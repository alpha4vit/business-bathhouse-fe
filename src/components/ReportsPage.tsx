import {useEffect, useState} from 'react'
import './ReportsPage.css'
import {
    InputReportMetadata,
    NoneReportMetadata,
    PeriodReportMetadata,
    REPORT_TYPES,
    ReportMetadataType,
    ReportRequestDto,
    reportService,
    ReportType,
    ReportTypeOption
} from '../services/reportService'

function ReportsPage() {
    const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>('')
    const [selectedReportConfig, setSelectedReportConfig] = useState<ReportTypeOption | null>(null)
    const [fromDate, setFromDate] = useState<string>('')
    const [toDate, setToDate] = useState<string>('')
    const [inputValue, setInputValue] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        if (selectedReportType) {
            const config = REPORT_TYPES.find(rt => rt.value === selectedReportType)
            setSelectedReportConfig(config || null)
            // Reset form fields when report type changes
            setFromDate('')
            setToDate('')
            setInputValue('')
        } else {
            setSelectedReportConfig(null)
        }
    }, [selectedReportType])

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({type, message})
        setTimeout(() => setNotification(null), 3000)
    }

    const handleGenerateReport = async () => {
        if (!selectedReportType || !selectedReportConfig) {
            showNotification('error', 'Пожалуйста, выберите тип отчета')
            return
        }

        let metadata: PeriodReportMetadata | InputReportMetadata | NoneReportMetadata

        if (selectedReportConfig.metadataType === ReportMetadataType.PERIOD) {
            if (!fromDate || !toDate) {
                showNotification('error', 'Пожалуйста, укажите период')
                return
            }
            metadata = {
                type: ReportMetadataType.PERIOD,
                from: new Date(fromDate).toISOString(),
                to: new Date(toDate).toISOString()
            }
        } else if (selectedReportConfig.metadataType === ReportMetadataType.INPUT) {
            if (!inputValue.trim()) {
                showNotification('error', 'Пожалуйста, введите данные для отчета')
                return
            }
            metadata = {
                type: ReportMetadataType.INPUT,
                input: inputValue.trim()
            }
        } else {
            metadata = {
                type: ReportMetadataType.EMPTY
            }
        }

        setIsGenerating(true)

        try {
            const request: ReportRequestDto = {
                type: selectedReportType as ReportType,
                metadata
            }

            const blob = await reportService.generateReport(request)
            console.log(blob.size)
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url

            // Get report label for filename
            const filename = `report-${selectedReportConfig.label.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.xlsx`
            a.download = filename

            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            showNotification('success', 'Отчет успешно сгенерирован и скачан')
        } catch (error) {
            console.error('Error generating report:', error)
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при генерации отчета'
            showNotification('error', errorMessage)
        } finally {
            setIsGenerating(false)
        }
    }

    const isFormValid = () => {
        if (!selectedReportType || !selectedReportConfig) return false

        if (selectedReportConfig.metadataType === ReportMetadataType.PERIOD) {
            return fromDate !== '' && toDate !== ''
        }

        if (selectedReportConfig.metadataType === ReportMetadataType.INPUT) {
            return inputValue.trim() !== ''
        }

        return true // NONE type is always valid
    }

    return (
        <div className="reports-container">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="reports-content">
                <div className="reports-header">
                    <h1>Генерация отчетов</h1>
                </div>

                <div className="reports-card">
                    <h2>Генерация отчета</h2>

                    <div className="reports-input-group">
                        <label>
                            Тип отчета
                        </label>
                        <select
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                            className="reports-select"
                            disabled={isGenerating}
                        >
                            <option value="">Выберите тип отчета</option>
                            {REPORT_TYPES.map(reportType => (
                                <option key={reportType.id} value={reportType.value}>
                                    {reportType.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedReportConfig && selectedReportConfig.metadataType === ReportMetadataType.PERIOD && (
                        <>
                            <div className="reports-input-group">
                                <label>
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="reports-input"
                                    disabled={isGenerating}
                                />
                            </div>

                            <div className="reports-input-group">
                                <label>
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="reports-input"
                                    disabled={isGenerating}
                                />
                            </div>
                        </>
                    )}

                    {selectedReportConfig && selectedReportConfig.metadataType === ReportMetadataType.INPUT && selectedReportConfig.enumOptions ? (
                        <div className="reports-input-group">
                            <label>
                                {selectedReportConfig.label}
                            </label>
                            <select
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="reports-select"
                                disabled={isGenerating}
                            >
                                <option value="">Выберите значение</option>
                                {selectedReportConfig.enumOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : selectedReportConfig && selectedReportConfig.metadataType === ReportMetadataType.INPUT && (
                        <div className="reports-input-group">
                            <label>
                                Данные для отчета
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Введите данные..."
                                className="reports-input"
                                disabled={isGenerating}
                            />
                        </div>
                    )}
                </div>

                <div className="reports-button-container">
                    <button
                        onClick={handleGenerateReport}
                        disabled={!isFormValid() || isGenerating}
                        className="reports-button"
                    >
                        {isGenerating ? (
                            <span className="reports-button-loader">
                <span className="reports-spinner"></span>
                Генерация...
              </span>
                        ) : (
                            'Сгенерировать отчет'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportsPage
