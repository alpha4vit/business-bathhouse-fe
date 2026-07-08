import { API_BASE_URL } from '../config/api'
import { authenticatedFetch } from '../utils/apiClient'

export enum TransactionPurpose {
    DOWN_PAYMENT = 'DOWN_PAYMENT',
    DEPOSIT = 'DEPOSIT',
    EVENT = 'EVENT',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    CHARITY = 'CHARITY',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT',
    MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT'
}

export enum TransactionDirection {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT'
}

export interface BalanceAdjustmentDto {
    userId: string
    adminId: number
    amount: {
        amount: number
        currency: string
    }
    direction: TransactionDirection
    purpose: TransactionPurpose
    title: string
    eventId?: string
}

export const balanceAdjustmentService = {
    async adjustBalance(dto: BalanceAdjustmentDto): Promise<void> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/balance/adjust`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dto),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to adjust balance')
        }
    }
}
