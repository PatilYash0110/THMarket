import { io, type Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL as string
const TOKEN_STORAGE_KEY = 'thmarket.token'

// One lazily-created singleton — connected only once MessagesProvider knows
// a logged-in user exists (autoConnect: false), and the JWT is read fresh
// at connect time rather than baked in here, since this module loads once
// at app startup, well before a user may have logged in.
const socket: Socket = io(`${API_URL}/chat`, {
  autoConnect: false,
  auth: (callback) => callback({ token: localStorage.getItem(TOKEN_STORAGE_KEY) }),
})

export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket(): void {
  socket.disconnect()
}

export function getSocket(): Socket {
  return socket
}
