import './SpecialOffers.css'
import {useEffect, useState} from 'react'
import {SpecialOffer, specialOfferService} from '../services/specialOfferService'
import Loading from "./Loading.tsx";

function SpecialOffers() {
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const data = await specialOfferService.getActiveOffers()
                setOffers(data)
            } catch (err) {
                console.error('Failed to load special offers:', err)
                setError('Не удалось загрузить специальные предложения')
            } finally {
                setLoading(false)
            }
        }

        loadOffers()
    }, [])

    if (loading) {
        return <div className="offers-container">
            <Loading message={"Загрузка..."}></Loading>
        </div>
    }

    if (error) {
        return <div className="offers-container">{error}</div>
    }

    if (offers.length === 0) {
        return (
            <div className="offers-container">
                <div className="offers-content">
                    <div className="offers-empty-state">
                        <div className="offers-empty-icon">🎁</div>
                        <h2 className="offers-empty-title">Нет активных специальных предложений</h2>
                        <p className="offers-empty-description">
                            В данный момент специальных предложений нет. Следите за обновлениями!
                        </p>
                    </div>
                </div>
            </div>
        )
    }

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
                                <h2 className="offers-establishment-name">«{offer.establishmentName}»</h2>
                                <div className="offers-establishment-type">{offer.establishmentType}</div>
                            </div>
                        </div>

                        <div className="offers-bonus-section">
                            <div className="offers-bonus-header">
                                <div className="offers-bonus-title">Специальные условия для резидентов</div>
                            </div>
                            <div className="offers-bonus-content">
                                <div className="offers-bonus-value">{offer.offer}</div>
                            </div>
                        </div>

                        {offer.address && (<div className="offers-details">
                                <div className="offers-detail-item">
                                    <div className="offers-detail-content">
                                        <div className="offers-detail-label">Информация о заведении</div>
                                        <div className="offers-establishment-info-detailed">
                                            {offer.address && (
                                                <div className="offers-info-row">
                                                    <span className="offers-info-label">Адрес:</span>
                                                    {offer.mapLink ? (
                                                        <a
                                                            href={offer.mapLink}
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
                                            )}
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
                        )
                        }
                        {offer.steps && offer.steps.length > 0 && (
                            <div className="offers-exclusive-steps">
                                {offer.steps.map((step, index) => (
                                    <div key={index} className="offers-exclusive-step">
                                        <div className="offers-exclusive-step-number">{index + 1}</div>
                                        <div className="offers-exclusive-step-text">{step}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {offer.tip && (
                            <div className="offers-exclusive-warning">
                                <strong>‼️ Важно:</strong> {offer.tip}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SpecialOffers
