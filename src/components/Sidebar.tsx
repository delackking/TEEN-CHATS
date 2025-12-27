'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import styles from './Sidebar.module.css'

interface SidebarProps {
    user: any
    onSelectChat: (chat: any, type: 'dm' | 'group') => void
    selectedChat: any
}

export default function Sidebar({ user, onSelectChat, selectedChat }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'dms' | 'groups'>('dms')
    const [directMessages, setDirectMessages] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [groupName, setGroupName] = useState('')

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/groups')
            const data = await response.json()
            setGroups(data.groups || [])
        } catch (error) {
            console.error('Error fetching groups:', error)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()
            setSearchResults(data.users || [])
        } catch (error) {
            console.error('Error searching users:', error)
        }
    }

    const handleSelectUser = (selectedUser: any) => {
        // Check if DM already exists
        const existingDM = directMessages.find(dm => dm.id === selectedUser.id)
        if (!existingDM) {
            setDirectMessages([selectedUser, ...directMessages])
        }
        onSelectChat(selectedUser, 'dm')
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
    }

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return

        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupName })
            })

            const data = await response.json()
            if (response.ok) {
                setGroups([data.group, ...groups])
                setGroupName('')
                setShowCreateGroup(false)
                onSelectChat(data.group, 'group')
            }
        } catch (error) {
            console.error('Error creating group:', error)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    <div className="avatar avatar-sm">
                        {getInitials(user.name || 'U')}
                    </div>
                    <div className={styles.userDetails}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userId}>ID: {(user as any).id}</div>
                    </div>
                </div>
                <button className="btn-icon" onClick={() => signOut()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'dms' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dms')}
                >
                    Direct Messages
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    Groups
                </button>
            </div>

            {activeTab === 'dms' ? (
                <div className={styles.content}>
                    <button className={`btn btn-primary ${styles.addButton}`} onClick={() => setShowSearch(!showSearch)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
                            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Add User by ID
                    </button>

                    {showSearch && (
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search by ID or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch}>Search</button>

                            {searchResults.length > 0 && (
                                <div className={styles.searchResults}>
                                    {searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            className={styles.searchResult}
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <div className="avatar avatar-sm">{getInitials(user.nickname)}</div>
                                            <div>
                                                <div className={styles.resultName}>{user.nickname}</div>
                                                <div className={styles.resultId}>@{user.username} • {user.id}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.chatList}>
                        {directMessages.map(dm => (
                            <div
                                key={dm.id}
                                className={`${styles.chatItem} ${selectedChat?.id === dm.id ? styles.selected : ''}`}
                                onClick={() => onSelectChat(dm, 'dm')}
                            >
                                <div className="avatar avatar-sm">{getInitials(dm.nickname)}</div>
                                <div className={styles.chatInfo}>
                                    <div className={styles.chatName}>{dm.nickname}</div>
                                    <div className={styles.chatPreview}>@{dm.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles.content}>
                    <button className={`btn btn-primary ${styles.addButton}`} onClick={() => setShowCreateGroup(!showCreateGroup)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
                            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Create Group
                    </button>

                    {showCreateGroup && (
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Group name..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                            />
                            <button className="btn btn-primary" onClick={handleCreateGroup}>Create</button>
                        </div>
                    )}

                    <div className={styles.chatList}>
                        {groups.map(group => (
                            <div
                                key={group.id}
                                className={`${styles.chatItem} ${selectedChat?.id === group.id ? styles.selected : ''}`}
                                onClick={() => onSelectChat(group, 'group')}
                            >
                                <div className="avatar avatar-sm">{getInitials(group.name)}</div>
                                <div className={styles.chatInfo}>
                                    <div className={styles.chatName}>{group.name}</div>
                                    <div className={styles.chatPreview}>{group.members?.length || 0} members</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
