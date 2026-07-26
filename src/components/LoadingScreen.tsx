import React from 'react'
import './LoadingScreen.css'
import logo from '../img/бб2.avif'

const LoadingScreen: React.FC = () => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <img 
                    src={logo}
                    alt="Business Banya Logo" 
                    className="loading-logo"
                />
                <div className="loading-progress-container">
                    <div className="loading-progress-bar"></div>
                </div>
                <p className="loading-text">Загрузка...</p>
            </div>
        </div>
    )
}

export default LoadingScreen
