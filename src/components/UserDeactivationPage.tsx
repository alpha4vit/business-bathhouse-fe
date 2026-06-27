import {useState} from 'react'
import './UserDeactivationPage.css'
import {UserSearchDto, userService} from '../services/userService'
import UserSearch from './UserSearch'

interface DeactivationResult {
    success: UserSearchDto[]
    failed: UserSearchDto[]
}

function UserDeactivationPage() {
    const [selectedUsers, setSelectedUsers] = useState<UserSearchDto[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<DeactivationResult | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({type, message})
        setTimeout(() => setNotification(null), 5000)
    }

    const handleDeactivate = async () => {
        const noCompanyId = selectedUsers.filter(u => u.companyId === null)
        const validUsers = selectedUsers.filter(u => u.companyId !== null)

        if (validUsers.length === 0) {
            showNotification('error', 'У выбранных пользователей отсутствует ID компании')
            return
        }

        setIsSubmitting(true)
        setResult(null)

        try {
            const companyIds = validUsers.map(u => u.companyId as string)
            const deactivatedIds = await userService.deactivate(companyIds)

            const deactivatedSet = new Set(deactivatedIds)
            const success = validUsers.filter(u => deactivatedSet.has(u.companyId as string))
            const failed = [
                ...validUsers.filter(u => !deactivatedSet.has(u.companyId as string)),
                ...noCompanyId
            ]

            setResult({success, failed})

            if (success.length > 0) {
                setSelectedUsers([])
            }
        } catch (error) {
            console.error('Error deactivating users:', error)
            showNotification('error', 'Ошибка при выполнении деактивации')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="deactivation-container">
            {notification && (
                <div className={`deactivation-notification deactivation-notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="deactivation-content">
                <div className="deactivation-header">
                    <h1>Принудительная деактивация</h1>
                    <p>Пользователи получат статус "Бывший резидент"</p>
                </div>

                <div className="deactivation-card">
                    <h2>Выбор пользователей</h2>
                    <div className="deactivation-input-group">
                        <UserSearch
                            selectedUsers={selectedUsers}
                            onUsersChange={setSelectedUsers}
                            placeholder="Поиск по имени..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="deactivation-warning-card">
                    <div className="deactivation-warning-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L18.66 17H1.34L10 2Z" stroke="currentColor" strokeWidth="1.5"
                                  strokeLinejoin="round"/>
                            <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <circle cx="10" cy="14" r="0.75" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="deactivation-warning-text">
                        <strong>Внимание!</strong> Это действие необратимо. Деактивированные пользователи
                        потеряют доступ к системе и получат уведомление о деактивации
                    </div>
                </div>

                <div className="deactivation-button-container">
                    <button
                        onClick={handleDeactivate}
                        disabled={selectedUsers.length === 0 || isSubmitting}
                        className="deactivation-button"
                    >
                        {isSubmitting ? (
                            <span className="deactivation-button-loader">
                                <span className="deactivation-spinner"></span>
                                Деактивация...
                            </span>
                        ) : (
                            `Деактивировать${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`
                        )}
                    </button>
                </div>

                {result && (
                    <div className="deactivation-result-card">
                        {result.success.length > 0 && (
                            <div className="deactivation-result-section deactivation-result-success">
                                <div className="deactivation-result-section-header">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M5.5 9L7.5 11L12.5 6.5" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <h3>Успешно деактивированы — {result.success.length}</h3>
                                </div>
                                <ul className="deactivation-result-list">
                                    {result.success.map(u => (
                                        <li key={u.chatId} className="deactivation-result-item">
                                            <span className="deactivation-result-name">{u.fullName}</span>
                                            {u.telegramUsername && (
                                                <span
                                                    className="deactivation-result-username">@{u.telegramUsername}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.failed.length > 0 && (
                            <div className="deactivation-result-section deactivation-result-failed">
                                <div className="deactivation-result-section-header">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M6 6L12 12M12 6L6 12" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round"/>
                                    </svg>
                                    <h3>Не удалось деактивировать — {result.failed.length}</h3>
                                </div>
                                <ul className="deactivation-result-list">
                                    {result.failed.map(u => (
                                        <li key={u.chatId} className="deactivation-result-item">
                                            <span className="deactivation-result-name">{u.fullName}</span>
                                            {u.companyId === null ? (
                                                <span className="deactivation-result-reason">нет ID компании</span>
                                            ) : (
                                                u.telegramUsername && (
                                                    <span
                                                        className="deactivation-result-username">@{u.telegramUsername}</span>
                                                )
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserDeactivationPage
