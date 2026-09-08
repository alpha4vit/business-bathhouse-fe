import {telegramUtils} from './telegram';
import {userStorage} from './userStorage';

/**
 * Событие для обработки ошибок авторизации
 */
export const AUTH_ERROR_EVENT = 'authError';

/**
 * Событие для обработки отсутствия подписки на обязательные чаты
 */
export const MANDATORY_CHAT_SUBSCRIPTION_EVENT = 'mandatoryChatSubscription';

/**
 * Централизованный fetch wrapper с автоматическим добавлением заголовка авторизации
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  contentType: string = 'application/json'
): Promise<Response> {
  const authHeader = telegramUtils.getAuthHeader();
  const accessToken = userStorage.getAccessToken();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(authHeader || {})
  };

  // Use JWT bearer token if available (fallback to Telegram auth)
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Если body - FormData, не устанавливаем Content-Type чтобы браузер установил его автоматически с boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = contentType;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Обработка ошибок авторизации
  if (response.status === 401 || response.status === 403) {

    // Если это 401, проверяем код ошибки в теле ответа
    if (response.status === 401) {
      try {
        const errorBody = await response.clone().json();
        // Если код ошибки TOKEN_EXPIRED
        if (errorBody.code === 'TOKEN_EXPIRED' || errorBody.code === 'UNAUTHORIZED') {
          // Для /api/auth/login/otp/create только очищаем токен, не редиректим
          if (url.includes('/api/auth/login/otp/create')) {
            userStorage.setAccessToken(null);
            return response;
          }
          // Для остальных URL редиректим на OTP логин
          if (window.location.pathname !== '/otp-login') {
            userStorage.setAccessToken(null);
            window.location.href = '/otp-login';
            return response;
          }
        }
      } catch (e) {
        // Если не удалось распарсить JSON, продолжаем с обычной обработкой
      }
    }

    // Для остальных случаев отправляем событие для глобальной обработки
    const error = {
      status: response.status,
      message: response.status === 401
        ? 'Требуется авторизация'
        : 'Недостаточно прав для доступа к ресурсу'
    };

    window.dispatchEvent(new CustomEvent(AUTH_ERROR_EVENT, { detail: error }));
  }

  // Обработка отсутствия подписки на обязательные чаты
  // Не отправляем событие для запросов ссылок чатов, чтобы избежать цикла
  if (response.status === 428 && !url.includes('/api/chats/link')) {
    window.dispatchEvent(new CustomEvent(MANDATORY_CHAT_SUBSCRIPTION_EVENT, { detail: {} }));
  }

  return response;
}

/**
 * Вспомогательная функция для выполнения GET запросов с авторизацией
 */
export async function get(url: string): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'GET'
  });
}

/**
 * Вспомогательная функция для выполнения POST запросов с авторизацией
 */
export async function post(
  url: string,
  body?: any,
  contentType: string = 'application/json'
): Promise<Response> {
  const headers: HeadersInit = {};
  
  if (contentType && body) {
    headers['Content-Type'] = contentType;
  }

  return authenticatedFetch(url, {
    method: 'POST',
    headers,
    body: body ? (contentType === 'application/json' ? JSON.stringify(body) : body) : undefined
  });
}

/**
 * Вспомогательная функция для выполнения PUT запросов с авторизацией
 */
export async function put(
  url: string,
  body?: any,
  contentType: string = 'application/json'
): Promise<Response> {
  const headers: HeadersInit = {};
  
  if (contentType && body) {
    headers['Content-Type'] = contentType;
  }

  return authenticatedFetch(url, {
    method: 'PUT',
    headers,
    body: body ? (contentType === 'application/json' ? JSON.stringify(body) : body) : undefined
  });
}

/**
 * Вспомогательная функция для выполнения DELETE запросов с авторизацией
 */
export async function del(url: string): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'DELETE'
  });
}

/**
 * Вспомогательная функция для обработки ошибок API
 * Извлекает message из ответа бэкенда в формате {message: "", code: ""}
 */
export async function handleApiError(response: Response, defaultMessage: string = 'Произошла ошибка'): Promise<never> {
  try {
    const errorData = await response.json();
    throw new Error(errorData.message || defaultMessage);
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error(defaultMessage);
  }
}
