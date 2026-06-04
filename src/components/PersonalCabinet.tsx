import {useEffect, useState} from 'react'
import './PersonalCabinet.css'
import {userService, UserDataDto} from '../services/userService'
import {useUserId} from '../hooks/useUserId'
import {useCache} from '../utils/cache'
import arrowIcon from '../img/arrow.svg'

function PersonalCabinet() {
    const chatId = useUserId()

    const [userData, setUserData] = useState<UserDataDto | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false)
    const [visibleCount, setVisibleCount] = useState<number>(20)
    const [showInstructions, setShowInstructions] = useState<boolean>(false)
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
        setShowLeaderboard(!showLeaderboard)
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
                                <div className="cabinet-photo-loading"></div>
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
                            onClick={() => setShowInstructions(!showInstructions)}
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
                    <div className="cabinet-card leaderboard-card">
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
                    <div className="cabinet-card instructions-card">
                        <h2>Как заработать баллы</h2>

                        <div className="cabinet-instructions-intro">
                            В целях формирования объективного рейтинга участников бизнес-сообщества «Бизнес Баня» баллы начисляются за следующие активности.
                        </div>

                        <div className="cabinet-instructions-item">
                            <div className="cabinet-instructions-title">
                                <span className="cabinet-instructions-number">1</span>
                                <span>🏢 Посещение внутренних мероприятий</span>
                            </div>
                            <div className="cabinet-instructions-content">
                                <p>За участие в мероприятиях сообщества резидентам начисляются баллы.</p>
                                <div className="cabinet-instructions-highlight">
                                    <p>Перечень ближайших мероприятий, за которые предусмотрено начисление баллов, публикуется один раз в две недели совместно с обновлённой версией рейтинга.</p>
                                </div>
                                <p>Также баллы могут начисляться за участие в партнёрских мероприятиях. Факт начисления баллов в таких случаях всегда указывается в анонсе мероприятия.</p>
                            </div>
                        </div>

                        <div className="cabinet-instructions-item">
                            <div className="cabinet-instructions-title">
                                <span className="cabinet-instructions-number">2</span>
                                <span>⚽ Участие в мероприятиях клубов по интересам</span>
                            </div>
                            <div className="cabinet-instructions-content">
                                <p>Баллы начисляются за посещение активностей спортивных клубов сообщества.</p>
                                <div className="cabinet-instructions-highlight cabinet-instructions-pulse">
                                    <p><strong>Важно:</strong> Следите за анонсами спортивных мероприятий и активно участвуйте в жизни клубов!</p>
                                </div>
                            </div>
                        </div>

                        <div className="cabinet-instructions-item">
                            <div className="cabinet-instructions-title">
                                <span className="cabinet-instructions-number">3</span>
                                <span>🤝 Участие в проекте «Персональный нетворкинг»</span>
                            </div>
                            <div className="cabinet-instructions-content">
                                <p>В рамках данного проекта начисление баллов осуществляется следующим образом:</p>
                                <div className="cabinet-instructions-list-item">
                                    <strong>Инициатор встречи</strong> — <span className="cabinet-instructions-badge">5 баллов</span> за каждую состоявшуюся встречу
                                </div>
                                <div className="cabinet-instructions-highlight">
                                    <p><strong>Совет:</strong> Будьте proactive! Иницируйте встречи с другими резидентами для расширения нетворка и заработка дополнительных баллов.</p>
                                </div>
                            </div>
                        </div>

                        <div className="cabinet-instructions-item">
                            <div className="cabinet-instructions-title">
                                <span className="cabinet-instructions-number">📊</span>
                                <span>Актуальная информация</span>
                            </div>
                            <div className="cabinet-instructions-content">
                                <div className="cabinet-instructions-highlight">
                                    <p>Актуальный рейтинг и перечень мероприятий с начислением баллов публикуются с периодичностью один раз в две недели.</p>
                                </div>
                                <p>Следите за обновлениями в сообществе, чтобы не упустить возможности для заработка баллов!</p>
                            </div>
                        </div>

                        <button
                            className="cabinet-hide-instructions-button"
                            onClick={() => {

                                setTimeout(() => {
                                    setShowInstructions(false)

                                }, 300)
                            }}
                        >
                            Скрыть
                        </button>
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
