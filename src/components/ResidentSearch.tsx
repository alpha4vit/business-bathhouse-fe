import {useState, useEffect, useRef} from 'react'
import './ResidentSearch.css'

interface Resident {
    chatId: number
    fullName: string
    businessDescription?: string
    phoneNumber?: string
    telegramUsername?: string
    achievements: string[]
}

function ResidentSearch() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<Resident[]>([])
    const [loading, setLoading] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([])
            setLoading(false)
            return
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await fetch(`http://localhost:8080/api/user?keyword=${encodeURIComponent(searchTerm)}`, {
                    signal: abortController.signal
                })
                
                if (!response.ok) {
                    throw new Error('Failed to search residents')
                }
                
                const data = await response.json()
                setResults(data)
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Search error:', error)
                }
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            abortController.abort()
        }
    }, [searchTerm])

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
                        Найдено резидентов: {results.length}
                    </div>
                    <div className="search-results-list">
                        {results.map((resident) => (
                            <div key={resident.chatId} className="search-result-card">
                                <div className="search-result-header">
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
                                        <button 
                                            // onClick={() => {
                                            //     const username = resident.telegramUsername.replace('@', '')
                                            //     if (window.Telegram?.WebApp?.openTelegramLink) {
                                            //         window.Telegram.WebApp.openTelegramLink(`https://t.me/${username}`)
                                            //     } else {
                                            //         window.open(`https://t.me/${username}`, '_blank')
                                            //     }
                                            // }}
                                            className="search-result-telegram"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="search-result-telegram-logo">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                                            </svg>
                                            @{resident.telegramUsername.replace('@', '')}
                                        </button>
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
