import { useState, useCallback, useRef } from 'react'

export type NotificationType = 'success' | 'error'

export interface Notification {
  type: NotificationType
  message: string
  isFading?: boolean
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotification = useCallback((type: NotificationType, message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setNotification({ type, message, isFading: false })

    timeoutRef.current = setTimeout(() => {
      setNotification(prev => prev ? { ...prev, isFading: true } : null)
      
      setTimeout(() => {
        setNotification(null)
      }, 300)
    }, 5000)
  }, [])

  const showSuccess = useCallback((message: string) => {
    showNotification('success', message)
  }, [showNotification])

  const showError = useCallback((message: string) => {
    showNotification('error', message)
  }, [showNotification])

  const clearNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
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
