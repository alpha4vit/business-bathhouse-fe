const USER_ID_KEY = 'userId';

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
  }
};
