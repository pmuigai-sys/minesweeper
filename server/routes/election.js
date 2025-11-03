import { Router } from 'express'
import { createElectionHandler, deleteElectionHandler, getElection, listActiveElections, listElections, updateElectionHandler, addCandidateHandler } from '../controllers/electionController.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { csrfProtection } from '../middleware/csrf.js'

const router = Router()

router.get('/', authenticate, requireRole('admin'), listElections)
router.get('/active', authenticate, listActiveElections)
router.get('/:id', authenticate, getElection)
router.post('/', authenticate, requireRole('admin'), csrfProtection, createElectionHandler)
router.patch('/:id', authenticate, requireRole('admin'), csrfProtection, updateElectionHandler)
router.delete('/:id', authenticate, requireRole('admin'), csrfProtection, deleteElectionHandler)
router.post('/:id/candidates', authenticate, requireRole('admin'), csrfProtection, addCandidateHandler)

export default router
