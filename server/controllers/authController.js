import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { createUser, findUserByEmail, sanitizeUser, verifyPassword } from '../models/User.js'

const buildToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

const setCsrfCookie = (res, token) => {
  res.cookie(config.csrfCookieName, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: config.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 12,
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await findUserByEmail(email.toLowerCase())
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const passwordValid = await verifyPassword(password, user.password_hash)
  if (!passwordValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = buildToken(user)
  const csrfToken = crypto.randomBytes(32).toString('hex')
  setCsrfCookie(res, csrfToken)

  res.json({
    token,
    csrfToken,
    user: sanitizeUser(user),
  })
}

export const register = async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  const existing = await findUserByEmail(email.toLowerCase())
  if (existing) {
    return res.status(409).json({ message: 'User already exists' })
  }

  const user = await createUser({ name, email, password, role })
  const token = buildToken(user)
  const csrfToken = crypto.randomBytes(32).toString('hex')
  setCsrfCookie(res, csrfToken)

  res.status(201).json({
    token,
    csrfToken,
    user: sanitizeUser(user),
  })
}

export const currentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  res.json({ user: sanitizeUser(req.user) })
}

export default {
  login,
  register,
  currentUser,
}
