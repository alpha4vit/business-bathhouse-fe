import React, { useState } from 'react'
import './BalanceAdjustmentPage.css'
import { UserSearchDto } from '../services/userService'
import { Event } from '../services/eventService'
import {
    balanceAdjustmentService,
    TransactionDirection,
    TransactionPurpose
} from '../services/balanceAdjustmentService'
import UserSearch from './UserSearch'
import EventSearch from './EventSearch'

function BalanceAdjustmentPage() {
    const [selectedUsers, setSelectedUsers] = useState<UserSearchDto[]>([])
    const [amount, setAmount] = useState<string>('')
    const [direction, setDirection] = useState<TransactionDirection>(TransactionDirection.CREDIT)
    const [title, setTitle] = useState<string>('')
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value)
        }
    }


    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            showNotification('error', 'Пожалуйста, выберите хотя бы одного пользователя')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            showNotification('error', 'Пожалуйста, введите корректную сумму')
            return
        }

        if (!title.trim()) {
            showNotification('error', 'Пожалуйста, введите заголовок операции')
            return
        }

        setIsSubmitting(true)

        try {
            const adminId = 1 // TODO: Получить ID админа из контекста авторизации
            let successCount = 0
            let errorCount = 0

            for (const user of selectedUsers) {
                const userId = user.companyId || user.chatId.toString()

                try {
                    await balanceAdjustmentService.adjustBalance({
                        userId: userId,
                        adminId: adminId,
                        amount: {
                            amount: parseFloat(amount) * 100, // Конвертируем в копейки
                            currency: 'RUB'
                        },
                        direction: direction,
                        purpose: TransactionPurpose.MANUAL_ADJUSTMENT,
                        title: selectedEvent ? selectedEvent.title : title.trim(),
                        eventId: selectedEvent ? selectedEvent.id : undefined
                    })
                    successCount++
                } catch (error) {
                    console.error(`Error adjusting balance for user ${user.fullName}:`, error)
                    errorCount++
                }
            }

            if (successCount > 0) {
                showNotification('success', `Баланс успешно скорректирован!`)

                setSelectedUsers([])
                setAmount('')
                setTitle('')
                setSelectedEvent(null)
            } else {
                showNotification('error', 'Не удалось скорректировать баланс')
            }
        } catch (error) {
            console.error('Error adjusting balance:', error)
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при корректировке баланса'
            showNotification('error', errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="balance-adjustment-container">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="balance-adjustment-content">
                <div className="balance-adjustment-header">
                    <h1>Корректировка баланса</h1>
                </div>

                <div className="balance-adjustment-card">
                    <h2>Выбор пользователей</h2>
                    <div className="balance-adjustment-input-group">
                        <UserSearch
                            selectedUsers={selectedUsers}
                            onUsersChange={setSelectedUsers}
                            placeholder="Поиск по фамилии..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="balance-adjustment-card">
                    <h2>Параметры корректировки</h2>

                    <div className="balance-adjustment-input-group">
                        <label>
                            Сумма
                        </label>
                        <div className="balance-adjustment-input-with-suffix">
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="Введите сумму"
                                className="balance-adjustment-input"
                                disabled={isSubmitting}
                            />
                            <span className="balance-adjustment-input-suffix">₽</span>
                        </div>
                    </div>

                    <div className="balance-adjustment-input-group">
                        <label>
                            Тип операции
                        </label>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value as TransactionDirection)}
                            className="balance-adjustment-select"
                            disabled={isSubmitting}
                        >
                            <option value={TransactionDirection.CREDIT}>Начисление</option>
                            <option value={TransactionDirection.DEBIT}>Списание</option>
                        </select>
                    </div>

                    <div className="balance-adjustment-input-group">
                        <label>
                            Заголовок операции
                        </label>
                        <EventSearch
                            selectedEvent={selectedEvent}
                            onEventChange={setSelectedEvent}
                            onInputChange={setTitle}
                            inputValue={title}
                            placeholder="Поиск мероприятия или введите описание..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="balance-adjustment-button-container">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedUsers.length === 0 || !amount || !title.trim() || isSubmitting}
                        className="balance-adjustment-button"
                    >
                        {isSubmitting ? (
                            <span className="balance-adjustment-button-loader">
                                <span className="balance-adjustment-spinner"></span>
                                Обработка...
                            </span>
                        ) : (
                            `Скорректировать баланс`
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BalanceAdjustmentPage
