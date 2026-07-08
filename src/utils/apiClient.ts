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
  options: RequestInit = {}
): Promise<Response> {
  const authHeader = telegramUtils.getAuthHeader();
  
  const headers: HeadersInit = {
    ...options.headers,
    ...(authHeader || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Обработка ошибок авторизации
  if (response.status === 401 || response.status === 403) {
    const error = {
      status: response.status,
      message: response.status === 401 
        ? 'Требуется авторизация' 
        : 'Недостаточно прав для доступа к ресурсу'
    };
    
    // Отправляем событие для глобальной обработки
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
