import {useEffect, useState, useRef} from 'react'
import SwipeCard, {SwipeCardRef} from './SwipeCard'
import {Chat, chatService} from '../services/chatService'
import './ChatsPage.css'
import {useUser} from "../contexts/UserContext.tsx";
import {isNonResident} from "../services/userService.ts";
import {useNotification} from "../hooks/useNotification.ts";
import Loading from "./Loading.tsx";
import {useCache} from '../utils/cache'

function ChatsPage() {
    const {user} = useUser()
    const {showSuccess, showError} = useNotification()
    const swipeCardRef = useRef<SwipeCardRef>(null)
    const {data: chatsData, loading: chatsLoading, error: chatsError} = useCache<Chat[]>(
        'chats',
        () => chatService.getChats(),
        []
    )
    const [chats, setChats] = useState<Chat[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [chatImages, setChatImages] = useState<Map<number, string>>(new Map())
    const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())
    const [inviteLinks, setInviteLinks] = useState<Map<number, string>>(new Map())
    const [requestingChatId, setRequestingChatId] = useState<number | null>(null)

    useEffect(() => {
        if (chatsData) {
            setChats(chatsData)
        }
    }, [chatsData])

    useEffect(() => {
        setLoading(chatsLoading)
    }, [chatsLoading])

    useEffect(() => {
        setError(chatsError)
    }, [chatsError])

    // Handle keyboard navigation for desktop
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (chats.length === 0) return

            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                swipeCardRef.current?.handlePrevious()
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                swipeCardRef.current?.handleNext()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [chats.length])

    useEffect(() => {
        chats.forEach(chat => {
            if (!chatImages.has(chat.id) && !loadingImages.has(chat.id)) {
                loadChatImage(chat.id)
            }

            if (!isNonResident(user) && !inviteLinks.has(chat.id)) {
                loadInviteLink(chat.id)
            }
        })
    }, [chats, user])

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

    const loadInviteLink = async (chatId: number) => {
        try {
            const inviteLink = await chatService.getInviteLink(chatId)
            if (inviteLink) {
                setInviteLinks(prev => new Map(prev).set(chatId, inviteLink))
            }
        } catch (err) {
            console.error(`Failed to load invite link for chat ${chatId}:`, err)
        }
    }

    const handleJoinChatRequest = async (chatId: number) => {
        try {
            setRequestingChatId(chatId)
            await chatService.sendJoinChatRequest(chatId)
            showSuccess('Заявка успешно отправлена!')
        } catch (error) {
            console.error('Error sending join request:', error)
            showError('Ошибка при отправке заявки, попробуйте еще раз!')
        } finally {
            setRequestingChatId(null)
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
                    <div className="chats-loading">
                        <Loading message={"Загрузка..."}></Loading>
                    </div>
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
                        ref={swipeCardRef}
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
                                            <img src={chatImages.get(chat.id)} alt={chat.title}/>
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

                                {!isNonResident(user) && (
                                    inviteLinks.get(chat.id) ? (
                                        <a
                                            href={inviteLinks.get(chat.id)}
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
                                    )
                                )}

                                {isNonResident(user) && (
                                    <button
                                        onClick={() => handleJoinChatRequest(chat.id)}
                                        className="chats-join-button"
                                        disabled={requestingChatId === chat.id}
                                    >
                                        {requestingChatId === chat.id ? 'Отправка...' : 'Подать заявку на вступление'}
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
