import './AccessDenied.css'

interface AccessDeniedProps {
  message?: string
  onDismiss?: () => void
}

function AccessDenied({ message = 'Недостаточно прав для доступа к ресурсу', onDismiss }: AccessDeniedProps) {
  return (
    <div className="access-denied-overlay">
      <div className="access-denied-modal">
        <div className="access-denied-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#E53935" strokeWidth="2" fill="none"/>
            <path d="M12 7V13" stroke="#E53935" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16V17" stroke="#E53935" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="access-denied-title">Доступ запрещен</h2>
        <p className="access-denied-message">{message}</p>
        <div className="access-denied-tips">
          <p className="access-denied-tip">Возможные причины:</p>
          <ul className="access-denied-list">
            <li>Вы не авторизованы в Telegram</li>
            <li>У вас нет необходимых прав для доступа к этому разделу</li>
            <li>Сессия истекла или была прервана</li>
          </ul>
        </div>
        {onDismiss && (
          <button className="access-denied-button" onClick={onDismiss}>
            Закрыть
          </button>
        )}
      </div>
    </div>
  )
}

export default AccessDenied
