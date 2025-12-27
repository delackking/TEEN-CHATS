const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Join user's personal room
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`)
            console.log(`User ${userId} joined their room`)
        })

        // Join DM room
        socket.on('join-dm', ({ userId, otherUserId }) => {
            const roomId = [userId, otherUserId].sort().join('-')
            socket.join(`dm:${roomId}`)
            console.log(`User joined DM room: ${roomId}`)
        })

        // Join group room
        socket.on('join-group', (groupId) => {
            socket.join(`group:${groupId}`)
            console.log(`User joined group: ${groupId}`)
        })

        // Send direct message
        socket.on('send-dm', async (data) => {
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
        socket.on('send-group-message', async (data) => {
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
        socket.on('typing-dm', (data) => {
            const roomId = [data.userId, data.otherUserId].sort().join('-')
            socket.to(`dm:${roomId}`).emit('user-typing-dm', {
                userId: data.userId,
                isTyping: data.isTyping
            })
        })

        // Typing indicator for group
        socket.on('typing-group', (data) => {
            socket.to(`group:${data.groupId}`).emit('user-typing-group', {
                userId: data.userId,
                isTyping: data.isTyping
            })
        })

        // WebRTC signaling for voice chat
        socket.on('voice-offer', (data) => {
            io.to(`user:${data.to}`).emit('voice-offer', {
                from: socket.id,
                offer: data.offer
            })
        })

        socket.on('voice-answer', (data) => {
            io.to(`user:${data.to}`).emit('voice-answer', {
                from: socket.id,
                answer: data.answer
            })
        })

        socket.on('ice-candidate', (data) => {
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

module.exports = { initSocket }
