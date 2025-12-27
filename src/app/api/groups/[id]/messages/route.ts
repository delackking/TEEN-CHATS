import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const groupId = params.id

        // Fetch group messages
        const messages = await prisma.groupMessage.findMany({
            where: { groupId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: 100
        })

        return NextResponse.json({ messages })
    } catch (error) {
        console.error('Fetch group messages error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
