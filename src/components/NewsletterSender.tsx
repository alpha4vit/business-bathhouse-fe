import {useEffect, useState} from 'react'
import {UserSearchDto, userService} from '../services/userService'
import './NewsletterSender.css'
import {API_BASE_URL} from "../config/api.ts";
import {authenticatedFetch} from "../utils/apiClient.ts";
import Loading from "./Loading.tsx";

export default function NewsletterSender() {
    const [users, setUsers] = useState<UserSearchDto[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [sendToResidents, setSendToResidents] = useState(false)
    const [sendToNonResidents, setSendToNonResidents] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<UserSearchDto[]>([])

    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState<UserSearchDto[]>([])
    const [autocompleteOpen, setAutocompleteOpen] = useState(false)
    const [autocompletePosition, setAutocompletePosition] = useState<{
        top: number;
        left: number;
        width: number
    } | null>(null)

    const [messageText, setMessageText] = useState('')
    const [attachedFiles, setAttachedFiles] = useState<File[]>([])
    const [fileError, setFileError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [notificationMode, setNotificationMode] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL')
    const [parseMode, setParseMode] = useState<'NONE' | 'HTML'>('NONE')
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await userService.getAllUsers()
            setUsers(data)
        } catch (err) {
            setError('Не удалось загрузить пользователей')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearchChange = (value: string, event?: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(value)
        if (event) {
            const rect = event.target.getBoundingClientRect()
            setAutocompletePosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
        if (value.length > 0) {
            const filtered = users.filter(user =>
                user.fullName && user.fullName.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredUsers(filtered)
            setAutocompleteOpen(true)
        } else {
            setFilteredUsers([])
            setAutocompleteOpen(false)
        }
    }

    const handleUserSelect = (user: UserSearchDto) => {
        if (!selectedUsers.find(u => u.chatId === user.chatId)) {
            setSelectedUsers([...selectedUsers, user])
        }
        setSearchQuery('')
        setFilteredUsers([])
        setAutocompleteOpen(false)
        setAutocompletePosition(null)
    }

    const handleRemoveUser = (chatId: number) => {
        setSelectedUsers(selectedUsers.filter(u => u.chatId !== chatId))
    }

    const getRoleDisplay = (role: string) => {
        if (role === 'RESIDENT') return 'Резидент'
        if (role === 'ADMIN' || role === 'ADMIN_RESIDENT') return 'Админ'
        return 'Не резидент'
    }

    const getRoleClass = (role: string) => {
        if (role === 'RESIDENT') return 'resident'
        if (role === 'ADMIN' || role === 'ADMIN_RESIDENT') return 'admin'
        return 'non-resident'
    }

    const getRecipientCount = () => {
        let count = selectedUsers.length
        if (sendToResidents) {
            count += users.filter(u => u.role === 'RESIDENT').length
        }
        if (sendToNonResidents) {
            count += users.filter(u => u.role !== 'RESIDENT').length
        }
        return count
    }

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({type, message})
        setTimeout(() => setNotification(null), 3000)
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        setFileError(null)
        const newFiles: File[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            let maxSize: number
            if (file.type.startsWith('video/')) {
                maxSize = 50 * 1024 * 1024 // 50MB для видео
            } else if (file.type.startsWith('image/')) {
                maxSize = 10 * 1024 * 1024 // 10MB для фото
            } else {
                maxSize = 25 * 1024 * 1024 // 25MB для документов
            }

            if (file.size > maxSize) {
                setFileError(`Файл "${file.name}" превышает максимальный размер (${maxSize / 1024 / 1024}MB)`)
                return
            }

            const isImage = file.type.startsWith('image/')
            const isVideo = file.type.startsWith('video/')
            const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            const isPdf = file.type === 'application/pdf'

            if (!isImage && !isVideo && !isDocx && !isExcel && !isPdf) {
                setFileError(`Файл "${file.name}" не поддерживается. Допустимые форматы: изображения, видео, DOCX, Excel, PDF`)
                return
            }

            newFiles.push(file)
        }

        setAttachedFiles([...attachedFiles, ...newFiles])
        event.target.value = ''
    }

    const handleRemoveFile = (index: number) => {
        setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (!files || files.length === 0) return

        setFileError(null)
        const newFiles: File[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            let maxSize: number
            if (file.type.startsWith('video/')) {
                maxSize = 50 * 1024 * 1024 // 50MB для видео
            } else if (file.type.startsWith('image/')) {
                maxSize = 10 * 1024 * 1024 // 10MB для фото
            } else {
                maxSize = 25 * 1024 * 1024 // 25MB для документов
            }

            if (file.size > maxSize) {
                setFileError(`Файл "${file.name}" превышает максимальный размер (${maxSize / 1024 / 1024}MB)`)
                return
            }

            const isImage = file.type.startsWith('image/')
            const isVideo = file.type.startsWith('video/')
            const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            const isPdf = file.type === 'application/pdf'

            if (!isImage && !isVideo && !isDocx && !isExcel && !isPdf) {
                setFileError(`Файл "${file.name}" не поддерживается. Допустимые форматы: изображения, видео, DOCX, Excel, PDF`)
                return
            }

            newFiles.push(file)
        }

        setAttachedFiles([...attachedFiles, ...newFiles])
    }

    const handleSendNewsletter = async () => {
        // Собираем список получателей
        const recipients: string[] = []

        // Добавляем выбранных пользователей
        selectedUsers.forEach(user => {
            recipients.push(user.chatId.toString())
        })

        // Добавляем резидентов если выбран чекбокс
        if (sendToResidents) {
            users.filter(u => u.role === 'RESIDENT').forEach(user => {
                if (!recipients.includes(user.chatId.toString())) {
                    recipients.push(user.chatId.toString())
                }
            })
        }

        // Добавляем не резидентов если выбран чекбокс
        if (sendToNonResidents) {
            users.filter(u => u.role !== 'RESIDENT').forEach(user => {
                if (!recipients.includes(user.chatId.toString())) {
                    recipients.push(user.chatId.toString())
                }
            })
        }

        if (recipients.length === 0) {
            setError('Выберите хотя бы одного получателя')
            return
        }

        if (!messageText && attachedFiles.length === 0) {
            setError('Введите текст рассылки или прикрепите файлы')
            return
        }

        // Создаем FormData
        const formData = new FormData()

        const dto = {
            consumers: recipients.map(id => parseInt(id)),
            text: messageText.trim() || null,
            mode: notificationMode,
            parseMode: parseMode
        }

        console.log(dto)

        const jsonBlob = new Blob([JSON.stringify(dto)], {type: 'application/json'})

        // Добавляем наш JSON-блок на верхний уровень FormData
        formData.append('dto', jsonBlob)

        // Добавляем файлы только если они есть
        if (attachedFiles.length > 0) {
            attachedFiles.forEach(file => {
                console.log(`Adding file: ${file.name}, type: ${file.type}, size: ${file.size}`)
                formData.append('files', file, file.name)
            })
        }

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/api/notifications`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error(`Failed to send newsletter: ${response.status}`)
            }

            // Очищаем форму после успешной отправки
            setMessageText('')
            setAttachedFiles([])
            setSelectedUsers([])
            setSendToResidents(false)
            setSendToNonResidents(false)
            setError(null)

            showNotification('success', 'Рассылка успешно отправлена!')
        } catch (err) {
            console.error('Error sending newsletter:', err)
            setError('Не удалось отправить рассылку')
        }
    }

    if (loading) {
        return (
            <div className="newsletter-sender">
                <div className="newsletter-loading">
                    <Loading message={"Загрузка..."}/>
                </div>
            </div>
        )
    }

    return (
        <div className="newsletter-sender">
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="newsletter-content">
                <div className="newsletter-header">
                    <h1>Рассылка пользователям</h1>
                </div>

                <div className="newsletter-card">
                    {error && (
                        <div className="newsletter-error">
                            {error}
                        </div>
                    )}

                    <div className="newsletter-section">
                        <h2>Выберите получателей</h2>

                        <div className="newsletter-checkboxes">
                            <label className="newsletter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={sendToResidents}
                                    onChange={(e) => setSendToResidents(e.target.checked)}
                                />
                                <span>Отправить резидентам</span>
                            </label>

                            <label className="newsletter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={sendToNonResidents}
                                    onChange={(e) => setSendToNonResidents(e.target.checked)}
                                />
                                <span>Отправить не резидентам</span>
                            </label>
                        </div>
                    </div>

                    <div className="newsletter-section">
                        <h2>Добавить пользователей</h2>
                        <div className="newsletter-search-container">
                            <div className="newsletter-search-wrapper">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value, e)}
                                    className="newsletter-search-input"
                                    placeholder="Поиск по фамилии..."
                                />
                                {autocompleteOpen && filteredUsers.length > 0 && autocompletePosition && (
                                    <div
                                        className="newsletter-autocomplete"
                                        style={{
                                            top: `${autocompletePosition.top}px`,
                                            left: `${autocompletePosition.left}px`,
                                            width: `${autocompletePosition.width}px`
                                        }}
                                    >
                                        {filteredUsers.map(user => (
                                            <div
                                                key={user.chatId}
                                                className="newsletter-autocomplete-item"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="autocomplete-item-name">{user.fullName}</div>
                                                <div
                                                    className="autocomplete-item-role">{getRoleDisplay(user.role)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedUsers.length > 0 && (
                                <div className="newsletter-selected-users">
                                    {selectedUsers.map(user => (
                                        <div key={user.chatId} className="newsletter-selected-user">
                                            <span className="selected-user-name">{user.fullName}</span>
                                            <div className="selected-user-right">
                                                <span className={`selected-user-role ${getRoleClass(user.role)}`}>
                                                    {getRoleDisplay(user.role)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveUser(user.chatId)}
                                                    className="newsletter-remove-button"
                                                    title="Удалить"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor"
                                                              strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="newsletter-section">
                        <h2>Текст рассылки</h2>
                        <div
                            className={`newsletter-message-container ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <textarea
                                className="newsletter-message-textarea"
                                placeholder="Введите текст рассылки..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                rows={6}
                            />
                            <div className="newsletter-attachments">
                                <label className="newsletter-attach-button">
                                    <input
                                        type="file"
                                        accept="image/*,video/*,.docx,.xlsx,.pdf"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="newsletter-file-input"
                                    />
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5V15M5 10H15" stroke="currentColor" strokeWidth="2"
                                              strokeLinecap="round"/>
                                    </svg>
                                    <span>Прикрепить файлы</span>
                                </label>
                            </div>
                            {isDragging && (
                                <div className="newsletter-drag-overlay">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <path d="M24 12V36M12 24H36" stroke="currentColor" strokeWidth="3"
                                              strokeLinecap="round"/>
                                    </svg>
                                    <span>Перетащите файлы сюда</span>
                                </div>
                            )}
                        </div>
                        {fileError && (
                            <div className="newsletter-file-error">
                                {fileError}
                            </div>
                        )}
                        {attachedFiles.length > 0 && (
                            <div className="newsletter-attached-files">
                                {attachedFiles.map((file, index) => (
                                    <div key={index} className="newsletter-attached-file">
                                        <div className="file-info">
                                            <span className="file-icon">
                                                {file.type.startsWith('video/') ? (
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M4 4L16 10L4 16V4Z" stroke="currentColor"
                                                              strokeWidth="2" strokeLinecap="round"
                                                              strokeLinejoin="round"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <rect x="3" y="3" width="14" height="14" rx="2"
                                                              stroke="currentColor" strokeWidth="2"/>
                                                        <circle cx="10" cy="8" r="2" stroke="currentColor"
                                                                strokeWidth="2"/>
                                                        <path d="M6 14C6 14 8 12 10 12C12 12 14 14 14 14"
                                                              stroke="currentColor" strokeWidth="2"
                                                              strokeLinecap="round"/>
                                                    </svg>
                                                )}
                                            </span>
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="file-remove-button"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2"
                                                      strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="newsletter-footer">
                        <div className="newsletter-footer-left">
                            <div className="newsletter-recipient-count">
                                Всего получателей: {getRecipientCount()}
                            </div>
                            <div className="newsletter-notification-mode-toggle">
                                <button
                                    className={`toggle-option ${notificationMode === 'PERSONAL' ? 'active' : ''}`}
                                    onClick={() => setNotificationMode('PERSONAL')}
                                >
                                    От бота
                                </button>
                                <button
                                    className={`toggle-option ${notificationMode === 'BUSINESS' ? 'active' : ''}`}
                                    onClick={() => setNotificationMode('BUSINESS')}
                                >
                                    От Максима
                                </button>
                            </div>
                            <div className="newsletter-notification-mode-toggle">
                                <button
                                    className={`toggle-option ${parseMode === 'NONE' ? 'active' : ''}`}
                                    onClick={() => setParseMode('NONE')}
                                >
                                    Обычный
                                </button>
                                <button
                                    className={`toggle-option ${parseMode === 'HTML' ? 'active' : ''}`}
                                    onClick={() => setParseMode('HTML')}
                                >
                                    HTML
                                </button>
                            </div>
                        </div>
                        <button className="newsletter-button" onClick={handleSendNewsletter}>
                            Отправить рассылку
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
