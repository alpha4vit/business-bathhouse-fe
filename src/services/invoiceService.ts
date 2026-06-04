import { API_BASE_URL } from '../config/api'

export enum PaymentPurpose {
    DEPOSIT = 'DEPOSIT',
    CHARITY = 'CHARITY',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    BATHHOUSE_EVENT = 'BATHHOUSE_EVENT'
}

export enum LegalCompanyType {
    LEGAL = 'LEGAL',
    INDIVIDUAL = 'INDIVIDUAL'
}

export enum PaymentType {
    INVOICE = 'INVOICE',
    FAST_PAYMENT = 'FAST_PAYMENT',
    PERSONAL_ACCOUNT = 'PERSONAL_ACCOUNT'
}

export interface InvoiceExistedCompanyDto {
    invoiceType: 'EXISTED_COMPANY'
    userId: string
    amount: number
    currency: string
    purpose: PaymentPurpose
    type: PaymentType
    companyId: string
}

export interface InvoiceNewCompanyDto {
    invoiceType: 'NEW_COMPANY'
    userId: string
    amount: number
    currency: string
    purpose: PaymentPurpose
    type: PaymentType
    companyType: LegalCompanyType
    edo: string
    title: string
    inn: string
    okpo: string
    address: string
    ogrn: string
    kpp?: string
    okved?: string
}

export const invoiceService = {
    async createInvoice(dto: InvoiceExistedCompanyDto | InvoiceNewCompanyDto): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/invoice`, {
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
