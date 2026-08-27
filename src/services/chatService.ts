import {API_BASE_URL} from '../config/api'
import {authenticatedFetch} from '../utils/apiClient'

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
            console.log(`Fetching invite link for chat ${chatId}...`)
            const response = await authenticatedFetch(`${API_BASE_URL}/api/chats/link?chatId=${chatId}`)
            console.log(`Invite link response status for chat ${chatId}:`, response.status)

            if (!response.ok || response.status === 401 || response.status === 400 || response.status === 428) {
                console.log(`Invite link not available for chat ${chatId}, status: ${response.status}`)
                return null
            }

            const link = await response.text()
            console.log(`Got invite link for chat ${chatId}:`, link)
            return link
        } catch (error) {
            console.error('Error fetching invite link:', error)
            return null
        }
    },

    async sendJoinChatRequest(chatId: number): Promise<void> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/chats/${chatId}/request`, {
            method: 'POST',
        })

        if (!response.ok) {
            throw new Error("Ошибка отправки запроса на вступление в чат!")
        }
    },

    async getMandatoryChats(): Promise<Chat[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/chats/resident?type=USER&requirement=MANDATORY`)

            if (!response.ok) {
                throw new Error(`Failed to fetch mandatory chats: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching mandatory chats:', error)
            throw error
        }
    }
}
