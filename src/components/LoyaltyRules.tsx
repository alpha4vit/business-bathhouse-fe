import {useEffect, useState} from 'react'
import {
    loyaltyService,
    LoyaltyRewardRule,
    CreateLoyaltyRewardRuleRequest,
    UpdateLoyaltyRewardRuleRequest,
    UpdateLoyaltyRewardRuleStatusRequest,
    LoyaltyRewardRuleStatus
} from '../services/loyaltyService'
import Loading from "./Loading.tsx"
import {useNotification} from '../hooks/useNotification'
import Modal from './Modal'
import './LoyaltyRules.css'
import './Modal.css'
import './Notification.css'

function LoyaltyRules() {
    const [rules, setRules] = useState<LoyaltyRewardRule[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [formData, setFormData] = useState<CreateLoyaltyRewardRuleRequest>({
        name: '',
        description: '',
        code: ''
    })
    const [editFormData, setEditFormData] = useState<UpdateLoyaltyRewardRuleRequest>({
        id: '',
        name: '',
        description: '',
        code: ''
    })
    const {notification, showSuccess, showError} = useNotification()

    const getStatusLabel = (status: LoyaltyRewardRuleStatus): string => {
        const labels: Record<LoyaltyRewardRuleStatus, string> = {
            'ACTIVE': 'Активно',
            'PENDING_IMPLEMENTATION': 'Ожидает реализации',
            'INACTIVE': 'Неактивно'
        }
        return labels[status] || status
    }

    const getStatusClass = (status: LoyaltyRewardRuleStatus): string => {
        const classes: Record<LoyaltyRewardRuleStatus, string> = {
            'ACTIVE': 'loyalty-rules-status-active',
            'PENDING_IMPLEMENTATION': 'loyalty-rules-status-pending',
            'INACTIVE': 'loyalty-rules-status-inactive'
        }
        return classes[status] || 'loyalty-rules-status-inactive'
    }

    useEffect(() => {
        loadRules()
    }, [])

    const loadRules = async () => {
        try {
            setLoading(true)
            const data = await loyaltyService.getAllRules()
            setRules(data)
        } catch (err) {
            console.error('Failed to load rules:', err)
            showError('Не удалось загрузить правила')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            await loyaltyService.createRule(formData)
            setShowModal(false)
            resetForm()
            loadRules()
            showSuccess('Правило успешно создано')
        } catch (err) {
            console.error('Failed to create rule:', err)
            showError('Не удалось создать правило')
        }
    }

    const handleStatusToggle = async (rule: LoyaltyRewardRule) => {
        const newStatus = rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            const request: UpdateLoyaltyRewardRuleStatusRequest = {
                id: rule.id,
                status: newStatus
            }
            await loyaltyService.changeRuleStatus(request)
            loadRules()
            showSuccess(newStatus === 'ACTIVE' ? 'Правило успешно активировано' : 'Правило успешно деактивировано')
        } catch (err) {
            console.error('Failed to toggle rule status:', err)
            showError('Не удалось изменить статус правила')
        }
    }

    const handleEdit = (rule: LoyaltyRewardRule) => {
        setEditFormData({
            id: rule.id,
            name: rule.name,
            description: rule.description,
            code: rule.code
        })
        setShowEditModal(true)
    }

    const handleUpdate = async () => {
        try {
            await loyaltyService.updateRule(editFormData)
            setShowEditModal(false)
            resetEditForm()
            loadRules()
            showSuccess('Правило успешно обновлено')
        } catch (err) {
            console.error('Failed to update rule:', err)
            showError('Не удалось обновить правило')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            code: ''
        })
    }

    const resetEditForm = () => {
        setEditFormData({
            id: '',
            name: '',
            description: '',
            code: ''
        })
    }

    if (loading) {
        return <div className="loyalty-rules-container">
            <Loading message={"Загрузка..."}/>
        </div>
    }

    return (
        <div className="loyalty-rules-container">
            {notification && (
                <div className={`notification notification-${notification.type} ${notification.isFading ? 'notification-fading' : ''}`}>
                    {notification.message}
                </div>
            )}

            <div className="loyalty-rules-actions">
                <button
                    className="loyalty-rules-button loyalty-rules-button-primary"
                    onClick={() => setShowModal(true)}
                >
                    + Создать правило
                </button>
            </div>

            <div className="loyalty-rules-list">
                {rules.length === 0 ? (
                    <div className="loyalty-rules-empty">
                        Нет общих правил скидок
                    </div>
                ) : (
                    rules.map(rule => (
                        <div key={rule.id} className="loyalty-rules-item">
                            <div className="loyalty-rules-item-info">
                                <h3>{rule.name}</h3>
                                <p className="loyalty-rules-item-description">{rule.description}</p>
                                <p className="loyalty-rules-item-code">Код: {rule.code}</p>
                                <span className={`loyalty-rules-status ${getStatusClass(rule.status)}`}>
                                    {getStatusLabel(rule.status)}
                                </span>
                            </div>
                            <div className="loyalty-rules-item-actions">
                                <button
                                    className="loyalty-rules-button loyalty-rules-button-secondary"
                                    onClick={() => handleEdit(rule)}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className={`loyalty-rules-button ${rule.status === 'ACTIVE' ? 'loyalty-rules-button-danger' : 'loyalty-rules-button-success'}`}
                                    onClick={() => handleStatusToggle(rule)}
                                >
                                    {rule.status === 'ACTIVE' ? 'Деактивировать' : 'Активировать'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                    resetForm()
                }}
                title="Создать правило скидки"
                actions={
                    <>
                        <button
                            type="button"
                            className="modal-button modal-button-secondary"
                            onClick={() => {
                                setShowModal(false)
                                resetForm()
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="modal-button modal-button-primary"
                            onClick={(e) => {
                                e.preventDefault()
                                handleCreate()
                            }}
                        >
                            Создать
                        </button>
                    </>
                }
            >
                <form>
                    <div className="modal-form-group">
                        <label>Название правила</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Описание</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Код правила</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            required
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    resetEditForm()
                }}
                title="Изменить правило скидки"
                actions={
                    <>
                        <button
                            type="button"
                            className="modal-button modal-button-secondary"
                            onClick={() => {
                                setShowEditModal(false)
                                resetEditForm()
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="modal-button modal-button-primary"
                            onClick={(e) => {
                                e.preventDefault()
                                handleUpdate()
                            }}
                        >
                            Сохранить
                        </button>
                    </>
                }
            >
                <form>
                    <div className="modal-form-group">
                        <label>Название правила</label>
                        <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Описание</label>
                        <textarea
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Код правила</label>
                        <input
                            type="text"
                            value={editFormData.code}
                            onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                            required
                            disabled
                            readOnly
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default LoyaltyRules
