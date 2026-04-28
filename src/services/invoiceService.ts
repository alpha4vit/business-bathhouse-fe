import { API_BASE_URL } from '../config/api'

export enum PaymentPurpose {
    RESIDENT_TOP_UP = 'RESIDENT_TOP_UP',
    CHARITY = 'CHARITY',
    MEMBERSHIP_FEE = 'MEMBERSHIP_FEE'
}

export enum LegalCompanyType {
    LEGAL = 'LEGAL',
    INDIVIDUAL = 'INDIVIDUAL'
}

export interface InvoiceExistedCompanyDto {
    dtoType: 'EXISTED_COMPANY'
    userId: string
    amount: number
    paymentPurpose: PaymentPurpose
    companyId: string
}

export interface InvoiceNewCompanyDto {
    dtoType: 'NEW_COMPANY'
    userId: string
    amount: number
    edo: string
    paymentPurpose: PaymentPurpose
    type: LegalCompanyType
    title: string
    inn: string
    okpo: string
    address: string
    kpp?: string
    ogrn?: string
    ogrnip?: string
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
            throw new Error('Failed to create invoice')
        }
    }
}
