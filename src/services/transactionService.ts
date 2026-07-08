import {API_BASE_URL} from '../config/api'
import { authenticatedFetch } from '../utils/apiClient'

export enum TransactionDirection {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT'
}

export interface TransactionDto {
    title: string
    amount: number
    currency: string
    direction: TransactionDirection
    date: string
}

export const transactionService = {
    async getTransactionHistory(userId: string): Promise<TransactionDto[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/transactions/${userId}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch transaction history: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching transaction history:', error)
            throw error
        }
    }
}
