import {useEffect, useState} from 'react'
import './EventRegistrationsPage.css'
import {Event, eventService} from '../services/eventService'
import {API_BASE_URL} from "../config/api.ts";

export type EventParticipationStatus = 'PENDING' | 'REGISTERED' | 'VISITED' | 'NO_SHOW' | 'PENDING_CANCEL' | 'CANCELED'

export type TargetStatus = 'CANCELED' | 'VISITED' | 'NO_SHOW'

const statusLabels: Record<EventParticipationStatus, string> = {
    'PENDING': 'В прогрессе',
    'REGISTERED': 'Зарегистрирован',
    'VISITED': 'Посетил',
    'NO_SHOW': 'Не пришел',
    'PENDING_CANCEL': 'В процессе отмены',
    'CANCELED': 'Отменен'
}

const targetStatusLabels: Record<TargetStatus, string> = {
    'CANCELED': 'Отменена',
    'VISITED': 'Посетил',
    'NO_SHOW': 'Не пришел'
}


export interface UserEventRegistrationDto {
    userId: string
    fullName: string
    status: EventParticipationStatus
    registeredAt: string | null
}

export interface EventRegistrationsDto {
    eventId: string
    title: string
    registrations: UserEventRegistrationDto[]
}

export interface UpdateUserEventRegistrationDto {
    userId: string
    fullName: string
    status: TargetStatus
    registeredAt: string
}

export interface UpdateEventRegistrationsDto {
    eventId: string
    title: string
    registrations: UpdateUserEventRegistrationDto[]
}


function EventRegistrationsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>('')
    const [registrations, setRegistrations] = useState<UserEventRegistrationDto[]>([])
    const [loadingEvents, setLoadingEvents] = useState(true)
    const [loadingRegistrations, setLoadingRegistrations] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isModalClosing, setIsModalClosing] = useState(false)

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        setLoadingEvents(true)
        try {
            const data = await eventService.getEvents()
            setEvents(data)
        } catch (error) {
            console.error('[EventRegistrationsPage] Error loading events:', error)
            showNotification('error', 'Ошибка загрузки мероприятий')
        } finally {
            setLoadingEvents(false)
        }
    }

    const loadRegistrations = async (eventId: string) => {
        setLoadingRegistrations(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/registrations/${eventId}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch registrations: ${response.status}`)
            }
            const data = await response.json()
            setRegistrations(data.registrations)
        } catch (error) {
            console.error('[EventRegistrationsPage] Error loading registrations:', error)
            showNotification('error', 'Ошибка загрузки регистраций')
        } finally {
            setLoadingRegistrations(false)
        }
    }

    const handleEventChange = (eventId: string) => {
        setSelectedEventId(eventId)
        setRegistrations([])
        setHasChanges(false)
        if (eventId) {
            loadRegistrations(eventId)
        }
    }

    const handleStatusChange = (userId: string, newStatus: TargetStatus) => {
        setRegistrations(prev =>
            prev.map(reg =>
                reg.userId === userId
                    ? {...reg, status: newStatus as EventParticipationStatus}
                    : reg
            )
        )
        setHasChanges(true)
    }

    const handleSave = async () => {
        try {
            const updateDto: UpdateEventRegistrationsDto = {
                eventId: selectedEventId,
                title: '', // Will be filled by backend
                registrations: registrations.map(reg => ({
                    userId: reg.userId,
                    fullName: reg.fullName,
                    status: reg.status as TargetStatus,
                    registeredAt: reg.registeredAt || ''
                }))
            }

            const response = await fetch(`${API_BASE_URL}/api/events/registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateDto)
            })

            if (!response.ok) {
                throw new Error(`Failed to update registrations: ${response.status}`)
            }

            showNotification('success', 'Изменения сохранены')
            setHasChanges(false)
            
            // Reload registrations to get updated statuses
            loadRegistrations(selectedEventId)
        } catch (error) {
            console.error('[EventRegistrationsPage] Error saving registrations:', error)
            showNotification('error', 'Ошибка сохранения изменений')
        }
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({type, message})
        setTimeout(() => setNotification(null), 3000)
    }

    const handleCancelEvent = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/cancel/${selectedEventId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to cancel event: ${response.status}`)
            }

            showNotification('success', 'Мероприятие отменено')
            closeModal()
            
            // Reload events and clear selections
            loadEvents()
            setSelectedEventId('')
            setRegistrations([])
            setHasChanges(false)
        } catch (error) {
            console.error('[EventRegistrationsPage] Error canceling event:', error)
            showNotification('error', 'Ошибка отмены мероприятия')
        }
    }

    const closeModal = () => {
        setIsModalClosing(true)
        setTimeout(() => {
            setShowCancelModal(false)
            setIsModalClosing(false)
        }, 300)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <div className="registrations-container">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {showCancelModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className={`modal-content ${isModalClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <h2>Подтверждение отмены мероприятия</h2>
                        <p>Вы уверены, что хотите отменить данное мероприятие, пользователи получат рассылку об отмене, а оплаченные средства начислятся на лицевые счета пользователей</p>
                        <div className="modal-actions">
                            <button
                                className="modal-button modal-button-cancel"
                                onClick={closeModal}
                            >
                                Нет, назад
                            </button>
                            <button
                                className="modal-button modal-button-confirm"
                                onClick={handleCancelEvent}
                            >
                                Да, отменить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="registrations-header">
                <h1>Управление регистрациями</h1>
            </div>

            <div className="registrations-content">
                <div className="event-selector">
                    <label htmlFor="event-select">Выберите мероприятие:</label>
                    <select
                        id="event-select"
                        value={selectedEventId}
                        onChange={(e) => handleEventChange(e.target.value)}
                        disabled={loadingEvents}
                    >
                        <option value="">-- Выберите мероприятие --</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>
                                {event.title}
                            </option>
                        ))}
                    </select>
                </div>

                {loadingRegistrations && (
                    <div className="registrations-loading">
                        <div className="registrations-loading-spinner"></div>
                        <p>Загрузка регистраций...</p>
                    </div>
                )}

                {!loadingRegistrations && registrations.length > 0 && (
                    <div className="registrations-table-wrapper">
                        <table className="registrations-table">
                            <thead>
                            <tr>
                                <th>ID пользователя</th>
                                <th>Полное имя</th>
                                <th>Статус</th>
                                <th>Дата регистрации</th>
                            </tr>
                            </thead>
                            <tbody>
                            {registrations.map(registration => (
                                <tr key={registration.userId}>
                                    <td>{registration.userId}</td>
                                    <td>{registration.fullName}</td>
                                    <td>
                                        <select
                                            value={registration.status}
                                            onChange={(e) => handleStatusChange(registration.userId, e.target.value as TargetStatus)}
                                            className="registrations-select"
                                        >
                                            {!Object.keys(targetStatusLabels).includes(registration.status) && (
                                                <option 
                                                    value={registration.status}
                                                    disabled
                                                >
                                                    {statusLabels[registration.status]}
                                                </option>
                                            )}
                                            {Object.entries(targetStatusLabels).map(([value, label]) => (
                                                <option 
                                                    key={value} 
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{formatDate(registration.registeredAt)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loadingRegistrations && selectedEventId && registrations.length === 0 && (
                    <div className="registrations-empty">
                        <p>Нет регистраций на это мероприятие</p>
                    </div>
                )}

                <div className="registrations-actions">
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        Сохранить
                    </button>
                    <button
                        className="cancel-button"
                        onClick={() => setShowCancelModal(true)}
                        disabled={!selectedEventId}
                    >
                        Отменить мероприятие
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EventRegistrationsPage
