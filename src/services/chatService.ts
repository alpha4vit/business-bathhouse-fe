import {API_BASE_URL} from '../config/api'
import { authenticatedFetch } from '../utils/apiClient'

export interface Chat {
    id: number
    title: string
    description?: string
    memberCount?: number
    lastMessage?: string
    lastMessageTime?: string
    link?: string
    joinLink?: string
}

export const chatService = {
    async getChats(): Promise<Chat[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/chats`)

            if (!response.ok) {
                throw new Error(`Failed to fetch chats: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching chats:', error)
            throw error
        }
    },

    async getChatImage(chatId: number): Promise<string | null> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/chats/${chatId}/image`)

            if (!response.ok) {
                console.log(`Chat ${chatId} image not found (status: ${response.status})`)
                return null
            }

            const blob = await response.blob()
            if (blob.size === 0) {
                console.log(`Chat ${chatId} image is empty`)
                return null
            }
            return URL.createObjectURL(blob)
        } catch (error) {
            console.error('Error fetching chat image:', error)
            return null
        }
    },

    async getInviteLink(chatId: number): Promise<string | null> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/chats/link?chatId=${chatId}`)

            if (!response.ok || response.status === 401 || response.status === 400) {
                return null
            }

            return await response.text()
        } catch (error) {
            console.error('Error fetching invite link:', error)
            return null
        }
    }
}
