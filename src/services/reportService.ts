import {API_BASE_URL} from '../config/api'
import {authenticatedFetch, handleApiError} from '../utils/apiClient'

export enum ReportType {
    REGISTRATION_STATUS = 'REGISTRATION_STATUS',
    USER_EVENT = 'USER_EVENT',
    GLOBAL = 'GLOBAL',
    POINTS = 'POINTS',
    BALANCE = 'BALANCE'
}

export enum ReportMetadataType {
    PERIOD = 'PERIOD',
    INPUT = 'INPUT',
    EMPTY = 'EMPTY'
}

export interface ReportTypeOption {
    id: string
    label: string
    value: ReportType
    metadataType: ReportMetadataType
    enumOptions?: EnumOption[]
}

export interface EnumOption {
    id: string
    label: string
}

export const REPORT_TYPES: ReportTypeOption[] = [
    {
        id: '9',
        label: 'Статус регистрации в боте',
        value: ReportType.REGISTRATION_STATUS,
        metadataType: ReportMetadataType.INPUT,
        enumOptions: [
            {id: '281564', label: 'Зарегистрированные'},
            {id: '281566', label: 'Незарегистрированные'}
        ]
    },
    {
        id: '12',
        label: 'Регистрация на мероприятия',
        value: ReportType.USER_EVENT,
        metadataType: ReportMetadataType.EMPTY
    },
    {
        id: '13',
        label: 'Общий отчет',
        value: ReportType.GLOBAL,
        metadataType: ReportMetadataType.PERIOD
    },
    {
        id: '14',
        label: 'Баллы',
        value: ReportType.POINTS,
        metadataType: ReportMetadataType.EMPTY
    },
    {
        id: '15',
        label: 'Балансы пользователей',
        value: ReportType.BALANCE,
        metadataType: ReportMetadataType.EMPTY
    }
]

export interface PeriodReportMetadata {
    type: ReportMetadataType.PERIOD
    from: string
    to: string
}

export interface InputReportMetadata {
    type: ReportMetadataType.INPUT
    input: string
}

export interface NoneReportMetadata {
    type: ReportMetadataType.EMPTY
}

export type ReportMetadata = PeriodReportMetadata | InputReportMetadata | NoneReportMetadata

export interface ReportRequestDto {
    type: ReportType
    metadata: ReportMetadata | null
}

export const reportService = {
    async generateReport(request: ReportRequestDto): Promise<Blob> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                await handleApiError(response, 'Failed to generate report')
            }

            return await response.blob()
        } catch (error) {
            console.error('Error generating report:', error)
            throw error
        }
    }
}
