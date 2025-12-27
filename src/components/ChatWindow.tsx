'use client'

import { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket-client'
import { voiceManager } from '@/lib/voice-manager'
import AddMemberModal from './AddMemberModal'
import styles from './ChatWindow.module.css'

interface ChatWindowProps {
    user: any
    selectedChat: any
    chatType: 'dm' | 'group'
}

export default function ChatWindow({ user, selectedChat, chatType }: ChatWindowProps) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [inVoiceCall, setInVoiceCall] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [showAddMember, setShowAddMember] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<any>(null)

    useEffect(() => {
        if (selectedChat) {
            loadMessages()
            const socket = getSocket()

            if (chatType === 'dm') {
                socket.emit('join-dm', { userId: user.id, otherUserId: selectedChat.id })
                socket.on('new-dm', handleNewMessage)
                socket.on('user-typing-dm', handleTyping)
            } else {
                socket.emit('join-group', selectedChat.id)
                socket.on('new-group-message', handleNewMessage)
                socket.on('user-typing-group', handleTyping)
            }

            return () => {
                socket.off('new-dm', handleNewMessage)
                socket.off('new-group-message', handleNewMessage)
                socket.off('user-typing-dm', handleTyping)
                socket.off('user-typing-group', handleTyping)
            }
        }
    }, [selectedChat, chatType])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        try {
            let url = ''
            if (chatType === 'dm') {
                url = `/api/messages/direct?userId=${selectedChat.id}`
            } else {
                url = `/api/groups/${selectedChat.id}/messages`
            }

            const response = await fetch(url)
            const data = await response.json()
            setMessages(data.messages || [])
        } catch (error) {
            console.error('Error loading messages:', error)
        }
    }

    const handleNewMessage = (message: any) => {
        setMessages(prev => [...prev, message])
        setIsTyping(false)
    }

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
        if (data.userId !== user.id) {
            setIsTyping(data.isTyping)
        }
    }

    const sendMessage = () => {
        if (!newMessage.trim()) return

        const socket = getSocket()

        if (chatType === 'dm') {
            socket.emit('send-dm', {
                senderId: user.id,
                receiverId: selectedChat.id,
                content: newMessage
            })
        } else {
            socket.emit('send-group-message', {
                senderId: user.id,
                groupId: selectedChat.id,
                content: newMessage
            })
        }

        setNewMessage('')
        stopTyping()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value)

        const socket = getSocket()
        if (chatType === 'dm') {
            socket.emit('typing-dm', { userId: user.id, otherUserId: selectedChat.id, isTyping: true })
        } else {
            socket.emit('typing-group', { userId: user.id, groupId: selectedChat.id, isTyping: true })
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(stopTyping, 1000)
    }

    const stopTyping = () => {
        const socket = getSocket()
        if (chatType === 'dm') {
            socket.emit('typing-dm', { userId: user.id, otherUserId: selectedChat.id, isTyping: false })
        } else {
            socket.emit('typing-group', { userId: user.id, groupId: selectedChat.id, isTyping: false })
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const toggleVoiceCall = async () => {
        if (inVoiceCall) {
            voiceManager.endCall()
            setInVoiceCall(false)
            setIsMuted(false)
        } else {
            try {
                await voiceManager.initialize(user.id)
                if (chatType === 'dm') {
                    await voiceManager.call(selectedChat.id)
                }
                setInVoiceCall(true)
            } catch (error) {
                console.error('Error starting voice call:', error)
                alert('Failed to start voice call. Please check microphone permissions.')
            }
        }
    }

    const toggleMute = () => {
        const muted = voiceManager.toggleMute()
        setIsMuted(muted)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const formatTime = (date: string) => {
        const d = new Date(date)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    if (!selectedChat) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>💬</div>
                <h2>Select a chat to start messaging</h2>
                <p>Choose a conversation from the sidebar or start a new one</p>
            </div>
        )
    }

    return (
        <div className={styles.chatWindow}>
            <div className={styles.header}>
                <div className={styles.chatInfo}>
                    <div className="avatar avatar-sm">
                        {getInitials(chatType === 'dm' ? selectedChat.nickname : selectedChat.name)}
                    </div>
                    <div>
                        <div className={styles.chatName}>
                            {chatType === 'dm' ? selectedChat.nickname : selectedChat.name}
                        </div>
                        <div className={styles.chatStatus}>
                            {chatType === 'dm' ? `@${selectedChat.username}` : `${selectedChat.members?.length || 0} members`}
                        </div>
                    </div>
                </div>

                {chatType === 'dm' && (
                    <div className={styles.voiceControls}>
                        {inVoiceCall && (
                            <button
                                className={`btn-icon ${isMuted ? styles.muted : ''}`}
                                onClick={toggleMute}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    {isMuted ? (
                                        <>
                                            <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                                            <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" strokeLinecap="round" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="12" y1="19" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                                            <line x1="8" y1="23" x2="16" y2="23" strokeWidth="2" strokeLinecap="round" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        )}
                        <button
                            className={`btn-icon ${inVoiceCall ? styles.active : ''}`}
                            onClick={toggleVoiceCall}
                            title={inVoiceCall ? 'End Call' : 'Start Voice Call'}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                )}

                {chatType === 'group' && (
                    <div className={styles.voiceControls}>
                        <button
                            className="btn-icon"
                            onClick={() => setShowAddMember(true)}
                            title="Add Members"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" strokeLinecap="round" />
                                <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.messages}>
                {messages.map((message, index) => {
                    const isOwn = message.sender?.id === user.id || message.senderId === user.id
                    return (
                        <div
                            key={message.id || index}
                            className={`${styles.message} ${isOwn ? styles.own : ''}`}
                        >
                            {!isOwn && (
                                <div className="avatar avatar-sm">
                                    {getInitials(message.sender?.nickname || 'U')}
                                </div>
                            )}
                            <div className={styles.messageContent}>
                                {!isOwn && chatType === 'group' && (
                                    <div className={styles.senderName}>{message.sender?.nickname}</div>
                                )}
                                <div className={styles.messageBubble}>
                                    {message.content}
                                </div>
                                <div className={styles.messageTime}>
                                    {formatTime(message.createdAt)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {isTyping && (
                    <div className={styles.typingIndicator}>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className="input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {showAddMember && chatType === 'group' && (
                <AddMemberModal
                    groupId={selectedChat.id}
                    onClose={() => setShowAddMember(false)}
                    onMemberAdded={() => {
                        // Optionally refresh group data or show success message
                        setShowAddMember(false)
                    }}
                />
            )}
        </div>
    )
}
