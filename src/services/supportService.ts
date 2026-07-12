import {API_BASE_URL} from '../config/api'
import {authenticatedFetch} from '../utils/apiClient'

export interface SupportRequestDto {
    text: string
    subject?: string
}

export const supportService = {
    async sendSupportRequest(request: SupportRequestDto, files?: File[]): Promise<void> {
        const formData = new FormData()
        
        // Добавляем JSON данные как Blob с правильным Content-Type
        const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' })
        formData.append('request', jsonBlob)
        
        // Добавляем файлы если есть
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('files', file, file.name)
            })
        }

        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/support/requests`,
            {
                method: 'POST',
                body: formData
            }
        )

        if (!response.ok) {
            throw new Error('Не удалось отправить обращение в техподдержку')
        }
    }
}
