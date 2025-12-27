'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import { connectSocket, disconnectSocket } from '@/lib/socket-client'
import styles from './chat.module.css'

export default function ChatPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [selectedChat, setSelectedChat] = useState<any>(null)
    const [chatType, setChatType] = useState<'dm' | 'group'>('dm')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            const userId = (session.user as any).id
            connectSocket(userId)

            return () => {
                disconnectSocket()
            }
        }
    }, [session])

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const handleSelectChat = (chat: any, type: 'dm' | 'group') => {
        setSelectedChat(chat)
        setChatType(type)
    }

    return (
        <div className={styles.container}>
            <Sidebar
                user={session.user}
                onSelectChat={handleSelectChat}
                selectedChat={selectedChat}
            />
            <ChatWindow
                user={session.user}
                selectedChat={selectedChat}
                chatType={chatType}
            />
        </div>
    )
}
