import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import './Navbar.css'
import logo from '../img/бб2.png'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCabinetSubmenuOpen, setIsCabinetSubmenuOpen] = useState(false)

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isMenuOpen])

    return (
        <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <button 
                    className="navbar-hamburger"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Открыть меню"
                >
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                </button>

                <div className="navbar-brand">
                    <Link to="/" className="navbar-brand-link">
                        <img src={logo} alt="Бизнес Баня" className="navbar-logo" />
                    </Link>
                </div>
                
                <div className="navbar-menu">
                    <Link to="/cabinet" className="navbar-item">
                        <span className="navbar-text">Личный кабинет</span>
                    </Link>
                    <Link to="/invoice" className="navbar-item">
                        <span className="navbar-text">Пополнение лицевого счета</span>
                    </Link>
                    <Link to="/offers" className="navbar-item">
                        <span className="navbar-text">Спецпредложения</span>
                    </Link>
                    <Link to="/residents/search" className="navbar-item">
                        <span className="navbar-text">Поиск резидентов</span>
                    </Link>
                </div>
            </div>

            <div className={`navbar-drawer ${isMenuOpen ? 'open' : ''}`}>
                <div className="navbar-drawer-overlay" onClick={() => setIsMenuOpen(false)}></div>
                <div className="navbar-drawer-content">
                    <div className="navbar-drawer-header">
                        <h3>Меню</h3>
                        <button 
                            className="navbar-drawer-close"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Закрыть меню"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="navbar-drawer-links">
                        <div className="navbar-drawer-submenu">
                            <button 
                                className="navbar-drawer-link navbar-drawer-toggle"
                                onClick={() => setIsCabinetSubmenuOpen(!isCabinetSubmenuOpen)}
                            >
                                <span>Личный кабинет</span>
                                <span className={`navbar-drawer-arrow ${isCabinetSubmenuOpen ? 'open' : ''}`}>▼</span>
                            </button>
                            <div className={`navbar-drawer-submenu-links ${isCabinetSubmenuOpen ? 'open' : ''}`}>
                                <Link to="/cabinet" className="navbar-drawer-link navbar-drawer-sublink" onClick={() => { setIsMenuOpen(false); setIsCabinetSubmenuOpen(false); }}>
                                    <span>Мой профиль</span>
                                </Link>
                                <Link to="/invoice" className="navbar-drawer-link navbar-drawer-sublink" onClick={() => { setIsMenuOpen(false); setIsCabinetSubmenuOpen(false); }}>
                                    <span>Пополнение лицевого счета</span>
                                </Link>
                            </div>
                        </div>
                        <Link to="/offers" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                            <span>Спецпредложения</span>
                        </Link>
                        <Link to="/residents/search" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                            <span>Поиск резидентов</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
