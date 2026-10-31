import './SpecialOffersAdmin.css'
import {useEffect, useState} from 'react'
import {
    specialOfferService,
    SpecialOffer,
    SpecialOfferStatus,
    CreateSpecialOfferRequest,
    UpdateSpecialOfferRequest
} from '../services/specialOfferService'
import Loading from "./Loading.tsx"
import Modal from './Modal'

function SpecialOffersAdmin() {
    const [offers, setOffers] = useState<SpecialOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<SpecialOfferStatus | 'ALL'>('ALL')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null)
    const [formData, setFormData] = useState<CreateSpecialOfferRequest>({
        offer: '',
        establishmentName: '',
        establishmentType: '',
        address: '',
        mapLink: '',
        workingHours: '',
        parking: '',
        steps: [],
        tip: '',
        status: SpecialOfferStatus.ACTIVE
    })
    const [stepsRaw, setStepsRaw] = useState('')

    useEffect(() => {
        loadOffers()
    }, [])

    const loadOffers = async () => {
        try {
            setLoading(true)
            const data = await specialOfferService.getAllOffers()
            setOffers(data)
        } catch (err) {
            console.error('Failed to load offers:', err)
            setError('Не удалось загрузить специальные предложения')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            const steps = stepsRaw.split('|').map(s => s.trim()).filter(s => s.trim())
            await specialOfferService.createOffer({...formData, steps})
            setShowCreateModal(false)
            resetForm()
            loadOffers()
        } catch (err) {
            console.error('Failed to create offer:', err)
            setError('Не удалось создать специальное предложение')
        }
    }

    const handleUpdate = async () => {
        if (!editingOffer) return
        try {
            const steps = stepsRaw.split('|').map(s => s.trim()).filter(s => s.trim())
            const updateRequest: UpdateSpecialOfferRequest = {
                offer: formData.offer,
                establishmentName: formData.establishmentName,
                establishmentType: formData.establishmentType,
                address: formData.address,
                mapLink: formData.mapLink,
                workingHours: formData.workingHours,
                parking: formData.parking,
                steps,
                tip: formData.tip,
                status: formData.status
            }
            await specialOfferService.updateOffer(editingOffer.id, updateRequest)
            setEditingOffer(null)
            resetForm()
            loadOffers()
        } catch (err) {
            console.error('Failed to update offer:', err)
            setError('Не удалось обновить специальное предложение')
        }
    }

    const handleStatusToggle = async (offer: SpecialOffer) => {
        const newStatus = offer.status === SpecialOfferStatus.ACTIVE
            ? SpecialOfferStatus.DEACTIVATED
            : SpecialOfferStatus.ACTIVE
        try {
            await specialOfferService.updateOfferStatus(offer.id, newStatus)
            loadOffers()
        } catch (err) {
            console.error('Failed to update status:', err)
            setError('Не удалось обновить статус')
        }
    }

    const openEditModal = (offer: SpecialOffer) => {
        setEditingOffer(offer)
        setFormData({
            offer: offer.offer,
            establishmentName: offer.establishmentName,
            establishmentType: offer.establishmentType,
            address: offer.address || '',
            mapLink: offer.mapLink || '',
            workingHours: offer.workingHours,
            parking: offer.parking,
            steps: offer.steps || [],
            tip: offer.tip,
            status: offer.status
        })
        setStepsRaw(offer.steps?.join(' | ') || '')
    }

    const resetForm = () => {
        setFormData({
            offer: '',
            establishmentName: '',
            establishmentType: '',
            address: '',
            mapLink: '',
            workingHours: '',
            parking: '',
            steps: [],
            tip: '',
            status: SpecialOfferStatus.ACTIVE
        })
        setStepsRaw('')
    }

    const filteredOffers = filter === 'ALL'
        ? offers
        : offers.filter(o => o.status === filter)

    if (loading) {
        return <div className="admin-offers-container">
            <Loading message={"Загрузка..."}/>
        </div>
    }

    return (
        <div className="admin-offers-container">
            <div className="admin-offers-content">
                <div className="admin-offers-header">
                    <h1>Управление специальными предложениями</h1>
                    <button
                        className="admin-offers-button admin-offers-button-contrast"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Создать предложение
                    </button>
                </div>

                {error && <div className="admin-offers-error">{error}</div>}

                <div className="admin-offers-filters">
                    <button
                        className={`admin-offers-filter ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        Все
                    </button>
                    <button
                        className={`admin-offers-filter ${filter === SpecialOfferStatus.ACTIVE ? 'active' : ''}`}
                        onClick={() => setFilter(SpecialOfferStatus.ACTIVE)}
                    >
                        Активные
                    </button>
                    <button
                        className={`admin-offers-filter ${filter === SpecialOfferStatus.DEACTIVATED ? 'active' : ''}`}
                        onClick={() => setFilter(SpecialOfferStatus.DEACTIVATED)}
                    >
                        Деактивированные
                    </button>
                </div>

                <div className="admin-offers-list">
                    {filteredOffers.map(offer => (
                        <div key={offer.id} className="admin-offers-item">
                            <div className="admin-offers-item-info">
                                <h3>{offer.establishmentName}</h3>
                                <p className="admin-offers-item-type">{offer.establishmentType}</p>
                                <p className="admin-offers-item-offer">{offer.offer}</p>
                                <span className={`admin-offers-status ${offer.status === SpecialOfferStatus.ACTIVE ? 'active' : 'deactivated'}`}>
                                    {offer.status === SpecialOfferStatus.ACTIVE ? 'Активно' : 'Деактивировано'}
                                </span>
                            </div>
                            <div className="admin-offers-item-actions">
                                <button
                                    className="admin-offers-button admin-offers-button-secondary"
                                    onClick={() => openEditModal(offer)}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className={`admin-offers-button ${offer.status === SpecialOfferStatus.ACTIVE ? 'admin-offers-button-danger' : 'admin-offers-button-secondary'}`}
                                    onClick={() => handleStatusToggle(offer)}
                                >
                                    {offer.status === SpecialOfferStatus.ACTIVE ? 'Деактивировать' : 'Активировать'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={showCreateModal || editingOffer !== null}
                onClose={() => {
                    setShowCreateModal(false)
                    setEditingOffer(null)
                    resetForm()
                }}
                title={editingOffer ? 'Редактировать предложение' : 'Создать предложение'}
                actions={
                    <>
                        <button
                            type="button"
                            className="modal-button modal-button-secondary"
                            onClick={() => {
                                setShowCreateModal(false)
                                setEditingOffer(null)
                                resetForm()
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="modal-button modal-button-primary"
                            onClick={() => editingOffer ? handleUpdate() : handleCreate()}
                        >
                            {editingOffer ? 'Сохранить' : 'Создать'}
                        </button>
                    </>
                }
            >
                <div className="modal-form-group">
                    <label>Название заведения</label>
                    <input
                        type="text"
                        value={formData.establishmentName}
                        onChange={(e) => setFormData({...formData, establishmentName: e.target.value})}
                        required
                    />
                </div>
                <div className="modal-form-group">
                    <label>Тип заведения</label>
                    <input
                        type="text"
                        value={formData.establishmentType}
                        onChange={(e) => setFormData({...formData, establishmentType: e.target.value})}
                        required
                    />
                </div>
                <div className="modal-form-group">
                    <label>Специальное предложение</label>
                    <textarea
                        value={formData.offer}
                        onChange={(e) => setFormData({...formData, offer: e.target.value})}
                        required
                    />
                </div>
                <div className="modal-form-group">
                    <label>Адрес</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                </div>
                <div className="modal-form-group">
                    <label>Ссылка на карту</label>
                    <input
                        type="text"
                        value={formData.mapLink}
                        onChange={(e) => setFormData({...formData, mapLink: e.target.value})}
                    />
                </div>
                <div className="modal-form-group">
                    <label>Режим работы</label>
                    <input
                        type="text"
                        value={formData.workingHours}
                        onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                        required
                    />
                </div>
                <div className="modal-form-group">
                    <label>Парковка</label>
                    <input
                        type="text"
                        value={formData.parking}
                        onChange={(e) => setFormData({...formData, parking: e.target.value})}
                        required
                    />
                </div>
                <div className="modal-form-group">
                    <label>Шаги (разделите знаком |)</label>
                    <textarea
                        value={stepsRaw}
                        onChange={(e) => setStepsRaw(e.target.value)}
                    />
                </div>
                <div className="modal-form-group">
                    <label>Совет</label>
                    <textarea
                        value={formData.tip}
                        onChange={(e) => setFormData({...formData, tip: e.target.value})}
                    />
                </div>
                <div className="modal-form-group">
                    <label>Статус</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as SpecialOfferStatus})}
                    >
                        <option value={SpecialOfferStatus.ACTIVE}>Активно</option>
                        <option value={SpecialOfferStatus.DEACTIVATED}>Деактивировано</option>
                    </select>
                </div>
            </Modal>
        </div>
    )
}

export default SpecialOffersAdmin
