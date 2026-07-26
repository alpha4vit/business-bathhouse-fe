import { useUser } from '../contexts/UserContext'

export function useAuthUser() {
    const { user, role, isLoading, error, refreshUser } = useUser()
    
    return { 
        user, 
        loading: isLoading, 
        error, 
        userId: user?.chatId?.toString() || null,
        role,
        refreshUser
    }
}
