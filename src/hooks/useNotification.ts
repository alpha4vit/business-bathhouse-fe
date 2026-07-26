import { useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error'

export interface Notification {
  type: NotificationType
  message: string
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null)

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const showSuccess = useCallback((message: string) => {
    showNotification('success', message)
  }, [showNotification])

  const showError = useCallback((message: string) => {
    showNotification('error', message)
  }, [showNotification])

  const clearNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    clearNotification
  }
}
