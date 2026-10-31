import {API_BASE_URL} from '../config/api'
import {authenticatedFetch, handleApiError} from '../utils/apiClient'
import {UserDto} from "./userService.ts";

export type LoyaltyRewardRuleStatus = 'ACTIVE' | 'PENDING_IMPLEMENTATION' | 'INACTIVE'

export interface LoyaltyRewardRule {
    id: string
    name: string
    description: string
    code: string
    status: LoyaltyRewardRuleStatus
    createdAt: string
    updatedAt: string
}

export interface CreateLoyaltyRewardRuleRequest {
    name: string
    description: string
    code: string
}

export interface UpdateLoyaltyRewardRuleRequest {
    id: string
    name: string
    description: string
    code: string
}

export interface UpdateLoyaltyRewardRuleStatusRequest {
    id: string
    status: LoyaltyRewardRuleStatus
}

export interface LoyaltyReward {
    rule: LoyaltyRewardRule,
    user: UserDto,
    discount: number
    createdAt: string
}

export interface CreateLoyaltyRewardRequest {
    name: string
    description: string
    userIds: number[]
    discount: number
}

export const loyaltyService = {
    async getAllRules(): Promise<LoyaltyRewardRule[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rules`)
            if (!response.ok) {
                throw new Error(`Failed to fetch loyalty rules: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching loyalty rules:', error)
            throw error
        }
    },

    async createRule(request: CreateLoyaltyRewardRuleRequest): Promise<LoyaltyRewardRule> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rules`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to create loyalty rule')
            }
            return await response.json()
        } catch (error) {
            console.error('Error creating loyalty rule:', error)
            throw error
        }
    },

    async deleteRule(id: string): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rules/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to delete loyalty rule')
            }
        } catch (error) {
            console.error('Error deleting loyalty rule:', error)
            throw error
        }
    },

    async updateRule(request: UpdateLoyaltyRewardRuleRequest): Promise<LoyaltyRewardRule> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rules`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to update loyalty rule')
            }
            return await response.json()
        } catch (error) {
            console.error('Error updating loyalty rule:', error)
            throw error
        }
    },

    async changeRuleStatus(request: UpdateLoyaltyRewardRuleStatusRequest): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rules/status`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to change loyalty rule status')
            }
        } catch (error) {
            console.error('Error changing loyalty rule status:', error)
            throw error
        }
    },

    async getAllRewards(): Promise<LoyaltyReward[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rewards`)
            if (!response.ok) {
                throw new Error(`Failed to fetch loyalty rewards: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching loyalty rewards:', error)
            throw error
        }
    },

    async createReward(request: CreateLoyaltyRewardRequest): Promise<LoyaltyReward> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rewards`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(request)
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to create loyalty reward')
            }
            return await response.json()
        } catch (error) {
            console.error('Error creating loyalty reward:', error)
            throw error
        }
    },

    async deleteReward(_: LoyaltyReward): Promise<void> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rewards/TODO`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                await handleApiError(response, 'Failed to delete loyalty reward')
            }
        } catch (error) {
            console.error('Error deleting loyalty reward:', error)
            throw error
        }
    },

    async getUserRewards(userId: number): Promise<LoyaltyReward[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/loyalty/rewards/${userId}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch user loyalty rewards: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching user loyalty rewards:', error)
            throw error
        }
    }
}
