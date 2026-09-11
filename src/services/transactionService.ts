import {API_BASE_URL} from '../config/api'
import {authenticatedFetch} from '../utils/apiClient'

export enum TransactionDirection {
    DEBIT = '1',
    CREDIT = '2'
}

export enum TransactionType {
    FAST_PAYMENT = 'FAST_PAYMENT',
    INVOICE = 'INVOICE',
    PERSONAL_ACCOUNT = 'PERSONAL_ACCOUNT',
    BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT'
}

export interface TransactionContent {
    type: string
    title: string
}

export interface FastPaymentContent extends TransactionContent {
    type: 'FAST_PAYMENT'
    expiredAt: string
    externalId: string
    base64Image: string
    link: string
}

export interface InvoiceContent extends TransactionContent {
    type: 'INVOICE'
    companyId: string
    accrued: {
        amount: number
        currency: string
    }
}

export interface BalanceAdjustmentContent extends TransactionContent {
    type: 'BALANCE_ADJUSTMENT'
    adjustedBy: number
}

export interface PersonalAccountContent extends TransactionContent {
    type: 'PERSONAL_ACCOUNT'
}

export type TransactionContentUnion = FastPaymentContent | InvoiceContent | BalanceAdjustmentContent | PersonalAccountContent

export interface TransactionDto {
    id: string
    externalId: string
    title: string
    content: TransactionContentUnion
    type: TransactionType
    amount: number
    currency: string
    direction: TransactionDirection
    createdAt: string
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
