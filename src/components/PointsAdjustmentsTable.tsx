import {useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {PointsAdjustmentDto, pointsService, CompanyDto} from '../services/pointsService'
import './PointsAdjustmentsTable.css'

export default function PointsAdjustmentsTable() {
    const [searchParams] = useSearchParams()
    const eventId = searchParams.get('eventId')

    const [adjustments, setAdjustments] = useState<PointsAdjustmentDto[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deletingRowId, setDeletingRowId] = useState<string | null>(null)
    const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set())

    const [focusedInput, setFocusedInput] = useState<{ value: string; rect: DOMRect } | null>(null)
    const [companies, setCompanies] = useState<CompanyDto[]>([])
    const [autocompleteRowId, setAutocompleteRowId] = useState<string | null>(null)
    const [filteredCompanies, setFilteredCompanies] = useState<CompanyDto[]>([])
    const [autocompletePosition, setAutocompletePosition] = useState<{ top: number; left: number; width: number } | null>(null)

    useEffect(() => {
        if (eventId) {
            loadAdjustments()
        }
        loadCompanies()
    }, [eventId])

    const loadAdjustments = async () => {
        if (!eventId) return

        setLoading(true)
        setError(null)
        try {
            const data = await pointsService.getEventAdjustments(eventId)
            setAdjustments(data)
            setNewRowIds(new Set())
        } catch (err) {
            setError('Не удалось загрузить начисления')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadCompanies = async () => {
        try {
            const data = await pointsService.getAllCompanies()
            setCompanies(data)
        } catch (err) {
            console.error('Failed to load companies:', err)
        }
    }

    const handleAddRow = () => {
        const newId = crypto.randomUUID()
        const previousTitle = adjustments.length > 0 ? adjustments[adjustments.length - 1].title : ''
        const newRow: PointsAdjustmentDto = {
            id: newId,
            userId: '',
            fullName: '',
            eventId: eventId,
            title: previousTitle || '',
            amount: 0,
            status: 'PENDING'
        }
        setAdjustments([...adjustments, newRow])
        setNewRowIds(prev => new Set([...prev, newId]))
    }

    const handleDeleteRow = (id: string) => {
        if (newRowIds.has(id)) {
            // Для новых строк - полное удаление с анимацией
            setDeletingRowId(id)
            setTimeout(() => {
                setAdjustments(adjustments.filter(adj => adj.id !== id))
                setNewRowIds(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(id)
                    return newSet
                })
                setDeletingRowId(null)
            }, 300)
        } else {
            // Для существующих строк - меняем статус на REJECTED
            handleUpdateRow(id, 'status', 'REJECTED')
        }
    }

    const handleUpdateRow = (id: string, field: keyof PointsAdjustmentDto, value: any) => {
        setError(null)
        setAdjustments(adjustments.map(adj =>
            adj.id === id ? {...adj, [field]: value} : adj
        ))
    }

    const handleFullNameChange = (id: string, value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
        handleUpdateRow(id, 'fullName', value)
        setAutocompleteRowId(id)
        if (event) {
            const rect = event.target.getBoundingClientRect()
            setAutocompletePosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
        if (value.length > 0) {
            const filtered = companies.filter(company =>
                company.title.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredCompanies(filtered)
        } else {
            setFilteredCompanies([])
        }
    }

    const handleCompanySelect = (id: string, company: CompanyDto) => {
        setAdjustments(adjustments.map(adj =>
            adj.id === id ? {...adj, userId: company.id, fullName: company.title} : adj
        ))
        setAutocompleteRowId(null)
        setFilteredCompanies([])
        setAutocompletePosition(null)
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            const adjustmentsToSave = adjustments.map(adj => ({
                ...adj,
                status: adj.status === 'PENDING' ? 'CONFIRMED' : adj.status
            }))
            await pointsService.adjustEventPoints(adjustmentsToSave)
            alert('Начисления успешно сохранены!')
            await loadAdjustments()
        } catch (err: any) {
            const errorMessage = err?.message || 'Не удалось сохранить начисления'
            setError(errorMessage)
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target
        const value = input.value

        // Проверяем, помещается ли текст в инпут
        const textWidth = measureTextWidth(value, input)
        const inputWidth = input.offsetWidth

        if (textWidth > inputWidth - 20) { // -20 для padding
            setFocusedInput({
                value,
                rect: input.getBoundingClientRect()
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target
        const value = input.value

        // Если есть активное всплывающее окно, обновляем его значение
        if (focusedInput) {
            const textWidth = measureTextWidth(value, input)
            const inputWidth = input.offsetWidth

            if (textWidth > inputWidth - 20) {
                setFocusedInput({
                    value,
                    rect: input.getBoundingClientRect()
                })
            } else {
                setFocusedInput(null)
            }
        }
    }

    const handleInputBlur = () => {
        setFocusedInput(null)
    }

    const measureTextWidth = (text: string, element: HTMLElement): number => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) return 0

        const styles = window.getComputedStyle(element)
        context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`

        return context.measureText(text).width
    }

    if (loading) {
        return (
            <div className="adjustments-container">
                <div className="adjustments-content">
                    <div className="adjustments-loading">Загрузка...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="adjustments-container">
            <div className="adjustments-content">
                <div className="adjustments-header">
                    <h1>Начисление баллов</h1>
                    {adjustments.length !== 0 && <h1>{adjustments[0].title}</h1>}
                </div>

                <div className="adjustments-card">
                    {error && (
                        <div className="adjustments-error">
                            {error}
                        </div>
                    )}

                    {adjustments.length === 0 ? (
                        <div className="adjustments-empty">
                            Нет начислений для отображения
                        </div>
                    ) : (
                        <div className="adjustments-table-wrapper">
                            <table className="adjustments-table">
                                <thead>
                                <tr>
                                    <th>ID компании</th>
                                    <th>Полное имя</th>
                                    <th>Название</th>
                                    <th>Количество</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {adjustments.map((adj) => (
                                    <tr key={adj.id}
                                        className={`${adj.status === 'REJECTED' ? 'rejected' : ''} ${deletingRowId === adj.id ? 'deleting' : ''}`}>
                                        <td>
                                            <input
                                                type="text"
                                                value={adj.userId}
                                                onChange={(e) => {
                                                    handleUpdateRow(adj.id, 'userId', e.target.value)
                                                    handleInputChange(e)
                                                }}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                readOnly={!newRowIds.has(adj.id)}
                                                className="adjustments-input"
                                                placeholder="ID компании"
                                            />
                                        </td>
                                        <td className="autocomplete-cell">
                                            <input
                                                type="text"
                                                value={adj.fullName || ''}
                                                onChange={(e) => {
                                                    if (newRowIds.has(adj.id)) {
                                                        handleFullNameChange(adj.id, e.target.value, e)
                                                    }
                                                }}
                                                readOnly={!newRowIds.has(adj.id)}
                                                className="adjustments-input"
                                                placeholder="Полное имя"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={adj.title || ''}
                                                onChange={(e) => {
                                                    handleUpdateRow(adj.id, 'title', e.target.value)
                                                    handleInputChange(e)
                                                }}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                className="adjustments-input"
                                                placeholder="Название"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={adj.amount === 0 ? '' : adj.amount}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    if (value === '') {
                                                        handleUpdateRow(adj.id, 'amount', 0)
                                                    } else {
                                                        handleUpdateRow(adj.id, 'amount', parseInt(value) || 0)
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === '') {
                                                        handleUpdateRow(adj.id, 'amount', 0)
                                                    }
                                                }}
                                                className="adjustments-input"
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={adj.status}
                                                onChange={(e) => handleUpdateRow(adj.id, 'status', e.target.value)}
                                                disabled={adj.status === 'APPLIED'}
                                                className="adjustments-select"
                                            >
                                                <option value="PENDING">Ожидает</option>
                                                <option value="CONFIRMED">Подтверждено</option>
                                                <option value="APPLIED" disabled>Применено</option>
                                                <option value="REJECTED">Отклонено</option>
                                            </select>
                                        </td>
                                        <td>
                                            {adj.status === 'REJECTED' ? (
                                                <button
                                                    onClick={() => handleUpdateRow(adj.id, 'status', 'PENDING')}
                                                    className="adjustments-button adjustments-button-restore"
                                                >
                                                    Восстановить
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteRow(adj.id)}
                                                    disabled={adj.status === 'APPLIED'}
                                                    className="adjustments-button adjustments-button-delete"
                                                >
                                                    Удалить
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="adjustments-buttons">
                        <button
                            onClick={handleAddRow}
                            className="adjustments-button adjustments-button-add"
                        >
                            Добавить строку
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="adjustments-button adjustments-button-save"
                        >
                            {saving ? 'Сохранение...' : ' Сохранить'}
                        </button>
                    </div>
                </div>

                {focusedInput && (
                    <div
                        className="adjustments-popover"
                        style={{
                            top: `${focusedInput.rect.bottom + 8}px`,
                            left: `${focusedInput.rect.left}px`,
                            maxWidth: '300px'
                        }}
                    >
                        {focusedInput.value}
                    </div>
                )}

                {autocompleteRowId && filteredCompanies.length > 0 && autocompletePosition && (
                    <div
                        className="autocomplete-dropdown autocomplete-dropdown-fixed"
                        style={{
                            top: `${autocompletePosition.top}px`,
                            left: `${autocompletePosition.left}px`,
                            width: `${autocompletePosition.width}px`
                        }}
                    >
                        {filteredCompanies.map(company => (
                            <div
                                key={company.id}
                                className="autocomplete-item"
                                onClick={() => handleCompanySelect(autocompleteRowId!, company)}
                            >
                                {company.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
