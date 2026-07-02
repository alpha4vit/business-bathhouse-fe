import { useEffect, useState } from 'react'
import SwipeCard from './SwipeCard'
import { chatService, Chat } from '../services/chatService'
import './ChatsPage.css'

function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [chatImages, setChatImages] = useState<Map<number, string>>(new Map())
    const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())

    useEffect(() => {
        loadChats()
    }, [])

    useEffect(() => {
        chats.forEach(chat => {
            if (!chatImages.has(chat.id) && !loadingImages.has(chat.id)) {
                loadChatImage(chat.id)
            }
        })
    }, [chats])

    const loadChats = async () => {
        try {
            setLoading(true)
            const data = await chatService.getChats()
            setChats(data)
        } catch (err) {
            setError('Не удалось загрузить чаты')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadChatImage = async (chatId: number) => {
        try {
            setLoadingImages(prev => new Set(prev).add(chatId))
            const imageUrl = await chatService.getChatImage(chatId)
            if (imageUrl) {
                setChatImages(prev => new Map(prev).set(chatId, imageUrl))
            }
        } catch (err) {
            console.error(`Failed to load image for chat ${chatId}:`, err)
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev)
                newSet.delete(chatId)
                return newSet
            })
        }
    }

    if (loading) {
        return (
            <div className="chats-container">
                <div className="chats-content">
                    <div className="chats-header">
                        <h1>Наши чаты</h1>
                        <div className="chats-header-subtitle">
                            Сообщество «Бизнес Баня»
                        </div>
                    </div>
                    <div className="chats-loading">Загрузка...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="chats-container">
                <div className="chats-content">
                    <div className="chats-header">
                        <h1>Наши чаты</h1>
                        <div className="chats-header-subtitle">
                            Сообщество «Бизнес Баня»
                        </div>
                    </div>
                    <div className="chats-error">{error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="chats-container">
            <div className="chats-content">
                <div className="chats-header">
                    <h1>Наши чаты</h1>
                    <div className="chats-header-subtitle">
                        Сообщество «Бизнес Баня»
                    </div>
                </div>

                {chats.length === 0 ? (
                    <div className="chats-empty">
                        Чаты пока не добавлены
                    </div>
                ) : (
                    <SwipeCard
                        items={chats}
                        currentIndex={currentIndex}
                        onIndexChange={setCurrentIndex}
                        renderCard={(chat) => (
                            <div className="chats-card">
                                <div className="chats-card-header">
                                    <div className="chats-avatar">
                                        {loadingImages.has(chat.id) ? (
                                            <div className="chats-avatar-skeleton">
                                                {chat.title.charAt(0)}
                                            </div>
                                        ) : chatImages.get(chat.id) ? (
                                            <img src={chatImages.get(chat.id)} alt={chat.title} />
                                        ) : (
                                            <div className="chats-avatar-placeholder">
                                                {chat.title.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="chats-info">
                                        <h2 className="chats-title">{chat.title}</h2>
                                        {chat.memberCount && (
                                            <div className="chats-members">
                                                {chat.memberCount} участников
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {chat.description && (
                                    <div className="chats-description">
                                        {chat.description}
                                    </div>
                                )}

                                {chat.lastMessage && (
                                    <div className="chats-last-message">
                                        <div className="chats-last-message-label">Последнее сообщение:</div>
                                        <div className="chats-last-message-text">{chat.lastMessage}</div>
                                        {chat.lastMessageTime && (
                                            <div className="chats-last-message-time">{chat.lastMessageTime}</div>
                                        )}
                                    </div>
                                )}

                                {chat.link && (
                                    <a
                                        href={chat.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="chats-link"
                                    >
                                        Перейти в чат
                                    </a>
                                )}

                                {chat.joinLink ? (
                                    <a
                                        href={chat.joinLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="chats-join-button"
                                    >
                                        Вступить
                                    </a>
                                ) : (
                                    <button className="chats-join-button" disabled>
                                        Вступить
                                    </button>
                                )}
                            </div>
                        )}
                    />
                )}
            </div>
        </div>
    )
}

export default ChatsPage
