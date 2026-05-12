import {useEffect, useState} from 'react'
import './PersonalCabinet.css'
import {userService, UserDataDto} from '../services/userService'
import {useUserId} from '../hooks/useUserId'
import {useCache} from '../utils/cache'
import PointsInstructions from './PointsInstructions'
import arrowIcon from '../img/arrow.svg'

function PersonalCabinet() {
    const chatId = useUserId()

    const [userData, setUserData] = useState<UserDataDto | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false)
    const [visibleCount, setVisibleCount] = useState<number>(20)
    const [isClosing, setIsClosing] = useState<boolean>(false)
    const [showInstructions, setShowInstructions] = useState<boolean>(false)
    const [isInstructionsClosing, setIsInstructionsClosing] = useState<boolean>(false)
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
    const [photoLoading, setPhotoLoading] = useState<boolean>(false)
    
    // Используем кеш для рейтинга резидентов
    const { data: leaderboard, loading: leaderboardLoading, error: leaderboardError } = useCache(
        'leaderboard',
        () => userService.getLeaderboard(),
        [] // Пустые зависимости - кеш обновится только при перерендеринге компонента
    )

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true)
            setError(null)
            try {
                if (!chatId) {
                    setError('Требуется ID пользователя. Укажите параметр ?id= в URL.')
                    setUserData(null)
                    setLoading(false)
                    return
                }

                const data = await userService.getUserData(chatId)
                console.log('User data:', data)
                setUserData(data)

                // Начинаем загрузку фото асинхронно, не блокируя отображение карточки
                if (data.company?.photo?.showUrl) {
                    setPhotoLoading(true)
                    // Не ждем загрузки фото - запускаем в фоне
                    userService.getPhoto(data.company.photo.showUrl)
                        .then(photoUrl => {
                            setUserPhotoUrl(photoUrl)
                        })
                        .catch(photoError => {
                            console.error('Failed to load user photo:', photoError)
                            setUserPhotoUrl(null)
                        })
                        .finally(() => {
                            setPhotoLoading(false)
                        })
                } else {
                    setUserPhotoUrl(null)
                    setPhotoLoading(false)
                }
            } catch (err) {
                console.error('Failed to fetch user data:', err)
                setError('Не удалось загрузить данные пользователя')
                setUserData(null)
                setUserPhotoUrl(null)
                setPhotoLoading(false)
            } finally {
                setLoading(false)
            }
        }

        if (chatId) {
            fetchUserData()
        }
    }, [chatId])

    // Очистка URL объекта при размонтировании
    useEffect(() => {
        return () => {
            if (userPhotoUrl && userPhotoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(userPhotoUrl)
            }
        }
    }, [userPhotoUrl])

    const fetchLeaderboard = () => {
        if (showLeaderboard) {
            setIsClosing(true)
            setTimeout(() => {
                setShowLeaderboard(false)
                setIsClosing(false)
                setVisibleCount(20)
            }, 300)
            return
        }

        // Просто показываем/скрываем рейтинг, данные уже в кеше
        setShowLeaderboard(true)
    }

    const getPointsWord = (count: number): string => {
        const absCount = Math.abs(count)
        const lastDigit = absCount % 10
        const lastTwoDigits = absCount % 100
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'баллов'
        }
        
        if (lastDigit === 1) {
            return 'балл'
        }
        
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'балла'
        }
        
        return 'баллов'
    }

    if (!chatId) {
        return (
            <div className="cabinet-error">
                <h1>Ошибка</h1>
                <p>Требуется ID пользователя. Укажите параметр ?id= в URL.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="cabinet-container">
                <div className="cabinet-content">
                    <div className="cabinet-loading">
                        Загрузка данных...
                    </div>
                </div>
            </div>
        )
    }

    if (error || !userData) {
        return (
            <div className="cabinet-error">
                <h1>Ошибка</h1>
                <p>{error || 'Не удалось загрузить данные'}</p>
            </div>
        )
    }

    return (
        <div className="cabinet-container">
            <div className="cabinet-content">
                <div className="cabinet-header">
                    <h1>Мой личный кабинет</h1>
                    <div className="cabinet-header-subtitle">
                        {userData.fullName}
                    </div>
                </div>

                <div className="cabinet-card">
                    <h2>Профиль</h2>
                    
                    <div className="cabinet-profile-container">
                        <div className="cabinet-photo-section">
                            {photoLoading ? (
                                <div className="cabinet-photo-loading">
                                    Загрузка фото...
                                </div>
                            ) : userPhotoUrl ? (
                                <div className="cabinet-photo-wrapper">
                                    <img 
                                        src={userPhotoUrl} 
                                        alt="Фото резидента" 
                                        className="cabinet-user-photo"
                                        onError={() => {
                                            console.error('Failed to load user photo image')
                                            setUserPhotoUrl(null)
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="cabinet-no-photo">
                                    <div className="cabinet-no-photo-icon">👤</div>
                                    <span className="cabinet-no-photo-text">Нет фото</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="cabinet-info-group">
                            <div className="cabinet-info-item">
                                <span className="cabinet-info-label">ФИО:</span>
                                <span className="cabinet-info-value">{userData.fullName || 'Не указано'}</span>
                            </div>
                            
                            <div className="cabinet-info-item">
                                <span className="cabinet-info-label">Телефон:</span>
                                <span className="cabinet-info-value">{userData.phoneNumber || 'Не указано'}</span>
                            </div>
                            
                            <div className="cabinet-info-item">
                                <span className="cabinet-info-label">Компания:</span>
                                <span className="cabinet-info-value">{userData.companyTitle || 'Не указано'}</span>
                            </div>
                        </div>
                    </div>

                    {userData.businessDescription && (
                        <div className="cabinet-description">
                            <span className="cabinet-info-label">Описание бизнеса:</span>
                            <p className="cabinet-description-text">{userData.businessDescription}</p>
                        </div>
                    )}
                </div>

                <div className="cabinet-card">
                    <h2>Баланс и баллы</h2>
                    
                    <div className="cabinet-balance-points-container">
                        <div className="cabinet-balance-display">
                            <div className="cabinet-balance-amount">
                                {userData.balance.amount.toLocaleString('ru-RU')} {userData.balance.currency}
                            </div>
                            <div className="cabinet-balance-label">Текущий баланс</div>
                        </div>
                        
                        <div className="cabinet-points-display">
                            <div className="cabinet-points-amount">
                                {userData.points}
                            </div>
                            <div className="cabinet-points-emoji">⭐</div>
                            <div className="cabinet-points-label">Всего баллов</div>
                        </div>
                    </div>

                    <div className="cabinet-deposit-button-container">
                        <button 
                            className="cabinet-deposit-button"
                            onClick={() => {
                                // Переходим на страницу выставления счета
                                window.location.href = `/view/invoice/?id=${chatId}`
                            }}
                        >
                            <span className="cabinet-deposit-button-text">Пополнить лицевой счет</span>
                        </button>
                    </div>

                    <div className="cabinet-buttons-row">
                        <button 
                            className="cabinet-leaderboard-button"
                            onClick={fetchLeaderboard}
                        >
                            <span>Рейтинг резидентов</span>
                            <img 
                                src={arrowIcon} 
                                alt="arrow" 
                                className={`cabinet-button-icon ${showLeaderboard ? 'rotated' : ''}`}
                            />
                        </button>
                        <button 
                            className="cabinet-instructions-button"
                            onClick={() => {
                                if (showInstructions) {
                                    setIsInstructionsClosing(true)
                                    setTimeout(() => {
                                        setShowInstructions(false)
                                        setIsInstructionsClosing(false)
                                    }, 300)
                                } else {
                                    setShowInstructions(true)
                                }
                            }}
                        >
                            <span>Как заработать баллы</span>
                            <img 
                                src={arrowIcon} 
                                alt="arrow" 
                                className={`cabinet-button-icon ${showInstructions ? 'rotated' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {showLeaderboard && (
                    <div className={`cabinet-card leaderboard-card ${isClosing ? 'closing' : ''}`}>
                        <h2>🏆 Рейтинг резидентов</h2>
                        
                        {leaderboardLoading ? (
                            <div className="cabinet-loading">
                                Загрузка рейтинга...
                            </div>
                        ) : leaderboardError ? (
                            <div className="cabinet-empty-history">
                                Ошибка загрузки рейтинга: {leaderboardError}
                            </div>
                        ) : leaderboard && leaderboard.length > 0 ? (
                            <>
                                <div className="cabinet-leaderboard-list">
                                    {leaderboard.slice(0, visibleCount).map((item, index) => (
                                        <div 
                                            key={item.chatId} 
                                            className={`cabinet-leaderboard-item ${item.chatId === Number(chatId) ? 'current-user' : ''}`}
                                        >
                                            <div className="cabinet-leaderboard-rank">
                                                {index + 1}
                                            </div>
                                            <div className="cabinet-leaderboard-name">
                                                {item.fullName}
                                            </div>
                                            <div className="cabinet-leaderboard-points">
                                                {item.points} {getPointsWord(item.points)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="cabinet-leaderboard-buttons">
                                    {visibleCount < leaderboard.length && (
                                        <button 
                                            className="cabinet-load-more-button"
                                            onClick={() => setVisibleCount(prev => prev + 20)}
                                        >
                                            Показать еще
                                        </button>
                                    )}
                                    <button 
                                        className="cabinet-hide-leaderboard-button"
                                        onClick={fetchLeaderboard}
                                    >
                                        Скрыть рейтинг
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="cabinet-empty-history">
                                Рейтинг недоступен
                            </div>
                        )}
                    </div>
                )}

                {showInstructions && (
                    <div className={`cabinet-card instructions-card ${isInstructionsClosing ? 'closing' : ''}`}>
                        <PointsInstructions onClose={() => {
                            setIsInstructionsClosing(true)
                            setTimeout(() => {
                                setShowInstructions(false)
                                setIsInstructionsClosing(false)
                            }, 300)
                        }} />
                    </div>
                )}

                <div className="cabinet-card">
                    <h2>История баллов</h2>
                    
                    {userData.pointsHistory && userData.pointsHistory.length > 0 ? (
                        <div className="cabinet-history-list">
                            {userData.pointsHistory.map((item, index) => (
                                <div key={index} className="cabinet-history-item">
                                    <div className="cabinet-history-date">{item.date}</div>
                                    <div className="cabinet-history-title">{item.title}</div>
                                    <div className={`cabinet-history-amount ${item.amount > 0 ? 'positive' : 'negative'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount} {getPointsWord(item.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="cabinet-empty-history">
                            История начисления баллов отсутствует
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PersonalCabinet
