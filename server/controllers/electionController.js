import {
  addCandidate,
  createElection,
  deleteElection,
  getActiveElections,
  getAllElections,
  getElectionById,
  updateElection,
} from '../models/Election.js'

export const listElections = async (req, res) => {
  const elections = await getAllElections()
  res.json({ elections })
}

export const listActiveElections = async (req, res) => {
  const elections = await getActiveElections()
  res.json({ elections })
}

export const getElection = async (req, res) => {
  const election = await getElectionById(req.params.id)
  if (!election) {
    return res.status(404).json({ message: 'Election not found' })
  }
  res.json({ election })
}

export const createElectionHandler = async (req, res) => {
  const { title, description, startDate, endDate } = req.body
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ message: 'Title, start date, and end date are required' })
  }

  const election = await createElection({ title, description, startDate, endDate })
  res.status(201).json({ election })
}

export const updateElectionHandler = async (req, res) => {
  const election = await getElectionById(req.params.id)
  if (!election) {
    return res.status(404).json({ message: 'Election not found' })
  }

  const updated = await updateElection(req.params.id, req.body)
  res.json({ election: updated })
}

export const deleteElectionHandler = async (req, res) => {
  await deleteElection(req.params.id)
  res.status(204).end()
}

export const addCandidateHandler = async (req, res) => {
  const { name, bio, photoUrl } = req.body
  if (!name) {
    return res.status(400).json({ message: 'Candidate name is required' })
  }

  const election = await getElectionById(req.params.id)
  if (!election) {
    return res.status(404).json({ message: 'Election not found' })
  }

  const updated = await addCandidate(req.params.id, { name, bio, photoUrl })
  res.status(201).json({ election: updated })
}

export default {
  listElections,
  listActiveElections,
  getElection,
  createElectionHandler,
  updateElectionHandler,
  deleteElectionHandler,
  addCandidateHandler,
}
