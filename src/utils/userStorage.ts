const USER_ID_KEY = 'userId';
const ACCESS_TOKEN_KEY = 'accessToken';

export const userStorage = {
    /**
     * Сохраняет ID пользователя в localStorage
     * @param userId - ID пользователя из Telegram
     */
    setUserId(userId: string): void {
        try {
            const currentUserId = localStorage.getItem(USER_ID_KEY);

            // Сохраняем только если ID отсутствует или отличается от существующего
            if (!currentUserId || currentUserId !== userId) {
                localStorage.setItem(USER_ID_KEY, userId);
                console.log('User ID saved to localStorage:', userId);
            }
        } catch (error) {
            console.error('Error saving user ID to localStorage:', error);
        }
    },

    /**
     * Получает ID пользователя из localStorage
     * @returns ID пользователя или null если отсутствует
     */
    getUserId(): string | null {
        try {
            return localStorage.getItem(USER_ID_KEY);
        } catch (error) {
            console.error('Error getting user ID from localStorage:', error);
            return null;
        }
    },

    /**
     * Удаляет ID пользователя из localStorage
     */
    clearUserId(): void {
        try {
            localStorage.removeItem(USER_ID_KEY);
            console.log('User ID cleared from localStorage');
        } catch (error) {
            console.error('Error clearing user ID from localStorage:', error);
        }
    },

    /**
     * Проверяет, есть ли ID пользователя в localStorage
     * @returns true если ID существует
     */
    hasUserId(): boolean {
        return this.getUserId() !== null;
    },

    /**
     * Сохраняет JWT access token в localStorage
     * @param token - JWT access token
     */
    setAccessToken(token: string | null): void {
        try {
            if (token == null) {
                localStorage.removeItem(ACCESS_TOKEN_KEY)
            } else {
                localStorage.setItem(ACCESS_TOKEN_KEY, token)
            }
            console.log('Access token saved to localStorage');
        } catch (error) {
            console.error('Error saving access token to localStorage:', error);
        }
    },

    /**
     * Получает JWT access token из localStorage
     * @returns Access token или null если отсутствует
     */
    getAccessToken(): string | null {
        try {
            return localStorage.getItem(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting access token from localStorage:', error);
            return null;
        }
    },

    /**
     * Удаляет JWT access token из localStorage
     */
    clearAccessToken(): void {
        try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            console.log('Access token cleared from localStorage');
        } catch (error) {
            console.error('Error clearing access token from localStorage:', error);
        }
    },

    /**
     * Проверяет, есть ли access token в localStorage
     * @returns true если token существует
     */
    hasAccessToken(): boolean {
        return this.getAccessToken() !== null;
    }
};
