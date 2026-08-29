import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatService, Chat } from '../services/chatService'
import { userService } from '../services/userService'
import { useAuthUser } from '../hooks/useAuthUser'
import './MandatoryChatsPage.css'

interface ChatWithLink extends Chat {
    inviteLink?: string
    loadingLink?: boolean
}

export default function MandatoryChatsPage() {
    const navigate = useNavigate()
    const { refreshUser } = useAuthUser()
    const [chats, setChats] = useState<ChatWithLink[]>([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadMandatoryChats()
    }, [])

    const loadMandatoryChats = async () => {
        try {
            setLoading(true)
            const mandatoryChats = await chatService.getMandatoryChats()
            const chatsWithLinks: ChatWithLink[] = mandatoryChats.map(chat => ({
                ...chat,
                inviteLink: undefined,
                loadingLink: true
            }))
            setChats(chatsWithLinks)

            // Load invite links for each chat
            for (const chat of chatsWithLinks) {
                console.log(`Loading invite link for chat ${chat.id}...`)
                try {
                    const link = await chatService.getInviteLink(chat.id)
                    console.log(`Got invite link for chat ${chat.id}:`, link)
                    setChats(prev => prev.map(c => 
                        c.id === chat.id ? { ...c, inviteLink: link || undefined, loadingLink: false } : c
                    ))
                } catch (err) {
                    console.error(`Failed to load invite link for chat ${chat.id}:`, err)
                    setChats(prev => prev.map(c => 
                        c.id === chat.id ? { ...c, loadingLink: false } : c
                    ))
                }
            }
        } catch (err) {
            setError('Не удалось загрузить список обязательных чатов')
            console.error('Error loading mandatory chats:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckSubscription = async () => {
        try {
            setChecking(true)
            setError(null)

            // Call login endpoint to check subscription status
            await userService.getCurrentUser()

            // Refresh user data to ensure cache is updated
            await refreshUser()

            // If we got here without 428 error, user has subscribed
            // Navigate to personal cabinet
            navigate('/cabinet')
        } catch (err) {
            setError('Вы всё ещё не подписаны на обязательные чаты')
            console.error('Subscription check failed:', err)
        } finally {
            setChecking(false)
        }
    }

    if (loading) {
        return (
            <div className="mandatory-chats-container">
                <div className="loading">Загрузка...</div>
            </div>
        )
    }

    return (
        <div className="mandatory-chats-container">
            <div className="mandatory-chats-content">
                <h1 className="mandatory-chats-title">
                    Подпишитесь на обязательные чаты
                </h1>
                <p className="mandatory-chats-description">
                    Для продолжения работы необходимо подписаться на следующие чаты:
                </p>
                
                {error && (
                    <div className="mandatory-chats-error">
                        {error}
                    </div>
                )}

                <div className="mandatory-chats-list">
                    {chats.map((chat) => (
                        <div key={chat.id} className="mandatory-chat-item">
                            <div className="mandatory-chat-header">
                                <span className="mandatory-chat-icon">⚠️</span>
                                <h3 className="mandatory-chat-title">{chat.title}</h3>
                            </div>
                            {chat.description && (
                                <p className="mandatory-chat-description">{chat.description}</p>
                            )}
                            {chat.loadingLink ? (
                                <div className="mandatory-chat-loading">Загрузка ссылки...</div>
                            ) : chat.inviteLink ? (
                                <a 
                                    href={chat.inviteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mandatory-chat-link"
                                >
                                    Вступить
                                </a>
                            ) : (
                                <div className="mandatory-chat-no-link">Ссылка недоступна</div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleCheckSubscription}
                    disabled={checking}
                    className="mandatory-chats-check-button"
                >
                    {checking ? 'Проверка...' : 'Проверить подписку'}
                </button>
            </div>
        </div>
    )
}
