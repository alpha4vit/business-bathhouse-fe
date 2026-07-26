import React, { useEffect, useState, useRef } from 'react'
import { eventService, Event } from '../services/eventService'
import './EventSearch.css'

interface EventSearchProps {
    selectedEvent: Event | null
    onEventChange: (event: Event | null) => void
    onInputChange: (value: string) => void
    inputValue: string
    placeholder?: string
    disabled?: boolean
}

const formatDate = (dateValue: string | number[]): string => {
    if (!dateValue) return ''

    try {
        let date: Date
        if (Array.isArray(dateValue)) {
            const [year, month, day, hour, minute] = dateValue
            date = new Date(year, month - 1, day, hour, minute)
        } else {
            date = new Date(dateValue)
        }
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
        return date.toLocaleDateString('ru-RU', options)
    } catch (error) {
        return Array.isArray(dateValue) ? dateValue.join('/') : dateValue
    }
}

function EventSearch({
    selectedEvent,
    onEventChange,
    onInputChange,
    inputValue,
    placeholder = 'Поиск мероприятия...',
    disabled = false
}: EventSearchProps) {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(false)
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
    const [autocompleteOpen, setAutocompleteOpen] = useState(false)
    const [autocompletePosition, setAutocompletePosition] = useState<{ top: number; left: number; width: number } | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        setLoading(true)
        try {
            const data = await eventService.getAllEvents()
            setEvents(data)
        } catch (err) {
            console.error('Failed to load events:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearchChange = (value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange(value)
        // Если пользователь изменил текст вручную и он отличается от выбранного мероприятия, сбрасываем выбор
        if (selectedEvent && value !== selectedEvent.title) {
            onEventChange(null)
        }
        if (event) {
            const rect = event.target.getBoundingClientRect()
            setAutocompletePosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
        if (value.length > 0) {
            const filtered = events.filter(event =>
                event.title && event.title.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredEvents(filtered)
            setAutocompleteOpen(true)
        } else {
            setFilteredEvents([])
            setAutocompleteOpen(false)
        }
    }

    const handleEventSelect = (event: Event) => {
        onEventChange(event)
        onInputChange(event.title)
        setFilteredEvents([])
        setAutocompleteOpen(false)
        setAutocompletePosition(null)
        // Снимаем фокус с инпута после выбора мероприятия
        setTimeout(() => {
            inputRef.current?.blur()
        }, 0)
    }

    const handleClearSelection = () => {
        onEventChange(null)
        onInputChange('')
    }

    const handleBlur = () => {
        // Закрываем автозаполнение при потере фокуса с задержкой
        setTimeout(() => {
            setAutocompleteOpen(false)
            setAutocompletePosition(null)
        }, 200)
    }

    return (
        <div className="event-search-container">
            <div className="event-search-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleSearchChange(e.target.value, e)}
                    onBlur={handleBlur}
                    className="event-search-input"
                    placeholder={placeholder}
                    disabled={disabled || loading}
                />
                {selectedEvent && (
                    <button
                        onClick={handleClearSelection}
                        className="event-search-clear-button"
                        disabled={disabled}
                        title="Очистить выбор"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
                {autocompleteOpen && filteredEvents.length > 0 && autocompletePosition && (
                    <div
                        className="event-search-autocomplete"
                        style={{
                            top: `${autocompletePosition.top}px`,
                            left: `${autocompletePosition.left}px`,
                            width: `${autocompletePosition.width}px`
                        }}
                    >
                        {filteredEvents.map(event => (
                            <div
                                key={event.id}
                                className="event-search-autocomplete-item"
                                onMouseDown={() => handleEventSelect(event)}
                            >
                                <div className="autocomplete-item-title">{event.title}</div>
                                <div className="autocomplete-item-date">{formatDate(event.carryDate)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default EventSearch
