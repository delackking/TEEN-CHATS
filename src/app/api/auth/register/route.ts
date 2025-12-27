import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { username, nickname, password, email } = await request.json()

        if (!username || !nickname || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user with unique ID
        const user = await prisma.user.create({
            data: {
                id: nanoid(10), // Generate unique 10-character ID
                username,
                nickname,
                password: hashedPassword,
                email: email || null
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                nickname: user.nickname
            }
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
