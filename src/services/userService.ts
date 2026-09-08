import {API_BASE_URL} from '../config/api'
import {authenticatedFetch, handleApiError} from '../utils/apiClient'

export enum Gender {
    MALE = '273098',
    FEMALE = '273100'
}

export interface BalanceDto {
    amount: number
    currency: string
}

export interface PointsHistoryItem {
    date: string
    amount: number
    title: string
}

export interface UserDataDto {
    fullName: string
    businessDescription: string
    phoneNumber: string
    role: string
    status: string
    companyTitle: string
    balance: BalanceDto
    points: number,
    gender?: string,
    pointsHistory: PointsHistoryItem[]
    company?: {
        id: string
        title?: string
        points?: number
        balance?: {
            amount: number
            currency: string
        }
        photo?: {
            id: number
            showUrl: string
            downloadUrl: string
        },
        avatarUrl?: string,
        [key: string]: any // Дополнительные поля которые могут приходить с бэкенда
    }
}

export interface LeaderboardItem {
    fullName: string
    points: number
    chatId: number
}

export interface Resident {
    chatId: number
    fullName: string
    businessDescription?: string
    phoneNumber?: string
    telegramUsername?: string
    achievements: string[]
    avatar?: string
    hasPhotoSource?: boolean // Флаг для определения нужно ли показывать скелетон
    photoSource?: string // Источник фото для загрузки по требованию
}

export interface UserSearchDto {
    chatId: number
    companyId: string | null
    fullName: string
    businessDescription: string | null
    phoneNumber: string | null
    telegramUsername: string | null
    achievements: string[]
    avatarUrl: string | null
    role: string
}

export interface TelegramUserResponse {
    chatId: number
    telegramUsername?: string
    telegramFirstName?: string
    telegramLastName?: string
    fullName?: string
    businessDescription?: string
    phoneNumber?: string
    role?: string
    status?: string
    gender?: string
    company?: {
        id: string
        title?: string
        points?: number
        balance?: {
            amount: number
            currency: string
        }
        photo?: {
            id: number
            showUrl: string
            downloadUrl: string
        }
    },
    avatarUrl?: string
}

interface PointsAdjustmentResponse {
    id: string
    title: string
    amount: number
    status: string
    date: string
}

// Кеш для загруженных фото
const photoCache = new Map<string, string>()
// Кеш для активных запросов (дедупликация)
const pendingPhotoRequests = new Map<string, Promise<string>>()

export const userService = {
    async getCurrentUser(): Promise<TelegramUserResponse> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/auth/telegram`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to get current user: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    },

    async getUserData(externalId: string): Promise<UserDataDto> {
        try {
            const userResponse = await authenticatedFetch(`${API_BASE_URL}/api/users/${externalId}`)

            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user data: ${userResponse.status}`)
            }

            const user: TelegramUserResponse = await userResponse.json()

            // Only fetch points history if user has a company (RESIDENT)
            let pointsHistory: PointsHistoryItem[] = []
            if (user.role != "NON_RESIDENT") {
                try {
                    const adjustmentsResponse = await authenticatedFetch(`${API_BASE_URL}/api/points/adjustments/${externalId}`)

                    if (adjustmentsResponse.ok) {
                        const adjustments: PointsAdjustmentResponse[] = await adjustmentsResponse.json()

                        const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })

                        pointsHistory = adjustments
                            .map(adj => {
                                const date = new Date(adj.date)

                                if (isNaN(date.getTime())) {
                                    console.warn(`Invalid date value: ${adj.date}`)
                                    return null
                                }
                                return {
                                    date: dateFormatter.format(date),
                                    amount: adj.amount,
                                    title: adj.title
                                }
                            })
                            .filter((item): item is PointsHistoryItem => item !== null)
                    }
                } catch (error) {
                    console.error('Failed to fetch points history:', error)
                    // Don't throw error - continue without points history
                }
            }

            return {
                fullName: user.fullName || '',
                businessDescription: user.businessDescription || '',
                phoneNumber: user.phoneNumber || '',
                role: user.role || '',
                status: user.status || '',
                companyTitle: user.company?.title || '',
                balance: {
                    amount: user.company?.balance?.amount || 0,
                    currency: user.company?.balance?.currency || 'RUB'
                },
                points: user.company?.points || 0,
                gender: user.gender as Gender || Gender.MALE,
                pointsHistory,
                company: user.company ? {
                    ...user.company,
                    photo: user.company.photo
                } : undefined
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            throw error
        }
    },

    async getPhoto(photoUrl: string): Promise<string> {
        // Проверяем кеш
        if (photoCache.has(photoUrl)) {
            return photoCache.get(photoUrl)!
        }

        // Проверяем активные запросы (дедупликация)
        if (pendingPhotoRequests.has(photoUrl)) {
            return pendingPhotoRequests.get(photoUrl)!
        }

        // Создаем новый запрос
        const photoPromise = (async () => {
            try {
                // Извлекаем path из Bitrix URL
                const url = new URL(photoUrl)
                const path = url.pathname + url.search

                // Кодируем path для безопасной передачи
                const encodedPath = encodeURIComponent(path)

                const response = await authenticatedFetch(`${API_BASE_URL}/api/bitrix/image?path=${encodedPath}`)

                if (!response.ok) {
                    throw new Error(`Failed to fetch photo: ${response.status}`)
                }

                const blob = await response.blob()
                const blobUrl = URL.createObjectURL(blob)

                // Сохраняем в кеш
                photoCache.set(photoUrl, blobUrl)

                return blobUrl
            } catch (error) {
                console.error('Error fetching photo:', error)
                throw error
            } finally {
                // Удаляем из активных запросов
                pendingPhotoRequests.delete(photoUrl)
            }
        })()

        // Сохраняем активный запрос
        pendingPhotoRequests.set(photoUrl, photoPromise)

        return photoPromise
    },

    async getLeaderboard(): Promise<LeaderboardItem[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/points/leaderboard`)

            if (!response.ok) {
                throw new Error(`Failed to fetch leaderboard: ${response.status}`)
            }

            const data = await response.json()

            return data.map((item: any) => ({
                fullName: item.fullName || '',
                points: item.company?.points || 0,
                chatId: item.chatId || 0
            }))
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
            throw error
        }
    },

    async searchResidents(keyword: string): Promise<Resident[]> {
        try {
            console.log(`[ResidentSearch] Начинаю поиск резидентов по ключевому слову: "${keyword}"`)
            console.log(`[ResidentSearch] Запрос к API: ${API_BASE_URL}/api/users?keyword=${encodeURIComponent(keyword)}`)

            const response = await authenticatedFetch(`${API_BASE_URL}/api/users?keyword=${encodeURIComponent(keyword)}`)

            if (!response.ok) {
                console.error(`[ResidentSearch] Ошибка API запроса: ${response.status} ${response.statusText}`)
                throw new Error(`Failed to search residents: ${response.status}`)
            }

            const data: TelegramUserResponse[] = await response.json()
            console.log(`[ResidentSearch] Получено ${data.length} резидентов с сервера`)

            // Сначала создаем резидентов без фото для быстрого отображения
            const residents: Resident[] = data.map((user, index) => {
                console.log(`[ResidentSearch] Обработка резидента #${index + 1}:`, {
                    chatId: user.chatId,
                    fullName: user.fullName,
                    hasCompany: !!user.company,
                    companyPhoto: user.company?.photo,
                    showUrl: user.avatarUrl
                })

                // Приоритет: сначала пробуем avatarUrl, потом photo.showUrl
                const photoSource = user.avatarUrl || user.company?.photo?.showUrl

                return {
                    chatId: user.chatId,
                    fullName: user.fullName || '',
                    businessDescription: user.businessDescription,
                    phoneNumber: user.phoneNumber,
                    telegramUsername: user.telegramUsername,
                    achievements: [], // TODO: Получить достижения с бэкенда
                    avatar: undefined, // Будет загружено асинхронно
                    hasPhotoSource: !!photoSource, // Флаг для скелетона
                    photoSource: photoSource // Сохраняем источник для последующей загрузки
                }
            })

            console.log(`[ResidentSearch] Карточки резидентов готовы к отображению. Фотографии загружаются в фоне.`)
            return residents
        } catch (error) {
            console.error('[ResidentSearch] Критическая ошибка при поиске резидентов:', error)
            throw error
        }
    },

    // Callback для обновления аватара конкретного резидента
    updateResidentAvatar(chatId: number, avatarUrl: string | undefined) {
        // Этот метод будет вызываться для обновления конкретного резидента
        // В React компоненте мы будем использовать state обновление
        if (typeof window !== 'undefined' && (window as any).updateResidentAvatar) {
            (window as any).updateResidentAvatar(chatId, avatarUrl)
        }
    },

    async getAllUsers(): Promise<UserSearchDto[]> {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/users`)

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    },

    async deactivate(companyIds: string[]): Promise<string[]> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/users/deactivate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(companyIds)
        })

        if (!response.ok) {
            await handleApiError(response, 'Failed to deactivate users')
        }

        return await response.json()
    },

    async register(data: {
        fullName: string
        phoneNumber: string
        business: string
        referrerId?: string
        gender: string
    }): Promise<void> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            await handleApiError(response, 'Failed to register')
        }
    }
}

export function isNonResident(user?: TelegramUserResponse | null): boolean {
    return user != null && user?.role !== undefined && user.role == 'NON_RESIDENT'
}