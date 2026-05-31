import React, { useState } from 'react'
import './IndividualInvoice.css'
import { useUserId } from '../hooks/useUserId'
import {API_BASE_URL} from "../config/api.ts";

enum PaymentPurpose {
    DEPOSIT = 'DEPOSIT',
    CHARITY = 'CHARITY',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT'
}

function IndividualInvoice() {
    const userId = useUserId()

    const [invoiceAmount, setInvoiceAmount] = useState<string>('')
    const [paymentPurpose] = useState<PaymentPurpose>(PaymentPurpose.DEPOSIT)
    const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false)
    const [isPressed, setIsPressed] = useState<boolean>(false)
    const [createdPayment, setCreatedPayment] = useState<any>(null)
    const [copiedUrl, setCopiedUrl] = useState<boolean>(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const handleInvoiceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInvoiceAmount(value)
        }
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 3000)
    }

    const handleCreateInvoice = async () => {
        if (!invoiceAmount) {
            showNotification('error', 'Пожалуйста, введите сумму для начисления')
            return
        }

        setIsCreatingInvoice(true)

        try {
            const paymentData = {
                userId: userId || '',
                amount: Math.ceil(parseFloat(invoiceAmount) * 100), // Конвертируем в копейки
                currency: 'RUB',
                purpose: paymentPurpose,
                type: 'FAST_PAYMENT'
            }

            console.log('Creating fast payment:', paymentData)

            const response = await fetch(`${API_BASE_URL}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
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

            const paymentResult = await response.json()
            console.log('Payment result:', paymentResult)
            setCreatedPayment(paymentResult)

            // Очистка формы
            setInvoiceAmount('')
        } catch (error) {
            console.error('Error creating fast payment:', error)

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

            showNotification('error', errorMessage)
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
        setCreatedPayment(null)
        setInvoiceAmount('')
        setCopiedUrl(false)
    }

    if (!userId) {
        return (
            <div className="individual-invoice-error">
                <h1>Ошибка</h1>
                <p>Требуется ID пользователя. Укажите параметр ?id= в URL.</p>
            </div>
        )
    }

    // Показываем результат создания платежа
    if (createdPayment) {
        const paymentUrl = createdPayment.content?.link
        const base64Image = createdPayment.content?.base64Image
        const issuedAt = createdPayment.createdAt || createdPayment.issuedAt

        return (
            <div className="individual-invoice-container">
                <div className="individual-invoice-content">
                    <div className="payment-success-card">
                        <div className="payment-success-header">
                            <h2>СБП успешно создан!</h2>
                            {/*<p className="payment-notice"> Данные платежа отправлены в личные сообщения с Ботом Бизнес Бани</p>*/}
                        </div>
                        

                        
                        <div className="payment-details">
                            <div className="qr-code-container">
                                <img
                                    src={`data:image/png;base64,${base64Image}`}
                                    alt="QR-код для оплаты"
                                    className="qr-code-image"
                                />
                            </div>
                            <div className="payment-detail-item">
                                <span className="detail-label">Сумма платежа:</span>
                                <span className="detail-value">{(createdPayment.amount / 100).toFixed(2)} ₽</span>
                            </div>
                            <div className="payment-detail-item">
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
                        
                        {paymentUrl && (
                            <div className="payment-url-container">
                                <p className="payment-url-label">Ссылка для оплаты:</p>
                                <div className="payment-url-wrapper">
                                    <a 
                                        href={paymentUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="payment-url-link"
                                    >
                                        {paymentUrl}
                                    </a>
                                    <button
                                        onClick={() => handleCopyUrl(paymentUrl)}
                                        className="copy-button"
                                        title={copiedUrl ? "Скопировано!" : "Копировать ссылку"}
                                    >
                                        {copiedUrl ? "✅" : "📋"}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="payment-actions">
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
                            Сумма начисления
                        </label>
                        <div className="individual-input-wrapper">
                            <input
                                type="text"
                                value={invoiceAmount}
                                onChange={handleInvoiceAmountChange}
                                placeholder="Введите сумму для начисления"
                                className="individual-input"
                            />
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
