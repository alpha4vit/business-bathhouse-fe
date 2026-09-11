import {API_BASE_URL} from '../config/api'
import {authenticatedFetch} from '../utils/apiClient'

export interface Event {
    id: string
    title: string
    type: string
    carry_date: string
    price?: number
    points?: number
    description?: string
    registration_link?: string
    status: string
    privacy: string
    imageUrl?: string
}

export interface CreateEventRequest {
    title: string
    type: string
    price: number
    points: number
    description: string
    privacy: string
    registration_link: string
    extra_registration_link: string
    carry_date: string
}

export interface UpdateEventRequest {
    title: string
    type: string
    price: number
    points: number
    description: string
    privacy: string
    registration_link: string
    extra_registration_link: string
    carry_date: string
    delete_image: boolean
}

export const eventService = {
    async getEvents(type?: string): Promise<Event[]> {
        try {
            const url = new URL(`${API_BASE_URL}/api/events`)
            if (type) {
                url.searchParams.append('type', type)
            }

            console.log('[eventService] Запрос к API:', url.toString())
            const response = await authenticatedFetch(url.toString())

            console.log('[eventService] Статус ответа:', response.status)
            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.status}`)
            }

            const data = await response.json()
            console.log('[eventService] Получены данные:', data)
            return data
        } catch (error) {
            console.error('[eventService] Error fetching events:', error)
            throw error
        }
    },

    async getAllEvents(): Promise<Event[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/events/all`)

            if (!response.ok) {
                throw new Error(`Failed to fetch all events: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('[eventService] Error fetching all events:', error)
            throw error
        }
    },

    async createEvent(request: CreateEventRequest, image?: File): Promise<Event> {
        try {
            const formData = new FormData()
            const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
            formData.append('request', jsonBlob)

            if (image) {
                formData.append('image', image)
            }

            const response = await authenticatedFetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`Failed to create event: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('[eventService] Error creating event:', error)
            throw error
        }
    },

    async updateEvent(eventId: string, request: UpdateEventRequest, image?: File): Promise<void> {
        try {
            const formData = new FormData()
            const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
            formData.append('request', jsonBlob)

            if (image) {

                formData.append('image', image)
            }

            const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'PUT',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`Failed to update event: ${response.status}`)
            }
        } catch (error) {
            console.error('[eventService] Error updating event:', error)
            throw error
        }
    },

    async cancelEvent(eventId: string): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}/cancel`, {
                method: 'PUT'
            })

            if (!response.ok) {
                throw new Error(`Failed to cancel event: ${response.status}`)
            }
        } catch (error) {
            console.error('[eventService] Error canceling event:', error)
            throw error
        }
    },

    async getHtml(htmlUrl: string): Promise<string> {
        try {
            const url = new URL(htmlUrl)
            const path = url.pathname + url.search
            const encodedPath = encodeURIComponent(path)
            
            const response = await authenticatedFetch(`${API_BASE_URL}/api/bitrix/image?path=${encodedPath}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch HTML: ${response.status}`)
            }

            const html = await response.text()
            return html
        } catch (error) {
            console.error('[eventService] Error fetching HTML:', error)
            throw error
        }
    },

    async getEventImage(eventId: string): Promise<string | null> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}/image`)

            if (!response.ok) {
                if (response.status === 404) {
                    return null
                }
                throw new Error(`Failed to fetch event image: ${response.status}`)
            }

            const blob = await response.blob()
            return URL.createObjectURL(blob)
        } catch (error) {
            console.error('[eventService] Error fetching event image:', error)
            return null
        }
    }
}
