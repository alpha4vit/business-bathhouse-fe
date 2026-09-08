import {handleApiError, post} from '../utils/apiClient';
import {API_BASE_URL} from '../config/api'

export interface CreateOtpDto {
    phoneNumber: string;
}

export interface CheckOtpDto {
    code: string;
    phoneNumber: string;
}

export interface LoginResponseDto {
    accessToken: string;
}

export const authService = {
    /**
     * Создает и отправляет OTP код на указанный номер телефона
     */
    async createOtpCode(phoneNumber: string): Promise<void> {
        const response = await post(`${API_BASE_URL}/api/auth/login/otp/create`, {
            phoneNumber
        });

        if (!response.ok) {
            await handleApiError(response, 'Ошибка при создании OTP кода');
        }
    },

    /**
     * Проверяет OTP код и возвращает access token
     */
    async checkOtpCode(phoneNumber: string, code: string): Promise<LoginResponseDto> {
        const response = await post(`${API_BASE_URL}/api/auth/login/otp/check`, {
            phoneNumber,
            code
        });

        if (!response.ok) {
            await handleApiError(response, 'Ошибка при проверке OTP кода');
        }

        return response.json();
    }
};
