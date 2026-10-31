import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, Gender } from '../services/userService'
import { UserDto } from '../services/userService'
import './RegistrationPage.css'
import ReferrerSearch from './ReferrerSearch'
import { telegramUtils } from '../utils/telegram'

interface RegistrationFormData {
    fullName: string
    phoneNumber: string
    business: string
    referrer: UserDto | null
    gender: Gender
}

function RegistrationPage() {
    const navigate = useNavigate()
    
    // Check if running in Telegram mini-app with initData
    useEffect(() => {
        const initData = telegramUtils.getInitData()
        if (!initData) {
            navigate('/otp-login')
        }
    }, [navigate])
    
    const [formData, setFormData] = useState<RegistrationFormData>({
        fullName: '',
        phoneNumber: '',
        business: '',
        referrer: null,
        gender: Gender.MALE
    })
    const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Поле обязательно для заполнения'
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Поле обязательно для заполнения'
        } else if (!/^\+\d{10,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Номер должен начинаться с + и содержать 10-15 цифр'
        }

        if (!formData.business.trim()) {
            newErrors.business = 'Поле обязательно для заполнения'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            await userService.register({
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                business: formData.business,
                referrerId: formData.referrer?.chatId.toString(),
                gender: formData.gender
            })

            // After successful registration, refresh user data
            await userService.getCurrentUser()

            // Redirect to profile and refresh page
            navigate('/cabinet')
            window.location.reload()
        } catch (error) {
            console.error('Registration error:', error)
            setSubmitError(error instanceof Error ? error.message : 'Ошибка при регистрации')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field: keyof RegistrationFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleReferrerChange = (user: UserDto | null) => {
        setFormData(prev => ({ ...prev, referrer: user }))
    }

    return (
        <div className="registration-page">
            <div className="registration-container">
                <div className="registration-header">
                    <h1>Регистрация</h1>
                    <p>Заполните форму для регистрации в системе</p>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-group">
                        <label htmlFor="fullName">ФИО *</label>
                        <input
                            type="text"
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            className={errors.fullName ? 'error' : ''}
                            placeholder="Иванов Иван Иванович"
                        />
                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Телефон *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                            className={errors.phoneNumber ? 'error' : ''}
                            placeholder="+79991234567"
                        />
                        {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="business">Краткое описание бизнеса *</label>
                        <input
                            type="text"
                            id="business"
                            value={formData.business}
                            onChange={(e) => handleChange('business', e.target.value)}
                            className={errors.business ? 'error' : ''}
                            placeholder="ООО Бизнес Баня"
                        />
                        {errors.business && <span className="error-message">{errors.business}</span>}
                    </div>

                    <div className="form-group">
                        <label>Кто порекомендовал (необязательно)</label>
                        <ReferrerSearch
                            selectedUser={formData.referrer}
                            onUserChange={handleReferrerChange}
                            placeholder="Поиск по фамилии..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Пол *</label>
                        <div className="gender-options">
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={Gender.MALE}
                                    checked={formData.gender === Gender.MALE}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                />
                                <span>Мужчина</span>
                            </label>
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value={Gender.FEMALE}
                                    checked={formData.gender === Gender.FEMALE}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                />
                                <span>Женщина</span>
                            </label>
                        </div>
                    </div>

                    {submitError && <div className="submit-error">{submitError}</div>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>

                    <div className="text-link-container">
                        <span
                            className="text-link"
                            onClick={() => navigate('/otp-login')}
                        >
                            Войти в аккаунт
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegistrationPage
