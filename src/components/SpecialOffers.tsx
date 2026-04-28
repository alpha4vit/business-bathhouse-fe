import './SpecialOffers.css'

interface Offer {
    id: number
    title: string
    period: string
    emoji: string
    items: OfferItem[]
}

interface OfferItem {
    icon: string
    label: string
    value: string
    link?: string
}

function SpecialOffers() {
    const offers: Offer[] = [
        {
            id: 1,
            title: 'Завтрак',
            period: 'Будни: 9:00–12:00 | Выходные: 9:00–14:00',
            emoji: '🍳',
            items: [
                {
                    icon: '📍',
                    label: 'Ресторан',
                    value: 'Ива',
                    link: 'https://yandex.ru/maps/org/iva/50972027467?si=jn8ebe960mqzwnum120tmx13dw'
                },
                {
                    icon: '🏢',
                    label: 'Адрес',
                    value: 'ул. Радищева, 41/2'
                },
                {
                    icon: '🅿️',
                    label: 'Парковка',
                    value: 'Аннулируется по чеку'
                },
                {
                    icon: '🎁',
                    label: 'Бонус для резидентов',
                    value: 'Напиток к завтраку бесплатно по промокоду «Бизнес Баня»'
                }
            ]
        },
        {
            id: 2,
            title: 'Обед',
            period: '12:00–00:00',
            emoji: '🍽️',
            items: [
                {
                    icon: '📍',
                    label: 'Ресторан',
                    value: 'БарБорис',
                    link: 'https://yandex.ru/maps/org/barboris/215059089842?si=jn8ebe960mqzwnum120tmx13dw'
                },
                {
                    icon: '🏢',
                    label: 'Адрес',
                    value: 'ул. Бориса Ельцина, 3'
                },
                {
                    icon: '🅿️',
                    label: 'Парковка',
                    value: 'Аннулируется по чеку'
                },
                {
                    icon: '🎁',
                    label: 'Бонус для резидентов',
                    value: 'Скидка 5% по промокоду «Бизнес Баня»'
                }
            ]
        },
        {
            id: 3,
            title: 'Вечер',
            period: 'ВС-ЧТ: 13:00–01:00 | ПТ-СБ: 13:00–02:00',
            emoji: '🌙',
            items: [
                {
                    icon: '📍',
                    label: 'Кальянная',
                    value: 'Полки Lounge',
                    link: 'https://yandex.ru/maps/org/polki_lounge/212343517257?si=vgkqz9k6p2yhtnyz2gm2qxavfg'
                },
                {
                    icon: '🏢',
                    label: 'Адрес',
                    value: 'ул. 8 Марта, 31'
                },
                {
                    icon: '🎁',
                    label: 'Бонус для резидентов',
                    value: '1000 баллов по карте лояльности (списать до 50% от чека)',
                    link: 'https://t.me/PolkiGroupBot?start=jaxr8029'
                }
            ]
        }
    ]

    return (
        <div className="offers-container">
            <div className="offers-content">
                <div className="offers-header">
                    <h1>Спецпредложения и акции</h1>
                    <div className="offers-header-subtitle">
                        Сообщество Бизнес Бани
                    </div>
                </div>

                {offers.map(offer => (
                    <div key={offer.id} className="offers-card">
                        <div className="offers-card-header">
                            <div className="offers-card-emoji">{offer.emoji}</div>
                            <div className="offers-card-title">
                                <h2>{offer.title}</h2>
                                <div className="offers-card-period">{offer.period}</div>
                            </div>
                        </div>

                        <div className="offers-items">
                            {offer.items.map((item, index) => (
                                <div key={index} className="offers-item">
                                    <div className="offers-item-icon">{item.icon}</div>
                                    <div className="offers-item-content">
                                        <div className="offers-item-label">{item.label}</div>
                                        {item.link ? (
                                            <a 
                                                href={item.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="offers-item-value-link"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <div className="offers-item-value">{item.value}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="offers-card offers-card-exclusive">
                    <div className="offers-card-header">
                        <div className="offers-card-emoji">🏰</div>
                        <div className="offers-card-title">
                            <h2>Эксклюзивное предложение</h2>
                            <div className="offers-card-period">Для участников клуба «Бизнес Баня»</div>
                        </div>
                    </div>

                    <div className="offers-exclusive-content">
                        <div className="offers-exclusive-bonus">
                            Максимальная скидка 20% на аренду любого банного дома в комплексе «Три Богатыря»
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
        </div>
    )
}

export default SpecialOffers
