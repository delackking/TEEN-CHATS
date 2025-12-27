'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function Home() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        username: '',
        nickname: '',
        password: '',
        email: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                // Login
                const result = await signIn('credentials', {
                    username: formData.username,
                    password: formData.password,
                    redirect: false
                })

                if (result?.error) {
                    setError('Invalid username or password')
                } else {
                    router.push('/chat')
                }
            } else {
                // Register
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })

                const data = await response.json()

                if (!response.ok) {
                    setError(data.error || 'Registration failed')
                } else {
                    // Auto-login after registration
                    const result = await signIn('credentials', {
                        username: formData.username,
                        password: formData.password,
                        redirect: false
                    })

                    if (!result?.error) {
                        router.push('/chat')
                    }
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.gradient1}></div>
                <div className={styles.gradient2}></div>
                <div className={styles.gradient3}></div>
            </div>

            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>TeenChat</h1>
                    <p className={styles.tagline}>Connect, Chat, Talk</p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${isLogin ? styles.active : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            placeholder="Enter your username"
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className={styles.inputGroup}>
                                <label htmlFor="nickname">Nickname</label>
                                <input
                                    id="nickname"
                                    type="text"
                                    className="input"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    required
                                    placeholder="Choose a display name"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email (Optional)</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>💬</span>
                        <span>Real-time Chat</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🎤</span>
                        <span>Voice Calls</span>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>👥</span>
                        <span>Group Chats</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
