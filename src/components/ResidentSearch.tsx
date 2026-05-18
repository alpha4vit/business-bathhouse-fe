import {useState, useEffect} from 'react'
import './ResidentSearch.css'
import {userService, Resident} from '../services/userService'

function ResidentSearch() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Resident[]>([])
    const [loading, setLoading] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [failedAvatars, setFailedAvatars] = useState<Set<number>>(new Set())
    const [loadingAvatars, setLoadingAvatars] = useState<Set<number>>(new Set())

    const handleAvatarError = (resident: Resident, event: React.SyntheticEvent<HTMLImageElement>) => {
        const imgElement = event.currentTarget
        console.error(`[ResidentSearch] ❌ Ошибка загрузки аватара для ${resident.fullName} (chatId: ${resident.chatId})`)
        console.error(`[ResidentSearch] URL который не загрузился: ${resident.avatar}`)
        console.error(`[ResidentSearch]naturalWidth: ${imgElement.naturalWidth}, naturalHeight: ${imgElement.naturalHeight}`)
        console.error(`[ResidentSearch] Ошибка изображения:`, event)
        setFailedAvatars(prev => new Set(prev).add(resident.chatId))
        setLoadingAvatars(prev => {
            const newSet = new Set(prev)
            newSet.delete(resident.chatId)
            return newSet
        })
    }

    // Callback для обновления аватара конкретного резидента
    const updateResidentAvatar = (chatId: number, avatarUrl: string | undefined) => {
        setResults(prev => prev.map(resident => 
            resident.chatId === chatId 
                ? { ...resident, avatar: avatarUrl }
                : resident
        ))
        setLoadingAvatars(prev => {
            const newSet = new Set(prev)
            newSet.delete(chatId)
            return newSet
        })
    }

    // Регистрируем callback глобально для доступа из userService
    useEffect(() => {
        (window as any).updateResidentAvatar = updateResidentAvatar
        return () => {
            delete (window as any).updateResidentAvatar
        }
    }, [])

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([])
            setLoading(false)
            setCurrentIndex(0)
            setFailedAvatars(new Set())
            setLoadingAvatars(new Set())
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            setFailedAvatars(new Set())
            setLoadingAvatars(new Set())
            try {
                const data = await userService.searchResidents(searchTerm)
                setResults(data)
                setCurrentIndex(0)
                
                // Добавляем резидентов в загрузку аватаров только если у них есть источник фото
                const avatarLoadingSet = new Set<number>()
                data.forEach(resident => {
                    if (resident.hasPhotoSource) {
                        avatarLoadingSet.add(resident.chatId)
                    }
                })
                setLoadingAvatars(avatarLoadingSet)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [searchTerm])

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
        setTouchStartY(e.touches[0].clientY)
        setIsDragging(true)
        setSwipeOffset(0)
        setIsHorizontalSwipeStarted(false)
        setIsSwiping(false)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY
        const diffX = currentX - touchStart
        const diffY = Math.abs(currentY - (touchStartY || 0))

        // Если вертикальное движение больше горизонтального и горизонтальный свайп еще не начался, не обрабатываем свайп
        if (diffY > Math.abs(diffX) && diffY > 30 && !isHorizontalSwipeStarted) {
            setIsDragging(false)
            return
        }

        // Если горизонтальное движение достаточно большое, блокируем вертикальный скролл
        if (Math.abs(diffX) > 20) {
            setIsHorizontalSwipeStarted(true)
            setIsSwiping(true)
            e.preventDefault()
        }

        const threshold = 50

        if (diffX < -threshold && currentIndex < results.length - 1 && !swipeDirection) {
            setSwipeDirection('left')
        } else if (diffX > threshold && currentIndex > 0 && !swipeDirection) {
            setSwipeDirection('right')
        }

        setSwipeOffset(diffX)
    }

    const [touchStart, setTouchStart] = useState(0)
    const [touchStartY, setTouchStartY] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
    const [isHorizontalSwipeStarted, setIsHorizontalSwipeStarted] = useState(false)
    const [isSwiping, setIsSwiping] = useState(false)

    const handleTouchEnd = () => {
        if (!isDragging) return
        setIsDragging(false)
        setIsHorizontalSwipeStarted(false)
        setIsSwiping(false)

        if (swipeDirection === 'left' && currentIndex < results.length - 1) {
            setIsAnimating(true)
            setSwipeOffset(-500)
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setSwipeDirection(null)
            }, 300)
        } else if (swipeDirection === 'right' && currentIndex > 0) {
            setIsAnimating(true)
            setSwipeOffset(500)
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setSwipeDirection(null)
            }, 300)
        } else {
            setSwipeOffset(0)
            setSwipeDirection(null)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0 && !isAnimating) {
            setIsAnimating(true)
            setSwipeOffset(500)
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1)
                setIsAnimating(false)
                setSwipeOffset(0)
            }, 300)
        }
    }

    const handleNext = () => {
        if (currentIndex < results.length - 1 && !isAnimating) {
            setIsAnimating(true)
            setSwipeOffset(-500)
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1)
                setIsAnimating(false)
                setSwipeOffset(0)
            }, 300)
        }
    }

    return (
        <div className="search-container">
            <div className="search-header">
                <h1>🔍 Поиск резидентов</h1>
                <p className="search-subtitle">Найдите резидентов по имени, описанию бизнеса или компании</p>
            </div>

            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Введите ключевые слова для поиска..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {loading && <div className="search-loading">Поиск...</div>}
            </div>

            {searchTerm.length > 0 && searchTerm.length < 2 && (
                <div className="search-hint">
                    Введите минимум 2 символа для поиска
                </div>
            )}

            {results.length > 0 && (
                <div className="search-results">
                    <div className="search-results-count">
                        {currentIndex + 1} из {results.length}
                    </div>
                    
                    <div className="search-navigation-wrapper">
                        <button
                            className="search-nav-button search-nav-prev"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0 || isAnimating}
                            aria-label="Предыдущий резидент"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        
                        <div
                            className={`search-card-container ${isSwiping ? 'swiping' : ''}`}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {results.map((resident, index) => (
                                <div
                                    key={resident.chatId}
                                    className={`search-result-card ${index === currentIndex ? 'active' : ''} ${isAnimating ? (index < currentIndex ? 'swiping-left' : 'swiping-right') : ''} ${isDragging && index === currentIndex ? 'dragging' : ''}`}
                                    style={{
                                        display: index === currentIndex || (isAnimating && (index === currentIndex - 1 || index === currentIndex + 1)) ? 'flex' : 'none',
                                        transform: index === currentIndex && !isAnimating ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)` : undefined
                                    }}
                                >
                                    <div className="search-result-header">
                                        <div className="search-result-avatar large">
                                            {resident.hasPhotoSource && loadingAvatars.has(resident.chatId) ? (
                                                <div className="search-result-avatar-skeleton"></div>
                                            ) : resident.avatar && !failedAvatars.has(resident.chatId) ? (
                                                <img 
                                                    src={resident.avatar} 
                                                    alt={`Аватар ${resident.fullName}`}
                                                    className="search-result-avatar-img"
                                                    onError={(e) => handleAvatarError(resident, e)}
                                                />
                                            ) : (
                                                <div className="search-result-avatar-placeholder">
                                                    {resident.fullName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="search-result-name">{resident.fullName}</h3>
                                    </div>

                                    {resident.achievements && resident.achievements.length > 0 && (
                                        <div className="search-result-achievements">
                                            {resident.achievements.map((achievement, index) => (
                                                <span key={index} className="search-result-achievement">
                                                    {achievement}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {resident.businessDescription && (
                                        <div className="search-result-description">
                                            {resident.businessDescription}
                                        </div>
                                    )}

                                    <div className="search-result-contacts">
                                        {resident.telegramUsername && (
                                            <a
                                                href={`https://t.me/${resident.telegramUsername.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="search-result-telegram"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="search-result-telegram-logo">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                                </svg>
                                                @{resident.telegramUsername.replace('@', '')}
                                            </a>
                                        )}

                                        {resident.phoneNumber && (
                                            <div className="search-result-phone">
                                                📞 {resident.phoneNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button
                            className="search-nav-button search-nav-next"
                            onClick={handleNext}
                            disabled={currentIndex === results.length - 1 || isAnimating}
                            aria-label="Следующий резидент"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {searchTerm.length >= 2 && !loading && results.length === 0 && (
                <div className="search-empty">
                    <p>По вашему запросу ничего не найдено</p>
                    <p className="search-empty-hint">Попробуйте изменить ключевые слова</p>
                </div>
            )}
        </div>
    )
}

export default ResidentSearch
