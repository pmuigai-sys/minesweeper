import { getElectionById } from '../models/Election.js'
import blockchain from '../models/Blockchain.js'
import {
  generateVoterHash,
  getHistoryForUser,
  getVoteCounts,
  getVoteSummary,
  hasUserVoted,
  insertVote,
  updateVoteBlockHash,
} from '../models/Vote.js'

const ensureElectionIsActive = (election) => {
  const now = new Date()
  const starts = new Date(election.startDate)
  const ends = new Date(election.endDate)
  if (now < starts || now > ends) {
    return false
  }
  return true
}

export const castVote = async (req, res) => {
  const { electionId, candidateId } = req.body
  if (!electionId || !candidateId) {
    return res.status(400).json({ message: 'Election ID and candidate ID are required' })
  }

  const election = await getElectionById(electionId)
  if (!election) {
    return res.status(404).json({ message: 'Election not found' })
  }

  if (!ensureElectionIsActive(election)) {
    return res.status(400).json({ message: 'Election is not currently active' })
  }

  const candidate = election.candidates.find((item) => Number(item.id) === Number(candidateId))
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found in election' })
  }

  const existing = await hasUserVoted(req.user.id, electionId)
  if (existing) {
    return res.status(409).json({ message: 'You have already voted in this election' })
  }

  const voterHash = generateVoterHash(req.user.uuid, electionId)
  const voteId = await insertVote({
    userId: req.user.id,
    electionId,
    candidateId,
    voterHash,
  })

  const block = await blockchain.addBlock({
    voteId,
    electionId,
    candidateId,
    voterHash,
    electionTitle: election.title,
    candidateName: candidate.name,
    timestamp: new Date().toISOString(),
  })

  await updateVoteBlockHash(voteId, block.hash)

  const io = req.app.get('io')
  if (io) {
    const [summary, voteCounts] = await Promise.all([getVoteSummary(), getVoteCounts()])
    io.emit('voteUpdate', { summary, voteCounts })
    io.emit('blockMined', block)
  }

  res.status(201).json({
    message: 'Vote recorded successfully',
    blockHash: block.hash,
    blockIndex: block.index,
  })
}

export const fetchStats = async (req, res) => {
  const [summary, voteCounts] = await Promise.all([getVoteSummary(), getVoteCounts()])
  res.json({ summary, voteCounts })
}

export const getVoteHistory = async (req, res) => {
  const history = await getHistoryForUser(req.user.id)
  res.json({ history })
}

export default {
  castVote,
  fetchStats,
  getVoteHistory,
}
