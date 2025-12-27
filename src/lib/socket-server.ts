import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { prisma } from '@/lib/prisma'

export function initSocket(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Join user's personal room
        socket.on('join', (userId: string) => {
            socket.join(`user:${userId}`)
            console.log(`User ${userId} joined their room`)
        })

        // Join DM room
        socket.on('join-dm', ({ userId, otherUserId }: { userId: string; otherUserId: string }) => {
            const roomId = [userId, otherUserId].sort().join('-')
            socket.join(`dm:${roomId}`)
            console.log(`User joined DM room: ${roomId}`)
        })

        // Join group room
        socket.on('join-group', (groupId: string) => {
            socket.join(`group:${groupId}`)
            console.log(`User joined group: ${groupId}`)
        })

        // Send direct message
        socket.on('send-dm', async (data: {
            senderId: string
            receiverId: string
            content: string
        }) => {
            try {
                const message = await prisma.directMessage.create({
                    data: {
                        content: data.content,
                        senderId: data.senderId,
                        receiverId: data.receiverId
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                nickname: true,
                                avatar: true
                            }
                        }
                    }
                })

                const roomId = [data.senderId, data.receiverId].sort().join('-')
                io.to(`dm:${roomId}`).emit('new-dm', message)
            } catch (error) {
                console.error('Send DM error:', error)
            }
        })

        // Send group message
        socket.on('send-group-message', async (data: {
            senderId: string
            groupId: string
            content: string
        }) => {
            try {
                const message = await prisma.groupMessage.create({
                    data: {
                        content: data.content,
                        senderId: data.senderId,
                        groupId: data.groupId
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                nickname: true,
                                avatar: true
                            }
                        }
                    }
                })

                io.to(`group:${data.groupId}`).emit('new-group-message', message)
            } catch (error) {
                console.error('Send group message error:', error)
            }
        })

        // Typing indicator for DM
        socket.on('typing-dm', (data: { userId: string; otherUserId: string; isTyping: boolean }) => {
            const roomId = [data.userId, data.otherUserId].sort().join('-')
            socket.to(`dm:${roomId}`).emit('user-typing-dm', {
                userId: data.userId,
                isTyping: data.isTyping
            })
        })

        // Typing indicator for group
        socket.on('typing-group', (data: { userId: string; groupId: string; isTyping: boolean }) => {
            socket.to(`group:${data.groupId}`).emit('user-typing-group', {
                userId: data.userId,
                isTyping: data.isTyping
            })
        })

        // WebRTC signaling for voice chat
        socket.on('voice-offer', (data: { to: string; offer: any }) => {
            io.to(`user:${data.to}`).emit('voice-offer', {
                from: socket.id,
                offer: data.offer
            })
        })

        socket.on('voice-answer', (data: { to: string; answer: any }) => {
            io.to(`user:${data.to}`).emit('voice-answer', {
                from: socket.id,
                answer: data.answer
            })
        })

        socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
            io.to(`user:${data.to}`).emit('ice-candidate', {
                from: socket.id,
                candidate: data.candidate
            })
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

    return io
}
