import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import { findUserById } from '../models/User.js'

export const configureSockets = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Unauthorized'))
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret)
      const user = await findUserById(payload.sub)
      if (!user) {
        return next(new Error('Unauthorized'))
      }
      socket.user = user
      return next()
    } catch (error) {
      return next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user.email})`)
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
}

export default configureSockets
