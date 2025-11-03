import { all, get, run } from './db.js'

const mapCandidatesToElections = (elections, candidates) => {
  const grouped = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.election_id]) acc[candidate.election_id] = []
    acc[candidate.election_id].push({
      id: candidate.id,
      electionId: candidate.election_id,
      name: candidate.name,
      bio: candidate.bio,
      photoUrl: candidate.photo_url,
      createdAt: candidate.created_at,
    })
    return acc
  }, {})

  return elections.map((election) => ({
    ...normalizeElection(election),
    candidates: grouped[election.id] || [],
  }))
}

const normalizeElection = (record) => ({
  id: record.id,
  title: record.title,
  description: record.description,
  startDate: record.start_date,
  endDate: record.end_date,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
})

export const getAllElections = async () => {
  const rows = await all('SELECT * FROM elections ORDER BY start_date DESC')
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  const placeholders = ids.map(() => '?').join(',')
  const candidates = await all(
    `SELECT * FROM candidates WHERE election_id IN (${placeholders}) ORDER BY created_at ASC`,
    ids,
  )

  return mapCandidatesToElections(rows, candidates)
}

export const getElectionById = async (id) => {
  const election = await get('SELECT * FROM elections WHERE id = ?', [id])
  if (!election) return null
  const candidates = await all('SELECT * FROM candidates WHERE election_id = ? ORDER BY created_at ASC', [id])
  return mapCandidatesToElections([election], candidates)[0]
}

export const getActiveElections = async () => {
  const rows = await all(
    `SELECT *
     FROM elections
     WHERE datetime('now') BETWEEN datetime(start_date) AND datetime(end_date)
     ORDER BY start_date ASC`,
  )
  if (rows.length === 0) return []
  const ids = rows.map((row) => row.id)
  const placeholders = ids.map(() => '?').join(',')
  const candidates = await all(
    `SELECT * FROM candidates WHERE election_id IN (${placeholders}) ORDER BY created_at ASC`,
    ids,
  )
  return mapCandidatesToElections(rows, candidates)
}

export const createElection = async ({ title, description, startDate, endDate }) => {
  const result = await run(
    `INSERT INTO elections (title, description, start_date, end_date)
     VALUES (?, ?, ?, ?)`,
    [title, description, startDate, endDate],
  )
  return getElectionById(result.lastID)
}

export const updateElection = async (id, payload) => {
  const fields = []
  const params = []

  if (payload.title !== undefined) {
    fields.push('title = ?')
    params.push(payload.title)
  }
  if (payload.description !== undefined) {
    fields.push('description = ?')
    params.push(payload.description)
  }
  if (payload.startDate !== undefined) {
    fields.push('start_date = ?')
    params.push(payload.startDate)
  }
  if (payload.endDate !== undefined) {
    fields.push('end_date = ?')
    params.push(payload.endDate)
  }

  if (fields.length === 0) return getElectionById(id)

  fields.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)

  await run(`UPDATE elections SET ${fields.join(', ')} WHERE id = ?`, params)
  return getElectionById(id)
}

export const deleteElection = async (id) => {
  await run('DELETE FROM elections WHERE id = ?', [id])
}

export const addCandidate = async (electionId, { name, bio, photoUrl }) => {
  await run(
    `INSERT INTO candidates (election_id, name, bio, photo_url)
     VALUES (?, ?, ?, ?)`,
    [electionId, name, bio, photoUrl],
  )
  return getElectionById(electionId)
}

export default {
  getAllElections,
  getElectionById,
  getActiveElections,
  createElection,
  updateElection,
  deleteElection,
  addCandidate,
}
