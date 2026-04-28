import './PointsInstructions.css'

interface PointsInstructionsProps {
    onClose?: () => void
}

function PointsInstructions({ onClose }: PointsInstructionsProps) {
    return (
        <div className="instructions-container">
            {/*<div className="instructions-header">*/}
            {/*    <h1>📄 Правила начисления баллов</h1>*/}
            {/*    <div className="instructions-subtitle">В рейтинг резидентов бизнес-сообщества «Бизнес Баня»</div>*/}
            {/*</div>*/}

            <div className="instructions-intro">
                В целях формирования объективного рейтинга участников бизнес-сообщества «Бизнес Баня» баллы начисляются за следующие активности.
            </div>

            <div className="instructions-card">
                <div className="instructions-section-title">
                    <div className="instructions-section-number">1</div>
                    <span>🏢 Посещение внутренних мероприятий</span>
                </div>
                <div className="instructions-section-content">
                    <p>За участие в мероприятиях сообщества резидентам начисляются баллы.</p>
                    <div className="instructions-highlight">
                        <p>Перечень ближайших мероприятий, за которые предусмотрено начисление баллов, публикуется один раз в две недели совместно с обновлённой версией рейтинга.</p>
                    </div>
                    <p>Также баллы могут начисляться за участие в партнёрских мероприятиях. Факт начисления баллов в таких случаях всегда указывается в анонсе мероприятия.</p>
                </div>
            </div>

            <div className="instructions-card">
                <div className="instructions-section-title">
                    <div className="instructions-section-number">2</div>
                    <span>⚽ Участие в мероприятиях клубов по интересам</span>
                </div>
                <div className="instructions-section-content">
                    <p>Баллы начисляются за посещение активностей спортивных клубов сообщества.</p>
                    <div className="instructions-highlight instructions-pulse">
                        <p><strong>Важно:</strong> Следите за анонсами спортивных мероприятий и активно участвуйте в жизни клубов!</p>
                    </div>
                </div>
            </div>

            <div className="instructions-card">
                <div className="instructions-section-title">
                    <div className="instructions-section-number">3</div>
                    <span>🤝 Участие в проекте «Персональный нетворкинг»</span>
                </div>
                <div className="instructions-section-content">
                    <p>В рамках данного проекта начисление баллов осуществляется следующим образом:</p>
                    <div className="instructions-list-item">
                        <strong>Инициатор встречи</strong> — <span className="instructions-points-badge">5 баллов</span> за каждую состоявшуюся встречу
                    </div>
                    <div className="instructions-highlight">
                        <p><strong>Совет:</strong> Будьте proactive! Иницируйте встречи с другими резидентами для расширения нетворка и заработка дополнительных баллов.</p>
                    </div>
                </div>
            </div>

            <div className="instructions-card">
                <div className="instructions-section-title">
                    <div className="instructions-section-number">📊</div>
                    <span>Актуальная информация</span>
                </div>
                <div className="instructions-section-content">
                    <div className="instructions-highlight">
                        <p>Актуальный рейтинг и перечень мероприятий с начислением баллов публикуются с периодичностью один раз в две недели.</p>
                    </div>
                    <p>Следите за обновлениями в сообществе, чтобы не упустить возможности для заработка баллов!</p>
                </div>
            </div>

            {onClose && (
                <button 
                    className="instructions-close-button"
                    onClick={onClose}
                >
                    Скрыть
                </button>
            )}

            {/*<div className="instructions-footer">*/}
            {/*    <p>Бизнес-сообщество «Бизнес Баня»</p>*/}
            {/*    <p>Растём вместе 🚀</p>*/}
            {/*</div>*/}
        </div>
    )
}

export default PointsInstructions
