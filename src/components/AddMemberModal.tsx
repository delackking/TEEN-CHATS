'use client'

import { useState } from 'react'
import styles from './AddMemberModal.module.css'

interface AddMemberModalProps {
    groupId: string
    onClose: () => void
    onMemberAdded: () => void
}

export default function AddMemberModal({ groupId, onClose, onMemberAdded }: AddMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()
            setSearchResults(data.users || [])
        } catch (err) {
            setError('Failed to search users')
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async (userId: string) => {
        try {
            const response = await fetch(`/api/groups/${groupId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })

            if (response.ok) {
                onMemberAdded()
                onClose()
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to add member')
            }
        } catch (err) {
            setError('Failed to add member')
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
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Add Member to Group</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
                            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by user ID or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.results}>
                    {searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <div key={user.id} className={styles.userItem}>
                                <div className="avatar avatar-sm">{getInitials(user.nickname)}</div>
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>{user.nickname}</div>
                                    <div className={styles.userId}>@{user.username} • {user.id}</div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAddMember(user.id)}
                                >
                                    Add
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            {searchQuery ? 'No users found' : 'Search for users to add to the group'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
