import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import config from './config/config.js'
import { initializeDatabase } from './models/db.js'
import blockchain from './models/Blockchain.js'
import authRoutes from './routes/auth.js'
import electionRoutes from './routes/election.js'
import voteRoutes from './routes/vote.js'
import blockchainRoutes from './routes/blockchain.js'
import reportRoutes from './routes/reports.js'
import { errorHandler } from './middleware/errorHandler.js'
import { configureSockets } from './sockets/index.js'

await initializeDatabase()
await blockchain.init()

const app = express()

const allowedOrigins = config.corsOrigin.split(',').map((origin) => origin.trim())
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/elections', electionRoutes)
app.use('/api/votes', voteRoutes)
app.use('/api/blockchain', blockchainRoutes)
app.use('/api/reports', reportRoutes)

app.use(errorHandler)

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})

configureSockets(io)
app.set('io', io)

server.listen(config.port, () => {
  console.log(`Kabarak Voting API running on port ${config.port}`)
})
