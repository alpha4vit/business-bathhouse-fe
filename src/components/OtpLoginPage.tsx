import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { userStorage } from '../utils/userStorage'
import { useNotification } from '../hooks/useNotification'
import { telegramUtils } from '../utils/telegram'
import './OtpLoginPage.css'
import './Notification.css'

function OtpLoginPage() {
    const navigate = useNavigate()
    const { notification, showError } = useNotification()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false)

    // Check if running in Telegram mini-app
    useEffect(() => {
        const initData = telegramUtils.getInitData()
        setIsTelegramMiniApp(!!initData)
    }, [])

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        const code = otpDigits.join('')
        if (code.length === 6 && !isSubmitting) {
            handleVerifyCode()
        }
    }, [otpDigits])

    const validatePhone = (): boolean => {
        const newErrors: { phone?: string } = {}

        if (!phoneNumber.trim()) {
            newErrors.phone = 'Поле обязательно для заполнения'
        } else if (!/^\+\d{10,15}$/.test(phoneNumber)) {
            newErrors.phone = 'Номер должен начинаться с + и содержать 10-15 цифр'
        }

        setErrors(prev => ({ ...prev, ...newErrors }))
        return Object.keys(newErrors).length === 0
    }

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validatePhone()) {
            return
        }

        setIsSubmitting(true)

        try {
            await authService.createOtpCode(phoneNumber)
            setStep('otp')
            // Focus first OTP input after transition
            setTimeout(() => {
                inputRefs.current[0]?.focus()
            }, 100)
        } catch (error) {
            console.error('Error creating OTP code:', error)
            showError(error instanceof Error ? error.message : 'Ошибка при отправке кода')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleVerifyCode = async () => {
        setErrors(prev => ({ ...prev, otp: undefined }))

        const code = otpDigits.join('')
        if (code.length !== 6) {
            return
        }

        setIsSubmitting(true)

        try {
            const response = await authService.checkOtpCode(phoneNumber, code)
            
            // Save access token
            userStorage.setAccessToken(response.accessToken)
            
            // Navigate to cabinet
            navigate('/cabinet')
        } catch (error) {
            console.error('Error verifying OTP code:', error)
            showError(error instanceof Error ? error.message : 'Ошибка при проверке кода')
            setErrors(prev => ({ ...prev, otp: 'Неверный код' }))
            inputRefs.current[0]?.focus()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOtpDigitChange = (index: number, value: string) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(0, 1)
        
        const newDigits = [...otpDigits]
        newDigits[index] = digit
        setOtpDigits(newDigits)
        
        // Clear error when user starts typing
        if (errors.otp) {
            setErrors(prev => ({ ...prev, otp: undefined }))
        }

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace to focus previous input
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        
        // Handle arrow keys for navigation
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        
        const newDigits = [...otpDigits]
        for (let i = 0; i < pastedData.length; i++) {
            newDigits[i] = pastedData[i]
        }
        setOtpDigits(newDigits)
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(pastedData.length, 5)
        inputRefs.current[nextIndex]?.focus()
    }

    const handleBackToPhone = () => {
        setStep('phone')
        setPhoneNumber('')
        setOtpDigits(['', '', '', '', '', ''])
        setErrors({})
    }

    return (
        <div className="otp-login-page">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="otp-login-container">
                <div className="otp-login-header">
                    <h1>{step === 'phone' ? 'Вход по номеру телефона' : 'Введите код'}</h1>
                    <p>
                        {step === 'phone' 
                            ? 'Введите номер телефона для получения кода доступа в Telegram'
                            : 'Введите 6-значный код, отправленный в Telegram'
                        }
                    </p>
                </div>

                {step === 'phone' ? (
                    <form onSubmit={handleSendCode} className="otp-login-form">
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Номер телефона *</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value)
                                    if (errors.phone) {
                                        setErrors(prev => ({ ...prev, phone: undefined }))
                                    }
                                }}
                                className={errors.phone ? 'error' : ''}
                                placeholder="+79991234567"
                                disabled={isSubmitting}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Отправка...' : 'Получить код в Telegram'}
                        </button>

                        {isTelegramMiniApp && (
                            <div className="text-link-container">
                                <span
                                    className="text-link"
                                    onClick={() => navigate('/register')}
                                >
                                    Зарегистрироваться
                                </span>
                            </div>
                        )}
                    </form>
                ) : (
                    <form className="otp-login-form">
                        <div className="phone-display">
                            <span className="phone-label">Код отправлен на:</span>
                            <span className="phone-number">{phoneNumber}</span>
                        </div>

                        <div className="form-group">
                            <label>Код из Telegram *</label>
                            <div className="otp-digits-container">
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={handleOtpPaste}
                                        className={`otp-digit-input ${errors.otp ? 'error' : ''}`}
                                        disabled={isSubmitting}
                                    />
                                ))}
                            </div>
                            {errors.otp && <span className="error-message">{errors.otp}</span>}
                        </div>

                        <button
                            type="button"
                            className="back-button"
                            onClick={handleSendCode}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Отправка...' : 'Отправить код повторно'}
                        </button>

                        <button
                            type="button"
                            className="back-button"
                            onClick={handleBackToPhone}
                            disabled={isSubmitting}
                        >
                            Изменить номер
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default OtpLoginPage
