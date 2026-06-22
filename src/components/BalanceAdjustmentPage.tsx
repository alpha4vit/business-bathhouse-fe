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

const getPluralForm = (count: number, forms: [string, string, string]): string => {
    const n = Math.abs(count)
    const n10 = n % 10
    const n100 = n % 100

    if (n100 >= 11 && n100 <= 19) {
        return forms[2]
    }
    if (n10 === 1) {
        return forms[0]
    }
    if (n10 >= 2 && n10 <= 4) {
        return forms[1]
    }
    return forms[2]
}

const PURPOSES_BY_DIRECTION: Record<TransactionDirection, TransactionPurpose[]> = {
    [TransactionDirection.CREDIT]: [TransactionPurpose.DEPOSIT],
    [TransactionDirection.DEBIT]: [
        TransactionPurpose.EVENT,
        TransactionPurpose.DOWN_PAYMENT,
        TransactionPurpose.SUBSCRIPTION_RENEWAL,
        TransactionPurpose.CHARITY
    ]
}

const PURPOSE_LABELS: Record<TransactionPurpose, string> = {
    [TransactionPurpose.DEPOSIT]: 'Пополнение лицевого счета',
    [TransactionPurpose.DOWN_PAYMENT]: 'Первоначальный взнос',
    [TransactionPurpose.EVENT]: 'Оплата мероприятия',
    [TransactionPurpose.SUBSCRIPTION_RENEWAL]: 'Годовой членский взнос',
    [TransactionPurpose.CHARITY]: 'Благотворительность'
}

function BalanceAdjustmentPage() {
    const [selectedUsers, setSelectedUsers] = useState<UserSearchDto[]>([])
    const [amount, setAmount] = useState<string>('')
    const [direction, setDirection] = useState<TransactionDirection>(TransactionDirection.CREDIT)
    const [purpose, setPurpose] = useState<TransactionPurpose>(TransactionPurpose.DEPOSIT)
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

    const handleDirectionChange = (newDirection: TransactionDirection) => {
        setDirection(newDirection)
        // Сбрасываем purpose, если он не соответствует новому направлению
        const validPurposes = PURPOSES_BY_DIRECTION[newDirection]
        if (!validPurposes.includes(purpose)) {
            setPurpose(validPurposes[0])
        }
    }

    const getAvailablePurposes = (): TransactionPurpose[] => {
        return PURPOSES_BY_DIRECTION[direction] || []
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

        if (!title.trim() && !selectedEvent) {
            showNotification('error', 'Пожалуйста, введите описание операции или выберите мероприятие')
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
                        purpose: purpose,
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
                const userWord = getPluralForm(successCount, ['пользователя', 'пользователей', 'пользователей'])
                const errorMessage = errorCount > 0 ? ` (${errorCount} ${getPluralForm(errorCount, ['пользователя', 'пользователей', 'пользователей'])} с ошибкой)` : ''
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
                            onChange={(e) => handleDirectionChange(e.target.value as TransactionDirection)}
                            className="balance-adjustment-select"
                            disabled={isSubmitting}
                        >
                            <option value={TransactionDirection.CREDIT}>Начисление</option>
                            <option value={TransactionDirection.DEBIT}>Списание</option>
                        </select>
                    </div>

                    <div className="balance-adjustment-input-group">
                        <label>
                            Назначение
                        </label>
                        <select
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value as TransactionPurpose)}
                            className="balance-adjustment-select"
                            disabled={isSubmitting}
                        >
                            {getAvailablePurposes().map(p => (
                                <option key={p} value={p}>{PURPOSE_LABELS[p]}</option>
                            ))}
                        </select>
                    </div>

                    <div className="balance-adjustment-input-group">
                        <label>
                            Мероприятие (опционально)
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
                        disabled={selectedUsers.length === 0 || !amount || (!title.trim() && !selectedEvent) || isSubmitting}
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
