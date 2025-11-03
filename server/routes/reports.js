import { Router } from 'express'
import { exportVotesCsv } from '../controllers/reportController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/export', authenticate, requireRole('admin'), exportVotesCsv)

export default router
