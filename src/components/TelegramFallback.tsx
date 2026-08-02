import React from 'react'
import './TelegramFallback.css'

const TelegramFallback: React.FC = () => {
    const isTelegram = typeof window !== 'undefined' && (window as any).Telegram?.WebApp

    return (
        <div className="telegram-fallback">
            <div className="telegram-fallback-content">
                <div className="telegram-fallback-icon">📱</div>
                <h2 className="telegram-fallback-title">
                    {isTelegram ? 'Ошибка инициализации Telegram' : 'Откройте в Telegram'}
                </h2>
                <p className="telegram-fallback-message">
                    {isTelegram
                        ? 'Не удалось получить данные для авторизации. Пожалуйста, попробуйте перезапустить мини-приложение.'
                        : 'Это приложение предназначено для использования внутри Telegram. Пожалуйста, откройте его через Telegram.'
                    }
                </p>
                {!isTelegram && (
                    <div className="telegram-fallback-instructions">
                        <h3>Как открыть:</h3>
                        <ol>
                            <li>Найдите бота в Telegram</li>
                            <li>Запустите мини-приложение через меню бота</li>
                        </ol>
                    </div>
                )}
                <button
                    className="telegram-fallback-button"
                    onClick={() => window.location.reload()}
                >
                    Обновить страницу
                </button>
            </div>
        </div>
    )
}

export default TelegramFallback
