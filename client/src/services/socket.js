import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socketInstance = null

export const getSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token,
      },
      autoConnect: Boolean(token),
    })
  } else if (token && !socketInstance.connected) {
    socketInstance.auth = { token }
    socketInstance.connect()
  }

  return socketInstance
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

export default {
  getSocket,
  disconnectSocket,
}
