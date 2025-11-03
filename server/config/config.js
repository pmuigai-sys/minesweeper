import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'kabarak-blockchain-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../data/kabarak-voting.db'),
  powDifficulty: Number(process.env.POW_DIFFICULTY || 4),
  csrfCookieName: process.env.CSRF_COOKIE_NAME || 'kb_csrf',
  csrfHeaderName: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
}

export default config
