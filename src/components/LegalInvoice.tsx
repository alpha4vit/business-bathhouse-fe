import React, {useEffect, useState} from 'react'
import './LegalInvoice.css'
import {Company, companyService} from '../services/companyService'
import {useUserId} from '../hooks/useUserId'
import CompanyRequisitesInput from './CompanyRequisitesInput'
import {
    InvoiceExistedCompanyDto,
    InvoiceNewCompanyDto,
    invoiceService,
    LegalCompanyType
} from '../services/invoiceService'

enum PaymentPurpose {
    DEPOSIT = 'DEPOSIT',
    CHARITY = 'CHARITY',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT'
}

interface CompanyData {
    title: string
    type: string
    inn: string
    kpp: string
    okpo: string
    ogrn: string
    address: string
    okved: string
}

function LegalInvoice() {
    const userId = useUserId()

    const [legalEntities, setCompanies] = useState<Company[]>([])
    const [selectedEntity, setSelectedEntity] = useState<string>('')
    const [invoiceAmount, setInvoiceAmount] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isPressed, setIsPressed] = useState<boolean>(false)
    const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false)
    const [manualEntryMode, setManualEntryMode] = useState<boolean>(false)
    const [edoType, setEdoType] = useState<string>('')
    const [companyData, setCompanyData] = useState<CompanyData>({
        title: '',
        type: '',
        inn: '',
        kpp: '',
        okpo: '',
        ogrn: '',
        address: '',
        okved: ''
    })
    const [paymentPurpose, setPaymentPurpose] = useState<PaymentPurpose | ''>('')

    const handleInvoiceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInvoiceAmount(value)
        }
    }

    const handleCompanyDataChange = (data: CompanyData) => {
        setCompanyData(data)
    }

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true)
            setError(null)
            try {

                if (!userId) {
                    setCompanies([])
                    setLoading(false)
                    return
                }

                const companies = await companyService.getCompaniesByUserId(userId)

                setCompanies(companies)
            } catch (error) {
                console.error('Failed to fetch companies:', error)
                setError(error instanceof Error ? error.message : 'Не удалось загрузить юридические лица')
                setCompanies([])
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchCompanies()
        }
    }, [userId])

    useEffect(() => {
        if (paymentPurpose === PaymentPurpose.BATHHOUSE_EVENT) {
            setInvoiceAmount('14000')
        }
    }, [paymentPurpose])

    const calculatedAmount = (() => {
        if (!invoiceAmount) return '0'
        
        if (paymentPurpose === PaymentPurpose.BATHHOUSE_EVENT) {
            if (invoiceAmount === '14000') return '13000'
            if (invoiceAmount === '28000') return '26000'
        }
        
        return Math.ceil(parseFloat(invoiceAmount) * 0.92).toFixed(0)
    })()

    const handleCreateInvoice = async () => {
        if (!invoiceAmount || !paymentPurpose) {
            alert('Пожалуйста, введите сумму счета и выберите назначение платежа')
            return
        }

        setIsCreatingInvoice(true)

        try {
            const backendPaymentPurpose = paymentPurpose

            if (manualEntryMode) {
                // Режим ручного ввода с DaData
                if (!companyData.title || !companyData.inn) {
                    alert('Пожалуйста, заполните все обязательные поля компании')
                    setIsCreatingInvoice(false)
                    return
                }

                // Определяем тип компании на основе данных из DaData
                const companyType = companyData.type === 'INDIVIDUAL' ? LegalCompanyType.INDIVIDUAL : LegalCompanyType.LEGAL

                const newCompanyDto: InvoiceNewCompanyDto = {
                    dtoType: 'NEW_COMPANY',
                    userId: userId || '',
                    amount: parseFloat(invoiceAmount),
                    edo: edoType,
                    paymentPurpose: backendPaymentPurpose as any,
                    type: companyType,
                    title: companyData.title,
                    inn: companyData.inn,
                    okpo: companyData.okpo,
                    address: companyData.address,
                    kpp: companyData.kpp,
                    ogrn: companyData.ogrn,
                    okved: companyData.okved
                }

                await invoiceService.createInvoice(newCompanyDto)
                alert('Счет успешно создан!')
            } else {
                // Режим выбора существующей компании
                if (!selectedEntity) {
                    alert('Пожалуйста, выберите юридическое лицо')
                    setIsCreatingInvoice(false)
                    return
                }

                const existedCompanyDto: InvoiceExistedCompanyDto = {
                    dtoType: 'EXISTED_COMPANY',
                    userId: userId || '',
                    amount: parseFloat(invoiceAmount),
                    paymentPurpose: backendPaymentPurpose as any,
                    companyId: selectedEntity
                }

                await invoiceService.createInvoice(existedCompanyDto)
                alert('Счет успешно создан!')
            }
        } catch (error) {
            console.error('Error creating invoice:', error)
            alert('Ошибка при создании счета. Пожалуйста, попробуйте позже.')
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


    const handleCancelManualEntry = () => {
        setManualEntryMode(false)
    }

    if (!userId) {
        return (
            <div className="legal-invoice-error">
                <h1>Ошибка</h1>
                <p>Требуется ID пользователя. Укажите параметр ?id= в URL.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="legal-invoice-error">
                <h1>Ошибка</h1>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="legal-invoice-container">
            <div className="legal-invoice-content">
                <div className="legal-invoice-card">
                    <h2>Выбор юридического лица</h2>

                    {loading ? (
                        <div className="legal-invoice-loading">
                            Загрузка юридических лиц...
                        </div>
                    ) : (
                        <select
                            value={selectedEntity}
                            onChange={(e) => setSelectedEntity(e.target.value)}
                            disabled={manualEntryMode}
                            className="legal-invoice-select"
                        >
                            <option value="">Выберите юридическое лицо...</option>
                            {Array.isArray(legalEntities) && legalEntities.map(entity => (
                                <option key={entity.id} value={entity.id}>
                                    {entity.title}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={manualEntryMode ? handleCancelManualEntry : () => {
                            setSelectedEntity('')
                            setManualEntryMode(true)
                        }}
                        className="legal-invoice-secondary-button"
                    >
                        {manualEntryMode ? 'Скрыть ввод реквизитов' : 'Ввести реквизиты вручную'}
                    </button>
                </div>

                {manualEntryMode && (
                    <div className="legal-invoice-card">
                        <h2>Реквизиты юридического лица</h2>

                        <div className="legal-invoice-input-group">
                            <label>
                                Есть ли у вас ЭДО
                            </label>
                            <select
                                value={edoType}
                                onChange={(e) => setEdoType(e.target.value)}
                                className="legal-invoice-select"
                            >
                                <option value="">Выберите тип ЭДО...</option>
                                <option value="283179">Есть - Диадок</option>
                                <option value="283181">Есть - Астрал</option>
                                <option value="283183">Есть - другая</option>
                                <option value="283185">Нет</option>
                            </select>
                        </div>

                        <CompanyRequisitesInput
                            onCompanyDataChange={handleCompanyDataChange}
                            companyName={companyData.title}
                        />

                    </div>
                )}

                <div className="legal-invoice-card">
                    <h2>Назначение платежа</h2>

                    <div className="legal-invoice-input-group">
                        <label>
                            Выберите назначение платежа
                        </label>
                        <select
                            value={paymentPurpose}
                            onChange={(e) => setPaymentPurpose(e.target.value as PaymentPurpose | '')}
                            className="legal-invoice-select"
                        >
                            <option value="">Выберите назначение...</option>
                            <option value={PaymentPurpose.BATHHOUSE_EVENT}>Банное мероприятие</option>
                            <option value={PaymentPurpose.DEPOSIT}>Пополнение лицевого счета резидента для оплаты
                                мероприятий (Бизнес Бани, бизнес завтраков / ужинов и т д)
                            </option>
                            <option value={PaymentPurpose.CHARITY}>Благотворительный взнос</option>
                            <option value={PaymentPurpose.SUBSCRIPTION_RENEWAL}>Оплата годового членского взноса
                            </option>
                        </select>
                    </div>
                </div>

                <div className="legal-invoice-card">
                    <h2>Сумма счета</h2>

                    <div className="legal-invoice-input-group">
                        <label>
                            Сумма счета
                        </label>
                        {paymentPurpose === PaymentPurpose.BATHHOUSE_EVENT ? (
                            <div className="legal-invoice-input-wrapper">
                                <select
                                    value={invoiceAmount}
                                    onChange={(e) => setInvoiceAmount(e.target.value)}
                                    className="legal-invoice-select"
                                >
                                    <option value="">Выберите сумму...</option>
                                    <option value="14000">14 000 ₽</option>
                                    <option value="28000">28 000 ₽</option>
                                </select>
                            </div>
                        ) : (
                            <div className="legal-invoice-input-wrapper">
                                <input
                                    type="text"
                                    value={invoiceAmount}
                                    onChange={handleInvoiceAmountChange}
                                    placeholder="Введите сумму счета"
                                    className="legal-invoice-input"
                                />
                                <div className="legal-invoice-ruble-symbol">
                                    ₽
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="legal-invoice-input-group">
                        <label>
                            Сумма к зачислению на счет
                        </label>
                        <div className="legal-invoice-input-wrapper">
                            <input
                                type="text"
                                value={calculatedAmount}
                                readOnly
                                className="legal-invoice-input"
                                disabled
                            />
                            <div className="legal-invoice-ruble-symbol">
                                ₽
                            </div>
                        </div>
                    </div>

                    <div className="legal-invoice-note">
                        <strong>Примечание:</strong> На баланс зачисляется 92% от суммы (8% — налог по АУСН)
                    </div>
                </div>

                <div className="legal-invoice-button-container">
                    <button
                        onClick={handleCreateInvoice}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        disabled={(!manualEntryMode && !selectedEntity) || !invoiceAmount || !paymentPurpose || isCreatingInvoice}
                        className={`legal-invoice-button ${isPressed ? 'legal-invoice-button-pressed' : ''}`}
                    >
                        {isCreatingInvoice ? (
                            <span className="legal-invoice-button-loader">
                                <span className="legal-invoice-spinner"></span>
                                Создание счета...
                            </span>
                        ) : (
                            'Создать счет'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LegalInvoice
