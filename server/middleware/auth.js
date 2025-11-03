import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { findUserById } from '../models/User.js'

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await findUserById(payload.sub)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  return next()
}

export default {
  authenticate,
  requireRole,
}
