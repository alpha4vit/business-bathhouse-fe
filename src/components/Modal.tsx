import React from 'react'
import './Modal.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    actions?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {actions && (
                    <div className="modal-actions">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
