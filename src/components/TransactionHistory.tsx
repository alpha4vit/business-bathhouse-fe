import {useEffect, useState} from 'react'
import {paymentService, TransactionDto, TransactionDirection} from '../services/paymentService'
import {userService, UserDataDto} from '../services/userService'
import {useUserId} from '../hooks/useUserId'
import './TransactionHistory.css'

export default function TransactionHistory() {
    const userId = useUserId()
    const [transactions, setTransactions] = useState<TransactionDto[]>([])
    const [userData, setUserData] = useState<UserDataDto | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (userId) {
            loadUserData()
            loadTransactions()
        }
    }, [userId])

    const loadUserData = async () => {
        if (!userId) return

        try {
            const data = await userService.getUserData(userId)
            setUserData(data)
        } catch (err) {
            console.error('Failed to load user data:', err)
        }
    }

    const loadTransactions = async () => {
        if (!userId) {
            setError('ID пользователя не найден')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await paymentService.getTransactionHistory(userId)
            setTransactions(data)
        } catch (err) {
            setError('Не удалось загрузить журнал операций')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatAmount = (amount: number, currency: string, direction: TransactionDirection) => {
        const sign = direction === TransactionDirection.CREDIT ? '+' : '-'
        const formattedAmount = (amount / 100).toLocaleString('ru-RU', {
            style: 'currency',
            currency: currency
        })
        return `${sign}${formattedAmount}`
    }

    const getDirectionLabel = (direction: TransactionDirection) => {
        return direction === TransactionDirection.CREDIT ? 'Приход' : 'Расход'
    }

    const getDirectionClass = (direction: TransactionDirection) => {
        return direction === TransactionDirection.CREDIT ? 'credit' : 'debit'
    }

    if (loading) {
        return (
            <div className="transactions-container">
                <div className="transactions-content">
                    <div className="transactions-loading">Загрузка...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="transactions-container">
            <div className="transactions-content">
                <div className="transactions-header">
                    <h1>Журнал операций</h1>
                    {userData && (
                        <div className="transactions-balance">
                            Текущий баланс: {userData.balance.amount.toLocaleString('ru-RU')} {userData.balance.currency}
                        </div>
                    )}
                </div>

                <div className="transactions-card">
                    {error && (
                        <div className="transactions-error">
                            {error}
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <div className="transactions-empty">
                            Нет операций для отображения
                        </div>
                    ) : (
                        <>
                            <div className="transactions-table-wrapper desktop-only">
                                <table className="transactions-table">
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Операция</th>
                                        <th>Сумма</th>
                                        <th>Тип</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.date}>
                                            <td className="transactions-date">
                                                {formatDate(transaction.date)}
                                            </td>
                                            <td className="transactions-title">
                                                {transaction.title}
                                            </td>
                                            <td className={`transactions-amount ${getDirectionClass(transaction.direction)}`}>
                                                {formatAmount(transaction.amount, transaction.currency, transaction.direction)}
                                            </td>
                                            <td className={`transactions-direction ${getDirectionClass(transaction.direction)}`}>
                                                {getDirectionLabel(transaction.direction)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="transactions-cards mobile-only">
                                {transactions.map((transaction) => (
                                    <div key={transaction.date} className="transaction-card">
                                        <div className="transaction-card-header">
                                            <span className="transaction-card-date">{formatDate(transaction.date)}</span>
                                            <span className={`transaction-card-direction ${getDirectionClass(transaction.direction)}`}>
                                                {getDirectionLabel(transaction.direction)}
                                            </span>
                                        </div>
                                        <div className="transaction-card-title">
                                            {transaction.title}
                                        </div>
                                        <div className={`transaction-card-amount ${getDirectionClass(transaction.direction)}`}>
                                            {formatAmount(transaction.amount, transaction.currency, transaction.direction)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
