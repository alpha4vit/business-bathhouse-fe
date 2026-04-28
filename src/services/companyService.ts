export interface Company {
  id: string
  title: string
  inn: string
}

import {API_BASE_URL} from '../config/api'

export const companyService = {
  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/${userId}/legal`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  }
}
