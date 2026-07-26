import {useEffect, useState} from 'react'
import './EventsPage.css'
import {Event, eventService} from '../services/eventService'
import {userService} from '../services/userService'
import {userStorage} from '../utils/userStorage'
import {API_BASE_URL} from "../config/api.ts"
import SwipeCard from './SwipeCard'
import {authenticatedFetch} from "../utils/apiClient.ts"
import {useUser} from '../contexts/UserContext'

const eventTypeLabels: Record<string, string> = {
    'ENTERTAINMENT': 'Развлекательные мероприятия',
    'BATH': 'Банные мероприятия',
    'WITH_SPEAKER': 'Мероприятия со спикером',
    'PARTNERS': 'Партнерские мероприятия',
    'ANY': 'Все'
}

function EventsPage() {
    const {user} = useUser()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
    const [htmlDescriptions, setHtmlDescriptions] = useState<Map<string, string>>(new Map())
    const [loadingHtml, setLoadingHtml] = useState<Set<string>>(new Set())
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [userBalance, setUserBalance] = useState<number>(0)
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
    const [createdTransaction, setCreatedTransaction] = useState<any>(null)
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false)

    const handleImageLoad = (eventId: string) => {
        console.log(`[EventsPage] ✅ Изображение успешно загружено для мероприятия ${eventId}`)
        setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(eventId)
            return newSet
        })
        setLoadedImages(prev => new Set(prev).add(eventId))
    }

    const handleImageError = (eventId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
        const imgElement = event.currentTarget
        console.error(`[EventsPage] ❌ Ошибка загрузки изображения для мероприятия ${eventId}`)
        console.error(`[EventsPage]naturalWidth: ${imgElement.naturalWidth}, naturalHeight: ${imgElement.naturalHeight}`)
        setFailedImages(prev => new Set(prev).add(eventId))
        setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(eventId)
            return newSet
        })
    }

    const loadEventImage = async (event: Event) => {
        if (!event.photo?.showUrl || loadedImages.has(event.id) || loadingImages.has(event.id)) {
            return
        }

        console.log(`[EventsPage] 📸 Загрузка изображения для мероприятия ${event.id}`)
        setLoadingImages(prev => new Set(prev).add(event.id))

        try {
            const fullPhotoUrl = event.photo.showUrl.startsWith('http')
                ? event.photo.showUrl
                : `https://prime-ural.bitrix24.ru/${event.photo.showUrl}`

            const imageUrl = await userService.getPhoto(fullPhotoUrl)

            updateEventImage(event.id, imageUrl)
            console.log(`[EventsPage] ✅ Изображение загружено для мероприятия ${event.title}`)
        } catch (error) {
            console.error(`[EventsPage] ❌ Ошибка загрузки изображения для мероприятия ${event.title}:`, error)
            updateEventImage(event.id, undefined)
        }
    }

    const loadEventHtml = async (event: Event) => {
        if (!event.previewDescription?.showUrl || htmlDescriptions.has(event.id) || loadingHtml.has(event.id)) {
            return
        }

        console.log(`[EventsPage] 📄 Загрузка HTML описания для мероприятия ${event.id}`)
        console.log(`[EventsPage] 🔗 Исходный URL из Битрикса:`, event.previewDescription.showUrl)

        const fullHtmlUrl = event.previewDescription.showUrl.startsWith('http')
            ? event.previewDescription.showUrl
            : `https://prime-ural.bitrix24.ru/${event.previewDescription.showUrl}`

        console.log(`[EventsPage] 🔗 Полный URL для запроса:`, fullHtmlUrl)
        setLoadingHtml(prev => new Set(prev).add(event.id))

        try {
            const html = await eventService.getHtml(fullHtmlUrl)

            console.log(`[EventsPage] 📄 HTML содержимое для мероприятия ${event.id}:`, html)
            setHtmlDescriptions(prev => {
                const newMap = new Map(prev).set(event.id, html)
                console.log(`[EventsPage] 🗺️ Map после сохранения:`, newMap)
                return newMap
            })
            console.log(`[EventsPage] ✅ HTML описание загружено для мероприятия ${event.title}`)
        } catch (error) {
            console.error(`[EventsPage] ❌ Ошибка загрузки HTML описания для мероприятия ${event.title}:`, error)
        } finally {
            setLoadingHtml(prev => {
                const newSet = new Set(prev)
                newSet.delete(event.id)
                return newSet
            })
        }
    }

    const updateEventImage = (eventId: string, imageUrl: string | undefined) => {
        setEvents(prev => prev.map(evt =>
            evt.id === eventId
                ? {...evt, photo: imageUrl ? {...evt.photo!, showUrl: imageUrl} : evt.photo}
                : evt
        ))
        setLoadingImages(prev => {
            const newSet = new Set(prev)
            newSet.delete(eventId)
            return newSet
        })
    }

    useEffect(() => {
        (window as any).updateEventImage = updateEventImage
        return () => {
            delete (window as any).updateEventImage
        }
    }, [])

    useEffect(() => {
        if (events.length > 0 && currentIndex >= 0 && currentIndex < events.length) {
            const currentEvent = events[currentIndex]
            loadEventImage(currentEvent)
            loadEventHtml(currentEvent)
        }
    }, [currentIndex, events])

    useEffect(() => {
        const loadEvents = async () => {
            console.log('[EventsPage] Начинаю загрузку мероприятий')
            setLoading(true)
            setFailedImages(new Set())
            setLoadingImages(new Set())
            setLoadedImages(new Set())
            try {
                const data = await eventService.getEvents()
                console.log('[EventsPage] Получено мероприятий:', data.length)
                setEvents(data)
                setCurrentIndex(0)
            } catch (error) {
                console.error('[EventsPage] Error loading events:', error)
            } finally {
                setLoading(false)
            }
        }

        loadEvents()
    }, [])


    const formatDate = (dateValue: string | number[]) => {
        let date: Date
        if (Array.isArray(dateValue)) {
            const [year, month, day, hour, minute] = dateValue
            date = new Date(year, month - 1, day, hour, minute)
        } else {
            date = new Date(dateValue)
        }
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const handleRegistration = async (event: Event) => {
        setSelectedEvent(event)
        setRegistrationModalOpen(true)

        if (user) {
            setLoadingBalance(true)
            try {
                setUserBalance(user?.company?.balance?.amount ?? 0)
            } catch (error) {
                console.error('[EventsPage] Error loading user balance:', error)
                setUserBalance(0)
            } finally {
                setLoadingBalance(false)
            }
        }
    }

    const toggleDescription = (eventId: string) => {
        setExpandedDescriptions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(eventId)) {
                newSet.delete(eventId)
            } else {
                newSet.add(eventId)
            }
            return newSet
        })
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({type, message})
        setTimeout(() => setNotification(null), 3000)
    }

    const handleTransaction = async (paymentType: 'FAST_PAYMENT' | 'PERSONAL_ACCOUNT') => {
        if (!selectedEvent) return

        setIsProcessingTransaction(true)

        try {
            const purpose = selectedEvent.type === 'BATH' ? 'BATHHOUSE_EVENT' : 'EVENT'

            const transactionData = {
                userId: user?.company?.id?.toString() || '',
                amount: Math.ceil((selectedEvent.price || 0) * 100),
                currency: 'RUB',
                purpose: purpose,
                type: paymentType,
                eventId: selectedEvent.id
            }

            console.log('Creating transaction:', transactionData)

            const response = await authenticatedFetch(`${API_BASE_URL}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                const errorMessage = errorData.message || 'Ошибка при создании платежа'
                throw new Error(errorMessage)
            }

            const transactionResult = await response.json()
            console.log('Transaction result:', transactionResult)

            if (paymentType === 'FAST_PAYMENT') {
                setCreatedTransaction(transactionResult)
                showNotification('success', 'СБП успешно создан!')
            } else {
                showNotification('success', 'Оплата с лицевого счета выполнена!')
                setRegistrationModalOpen(false)
            }
        } catch (error) {
            console.error('Error creating transaction:', error)
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании транзакции. Пожалуйста, попробуйте позже.'
            showNotification('error', errorMessage)
        } finally {
            setIsProcessingTransaction(false)
        }
    }

    const handleTopUpBalance = () => {
        const userId = userStorage.getUserId()
        if (userId) {
            window.location.href = `/invoice`
        }
    }

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            setCopiedUrl(true)
            setTimeout(() => setCopiedUrl(false), 2000)
        } catch (error) {
            console.error('Failed to copy URL:', error)
        }
    }

    const handleResetTransaction = () => {
        setCreatedTransaction(null)
        setCopiedUrl(false)
    }

    return (
        <div className="events-container">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="events-header">
                <h1>Календарь мероприятий</h1>
            </div>

            {loading && (
                <div className="events-loading">
                    <div className="events-loading-spinner"></div>
                    <p>Загрузка мероприятий...</p>
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="events-empty">
                    <p>Предстоящих мероприятий нет</p>
                </div>
            )}

            {!loading && events.length > 0 && (
                <div className="events-results">
                    <div className="events-results-count">
                        {currentIndex + 1} из {events.length}
                    </div>

                    <SwipeCard
                        items={events}
                        currentIndex={currentIndex}
                        onIndexChange={setCurrentIndex}
                        cardClassName="events-result-card"
                        renderCard={(evt) => (
                            <>
                                <div className="events-result-image">
                                    {evt.photo?.showUrl && loadingImages.has(evt.id) ? (
                                        <div className="events-result-image-skeleton"></div>
                                    ) : evt.photo?.showUrl && !failedImages.has(evt.id) ? (
                                        <img
                                            src={evt.photo.showUrl}
                                            alt={`Изображение ${evt.title}`}
                                            className="events-result-image-img"
                                            onLoad={() => handleImageLoad(evt.id)}
                                            onError={(e) => handleImageError(evt.id, e)}
                                        />
                                    ) : (
                                        <div className="events-result-image-placeholder">
                                            📅
                                        </div>
                                    )}
                                </div>

                                <div className="events-result-header">
                                    <h3 className="events-result-name">{evt.title}</h3>
                                    <div className="events-result-date">
                                        🕐 {formatDate(evt.carryDate)}
                                    </div>
                                </div>

                                {evt.type && (
                                    <div className="events-result-type">
                                        {eventTypeLabels[evt.type] || evt.type}
                                    </div>
                                )}

                                <div className="events-result-info">
                                    {evt.price !== undefined && evt.price > 0 && (
                                        <div className="events-result-price">
                                            💰 {evt.price} ₽
                                        </div>
                                    )}
                                    {evt.points !== undefined && evt.points > 0 && (
                                        <div className="events-result-points">
                                            ⭐ {evt.points} баллов
                                        </div>
                                    )}
                                </div>

                                {evt.previewDescription?.showUrl && (
                                    <>
                                        <button
                                            className="events-result-description-toggle"
                                            onClick={() => toggleDescription(evt.id)}
                                        >
                                            {expandedDescriptions.has(evt.id) ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <polyline points="18 15 12 9 6 15"></polyline>
                                                </svg>
                                            )}
                                        </button>

                                        {expandedDescriptions.has(evt.id) && (
                                            <div className="events-result-description">
                                                {loadingHtml.has(evt.id) ? (
                                                    <div className="events-result-description-loading">Загрузка
                                                        описания...</div>
                                                ) : htmlDescriptions.has(evt.id) ? (
                                                    (() => {
                                                        const htmlContent = htmlDescriptions.get(evt.id) || ''
                                                        console.log(`[EventsPage] 🖼️ Рендеринг HTML для ${evt.id}:`, htmlContent)
                                                        return (
                                                            <div
                                                                className="events-result-description-content"
                                                                dangerouslySetInnerHTML={{__html: htmlContent}}
                                                            />
                                                        )
                                                    })()
                                                ) : (
                                                    <div className="events-result-description-loading">Загрузка
                                                        описания...</div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <button
                                    className="events-result-registration"
                                    onClick={() => handleRegistration(evt)}
                                >
                                    Зарегистрироваться
                                </button>
                            </>
                        )}
                    />
                </div>
            )}

            {registrationModalOpen && selectedEvent && (
                <div className="registration-modal-overlay" onClick={() => setRegistrationModalOpen(false)}>
                    <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="registration-modal-header">
                            <h2>{createdTransaction ? 'Оплата через СБП' : 'Оплата'}</h2>
                            <button
                                className="registration-modal-close"
                                onClick={() => {
                                    setRegistrationModalOpen(false)
                                    handleResetTransaction()
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="registration-modal-body">
                            {createdTransaction ? (
                                <>
                                    <div className="registration-modal-event-info">
                                        <h3>{selectedEvent.title}</h3>
                                        <p className="registration-modal-event-date">
                                            🕐 {formatDate(selectedEvent.carryDate)}
                                        </p>
                                    </div>

                                    <div className="transaction-success-card">
                                        <div className="transaction-success-header">
                                            <h2>СБП успешно создан!</h2>
                                        </div>

                                        <div className="transaction-details">
                                            <div className="qr-code-container">
                                                <img
                                                    src={`data:image/png;base64,${createdTransaction.content?.base64Image}`}
                                                    alt="QR-код для оплаты"
                                                    className="qr-code-image"
                                                />
                                            </div>
                                            <div className="transaction-detail-item">
                                                <span className="detail-label">Сумма платежа:</span>
                                                <span
                                                    className="detail-value">{(createdTransaction.amount / 100).toFixed(2)} ₽</span>
                                            </div>
                                            <div className="transaction-detail-item">
                                                <span className="detail-label">Дата выставления:</span>
                                                <span
                                                    className="detail-value">{new Date(createdTransaction.createdAt || createdTransaction.issuedAt).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>
                                        </div>

                                        {createdTransaction.content?.link && (
                                            <div className="transaction-url-container">
                                                <p className="transaction-url-label">Ссылка для оплаты:</p>
                                                <div className="transaction-url-wrapper">
                                                    <a
                                                        href={createdTransaction.content.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="transaction-url-link"
                                                    >
                                                        {createdTransaction.content.link}
                                                    </a>
                                                    <button
                                                        onClick={() => handleCopyUrl(createdTransaction.content.link)}
                                                        className="copy-button"
                                                        title={copiedUrl ? "Скопировано!" : "Копировать ссылку"}
                                                    >
                                                        {copiedUrl ? "✅" : "📋"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="transaction-actions">
                                            <button
                                                onClick={handleResetTransaction}
                                                className="reset-button"
                                            >
                                                Выбрать другой способ оплаты
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="registration-modal-event-info">
                                        <h3>{selectedEvent.title}</h3>
                                        <p className="registration-modal-event-date">
                                            🕐 {formatDate(selectedEvent.carryDate)}
                                        </p>
                                        {selectedEvent.price !== undefined && selectedEvent.price > 0 && (
                                            <p className="registration-modal-event-price">
                                                💰 Стоимость: {selectedEvent.price} ₽
                                            </p>
                                        )}
                                    </div>

                                    <div className="registration-modal-balance">
                                        <h4>Ваш баланс лицевого счета</h4>
                                        <div className="registration-modal-balance-amount">
                                            {loadingBalance ? (
                                                <span className="registration-modal-balance-loading">Загрузка...</span>
                                            ) : (
                                                `${userBalance.toLocaleString('ru-RU')} ₽`
                                            )}
                                        </div>
                                    </div>

                                    <div className="registration-modal-transaction-methods">
                                        {userBalance >= (selectedEvent.price || 0) ? (
                                            <button
                                                className="registration-modal-transaction-btn registration-modal-transaction-account"
                                                onClick={() => handleTransaction('PERSONAL_ACCOUNT')}
                                                disabled={isProcessingTransaction}
                                            >
                                                <span className="registration-modal-transaction-icon">💳</span>
                                                <span>Списать с лицевого счета</span>
                                            </button>
                                        ) : (
                                            <button
                                                className="registration-modal-transaction-btn registration-modal-transaction-account"
                                                onClick={handleTopUpBalance}
                                                disabled={isProcessingTransaction}
                                            >
                                                <span className="registration-modal-transaction-icon">💳</span>
                                                <span>Пополнить лицевой счет</span>
                                            </button>
                                        )}

                                        <button
                                            className="registration-modal-transaction-btn registration-modal-transaction-sbp"
                                            onClick={() => handleTransaction('FAST_PAYMENT')}
                                            disabled={isProcessingTransaction}
                                        >
                                            <span className="registration-modal-transaction-icon">📱</span>
                                            <span>Оплата СБП</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EventsPage
