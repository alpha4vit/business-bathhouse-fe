import {API_BASE_URL} from '../config/api'

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
  points: number
  pointsHistory: PointsHistoryItem[]
}

export interface LeaderboardItem {
  fullName: string
  points: number
  chatId: number
}

interface TelegramUserResponse {
  chatId: number
  telegramUsername?: string
  telegramFirstName?: string
  telegramLastName?: string
  fullName?: string
  businessDescription?: string
  phoneNumber?: string
  role?: string
  status?: string
  company?: {
    id: string
    title?: string
    points?: number
    balance?: {
      amount: number
      currency: string
    }
  }
}

interface PointsAdjustmentResponse {
  id: string
  title: string
  amount: number
  status: string
  date: string
}

export const userService = {
  async getUserData(externalId: string): Promise<UserDataDto> {
    try {
      const [userResponse, adjustmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user/${externalId}`),
        fetch(`${API_BASE_URL}/api/points/adjustment/${externalId}`)
      ])

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`)
      }

      if (!adjustmentsResponse.ok) {
        throw new Error(`Failed to fetch points history: ${adjustmentsResponse.status}`)
      }

      const user: TelegramUserResponse = await userResponse.json()
      const adjustments: PointsAdjustmentResponse[] = await adjustmentsResponse.json()

      const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      const pointsHistory: PointsHistoryItem[] = adjustments
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
        pointsHistory
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  },

  async getLeaderboard(): Promise<LeaderboardItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/points/leaderboard`)
      
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
  }
}
