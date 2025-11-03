import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { currentUser, login, register } from '../controllers/authController.js'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.get('/me', authenticate, currentUser)

export default router
