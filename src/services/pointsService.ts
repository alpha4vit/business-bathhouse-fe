import {API_BASE_URL} from '../config/api'
import { authenticatedFetch } from '../utils/apiClient'

export interface PointsAdjustmentDto {
    id: string
    userId: string
    fullName: string
    eventId: string | null
    title: string | null
    amount: number
    status: string
}

export interface CompanyDto {
    id: string
    title: string
}

export const pointsService = {
    async getEventAdjustments(eventId: string): Promise<PointsAdjustmentDto[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/points/adjustments/${eventId}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch event adjustments: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching event adjustments:', error)
            throw error
        }
    },

    async adjustEventPoints(adjustments: PointsAdjustmentDto[]): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/points/adjust`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adjustments),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to adjust event points')
            }
        } catch (error) {
            console.error('Error adjusting event points:', error)
            throw error
        }
    },

    async getAllCompanies(): Promise<CompanyDto[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/companies`)

            if (!response.ok) {
                throw new Error(`Failed to fetch companies: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching companies:', error)
            throw error
        }
    }
}
