import { useState } from 'react'
import './MembershipAdjustmentPage.css'
import { UserDto, userService } from '../services/userService'
import UserSearch from './UserSearch'

interface MembershipResult {
    success: { user: UserDto; newExpirationDate: string }[]
    failed: UserDto[]
}

function MembershipAdjustmentPage() {
    const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([])
    const [newExpirationDate, setNewExpirationDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<MembershipResult | null>(null)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const formatExpirationDate = (dateString: string | null) => {
        if (!dateString) return 'Не указано'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch {
            return 'Не указано'
        }
    }

    const handleQuickSetDate = (type: 'week' | 'month' | 'year') => {
        const date = new Date()

        switch (type) {
            case 'week':
                // End of current week (Friday)
                const dayOfWeek = date.getDay()
                const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
                date.setDate(date.getDate() + daysUntilFriday)
                break
            case 'month':
                // End of current month
                date.setMonth(date.getMonth() + 1, 0)
                break
            case 'year':
                // End of current year
                date.setMonth(11, 31)
                break
        }

        setNewExpirationDate(date.toISOString().split('T')[0])
    }

    const handleSubmit = async () => {
        const noCompanyId = selectedUsers.filter(u => u.companyId === null)
        const validUsers = selectedUsers.filter(u => u.companyId !== null)

        if (validUsers.length === 0) {
            showNotification('error', 'У выбранных пользователей отсутствует ID компании')
            return
        }

        if (!newExpirationDate) {
            showNotification('error', 'Пожалуйста, выберите новую дату окончания членства')
            return
        }

        setIsSubmitting(true)
        setResult(null)

        try {
            const companyIds = validUsers.map(u => u.companyId as string)
            const updatedResults = await userService.updateMembershipExpiration({
                userIds: companyIds,
                residentUntil: new Date(newExpirationDate).toISOString()
            })

            const updatedSet = new Set(updatedResults.map(r => r.externalId))
            const success = validUsers.filter(u => updatedSet.has(u.companyId as string)).map(user => ({
                user,
                newExpirationDate: newExpirationDate
            }))
            const failed = [
                ...validUsers.filter(u => !updatedSet.has(u.companyId as string)),
                ...noCompanyId
            ]

            setResult({ success, failed })

            if (success.length > 0) {
                showNotification('success', `Даты членства успешно обновлены для ${success.length} пользователей`)
                setSelectedUsers([])
                setNewExpirationDate('')
            } else {
                showNotification('error', 'Не удалось обновить даты членства')
            }
        } catch (error) {
            console.error('Error updating membership expiration:', error)
            showNotification('error', 'Ошибка при обновлении дат членства')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="membership-adjustment-container">
            {notification && (
                <div className={`membership-adjustment-notification membership-adjustment-notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="membership-adjustment-content">
                <div className="membership-adjustment-header">
                    <h1>Корректировка дат членства</h1>
                    <p>Управление сроками окончания членства в сообществе</p>
                </div>

                <div className="membership-adjustment-card">
                    <h2>Выбор пользователей</h2>
                    <div className="membership-adjustment-input-group">
                        <UserSearch
                            selectedUsers={selectedUsers}
                            onUsersChange={setSelectedUsers}
                            placeholder="Поиск по имени..."
                            disabled={isSubmitting}
                            showExpirationDate={true}
                            showExpirationInSelected={true}
                        />
                    </div>
                </div>

                <div className="membership-adjustment-card">
                    <h2>Новая дата окончания членства</h2>

                    <div className="membership-adjustment-input-group">
                        <label>
                            Дата окончания
                        </label>
                        <input
                            type="date"
                            value={newExpirationDate}
                            onChange={(e) => setNewExpirationDate(e.target.value)}
                            className="membership-adjustment-input"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="membership-adjustment-input-group">
                        <label>
                            Быстрая установка
                        </label>
                        <div className="membership-adjustment-quick-buttons">
                            <button
                                type="button"
                                onClick={() => handleQuickSetDate('week')}
                                disabled={isSubmitting}
                                className="membership-adjustment-quick-button"
                            >
                                До конца недели
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickSetDate('month')}
                                disabled={isSubmitting}
                                className="membership-adjustment-quick-button"
                            >
                                До конца месяца
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickSetDate('year')}
                                disabled={isSubmitting}
                                className="membership-adjustment-quick-button"
                            >
                                До конца года
                            </button>
                        </div>
                    </div>
                </div>

                {selectedUsers.length > 0 && (
                    <div className="membership-adjustment-card">
                        <h2>Предпросмотр изменений</h2>
                        <div className="membership-adjustment-preview-table">
                            <div className="membership-adjustment-preview-header">
                                <div className="membership-adjustment-preview-cell">Пользователь</div>
                                <div className="membership-adjustment-preview-cell">Текущая дата</div>
                                <div className="membership-adjustment-preview-cell">Новая дата</div>
                            </div>
                            {selectedUsers.map(user => (
                                <div key={user.chatId} className="membership-adjustment-preview-row">
                                    <div className="membership-adjustment-preview-cell">
                                        <div className="membership-adjustment-preview-name">{user.fullName}</div>
                                        <div className="membership-adjustment-preview-role">{user.role}</div>
                                    </div>
                                    <div className="membership-adjustment-preview-cell">
                                        {formatExpirationDate(user.residentUntil)}
                                    </div>
                                    <div className="membership-adjustment-preview-cell membership-adjustment-preview-new">
                                        {newExpirationDate ? formatExpirationDate(newExpirationDate) : 'Не выбрано'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="membership-adjustment-button-container">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedUsers.length === 0 || !newExpirationDate || isSubmitting}
                        className="membership-adjustment-button"
                    >
                        {isSubmitting ? (
                            <span className="membership-adjustment-button-loader">
                                <span className="membership-adjustment-spinner"></span>
                                Обработка...
                            </span>
                        ) : (
                            `Сохранить изменения${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`
                        )}
                    </button>
                </div>

                {result && (
                    <div className="membership-adjustment-result-card">
                        {result.success.length > 0 && (
                            <div className="membership-adjustment-result-section membership-adjustment-result-success">
                                <div className="membership-adjustment-result-section-header">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M5.5 9L7.5 11L12.5 6.5" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <h3>Успешно обновлено — {result.success.length}</h3>
                                </div>
                                <ul className="membership-adjustment-result-list">
                                    {result.success.map(({ user, newExpirationDate: date }) => (
                                        <li key={user.chatId} className="membership-adjustment-result-item">
                                            <span className="membership-adjustment-result-name">{user.fullName}</span>
                                            {user.telegramUsername && (
                                                <span className="membership-adjustment-result-username">@{user.telegramUsername}</span>
                                            )}
                                            <span className="membership-adjustment-result-date">
                                                {formatExpirationDate(date)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.failed.length > 0 && (
                            <div className="membership-adjustment-result-section membership-adjustment-result-failed">
                                <div className="membership-adjustment-result-section-header">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M6 6L12 12M12 6L6 12" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round"/>
                                    </svg>
                                    <h3>Не удалось обновить — {result.failed.length}</h3>
                                </div>
                                <ul className="membership-adjustment-result-list">
                                    {result.failed.map(u => (
                                        <li key={u.chatId} className="membership-adjustment-result-item">
                                            <span className="membership-adjustment-result-name">{u.fullName}</span>
                                            {u.companyId === null ? (
                                                <span className="membership-adjustment-result-reason">нет ID компании</span>
                                            ) : (
                                                u.telegramUsername && (
                                                    <span className="membership-adjustment-result-username">@{u.telegramUsername}</span>
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

export default MembershipAdjustmentPage
