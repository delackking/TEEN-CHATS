import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            autoConnect: false
        })
    }
    return socket
}

export function connectSocket(userId: string) {
    const socket = getSocket()
    if (!socket.connected) {
        socket.connect()
        socket.emit('join', userId)
    }
    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
    }
}
