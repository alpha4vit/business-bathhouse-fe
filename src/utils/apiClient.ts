import { telegramUtils } from './telegram';

/**
 * Событие для обработки ошибок авторизации
 */
export const AUTH_ERROR_EVENT = 'authError';

/**
 * Централизованный fetch wrapper с автоматическим добавлением заголовка авторизации
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  contentType: string = 'application/json'
): Promise<Response> {
  const authHeader = telegramUtils.getAuthHeader();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(authHeader || {})
  };

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
    // Если это запрос к /api/auth/telegram и мы на главной странице, редиректим на регистрацию
    if (url.includes('/api/auth/telegram') && (window.location.pathname === '/' || window.location.pathname.startsWith("/cabinet"))) {
      window.location.href = '/register';
      return response;
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
