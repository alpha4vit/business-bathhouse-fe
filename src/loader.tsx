import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './components/LoadingScreen.css'
import logo from './img/бб2.avif'

const LoaderRoot = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={`loading-screen ${mounted ? 'mounted' : ''}`}>
            <div className="loading-content">
                <img 
                    src={logo}
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

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <LoaderRoot />
    </React.StrictMode>,
)

// Динамически импортируем основной App после показа загрузочного экрана
setTimeout(() => {
    import('./main.tsx')
}, 800)
