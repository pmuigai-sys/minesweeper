import { all } from '../models/db.js'

const escapeCsv = (value) => {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export const exportVotesCsv = async (req, res) => {
  const rows = await all(
    `SELECT v.id,
            u.email as voterEmail,
            v.voter_hash as voterHash,
            e.title as electionTitle,
            c.name as candidateName,
            v.block_hash as blockHash,
            v.created_at as createdAt
       FROM votes v
       JOIN users u ON u.id = v.user_id
       JOIN elections e ON e.id = v.election_id
       JOIN candidates c ON c.id = v.candidate_id
   ORDER BY v.created_at DESC`,
  )

  const header = ['VoteID', 'VoterEmail', 'VoterHash', 'ElectionTitle', 'CandidateName', 'BlockHash', 'CreatedAt']
  const lines = [header.join(',')]

  rows.forEach((row) => {
    lines.push(
      [
        row.id,
        row.voterEmail,
        row.voterHash,
        row.electionTitle,
        row.candidateName,
        row.blockHash,
        row.createdAt,
      ]
        .map(escapeCsv)
        .join(','),
    )
  })

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="kabarak-votes-${Date.now()}.csv"`)
  res.send(lines.join('\n'))
}

export default {
  exportVotesCsv,
}
