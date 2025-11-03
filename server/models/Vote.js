import crypto from 'crypto'
import { all, get, run } from './db.js'
import { countUsersByRole } from './User.js'

export const generateVoterHash = (userUuid, electionId) =>
  crypto.createHash('sha256').update(`${userUuid}:${electionId}`).digest('hex')

export const hasUserVoted = (userId, electionId) =>
  get('SELECT id FROM votes WHERE user_id = ? AND election_id = ?', [userId, electionId])

export const insertVote = async ({ userId, electionId, candidateId, voterHash }) => {
  const result = await run(
    `INSERT INTO votes (user_id, election_id, candidate_id, voter_hash)
     VALUES (?, ?, ?, ?)`,
    [userId, electionId, candidateId, voterHash],
  )
  return result.lastID
}

export const updateVoteBlockHash = (voteId, blockHash) =>
  run('UPDATE votes SET block_hash = ? WHERE id = ?', [blockHash, voteId])

export const getVoteSummary = async () => {
  const totalVotesRow = await get('SELECT COUNT(*) as total FROM votes')
  const activeElectionsRow = await get(
    `SELECT COUNT(*) as total
       FROM elections
      WHERE datetime('now') BETWEEN datetime(start_date) AND datetime(end_date)`,
  )
  const totalVoters = await countUsersByRole('voter')
  const turnout = totalVoters > 0 ? (totalVotesRow.total / totalVoters) * 100 : 0

  return {
    totalVotes: totalVotesRow.total,
    activeElections: activeElectionsRow.total,
    totalVoters,
    turnout,
    blockchainStatus: 'Healthy',
  }
}

export const getVoteCounts = async () =>
  all(
    `SELECT c.id as candidateId,
            c.name as candidateName,
            e.id as electionId,
            e.title as electionTitle,
            COUNT(v.id) as totalVotes
       FROM candidates c
       JOIN elections e ON e.id = c.election_id
  LEFT JOIN votes v ON v.candidate_id = c.id
   GROUP BY c.id
   ORDER BY totalVotes DESC`,
  )

export const getHistoryForUser = (userId) =>
  all(
    `SELECT v.id,
            e.title as electionTitle,
            v.created_at as votedAt,
            v.block_hash as blockHash,
            b.block_index as blockIndex
       FROM votes v
       JOIN elections e ON e.id = v.election_id
  LEFT JOIN blocks b ON b.hash = v.block_hash
      WHERE v.user_id = ?
   ORDER BY v.created_at DESC`,
    [userId],
  )

export default {
  generateVoterHash,
  hasUserVoted,
  insertVote,
  updateVoteBlockHash,
  getVoteSummary,
  getVoteCounts,
  getHistoryForUser,
}
