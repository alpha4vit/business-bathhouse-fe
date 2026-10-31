import {useEffect, useState} from 'react'
import {CreateLoyaltyRewardRequest, LoyaltyReward, loyaltyService, LoyaltyRewardRuleStatus} from '../services/loyaltyService'
import Loading from "./Loading.tsx"
import UserSearch from './UserSearch'
import {UserDto} from '../services/userService'
import {useNotification} from '../hooks/useNotification'
import Modal from './Modal'
import './LoyaltyRewards.css'
import './Modal.css'
import './UserSearch.css'
import './Notification.css'

function LoyaltyRewards() {
    const [rewards, setRewards] = useState<LoyaltyReward[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState<CreateLoyaltyRewardRequest>({
        name: '',
        description: '',
        userIds: [],
        discount: 0
    })
    const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([])
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
            'ACTIVE': 'loyalty-rewards-status-active',
            'PENDING_IMPLEMENTATION': 'loyalty-rewards-status-pending',
            'INACTIVE': 'loyalty-rewards-status-inactive'
        }
        return classes[status] || 'loyalty-rewards-status-inactive'
    }

    useEffect(() => {
        loadRewards()
    }, [])

    const loadRewards = async () => {
        try {
            setLoading(true)
            const data = await loyaltyService.getAllRewards()
            setRewards(data)
        } catch (err) {
            console.error('Failed to load rewards:', err)
            showError('Не удалось загрузить персональные скидки')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        try {
            const userIds = selectedUsers.map(user => user.chatId)
            await loyaltyService.createReward({
                ...formData,
                userIds
            })
            setShowModal(false)
            resetForm()
            loadRewards()
            showSuccess('Персональная скидка успешно создана')
        } catch (err) {
            console.error('Failed to create reward:', err)
            showError('Не удалось создать персональную скидку')
        }
    }

    const handleDelete = async (reward: LoyaltyReward) => {
        try {
            await loyaltyService.deleteReward(reward)
            loadRewards()
            showSuccess('Персональная скидка успешно удалена')
        } catch (err) {
            console.error('Failed to delete reward:', err)
            showError('Не удалось удалить персональную скидку')
        }
    }

    const handleUsersChange = (users: UserDto[]) => {
        setSelectedUsers(users)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            userIds: [],
            discount: 0
        })
        setSelectedUsers([])
    }

    if (loading) {
        return <div className="loyalty-rewards-container">
            <Loading message={"Загрузка..."}/>
        </div>
    }

    return (
        <div className="loyalty-rewards-container">
            {notification && (
                <div
                    className={`notification notification-${notification.type} ${notification.isFading ? 'notification-fading' : ''}`}>
                    {notification.message}
                </div>
            )}

            <div className="loyalty-rewards-actions">
                <button
                    className="loyalty-rewards-button loyalty-rewards-button-primary"
                    onClick={() => setShowModal(true)}
                >
                    + Создать персональную скидку
                </button>
            </div>

            <div className="loyalty-rewards-list">
                {rewards.length === 0 ? (
                    <div className="loyalty-rewards-empty">
                        Нет персональных скидок
                    </div>
                ) : (
                    rewards.map(reward => (
                        <div key={reward.rule.id + reward.user.chatId} className="loyalty-rewards-item">
                            <div className="loyalty-rewards-item-info">
                                <h3>{reward.rule.name}</h3>
                                <p className="loyalty-rewards-item-description">{reward.rule.description}</p>
                                <p className="loyalty-rewards-item-discount">Скидка: {reward.discount}%</p>
                                <p className="loyalty-rewards-item-users">
                                    Пользователь: {reward.user.fullName || 'Не указан'}
                                </p>
                            </div>
                            <div className="loyalty-rewards-item-actions">
                                <div className="loyalty-rewards-item-status-container">
                                    <span
                                        className={`loyalty-rewards-status ${getStatusClass(reward.rule.status)}`}
                                    >
                                        {getStatusLabel(reward.rule.status)}
                                    </span>
                                </div>
                                <button
                                    className="loyalty-rewards-button loyalty-rewards-button-danger"
                                    onClick={() => handleDelete(reward)}
                                >
                                    Удалить
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
                title="Создать персональную скидку"
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
                            disabled={selectedUsers.length === 0}
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
                        <label>Название скидки</label>
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
                        <label>Размер скидки (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({
                                ...formData,
                                discount: parseInt(e.target.value) || 0
                            })}
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label>Выберите пользователей</label>
                        <UserSearch
                            selectedUsers={selectedUsers}
                            onUsersChange={handleUsersChange}
                            placeholder="Поиск..."
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default LoyaltyRewards
