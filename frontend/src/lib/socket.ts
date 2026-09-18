import { io, type Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL as string

// One lazily-created singleton — connected only once MessagesProvider knows
// a logged-in user exists (autoConnect: false). `withCredentials` makes the
// browser attach the same httpOnly auth cookie the REST API uses to the
// socket.io handshake request automatically, the same way `credentials:
// 'include'` does for fetch() elsewhere — no token read out of JS needed.
const socket: Socket = io(`${API_URL}/chat`, {
  autoConnect: false,
  withCredentials: true,
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
