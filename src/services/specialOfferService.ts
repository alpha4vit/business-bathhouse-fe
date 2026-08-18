import {API_BASE_URL} from '../config/api'
import {authenticatedFetch} from '../utils/apiClient'

export enum SpecialOfferStatus {
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED'
}

export interface SpecialOffer {
    id: string
    offer: string
    establishmentName: string
    establishmentType: string
    address?: string
    mapLink?: string
    workingHours: string
    parking: string
    steps: string[]
    tip: string
    status: SpecialOfferStatus
    createdAt: string
    updatedAt: string
}

export interface CreateSpecialOfferRequest {
    offer: string
    establishmentName: string
    establishmentType: string
    address?: string
    mapLink?: string
    workingHours: string
    parking: string
    steps: string[]
    tip: string
    status: SpecialOfferStatus
}

export interface UpdateSpecialOfferRequest {
    offer: string
    establishmentName: string
    establishmentType: string
    address?: string
    mapLink?: string
    workingHours: string
    parking: string
    steps: string[]
    tip: string
    status: SpecialOfferStatus
}

export const specialOfferService = {
    async getActiveOffers(): Promise<SpecialOffer[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers/active`)
            if (!response.ok) {
                throw new Error(`Failed to fetch active offers: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching active offers:', error)
            throw error
        }
    },

    async getAllOffers(): Promise<SpecialOffer[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers`)
            if (!response.ok) {
                throw new Error(`Failed to fetch all offers: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching all offers:', error)
            throw error
        }
    },

    async getOfferById(id: string): Promise<SpecialOffer> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers/${id}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch offer: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching offer:', error)
            throw error
        }
    },

    async createOffer(request: CreateSpecialOfferRequest): Promise<SpecialOffer> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                throw new Error(`Failed to create offer: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error creating offer:', error)
            throw error
        }
    },

    async updateOffer(id: string, request: UpdateSpecialOfferRequest): Promise<SpecialOffer> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                throw new Error(`Failed to update offer: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error updating offer:', error)
            throw error
        }
    },

    async updateOfferStatus(id: string, status: SpecialOfferStatus): Promise<SpecialOffer> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers/${id}/status`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status})
            })
            if (!response.ok) {
                throw new Error(`Failed to update offer status: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error updating offer status:', error)
            throw error
        }
    },

    async deleteOffer(id: string): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/special-offers/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                throw new Error(`Failed to delete offer: ${response.status}`)
            }
        } catch (error) {
            console.error('Error deleting offer:', error)
            throw error
        }
    }
}
