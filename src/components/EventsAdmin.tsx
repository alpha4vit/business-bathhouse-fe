import './EventsAdmin.css'
import './Notification.css'
import {useEffect, useState} from 'react'
import {CreateEventRequest, Event, eventService, UpdateEventRequest} from '../services/eventService'
import SwipeCard from './SwipeCard'
import {useNotification} from '../hooks/useNotification'

const eventTypeLabels: Record<string, string> = {
    'ENTERTAINMENT': 'Развлекательные мероприятия',
    'BATH': 'Банные мероприятия',
    'WITH_SPEAKER': 'Мероприятия со спикером',
    'PARTNERS': 'Партнерские мероприятия'
}

const statusLabels: Record<string, string> = {
    'ACTIVE': 'Активно',
    'CANCELED': 'Отменено',
    'COMPLETED': 'Завершено',
    'REMOVED': 'Удалено',
    'OUTDATED': 'Прошло'
}

function EventsAdmin() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const {notification, showSuccess, showError} = useNotification()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)
    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [previewEvent, setPreviewEvent] = useState<Event | null>(null)
    const [previewIndex, setPreviewIndex] = useState(0)
    const [eventImages, setEventImages] = useState<Map<string, string>>(new Map())
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [searchQuery, setSearchQuery] = useState('')
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalFormData, setOriginalFormData] = useState<CreateEventRequest | null>(null)
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState<CreateEventRequest>({
        title: '',
        type: 'ENTERTAINMENT',
        price: 0,
        points: 0,
        description: '',
        privacy: 'PUBLIC',
        registration_link: '',
        extra_registration_link: '',
        carry_date: ''
    })

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEventImage = async (eventId: string) => {
        if (eventImages.has(eventId) || loadingImages.has(eventId)) {
            return
        }

        setLoadingImages(prev => new Set(prev).add(eventId))

        try {
            const imageUrl = await eventService.getEventImage(eventId)

            if (imageUrl) {
                setEventImages(prev => new Map(prev).set(eventId, imageUrl))
            }
        } catch (error) {
            console.error('[EventsAdmin] Error loading event image:', error)
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev)
                newSet.delete(eventId)
                return newSet
            })
        }
    }

    useEffect(() => {
        events.forEach(event => {
            if (!eventImages.has(event.id)) {
                loadEventImage(event.id)
            }
        })
    }, [])

    const loadEvents = async () => {
        try {

            setLoading(true)
            const data = await eventService.getAllEvents()
            console.log("Loading events", data)
            const sortedEvents = [...data].sort((a, b) => {
                const dateA = new Date(a.carry_date)
                const dateB = new Date(b.carry_date)
                return sortOrder === 'asc'
                    ? dateA.getTime() - dateB.getTime()
                    : dateB.getTime() - dateA.getTime()
            })
            setEvents(sortedEvents)
        } catch (err) {
            showError('Не удалось загрузить мероприятия')
        } finally {
            setLoading(false)
        }
    }

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        const dateA = new Date(a.carry_date)
        const dateB = new Date(b.carry_date)
        return sortOrder === 'asc'
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime()
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCreate = async () => {
        try {
            const requestData = {
                ...formData,
                points: Math.floor(formData.price / 100)
            }
            await eventService.createEvent(requestData, imageFile || undefined)
            setShowCreateModal(false)
            resetForm()
            loadEvents()
            showSuccess('Мероприятие успешно создано')
        } catch (err) {
            console.error('Failed to create event:', err)
            showError('Не удалось создать мероприятие')
        }
    }

    const handleUpdate = async () => {
        if (!editingEvent) return
        try {
            const updateRequest: UpdateEventRequest = {
                ...formData,
                points: Math.floor(formData.price / 100),
                delete_image: !imageFile && !imagePreview
            }
            await eventService.updateEvent(editingEvent.id, updateRequest, imageFile || undefined)
            setEditingEvent(null)
            resetForm()
            loadEvents()
            showSuccess('Мероприятие успешно обновлено')
        } catch (err) {
            console.error('Failed to update event:', err)
            showError('Не удалось обновить мероприятие')
        }
    }

    const handleCancel = async (event: Event) => {
        try {
            await eventService.cancelEvent(event.id)
            loadEvents()
            showSuccess('Мероприятие успешно отменено')
        } catch (err) {
            console.error('Failed to cancel event:', err)
            showError('Не удалось отменить мероприятие')
        }
    }

    const openEditModal = (event: Event) => {
        setEditingEvent(event)

        if (!eventImages.has(event.id)) {
            loadEventImage(event.id)
        }

        let carryDateValue = ''
        if (event.carry_date) {
            try {
                const date = new Date(event.carry_date)
                if (!isNaN(date.getTime())) {
                    carryDateValue = date.toISOString().slice(0, 16)
                }
            } catch (e) {
                console.error('Error parsing date:', e)
            }
        }

        const newFormData = {
            title: event.title || '',
            type: event.type || 'ENTERTAINMENT',
            price: event.price || 0,
            points: event.points || 0,
            description: event.description || '',
            privacy: event.privacy || 'PUBLIC',
            registration_link: event.registration_link || '',
            extra_registration_link: '',
            carry_date: carryDateValue,
        }

        setFormData(newFormData)
        setOriginalFormData(newFormData)
        setHasChanges(false)

        const originalPreview = eventImages.has(event.id) ? eventImages.get(event.id)! : null
        setOriginalImagePreview(originalPreview)
        setImagePreview(originalPreview)
    }

    useEffect(() => {
        if (editingEvent && eventImages.has(editingEvent.id)) {
            const preview = eventImages.get(editingEvent.id)
            if (preview && imagePreview !== preview) {
                setImagePreview(preview)
                setOriginalImagePreview(preview)
            }
        }
    }, [editingEvent, eventImages])

    const openPreviewModal = (event: Event) => {
        setPreviewEvent(event)
        setPreviewIndex(0)
        setShowPreviewModal(true)
        if (!eventImages.has(event.id)) {
            loadEventImage(event.id)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'ENTERTAINMENT',
            price: 0,
            points: 0,
            description: '',
            privacy: 'PUBLIC',
            registration_link: '',
            extra_registration_link: '',
            carry_date: ''
        })
        setImageFile(null)
        setImagePreview(null)
        setOriginalImagePreview(null)
        setIsDragging(false)
        setHasChanges(false)
        setOriginalFormData(null)
    }

    const handlePreviewBeforeSave = () => {
        const tempEvent: Event = {
            id: 'preview',
            title: formData.title,
            carry_date: formData.carry_date,
            type: formData.type,
            price: formData.price,
            points: Math.floor(formData.price / 100),
            description: formData.description,
            status: 'ACTIVE',
            privacy: formData.privacy,
            registration_link: formData.registration_link
        }
        setPreviewEvent(tempEvent)
        if (imagePreview) {
            setEventImages(prev => new Map(prev).set('preview', imagePreview))
        }
        setShowPreviewModal(true)
    }

    const isFormValid = () => {
        return formData.title.trim() !== '' &&
            formData.type !== '' &&
            formData.carry_date !== '' &&
            formData.price >= 0
    }

    useEffect(() => {
        if (originalFormData) {
            const changed = JSON.stringify(formData) !== JSON.stringify(originalFormData) ||
                imageFile !== null ||
                imagePreview !== originalImagePreview
            setHasChanges(changed)
        } else {
            setHasChanges(isFormValid())
        }
    }, [formData, imageFile, imagePreview, originalFormData, originalImagePreview])

    const formatDate = (dateValue: string | undefined | null) => {
        if (!dateValue) return 'Дата не указана'

        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return 'Некорректная дата'

        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    if (loading) {
        return (
            <div className="admin-events-container">
                <div className="admin-events-loading">
                    <div className="admin-events-loading-spinner"></div>
                    <p>Загрузка мероприятий...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {notification && (
                <div
                    className={`notification notification-${notification.type} ${notification.isFading ? 'notification-fading' : ''}`}>
                    {notification.message}
                </div>
            )}
            <div className="admin-events-container">
                <div className="admin-events-header">
                    <h1>Управление мероприятиями</h1>
                    <button
                        className="admin-events-button admin-events-button-contrast"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Создать мероприятие
                    </button>
                </div>

                <div className="admin-events-search">
                    <input
                        type="text"
                        className="admin-events-search-input"
                        placeholder="Поиск по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="admin-events-sort-button"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        title={sortOrder === 'asc' ? 'Сначала старые' : 'Сначала новые'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="9"></line>
                            <polyline points="9 7 12 4 15 7"></polyline>
                            <line x1="12" y1="15" x2="12" y2="19"></line>
                            <polyline points="9 17 12 20 15 17"></polyline>
                        </svg>
                    </button>
                </div>

                <div className="admin-events-list">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="admin-events-item">
                            <div className="admin-events-item-info">
                                <h3>{event.title}</h3>
                                <p className="admin-events-item-type">{eventTypeLabels[event.type] || event.type}</p>
                                <p className="admin-events-item-date">{formatDate(event.carry_date)}</p>
                                {event.price !== undefined && event.price > 0 && (
                                    <p className="admin-events-item-price">{event.price} ₽</p>
                                )}
                                <span
                                    className={`admin-events-status admin-events-status-${event.status.toLowerCase()}`}>
                                {statusLabels[event.status] || event.status}
                            </span>
                            </div>
                            <div className="admin-events-item-actions">
                                <button
                                    className="admin-events-button admin-events-button-secondary"
                                    onClick={() => openPreviewModal(event)}
                                >
                                    Просмотр
                                </button>
                                {event.status === 'ACTIVE' && (
                                    <>
                                        <button
                                            className="admin-events-button admin-events-button-secondary"
                                            onClick={() => openEditModal(event)}
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            className="admin-events-button admin-events-button-danger"
                                            onClick={() => handleCancel(event)}
                                        >
                                            Отменить
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {(showCreateModal || editingEvent) && (
                    <div
                        className={`admin-events-modal ${showCreateModal || editingEvent ? 'open' : ''}`}
                        onClick={() => {
                            setShowCreateModal(false)
                            setEditingEvent(null)
                            resetForm()
                        }}
                    >
                        <div
                            className="admin-events-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2>{editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                editingEvent ? handleUpdate() : handleCreate();
                            }}>
                                <div className="admin-events-form-group">
                                    <label>Название</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Тип мероприятия</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        required
                                    >
                                        <option value="ENTERTAINMENT">Развлекательные мероприятия</option>
                                        <option value="BATH">Банные мероприятия</option>
                                        <option value="WITH_SPEAKER">Мероприятия со спикером</option>
                                        <option value="PARTNERS">Партнерские мероприятия</option>
                                    </select>
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Дата и время проведения</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.carry_date}
                                        onChange={(e) => setFormData({...formData, carry_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Цена (₽)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            price: parseInt(e.target.value) || 0
                                        })}
                                        required
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Описание</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Приватность</label>
                                    <select
                                        value={formData.privacy}
                                        onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                                        required
                                    >
                                        <option value="PUBLIC">Публичное</option>
                                        <option value="PRIVATE">Приватное</option>
                                    </select>
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Ссылка на регистрацию</label>
                                    <input
                                        type="text"
                                        value={formData.registration_link}
                                        onChange={(e) => setFormData({...formData, registration_link: e.target.value})}
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Дополнительная ссылка на регистрацию</label>
                                    <input
                                        type="text"
                                        value={formData.extra_registration_link}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            extra_registration_link: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="admin-events-form-group">
                                    <label>Изображение</label>
                                    <div
                                        className={`admin-events-image-upload ${isDragging ? 'dragging' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="admin-events-image-upload-input"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="admin-events-image-upload-label">
                                            <div className="admin-events-image-upload-icon">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                            </div>
                                            <div className="admin-events-image-upload-text">
                                                {isDragging ? 'Отпустите файл здесь' : 'Перетащите изображение или нажмите для выбора'}
                                            </div>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="admin-events-image-preview">
                                            <img src={imagePreview} alt="Preview"/>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null)
                                                    setImagePreview(null)
                                                    if (editingEvent?.id) {
                                                        eventImages.delete(editingEvent?.id)
                                                    }
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="admin-events-modal-actions">
                                    <button
                                        type="button"
                                        className="admin-events-button admin-events-button-secondary"
                                        onClick={handlePreviewBeforeSave}
                                    >
                                        Предпросмотр
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-events-button admin-events-button-secondary"
                                        onClick={() => {
                                            setShowCreateModal(false)
                                            setEditingEvent(null)
                                            resetForm()
                                        }}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="admin-events-button admin-events-button-primary"
                                        disabled={!hasChanges || !isFormValid()}
                                    >
                                        {editingEvent ? 'Сохранить' : 'Создать'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showPreviewModal && previewEvent && (
                    <div
                        className="admin-events-preview-modal open"
                        onClick={() => {
                            setShowPreviewModal(false)
                            setIsDescriptionExpanded(false)
                        }}
                    >
                        <div
                            className="admin-events-preview-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-events-preview-header">
                                <h2>Предпросмотр мероприятия</h2>
                                <button
                                    className="admin-events-preview-close"
                                    onClick={() => {
                                        setShowPreviewModal(false)
                                        setIsDescriptionExpanded(false)
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            <SwipeCard
                                items={[previewEvent]}
                                currentIndex={previewIndex}
                                onIndexChange={setPreviewIndex}
                                cardClassName="admin-events-preview-swipe-card"
                                renderCard={(evt) => (
                                    <>
                                        <div className="events-result-image">
                                            {eventImages.has(evt.id) ? (
                                                <img
                                                    src={eventImages.get(evt.id)}
                                                    alt={evt.title}
                                                    className="events-result-image-img"
                                                />
                                            ) : (
                                                <div className="events-result-image-placeholder">
                                                    <span style={{fontSize: '64px'}}>📅</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="events-result-header">
                                            <h3 className="events-result-name">{evt.title}</h3>
                                            <div className="events-result-date">
                                                {formatDate(evt.carry_date)}
                                            </div>
                                        </div>

                                        {evt.type && (
                                            <div className="events-result-type">
                                                {eventTypeLabels[evt.type] || evt.type}
                                            </div>
                                        )}

                                        {evt.description && (
                                            <>
                                                <button
                                                    className="events-result-description-toggle"
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                >
                                                    {isDescriptionExpanded ? (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="18 15 12 9 6 15"></polyline>
                                                            </svg>
                                                            Свернуть описание
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                            Развернуть описание
                                                        </>
                                                    )}
                                                </button>

                                                {isDescriptionExpanded && (
                                                    <div
                                                        className="events-result-description"
                                                        dangerouslySetInnerHTML={{__html: evt.description || ''}}
                                                    />
                                                )}
                                            </>
                                        )}

                                        <div className="events-result-info">
                                            {evt.price !== undefined && evt.price > 0 && (
                                                <div className="events-result-price">
                                                    {evt.price} ₽
                                                </div>
                                            )}
                                            {evt.points !== undefined && evt.points > 0 && (
                                                <div className="events-result-points">
                                                    {evt.points} баллов
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default EventsAdmin
