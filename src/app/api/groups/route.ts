import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: 'Group name required' },
                { status: 400 }
            )
        }

        const userId = (session.user as any).id

        // Create group with owner as first member
        const group = await prisma.group.create({
            data: {
                name,
                ownerId: userId,
                members: {
                    create: {
                        userId
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                nickname: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({ group })
    } catch (error) {
        console.error('Create group error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id

        // Fetch all groups the user is a member of
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        nickname: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                nickname: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ groups })
    } catch (error) {
        console.error('Fetch groups error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
