import { API_BASE_URL } from '../config/api'

export enum PaymentPurpose {
    DEPOSIT = 'DEPOSIT',
    CHARITY = 'CHARITY',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT'
}

export enum PaymentType {
    INVOICE = 'INVOICE',
    FAST_PAYMENT = 'FAST_PAYMENT',
    PERSONAL_ACCOUNT = 'PERSONAL_ACCOUNT'
}

export interface PaymentRequestDto {
    userId: string
    amount: number
    currency: string
    purpose: PaymentPurpose
    type: PaymentType
    companyId: string
}

export const invoiceService = {
    async createInvoice(dto: PaymentRequestDto): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dto),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to create invoice')
        }
    }
}
