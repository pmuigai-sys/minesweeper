import bcrypt from 'bcryptjs'
import { all, get, run } from './db.js'
import config from '../config/config.js'

export const findUserByEmail = (email) => get('SELECT * FROM users WHERE email = ?', [email])

export const findUserById = (id) => get('SELECT * FROM users WHERE id = ?', [id])

export const createUser = async ({ name, email, password, role = 'voter' }) => {
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds)
  await run(
    `INSERT INTO users (uuid, name, email, password_hash, role)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?)`,
    [name, email.toLowerCase(), passwordHash, role],
  )
  return findUserByEmail(email)
}

export const verifyPassword = (password, passwordHash) => bcrypt.compare(password, passwordHash)

export const listVoters = () => all('SELECT * FROM users WHERE role = ?', ['voter'])

export const countUsersByRole = (role) =>
  get('SELECT COUNT(*) as count FROM users WHERE role = ?', [role]).then((row) => row?.count ?? 0)

export const sanitizeUser = ({ password_hash, ...rest }) => rest

export default {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  listVoters,
  countUsersByRole,
  sanitizeUser,
}
