import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query) {
            return NextResponse.json(
                { error: 'Search query required' },
                { status: 400 }
            )
        }

        // Search by ID or username
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: { contains: query } },
                    { username: { contains: query } },
                    { nickname: { contains: query } }
                ]
            },
            select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true
            },
            take: 10
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('User search error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
