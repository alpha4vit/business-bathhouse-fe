import {memo, useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {CompanyDto, PointsAdjustmentDto, pointsService} from '../services/pointsService'
import {Event, eventService} from '../services/eventService'
import './PointsAdjustmentsTable.css'

interface TableProps {
    adjustments: PointsAdjustmentDto[]
    newRowIds: Set<string>
    deletingRowId: string | null
    focusedInput: { value: string; rect: DOMRect } | null
    autocompleteRowId: string | null
    filteredCompanies: CompanyDto[]
    autocompletePosition: { top: number; left: number; width: number } | null
    originalStatuses: Map<string, string>
    onUpdateRow: (id: string, field: keyof PointsAdjustmentDto, value: any) => void
    onFullNameChange: (id: string, value: string, event?: React.ChangeEvent<HTMLInputElement>) => void
    onCompanySelect: (id: string, company: CompanyDto) => void
    onAddRow: () => void
    onDeleteRow: (id: string) => void
    onSave: () => void
    onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onInputBlur: () => void
    saving: boolean
}

const AdjustmentsTable = memo(({
                                   adjustments,
                                   newRowIds,
                                   deletingRowId,
                                   focusedInput,
                                   autocompleteRowId,
                                   filteredCompanies,
                                   autocompletePosition,
                                   originalStatuses,
                                   onUpdateRow,
                                   onFullNameChange,
                                   onCompanySelect,
                                   onAddRow,
                                   onDeleteRow,
                                   onSave,
                                   onInputFocus,
                                   onInputChange,
                                   onInputBlur,
                                   saving
                               }: TableProps) => {
    return (
        <>
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
                        {adjustments.map((adj) => {
                            const originalStatus = originalStatuses.get(adj.id)
                            const isPreFinalStatus = originalStatus === 'PENDING_CANCEL' || originalStatus === 'CONFIRMED'
                            const isReadOnly = !newRowIds.has(adj.id) || isPreFinalStatus

                            return (
                                <tr key={adj.id}
                                    className={`${adj.status === 'CANCELED' || adj.status === 'PENDING_CANCEL' ? 'rejected' : ''} ${deletingRowId === adj.id ? 'deleting' : ''} ${isPreFinalStatus ? 'readonly' : ''}`}>
                                    <td>
                                        <input
                                            type="text"
                                            value={adj.userId}
                                            onChange={(e) => {
                                                onUpdateRow(adj.id, 'userId', e.target.value)
                                                onInputChange(e)
                                            }}
                                            onFocus={onInputFocus}
                                            onBlur={onInputBlur}
                                            readOnly={isReadOnly}
                                            className="adjustments-input"
                                            placeholder="ID компании"
                                        />
                                    </td>
                                    <td className="autocomplete-cell">
                                        <input
                                            type="text"
                                            value={adj.fullName || ''}
                                            onChange={(e) => {
                                                if (!isReadOnly) {
                                                    onFullNameChange(adj.id, e.target.value, e)
                                                }
                                            }}
                                            readOnly={isReadOnly}
                                            className="adjustments-input"
                                            placeholder="Полное имя"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={adj.title || ''}
                                            onChange={(e) => {
                                                onUpdateRow(adj.id, 'title', e.target.value)
                                                onInputChange(e)
                                            }}
                                            onFocus={onInputFocus}
                                            onBlur={onInputBlur}
                                            readOnly={isReadOnly}
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
                                                    onUpdateRow(adj.id, 'amount', 0)
                                                } else {
                                                    onUpdateRow(adj.id, 'amount', parseInt(value) || 0)
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    onUpdateRow(adj.id, 'amount', 0)
                                                }
                                            }}
                                            readOnly={isReadOnly}
                                            className="adjustments-input"
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={adj.status}
                                            onChange={(e) => onUpdateRow(adj.id, 'status', e.target.value)}
                                            disabled={isPreFinalStatus}
                                            className="adjustments-select"
                                        >
                                            {adj.status === 'APPLIED' && (
                                                <>
                                                    <option value="APPLIED" disabled>Применено</option>
                                                    <option value="PENDING_CANCEL">Отменено</option>
                                                </>
                                            )}
                                            {adj.status === 'PENDING_CANCEL' && (
                                                <>
                                                    <option value="APPLIED">Применено</option>
                                                    <option value="PENDING_CANCEL" disabled>Отменено</option>
                                                </>
                                            )}
                                            {adj.status === 'CANCELED' && (
                                                <>
                                                    <option value="CANCELED" disabled>Отклонено</option>
                                                    <option value="CONFIRMED">Подтверждено</option>
                                                </>
                                            )}
                                            {adj.status === 'CONFIRMED' && (
                                                <>
                                                    <option value="CONFIRMED" disabled>Подтверждено</option>
                                                    <option value="PENDING_CANCEL">Отменено</option>
                                                </>
                                            )}
                                            {(newRowIds.has(adj.id) || adj.status === 'PENDING') && (
                                                <>
                                                    <option value="PENDING" disabled>Ожидает</option>
                                                    <option value="CONFIRMED">Подтверждено</option>
                                                </>
                                            )}
                                        </select>
                                    </td>
                                    <td>
                                        {!isPreFinalStatus && (
                                            adj.status === 'CANCELED' || adj.status === 'PENDING_CANCEL' ? (
                                                <button
                                                    onClick={() => onUpdateRow(adj.id, 'status', 'PENDING')}
                                                    className="adjustments-button adjustments-button-restore"
                                                >
                                                    Восстановить
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onDeleteRow(adj.id)}
                                                    className="adjustments-button adjustments-button-delete"
                                                >
                                                    Отклонить
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="adjustments-buttons">
                <button
                    onClick={onAddRow}
                    className="adjustments-button adjustments-button-add"
                >
                    Добавить строку
                </button>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="adjustments-button adjustments-button-save"
                >
                    {saving ? 'Сохранение...' : ' Сохранить'}
                </button>
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
                            onClick={() => onCompanySelect(autocompleteRowId!, company)}
                        >
                            {company.title}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
})

export default function PointsAdjustmentsTable() {
    const [searchParams] = useSearchParams()
    const eventId = searchParams.get('eventId')

    const [adjustments, setAdjustments] = useState<PointsAdjustmentDto[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deletingRowId, setDeletingRowId] = useState<string | null>(null)
    const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set())
    const [originalStatuses, setOriginalStatuses] = useState<Map<string, string>>(new Map())

    const [focusedInput, setFocusedInput] = useState<{ value: string; rect: DOMRect } | null>(null)
    const [companies, setCompanies] = useState<CompanyDto[]>([])
    const [autocompleteRowId, setAutocompleteRowId] = useState<string | null>(null)
    const [filteredCompanies, setFilteredCompanies] = useState<CompanyDto[]>([])
    const [autocompletePosition, setAutocompletePosition] = useState<{
        top: number;
        left: number;
        width: number
    } | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    useEffect(() => {
        if (eventId) {
            loadAdjustments()
        }
        loadCompanies()
        loadEvents()
    }, [eventId])

    const loadAdjustments = async () => {
        if (!eventId) return

        setLoading(true)
        setError(null)
        try {
            const data = await pointsService.getEventAdjustments(eventId)
            setAdjustments(data)
            setNewRowIds(new Set())
            // Сохраняем исходные статусы с бэкенда
            setOriginalStatuses(new Map(data.map(adj => [adj.id, adj.status])))
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

    const loadEvents = async () => {
        try {
            const data = await eventService.getAllEvents()
            const sortedData = [...data].sort((a, b) =>
                new Date(b.carryDate).getTime() - new Date(a.carryDate).getTime()
            )
            setEvents(sortedData)
        } catch (err) {
            console.error('Failed to load events:', err)
        }
    }

    const handleAddRow = () => {
        const newId = crypto.randomUUID()
        const previousTitle = adjustments.length > 0 ? adjustments[adjustments.length - 1].title : ''
        const newRow: PointsAdjustmentDto = {
            id: newId,
            userId: '',
            fullName: '',
            eventId: selectedEvent?.id || eventId || null,
            title: selectedEvent?.title || previousTitle || '',
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
            // Для существующих строк - меняем статус в зависимости от текущего
            const adjustment = adjustments.find(adj => adj.id === id)
            if (adjustment) {
                if (adjustment.status === 'APPLIED') {
                    handleUpdateRow(id, 'status', 'PENDING_CANCEL')
                } else if (adjustment.status === 'PENDING') {
                    handleUpdateRow(id, 'status', 'CANCELED')
                } else {
                    handleUpdateRow(id, 'status', 'CANCELED')
                }
            }
        }
    }

    const handleUpdateRow = (id: string, field: keyof PointsAdjustmentDto, value: any) => {
        setError(null)
        setAdjustments(adjustments.map(adj =>
            adj.id === id ? {...adj, [field]: value} : adj
        ))
    }

    const handleEventChange = async (event: Event | null) => {
        setSelectedEvent(event)
        if (event) {
            // Загружаем начисления для выбранного мероприятия
            setLoading(true)
            setError(null)
            try {
                const data = await pointsService.getEventAdjustments(event.id)
                setAdjustments(data)
                setNewRowIds(new Set())
                // Сохраняем исходные статусы с бэкенда
                setOriginalStatuses(new Map(data.map(adj => [adj.id, adj.status])))
            } catch (err) {
                setError('Не удалось загрузить начисления')
                console.error(err)
            } finally {
                setLoading(false)
            }
        } else {
            // Если мероприятие не выбрано, очищаем таблицу
            setAdjustments([])
            setNewRowIds(new Set())
            setOriginalStatuses(new Map())
        }
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
        // Валидация: количество баллов должно быть строго больше 0 для всех строк, кроме отклоненных
        const invalidRows = adjustments.filter(adj =>
            adj.status !== 'CANCELED' && adj.status !== 'PENDING_CANCEL' && (!adj.amount || adj.amount <= 0)
        )

        if (invalidRows.length > 0) {
            setError('Количество баллов должно быть строго больше 0 для всех строк')
            return
        }

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

    // Если мероприятие выбрано, рендерим только таблицу
    const selectedEventId = selectedEvent?.id || ''
    const eventsList: Event[] = events

    return (
        <div className="adjustments-container">
            <div className="adjustments-content">
                <div className="adjustments-header">
                    <h1>Начисление баллов</h1>
                    {selectedEvent && <h2>{selectedEvent.title}</h2>}
                    {!selectedEvent && adjustments.length !== 0 && <h2>{adjustments[0].title}</h2>}
                </div>

                <div className="adjustments-card">
                    {!selectedEvent && (
                        <div className="adjustments-event-selector">
                            <label>Выберите мероприятие (опционально):</label>
                            <select
                                value={selectedEventId}
                                onChange={(e) => {
                                    const event = eventsList.find(ev => ev.id === e.target.value) || null
                                    handleEventChange(event)
                                }}
                                className="adjustments-select adjustments-event-select"
                            >
                                <option value="">Без мероприятия (кастомное начисление)</option>
                                {eventsList.map(event => (
                                    <option key={event.id} value={event.id}>{event.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {error && (
                        <div className="adjustments-error">
                            {error}
                        </div>
                    )}

                    <AdjustmentsTable
                        adjustments={adjustments}
                        newRowIds={newRowIds}
                        deletingRowId={deletingRowId}
                        focusedInput={focusedInput}
                        autocompleteRowId={autocompleteRowId}
                        filteredCompanies={filteredCompanies}
                        autocompletePosition={autocompletePosition}
                        originalStatuses={originalStatuses}
                        onUpdateRow={handleUpdateRow}
                        onFullNameChange={handleFullNameChange}
                        onCompanySelect={handleCompanySelect}
                        onAddRow={handleAddRow}
                        onDeleteRow={handleDeleteRow}
                        onSave={handleSave}
                        onInputFocus={handleInputFocus}
                        onInputChange={handleInputChange}
                        onInputBlur={handleInputBlur}
                        saving={saving}
                    />
                </div>
            </div>
        </div>
    )
}
