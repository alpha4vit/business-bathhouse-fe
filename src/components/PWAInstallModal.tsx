import './PWAInstallModal.css'

interface PWAInstallModalProps {
    isOpen: boolean
    onClose: () => void
}

function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
    if (!isOpen) return null

    const getOperatingSystem = (): string => {
        const userAgent = navigator.userAgent.toLowerCase()
        
        if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
            return 'ios'
        }
        if (userAgent.includes('android')) {
            return 'android'
        }
        if (userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad')) {
            return 'macos'
        }
        if (userAgent.includes('win')) {
            return 'windows'
        }
        return 'other'
    }

    const os = getOperatingSystem()

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            alert('Ссылка скопирована в буфер обмена!')
        } catch (err) {
            console.error('Не удалось скопировать ссылку:', err)
            alert('Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную из адресной строки.')
        }
    }

    const renderInstructions = () => {
        switch (os) {
            case 'ios':
                return (
                    <div className="pwa-instructions">
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">1</div>
                            <div className="pwa-step-content">
                                <p>Нажмите <span className="pwa-copy-link" onClick={copyToClipboard}>скопировать</span> ссылку на сайт</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">2</div>
                            <div className="pwa-step-content">
                                <p>Откройте Safari или другой браузер на вашем телефоне</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">3</div>
                            <div className="pwa-step-content">
                                <p>Вставьте скопированную ссылку в адресную строку браузера</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">4</div>
                            <div className="pwa-step-content">
                                <p>Нажмите на кнопку <strong>"Поделиться"</strong> <span className="pwa-icon"><svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg></span> в нижней части экрана</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">5</div>
                            <div className="pwa-step-content">
                                <p>Выберите <strong>"На экран Домой"</strong> и нажмите <strong>"Добавить"</strong></p>
                            </div>
                        </div>
                    </div>
                )
            case 'android':
                return (
                    <div className="pwa-instructions">
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">1</div>
                            <div className="pwa-step-content">
                                <p>Нажмите <span className="pwa-copy-link" onClick={copyToClipboard}>скопировать</span> ссылку на сайт</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">2</div>
                            <div className="pwa-step-content">
                                <p>Откройте Chrome или другой браузер на вашем телефоне</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">3</div>
                            <div className="pwa-step-content">
                                <p>Вставьте скопированную ссылку в адресную строку браузера</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">4</div>
                            <div className="pwa-step-content">
                                <p>Нажмите на меню <span className="pwa-icon">⋮</span> в правом верхнем углу браузера</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">5</div>
                            <div className="pwa-step-content">
                                <p>Выберите <strong>"Добавить на главный экран"</strong> и нажмите <strong>"Добавить"</strong></p>
                            </div>
                        </div>
                    </div>
                )
            case 'macos':
                return (
                    <div className="pwa-instructions">
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">1</div>
                            <div className="pwa-step-content">
                                <p>В меню Safari выберите <strong>"Файл"</strong> → <strong>"Добавить на экран Dock"</strong></p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">2</div>
                            <div className="pwa-step-content">
                                <p>Приложение появится в Dock и будет доступно для быстрого запуска</p>
                            </div>
                        </div>
                    </div>
                )
            case 'windows':
                return (
                    <div className="pwa-instructions">
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">1</div>
                            <div className="pwa-step-content">
                                <p>Нажмите на меню <span className="pwa-icon">⋮</span> в правом верхнем углу браузера</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">2</div>
                            <div className="pwa-step-content">
                                <p>Выберите <strong>"Приложения"</strong> → <strong>"Установить это приложение как приложение"</strong></p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">3</div>
                            <div className="pwa-step-content">
                                <p>Подтвердите установку, нажав <strong>"Установить"</strong></p>
                            </div>
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="pwa-instructions">
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">1</div>
                            <div className="pwa-step-content">
                                <p>Откройте меню браузера (обычно в правом верхнем углу)</p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">2</div>
                            <div className="pwa-step-content">
                                <p>Найдите опцию <strong>"Добавить на главный экран"</strong> или <strong>"Установить приложение"</strong></p>
                            </div>
                        </div>
                        <div className="pwa-instruction-step">
                            <div className="pwa-step-number">3</div>
                            <div className="pwa-step-content">
                                <p>Следуйте инструкциям на экране для завершения установки</p>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    const getOSTitle = () => {
        switch (os) {
            case 'ios': return 'iOS'
            case 'android': return 'Android'
            case 'macos': return 'macOS'
            case 'windows': return 'Windows'
            default: return 'Ваше устройство'
        }
    }

    return (
        <div className="pwa-modal-overlay" onClick={onClose}>
            <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="pwa-modal-close" onClick={onClose}>×</button>
                
                <div className="pwa-modal-header">
                    <div className="pwa-modal-icon">📱</div>
                    <h2 className="pwa-modal-title">Установите приложение</h2>
                    <p className="pwa-modal-subtitle">Добавьте «Бизнес Баня» на главный экран для быстрого доступа</p>
                </div>

                <div className="pwa-os-badge">
                    {getOSTitle()}
                </div>

                {renderInstructions()}

                <div className="pwa-modal-footer">
                    <button className="pwa-modal-button" onClick={onClose}>
                        Понятно
                    </button>
                    <button className="pwa-modal-button pwa-modal-button-secondary" onClick={() => {
                        localStorage.setItem('pwaInstallModalShown', 'true')
                        onClose()
                    }}>
                        Больше не показывать
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PWAInstallModal