import {useEffect, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import './EventsPage.css'
import {Event, eventService} from '../services/eventService'
import {isNonResident} from '../services/userService'
import {API_BASE_URL} from "../config/api.ts"
import SwipeCard, {SwipeCardRef} from './SwipeCard'
import {authenticatedFetch} from "../utils/apiClient.ts"
import {useUser} from '../contexts/UserContext'
import {useNotification} from '../hooks/useNotification'
import {getPointsWord} from '../utils/textUtils'
import {useCache} from '../utils/cache'

const eventTypeLabels: Record<string, string> = {
    'ENTERTAINMENT': 'Развлекательные мероприятия',
    'BATH': 'Банные мероприятия',
    'WITH_SPEAKER': 'Мероприятия со спикером',
    'PARTNERS': 'Партнерские мероприятия',
    'ANY': 'Все'
}

function EventsPage() {
    const {user} = useUser()
    const navigate = useNavigate()
    const swipeCardRef = useRef<SwipeCardRef>(null)
    const {data: eventsData, loading: eventsLoading} = useCache<Event[]>(
        'events',
        () => eventService.getEvents(),
        []
    )
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [eventImages, setEventImages] = useState<Map<string, string>>(new Map())
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
    const [eventsWithoutImage, setEventsWithoutImage] = useState<Set<string>>(new Set())
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [userBalance, setUserBalance] = useState<number>(0)
    const [loadingBalance, setLoadingBalance] = useState(false)
    const {notification, showSuccess, showError} = useNotification()
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)
    const [createdTransaction, setCreatedTransaction] = useState<any>(null)
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false)
    const [showFreeEventConfirmation, setShowFreeEventConfirmation] = useState(false)

    const loadEventImage = async (event: Event) => {
        if (eventImages.has(event.id) || loadingImages.has(event.id) || eventsWithoutImage.has(event.id)) {
            return
        }

        console.log(`[EventsPage] 📸 Загрузка изображения для мероприятия ${event.id}`)
        setLoadingImages(prev => new Set(prev).add(event.id))

        try {
            const imageUrl = await eventService.getEventImage(event.id)

            if (imageUrl) {
                setEventImages(prev => new Map(prev).set(event.id, imageUrl))
                console.log(`[EventsPage] ✅ Изображение загружено для мероприятия ${event.title}`)
            } else {
                setEventsWithoutImage(prev => new Set(prev).add(event.id))
                console.log(`[EventsPage] ℹ️ Изображение не найдено для мероприятия ${event.title}`)
            }
        } catch (error) {
            console.error(`[EventsPage] ❌ Ошибка загрузки изображения для мероприятия ${event.title}:`, error)
            setEventsWithoutImage(prev => new Set(prev).add(event.id))
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev)
                newSet.delete(event.id)
                return newSet
            })
        }
    }

    useEffect(() => {
        if (events.length > 0 && currentIndex >= 0 && currentIndex < events.length) {
            const currentEvent = events[currentIndex]
            loadEventImage(currentEvent)
        }
    }, [currentIndex, events])

    useEffect(() => {
        if (eventsData) {
            console.log('[EventsPage] Получено мероприятий из кеша:', eventsData.length)

            const sortedData = [...eventsData].sort((a, b) => {
                const parseDate = (dateValue: string): Date => {
                    return new Date(dateValue)
                }

                const dateA = parseDate(a.carry_date)
                const dateB = parseDate(b.carry_date)
                return dateA.getTime() - dateB.getTime()
            })

            console.log("Отсортированные: ", sortedData)

            setEvents(sortedData)
            setCurrentIndex(0)
            setLoading(false)
        }
    }, [eventsData])

    useEffect(() => {
        setLoading(eventsLoading)
    }, [eventsLoading])

    // Handle keyboard navigation for desktop
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (events.length === 0) return

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
    }, [events.length])


    const formatDate = (dateValue: string | undefined | null) => {
        if (!dateValue) return 'Дата не указана'

        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return 'Некорректная дата'

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

        if (event.price === undefined || event.price === 0) {
            setShowFreeEventConfirmation(true)
        } else {
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
                showSuccess('СБП успешно создан!')
            } else {
                showSuccess('Оплата с лицевого счета выполнена!')
                setRegistrationModalOpen(false)
            }
        } catch (error) {
            console.error('Error creating transaction:', error)
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании транзакции. Пожалуйста, попробуйте позже.'
            showError(errorMessage)
        } finally {
            setIsProcessingTransaction(false)
        }
    }

    const handleTopUpBalance = () => {
        navigate('/invoice')
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
        <>
            {notification && (
                <div
                    className={`notification notification-${notification.type} ${notification.isFading ? 'notification-fading' : ''}`}>
                    {notification.message}
                </div>
            )}
            <div className="events-container">
                <div className="events-content">
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
                                ref={swipeCardRef}
                                items={events}
                                currentIndex={currentIndex}
                                onIndexChange={setCurrentIndex}
                                cardClassName="events-result-card"
                                renderCard={(evt) => (
                                    <>
                                        <div className="events-result-image">
                                            {eventImages.has(evt.id) ? (
                                                <img
                                                    src={eventImages.get(evt.id)}
                                                    alt={`Изображение ${evt.title}`}
                                                    className="events-result-image-img"
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
                                                🕐 {formatDate(evt.carry_date)}
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
                                                    ⭐ {evt.points} {getPointsWord(evt.points)}
                                                </div>
                                            )}
                                        </div>

                                        {evt.description && (
                                            <>
                                                <button
                                                    className="events-result-description-toggle"
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                >
                                                    {isDescriptionExpanded ? (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                                 strokeLinejoin="round">
                                                                <polyline points="18 15 12 9 6 15"></polyline>
                                                            </svg>
                                                            Свернуть описание
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                                 strokeLinejoin="round">
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                            Развернуть описание
                                                        </>
                                                    )}
                                                </button>

                                                {isDescriptionExpanded && (
                                                    <div
                                                        className="events-result-description-content"
                                                        dangerouslySetInnerHTML={{__html: (evt.description || '').replace(/\n/g, '<br />')}}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {evt.registration_link ? (
                                            <a
                                                href={evt.registration_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="events-result-registration"
                                            >
                                                Зарегистрироваться
                                            </a>
                                        ) : (
                                            <button
                                                className="events-result-registration"
                                                onClick={() => handleRegistration(evt)}
                                            >
                                                Зарегистрироваться
                                            </button>
                                        )}
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
                                                    🕐 {formatDate(selectedEvent.carry_date)}
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
                                                    🕐 {formatDate(selectedEvent.carry_date)}
                                                </p>
                                                {selectedEvent.price !== undefined && selectedEvent.price > 0 && (
                                                    <p className="registration-modal-event-price">
                                                        💰 Стоимость: {selectedEvent.price} ₽
                                                    </p>
                                                )}
                                            </div>

                                            {!isNonResident(user) && selectedEvent.price !== undefined && selectedEvent.price > 0 && (
                                                <div className="registration-modal-balance">
                                                    <h4>Ваш баланс лицевого счета</h4>
                                                    <div className="registration-modal-balance-amount">
                                                        {loadingBalance ? (
                                                            <span
                                                                className="registration-modal-balance-loading">Загрузка...</span>
                                                        ) : (
                                                            `${userBalance.toLocaleString('ru-RU')} ₽`
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="registration-modal-transaction-methods">
                                                {!isNonResident(user) && (
                                                    userBalance >= (selectedEvent.price || 0) ? (
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
                                                            )
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

                    {showFreeEventConfirmation && selectedEvent && (
                        <div className="registration-modal-overlay" onClick={() => setShowFreeEventConfirmation(false)}>
                            <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="registration-modal-header">
                                    <h2>Подтверждение регистрации</h2>
                                    <button
                                        className="registration-modal-close"
                                        onClick={() => setShowFreeEventConfirmation(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="registration-modal-body">
                                    <div className="registration-modal-event-info">
                                        <h3>{selectedEvent.title}</h3>
                                        <p className="registration-modal-event-date">
                                            🕐 {formatDate(selectedEvent.carry_date)}
                                        </p>
                                        <div style={{marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)', borderRadius: '12px', textAlign: 'center'}}>
                                            <p style={{margin: '0', color: '#4CAF50', fontWeight: '600', fontSize: '16px'}}>
                                                🎉 Участие бесплатное
                                            </p>
                                        </div>
                                        <p style={{marginTop: '20px', color: '#495057', lineHeight: '1.6'}}>
                                            Подтвердите свою регистрацию на мероприятие.
                                        </p>
                                    </div>
                                    <div className="registration-modal-transaction-methods">
                                        <button
                                            className="events-result-registration"
                                            onClick={() => {
                                                setShowFreeEventConfirmation(false)
                                                handleTransaction('PERSONAL_ACCOUNT')
                                            }}
                                            disabled={isProcessingTransaction}
                                        >
                                            Подтвердить регистрацию
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default EventsPage
