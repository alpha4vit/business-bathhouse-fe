import {useState, useRef} from 'react'
import './SupportPage.css'
import {supportService, SupportRequestDto} from '../services/supportService'

interface FileWithPreview extends File {
    preview?: string
}

function SupportPage() {
    const [message, setMessage] = useState('')
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        
        const droppedFiles = Array.from(e.dataTransfer.files)
        handleFiles(droppedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (selectedFiles) {
            handleFiles(Array.from(selectedFiles))
        }
    }

    const handleFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(file => {
            // Проверяем размер файла (максимум 10MB)
            const maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                setError(`Файл ${file.name} превышает 10MB`)
                return false
            }
            return true
        })

        const filesWithPreview: FileWithPreview[] = validFiles.map(file => {
            // Создаем preview для изображений
            if (file.type.startsWith('image/')) {
                return Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
            }
            return file
        })

        setFiles(prev => [...prev, ...filesWithPreview])
        setError(null)
    }

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev]
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!)
            }
            newFiles.splice(index, 1)
            return newFiles
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!message.trim()) {
            setError('Пожалуйста, введите текст сообщения')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const request: SupportRequestDto = {
                text: message,
            }

            await supportService.sendSupportRequest(request, files)
            
            setSubmitSuccess(true)
            setMessage('')
            setFiles([])
            
            // Сбрасываем success через 3 секунды
            setTimeout(() => {
                setSubmitSuccess(false)
            }, 3000)
        } catch (err) {
            console.error('Error sending support request:', err)
            setError(err instanceof Error ? err.message : 'Не удалось отправить обращение')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Очистка preview при размонтировании
    useState(() => {
        return () => {
            files.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview)
                }
            })
        }
    })

    return (
        <div className="support-container">
            <div className="support-content">
                <div className="support-header">
                    <h1>Техподдержка</h1>
                    <p className="support-subtitle">Напишите нам, и мы поможем решить вашу проблему</p>
                </div>

                {submitSuccess && (
                    <div className="support-success">
                        <span className="support-success-icon">✓</span>
                        <span>Ваше обращение успешно отправлено!</span>
                    </div>
                )}

                {error && (
                    <div className="support-error">
                        {error}
                    </div>
                )}

                <form className="support-form" onSubmit={handleSubmit}>
                    <div className="support-form-group">
                        <label htmlFor="message" className="support-label">
                            Сообщение *
                        </label>
                        <textarea
                            id="message"
                            className="support-textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Опишите вашу проблему или вопрос подробно..."
                            rows={6}
                            required
                        />
                    </div>

                    <div className="support-form-group">
                        <label className="support-label">
                            Прикрепить файлы
                        </label>
                        
                        <div
                            className={`support-dropzone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="support-dropzone-content">
                                <span className="support-dropzone-icon">📎</span>
                                <p className="support-dropzone-text">
                                    Перетащите файлы сюда или нажмите для выбора
                                </p>
                                <p className="support-dropzone-hint">
                                    Поддерживаются изображения, видео и документы (макс. 10MB)
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="support-file-input"
                                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                            />
                        </div>

                        {files.length > 0 && (
                            <div className="support-files-list">
                                {files.map((file, index) => (
                                    <div key={index} className="support-file-item">
                                        {file.preview ? (
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="support-file-preview"
                                            />
                                        ) : (
                                            <div className="support-file-icon">
                                                {file.type.startsWith('video/') ? '🎬' : '📄'}
                                            </div>
                                        )}
                                        <div className="support-file-info">
                                            <span className="support-file-name">{file.name}</span>
                                            <span className="support-file-size">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="support-file-remove"
                                            onClick={() => removeFile(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="support-submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить обращение'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SupportPage
