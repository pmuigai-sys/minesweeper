import { Router } from 'express'
import { getBlockchain, verifyBlockchain } from '../controllers/blockchainController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, requireRole('admin'), getBlockchain)
router.get('/verify', authenticate, requireRole('admin'), verifyBlockchain)

export default router
