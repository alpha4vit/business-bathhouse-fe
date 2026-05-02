import './SpecialOffers.css'

interface Offer {
    id: number
    establishment: string
    type: string
    address: string
    workingHours: string
    parking: string
    bonus: string
    link?: string
    telegramLink?: string
}

function SpecialOffers() {
    const offers: Offer[] = [
        {
            id: 1,
            establishment: 'Ресторан «Ива»',
            type: 'Ресторан',
            address: 'ул. Радищева, 41/2',
            workingHours: 'Будни: 9:00–00:00 | Выходные: 9:00–02:00',
            parking: 'Бесплатная по чеку',
            bonus: 'Напиток к завтраку бесплатно по промокоду «Бизнес Баня»',
            link: 'https://yandex.ru/maps/org/iva/50972027467?si=jn8ebe960mqzwnum120tmx13dw'
        },
        {
            id: 2,
            establishment: 'Ресторан «БарБорис»',
            type: 'Ресторан',
            address: 'ул. Бориса Ельцина, 3',
            workingHours: 'Ежедневно: 12:00–00:00',
            parking: 'Бесплатная по чеку',
            bonus: 'Скидка 5% по промокоду «Бизнес Баня»',
            link: 'https://yandex.ru/maps/org/barboris/215059089842?si=jn8ebe960mqzwnum120tmx13dw'
        },
        {
            id: 3,
            establishment: 'Кальянная «Полки Lounge»',
            type: 'Кальянная',
            address: 'ул. 8 Марта, 31',
            workingHours: 'ВС-ЧТ: 13:00–01:00 | ПТ-СБ: 13:00–02:00',
            parking: 'Рядом платная парковка',
            bonus: '1000 баллов по карте лояльности (списать до 50% от чека)',
            telegramLink: 'https://t.me/PolkiGroupBot?start=jaxr8029',
            link: 'https://yandex.ru/maps/org/polki_lounge/212343517257?si=vgkqz9k6p2yhtnyz2gm2qxavfg'
        }
    ]

    return (
        <div className="offers-container">
            <div className="offers-content">
                <div className="offers-header">
                    <h1>Специальные предложения</h1>
                    <div className="offers-header-subtitle">
                        Для резидентов сообщества «Бизнес Баня»
                    </div>
                </div>

                {offers.map(offer => (
                    <div key={offer.id} className="offers-card">
                        <div className="offers-card-header">
                            <div className="offers-establishment-info">
                                <h2 className="offers-establishment-name">{offer.establishment}</h2>
                                <div className="offers-establishment-type">{offer.type}</div>
                            </div>
                        </div>

                        <div className="offers-bonus-section">
                            <div className="offers-bonus-header">
                                <div className="offers-bonus-title">Специальные условия для резидентов</div>
                            </div>
                            <div className="offers-bonus-content">
                                {offer.telegramLink ? (
                                    <a 
                                        href={offer.telegramLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="offers-bonus-value-link"
                                    >
                                        {offer.bonus}
                                    </a>
                                ) : (
                                    <div className="offers-bonus-value">{offer.bonus}</div>
                                )}
                            </div>
                        </div>

                        <div className="offers-details">
                            <div className="offers-detail-item">
                                <div className="offers-detail-content">
                                    <div className="offers-detail-label">Информация о заведении</div>
                                    <div className="offers-establishment-info-detailed">
                                        <div className="offers-info-row">
                                            <span className="offers-info-label">Адрес:</span>
                                            {offer.link ? (
                                                <a 
                                                    href={offer.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="offers-info-value-link"
                                                >
                                                    {offer.address}
                                                </a>
                                            ) : (
                                                <span className="offers-info-value">{offer.address}</span>
                                            )}
                                        </div>
                                        <div className="offers-info-row">
                                            <span className="offers-info-label">Режим работы:</span>
                                            <span className="offers-info-value">{offer.workingHours}</span>
                                        </div>
                                        <div className="offers-info-row">
                                            <span className="offers-info-label">Парковка:</span>
                                            <span className="offers-info-value">{offer.parking}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="offers-card">
                    <div className="offers-card-header">
                        <div className="offers-establishment-info">
                            <h2 className="offers-establishment-name">«Три Богатыря»</h2>
                            <div className="offers-establishment-type">Банный комплекс</div>
                        </div>
                    </div>

                    <div className="offers-bonus-section">
                        <div className="offers-bonus-header">
                            <div className="offers-bonus-title">Специальные условия для резидентов</div>
                        </div>
                        <div className="offers-bonus-content">
                            <div className="offers-bonus-value">
                                Максимальная скидка 20% на аренду любого банного дома
                            </div>
                        </div>
                    </div>

                    <div className="offers-exclusive-steps">
                        <div className="offers-exclusive-step">
                            <div className="offers-exclusive-step-number">1</div>
                            <div className="offers-exclusive-step-text">
                                Напишите Сергею Стрельникову&nbsp;
                                <a
                                    href="https://t.me/strelnikov_coach"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="offers-exclusive-link"
                                >
                                    @strelnikov_coach
                                </a>
                            </div>
                        </div>

                        <div className="offers-exclusive-step">
                            <div className="offers-exclusive-step-number">2</div>
                            <div className="offers-exclusive-step-text">
                                Сообщите номер своей карты при бронировании
                            </div>
                        </div>

                        <div className="offers-exclusive-step">
                            <div className="offers-exclusive-step-number">3</div>
                            <div className="offers-exclusive-step-text">
                                Предъявите оригинальную карту в приложении Wallet при расчете
                            </div>
                        </div>
                    </div>

                    <div className="offers-exclusive-warning">
                        <strong>‼️ Важно:</strong> Карта может использоваться только действующими участниками клуба «Бизнес Баня Екатеринбург». Список участников утверждается Сергеем Стрельниковым. Бронирование банного домика должно быть на ИМЯ и НОМЕР ТЕЛЕФОНА резидента сообщества.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SpecialOffers
