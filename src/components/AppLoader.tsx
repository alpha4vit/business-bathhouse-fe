import React, { useEffect, useState } from 'react'
import './LoadingScreen.css'

const AppLoader: React.FC = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Небольшая задержка для плавного появления
        const timer = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`loading-screen ${mounted ? 'mounted' : ''}`}>
            <div className="loading-content">
                <img 
                    src="/src/img/бб2.avif"
                    alt="Business Banya Logo" 
                    className="loading-logo"
                />
                <div className="loading-progress-container">
                    <div className="loading-progress-bar"></div>
                </div>
                <p className="loading-text">Загрузка приложения...</p>
            </div>
        </div>
    )
}

export default AppLoader
