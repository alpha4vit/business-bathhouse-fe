const INIT_DATA_KEY = 'telegramInitData';
const TEST_INIT_DATA_KEY = 'testInitData';

export const telegramUtils = {
  /**
   * Получает initData из Telegram WebApp API
   * Приоритет: testInitData (localStorage) > window.testInitData > Telegram WebApp API > localStorage
   * @returns initData строка или null если недоступна
   */
  getInitData(): string | null {
    try {
      // 1. Сначала проверяем тестовое значение в localStorage (для отладки)
      const testData = localStorage.getItem(TEST_INIT_DATA_KEY);
      if (testData) {
        console.log('[telegramUtils] Using test initData from localStorage');
        return testData;
      }

      // 2. Проверяем тестовое значение в window (для отладки через консоль)
      if (typeof window !== 'undefined' && (window as any).testInitData) {
        console.log('[telegramUtils] Using test initData from window');
        return (window as any).testInitData;
      }

      // 3. Проверяем наличие Telegram WebApp API
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const webApp = (window as any).Telegram.WebApp;
        const initData = webApp.initData;
        
        if (initData) {
          // Сохраняем в localStorage для использования между запросами
          localStorage.setItem(INIT_DATA_KEY, initData);
          return initData;
        }
      }
      
      // 4. Если WebApp API недоступен, пробуем получить из localStorage
      return localStorage.getItem(INIT_DATA_KEY);
    } catch (error) {
      console.error('Error getting Telegram initData:', error);
      return null;
    }
  },

  /**
   * Устанавливает тестовое initData для отладки
   * Использование в консоли: telegramUtils.setTestInitData('user=123&auth_date=...')
   */
  setTestInitData(initData: string): void {
    try {
      localStorage.setItem(TEST_INIT_DATA_KEY, initData);
      console.log('[telegramUtils] Test initData set in localStorage');
    } catch (error) {
      console.error('Error setting test initData:', error);
    }
  },

  /**
   * Устанавливает тестовое initData в window (для быстрой отладки)
   */
  setTestInitDataWindow(initData: string): void {
    try {
      (window as any).testInitData = initData;
      console.log('[telegramUtils] Test initData set in window');
    } catch (error) {
      console.error('Error setting test initData in window:', error);
    }
  },

  /**
   * Очищает тестовое initData
   */
  clearTestInitData(): void {
    try {
      localStorage.removeItem(TEST_INIT_DATA_KEY);
      delete (window as any).testInitData;
      console.log('[telegramUtils] Test initData cleared');
    } catch (error) {
      console.error('Error clearing test initData:', error);
    }
  },

  /**
   * Формирует заголовок Authorization для запросов
   * @returns заголовок Authorization или undefined если initData недоступен
   */
  getAuthHeader(): { Authorization: string } | undefined {
    const initData = this.getInitData();
    
    if (!initData) {
      console.warn('Telegram initData not available');
      return undefined;
    }
    
    return {
      Authorization: `TelegramMiniApp ${initData}`
    };
  },

  /**
   * Очищает сохраненный initData
   */
  clearInitData(): void {
    try {
      localStorage.removeItem(INIT_DATA_KEY);
    } catch (error) {
      console.error('Error clearing Telegram initData:', error);
    }
  }
};

// Экспортируем в window для отладки через консоль
if (typeof window !== 'undefined') {
  (window as any).telegramUtils = telegramUtils;
  console.log('[telegramUtils] Available in window for debugging');
}
