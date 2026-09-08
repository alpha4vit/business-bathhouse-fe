import React, {useState} from 'react'
import './IndividualInvoice.css'
import './Notification.css'
import {useAuthUser} from '../hooks/useAuthUser'
import {useNotification} from '../hooks/useNotification'
import {API_BASE_URL} from "../config/api.ts";
import {authenticatedFetch} from "../utils/apiClient.ts";

enum PaymentPurpose {
    DEPOSIT = 'DEPOSIT',
    CHARITY = 'CHARITY',
    DOWN_PAYMENT = 'DOWN_PAYMENT',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT'
}

function IndividualInvoice() {
    const {user: authUser, loading: authLoading, error: authError} = useAuthUser()
    const userId = authUser?.company?.id?.toString() || null
    const {notification, showError} = useNotification()
    const [paymentPurpose, setPaymentPurpose] = useState<PaymentPurpose | ''>('')

    const [invoiceAmount, setInvoiceAmount] = useState<string>('')
    const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false)
    const [isPressed, setIsPressed] = useState<boolean>(false)
    const [createdTransaction, setCreatedTransaction] = useState<any>(null)
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false)

    const handleInvoiceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInvoiceAmount(value)
        }
    }

    const handleCreateInvoice = async () => {
        if (!invoiceAmount) {
            showError('Пожалуйста, введите сумму для начисления')
            return
        }

        setIsCreatingInvoice(true)

        try {
            const transactionData = {
                userId: userId || '',
                amount: Math.ceil(parseFloat(invoiceAmount) * 100), // Конвертируем в копейки
                currency: 'RUB',
                purpose: paymentPurpose,
                type: 'FAST_PAYMENT'
            }

            console.log('Creating fast transaction:', transactionData)

            const response = await authenticatedFetch(`${API_BASE_URL}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Проверяем контент-тип ответа
            const contentType = response.headers.get('content-type')
            console.log('Response headers:', response.headers)
            console.log('Response status:', response.status)

            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text()
                console.log('Non-JSON response:', responseText)
                throw new Error('Server returned non-JSON response')
            }

            const transactionResult = await response.json()
            console.log('Transaction result:', transactionResult)
            setCreatedTransaction(transactionResult)

            // Очистка формы
            setInvoiceAmount('')
        } catch (error) {
            console.error('Error creating fast transaction:', error)

            let errorMessage = 'Ошибка при создании СБП. Пожалуйста, попробуйте позже.'

            if (error instanceof Error) {
                if (error.message.includes('HTTP error')) {
                    errorMessage = `Ошибка сервера: ${error.message}`
                } else if (error.message.includes('non-JSON')) {
                    errorMessage = 'Ошибка формата ответа сервера. Счет создан, но возникла проблема с отображением.'
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Ошибка соединения с сервером. Проверьте подключение к интернету.'
                } else {
                    errorMessage = `Ошибка: ${error.message}`
                }
            }

            showError(errorMessage)
        } finally {
            setIsCreatingInvoice(false)
        }
    }

    const handleTouchStart = () => {
        setIsPressed(true)
    }

    const handleTouchEnd = () => {
        setIsPressed(false)
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

    const handleReset = () => {
        setCreatedTransaction(null)
        setInvoiceAmount('')
        setCopiedUrl(false)
    }

    if (authLoading) {
        return (
            <div className="individual-invoice-container">
                <div className="individual-invoice-content">
                    <div className="individual-invoice-loading">
                        Загрузка...
                    </div>
                </div>
            </div>
        )
    }

    if (authError || !userId) {
        return (
            <div className="individual-invoice-error">
                <h1>Ошибка</h1>
                <p>{authError || 'Требуется авторизация'}</p>
            </div>
        )
    }

    // Показываем результат создания транзакции
    if (createdTransaction) {
        const transactionUrl = createdTransaction.content?.link
        const base64Image = createdTransaction.content?.base64Image
        const issuedAt = createdTransaction.createdAt || createdTransaction.issuedAt

        return (
            <div className="individual-invoice-container">
                <div className="individual-invoice-content">
                    <div className="transaction-success-card">
                        <div className="transaction-success-header">
                            <h2>СБП успешно создан!</h2>
                            {/*<p className="transaction-notice"> Данные платежа отправлены в личные сообщения с Ботом Бизнес Бани</p>*/}
                        </div>


                        <div className="transaction-details">
                            <div className="qr-code-container">
                                <img
                                    src={`data:image/png;base64,${base64Image}`}
                                    alt="QR-код для оплаты"
                                    className="qr-code-image"
                                />
                            </div>
                            <div className="transaction-detail-item">
                                <span className="detail-label">Сумма платежа:</span>
                                <span className="detail-value">{(createdTransaction.amount / 100).toFixed(2)} ₽</span>
                            </div>
                            <div className="transaction-detail-item">
                                <span className="detail-label">Дата выставления:</span>
                                <span className="detail-value">{new Date(issuedAt).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>

                        {transactionUrl && (
                            <div className="transaction-url-container">
                                <p className="transaction-url-label">Ссылка для оплаты:</p>
                                <div className="transaction-url-wrapper">
                                    <a
                                        href={transactionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transaction-url-link"
                                    >
                                        {transactionUrl}
                                    </a>
                                    <button
                                        onClick={() => handleCopyUrl(transactionUrl)}
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
                                onClick={handleReset}
                                className="reset-button"
                            >
                                Создать новый СБП
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="individual-invoice-container">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.type === 'success' ? '✅' : '❌'} {notification.message}
                </div>
            )}
            <div className="individual-invoice-content">
                <div className="individual-invoice-card">
                    <h2>Начисление средств через СБП</h2>

                    <div className="individual-input-group">
                        <label>
                            Выберите назначение платежа
                        </label>
                        <select
                            value={paymentPurpose}
                            onChange={(e) => {
                                const value = e.target.value as PaymentPurpose | ''
                                setPaymentPurpose(value)

                                if (value === PaymentPurpose.DOWN_PAYMENT) {
                                    setInvoiceAmount("26000")
                                }
                            }}
                            className="legal-invoice-select"
                        >
                            <option value="">Выберите назначение...</option>
                            <option value={PaymentPurpose.DEPOSIT}>Пополнение лицевого счета резидента для оплаты
                                мероприятий (Бизнес Бани, бизнес завтраков / ужинов и т д)
                            </option>
                            <option value={PaymentPurpose.DOWN_PAYMENT}>Первоначальный взнос</option>
                        </select>

                        <label style={{ marginTop: 20 }}>Сумма начисления</label>

                        <div className="individual-input-wrapper">
                            {/* 2. Блокируем инпут через disabled и передаем чистую строку в value */}
                            <input
                                type="text"
                                disabled={paymentPurpose === PaymentPurpose.DOWN_PAYMENT}
                                value={invoiceAmount}
                                onChange={handleInvoiceAmountChange}
                                placeholder="Введите сумму для начисления"
                                className="individual-input"
                            />
                            <div className="individual-ruble-symbol">₽</div>
                            <div className="individual-ruble-symbol">
                                ₽
                            </div>
                        </div>
                    </div>
                </div>

                <div className="individual-button-container">
                    <button
                        onClick={handleCreateInvoice}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        disabled={!invoiceAmount || isCreatingInvoice}
                        className={`individual-button ${isPressed ? 'individual-button-pressed' : ''}`}
                    >
                        {isCreatingInvoice ? (
                            <span className="individual-button-loader">
                                <span className="individual-spinner"></span>
                                Создание счета...
                            </span>
                        ) : (
                            'Создать СБП'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default IndividualInvoice
