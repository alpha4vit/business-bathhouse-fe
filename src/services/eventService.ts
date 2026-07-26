import {API_BASE_URL} from '../config/api'
import { authenticatedFetch } from '../utils/apiClient'

export interface EventPhoto {
    fileId?: number
    showUrl?: string
    downloadUrl?: string
}

export interface Event {
    id: string
    externalId?: string
    title: string
    carryDate: string | number[]
    type: string
    price?: number
    points?: number
    fullDescription?: EventPhoto
    previewDescription?: EventPhoto
    photo?: EventPhoto
    registrationLink?: string
    status: string
    privacy: string
    createdAt?: number
    extraRegistrationLink?: string
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
    }
}
