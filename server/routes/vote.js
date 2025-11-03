import { Router } from 'express'
import { castVote, fetchStats, getVoteHistory } from '../controllers/voteController.js'
import { authenticate } from '../middleware/auth.js'
import { csrfProtection } from '../middleware/csrf.js'

const router = Router()

router.post('/', authenticate, csrfProtection, castVote)
router.get('/stats', authenticate, fetchStats)
router.get('/history', authenticate, getVoteHistory)

export default router
