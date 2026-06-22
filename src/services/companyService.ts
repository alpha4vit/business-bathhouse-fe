export interface Company {
  id: string
  title: string
  inn: string
}

export interface CreateCompanyDto {
  userId: string
  type: 'LEGAL' | 'INDIVIDUAL'
  edo: string
  title: string
  inn: string
  okpo: string
  address: string
  ogrn: string
  kpp?: string
  okved?: string
}

import {API_BASE_URL} from '../config/api'

export const companyService = {
  async createCompany(dto: CreateCompanyDto): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create company')
    }

    return await response.text()
  },

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
