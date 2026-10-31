import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import './Navbar.css'
import logo from '../img/бб2.avif'
import {useUser} from '../contexts/UserContext'

function Navbar({hideMenuButton = false}: { hideMenuButton?: boolean }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCabinetSubmenuOpen, setIsCabinetSubmenuOpen] = useState(false)
    const [isAdminSubmenuOpen, setIsAdminSubmenuOpen] = useState(false)
    const {role} = useUser()
    const isAdmin = role === 'ADMIN'
    const isNonResident = role === 'NON_RESIDENT'

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
                {!hideMenuButton ? (
                    <button
                        className="navbar-hamburger"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Открыть меню"
                    >
                        <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                        <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                        <span className={`navbar-hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                    </button>
                ) : (
                    <div className="navbar-hamburger-placeholder"></div>
                )}

                <div className="navbar-brand">
                    <Link to="/" className="navbar-brand-link">
                        <img src={logo} alt="Бизнес Баня" className="navbar-logo"/>
                    </Link>
                </div>

                <div className="navbar-menu">
                    {isNonResident ? (
                        <>
                            <Link to="/cabinet" className="navbar-item">
                                <span className="navbar-text">Мой профиль</span>
                            </Link>
                            <Link to="/support" className="navbar-item">
                                <span className="navbar-text">Техподдержка</span>
                            </Link>
                            <Link to="/events" className="navbar-item">
                                <span className="navbar-text">Календарь мероприятий</span>
                            </Link>
                            <Link to="/chats" className="navbar-item">
                                <span className="navbar-text">Чаты сообщества</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/cabinet" className="navbar-item">
                                <span className="navbar-text">Личный кабинет</span>
                            </Link>
                            <Link to="/invoice" className="navbar-item">
                                <span className="navbar-text">Пополнение лицевого счета</span>
                            </Link>
                            <Link to="/transactions" className="navbar-item">
                                <span className="navbar-text">Журнал операций</span>
                            </Link>
                            <Link to="/offers" className="navbar-item">
                                <span className="navbar-text">Спецпредложения</span>
                            </Link>
                            <Link to="/events" className="navbar-item">
                                <span className="navbar-text">Календарь мероприятий</span>
                            </Link>
                            <Link to="/residents/search" className="navbar-item">
                                <span className="navbar-text">Поиск резидентов</span>
                            </Link>
                            <Link to="/chats" className="navbar-item">
                                <span className="navbar-text">Чаты сообщества</span>
                            </Link>
                            <Link to="/support" className="navbar-item">
                                <span className="navbar-text">Техподдержка</span>
                            </Link>
                            {isAdmin && (
                                <div className="navbar-item navbar-dropdown">
                                    <span className="navbar-text">Админ-панель</span>
                                    <div className="navbar-dropdown-menu">
                                        <Link to="/admin/balance/adjustment" className="navbar-dropdown-item">
                                            <span>Корректировка баланса</span>
                                        </Link>
                                        <Link to="/admin/points/adjustments" className="navbar-dropdown-item">
                                            <span>Начисление баллов</span>
                                        </Link>
                                        <Link to="/admin/newsletter" className="navbar-dropdown-item">
                                            <span>Рассылка</span>
                                        </Link>
                                        <Link to="/admin/reports" className="navbar-dropdown-item">
                                            <span>Отчеты</span>
                                        </Link>
                                        <Link to="/admin/special-offers" className="navbar-dropdown-item">
                                            <span>Спецпредложения</span>
                                        </Link>
                                        <Link to="/admin/events" className="navbar-dropdown-item">
                                            <span>Управление мероприятиями</span>
                                        </Link>
                                        <Link to="/admin/users/deactivate" className="navbar-dropdown-item">
                                            <span>Деактивация пользователей</span>
                                        </Link>
                                        <Link to="/admin/membership/adjustment" className="navbar-dropdown-item">
                                            <span>Корректировка членства</span>
                                        </Link>
                                        <Link to="/admin/loyalty" className="navbar-dropdown-item">
                                            <span>Управление скидками</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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
                        {isNonResident ? (
                            <>
                                <Link to="/cabinet" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Мой профиль</span>
                                </Link>
                                <Link to="/events" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Календарь мероприятий</span>
                                </Link>
                                <Link to="/chats" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Чаты сообщества</span>
                                </Link>
                                <Link to="/support" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Техподдержка</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="navbar-drawer-submenu">
                                    <button
                                        className="navbar-drawer-link navbar-drawer-toggle"
                                        onClick={() => setIsCabinetSubmenuOpen(!isCabinetSubmenuOpen)}
                                    >
                                        <span>Личный кабинет</span>
                                        <span
                                            className={`navbar-drawer-arrow ${isCabinetSubmenuOpen ? 'open' : ''}`}>▼</span>
                                    </button>
                                    <div
                                        className={`navbar-drawer-submenu-links ${isCabinetSubmenuOpen ? 'open' : ''}`}>
                                        <Link to="/cabinet" className="navbar-drawer-link navbar-drawer-sublink"
                                              onClick={() => {
                                                  setIsMenuOpen(false);
                                                  setIsCabinetSubmenuOpen(false);
                                              }}>
                                            <span>Мой профиль</span>
                                        </Link>
                                        <Link to="/invoice" className="navbar-drawer-link navbar-drawer-sublink"
                                              onClick={() => {
                                                  setIsMenuOpen(false);
                                                  setIsCabinetSubmenuOpen(false);
                                              }}>
                                            <span>Пополнение лицевого счета</span>
                                        </Link>
                                        <Link to="/transactions" className="navbar-drawer-link navbar-drawer-sublink"
                                              onClick={() => {
                                                  setIsMenuOpen(false);
                                                  setIsCabinetSubmenuOpen(false);
                                              }}>
                                            <span>Журнал операций</span>
                                        </Link>
                                    </div>
                                </div>
                                <Link to="/offers" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Спецпредложения</span>
                                </Link>
                                <Link to="/events" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Календарь мероприятий</span>
                                </Link>
                                <Link to="/residents/search" className="navbar-drawer-link"
                                      onClick={() => setIsMenuOpen(false)}>
                                    <span>Поиск резидентов</span>
                                </Link>
                                <Link to="/chats" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Чаты сообщества</span>
                                </Link>
                                <Link to="/support" className="navbar-drawer-link" onClick={() => setIsMenuOpen(false)}>
                                    <span>Техподдержка</span>
                                </Link>
                                {isAdmin && (
                                    <div className="navbar-drawer-submenu">
                                        <button
                                            className="navbar-drawer-link navbar-drawer-toggle"
                                            onClick={() => setIsAdminSubmenuOpen(!isAdminSubmenuOpen)}
                                        >
                                            <span>Админ-панель</span>
                                            <span
                                                className={`navbar-drawer-arrow ${isAdminSubmenuOpen ? 'open' : ''}`}>▼</span>
                                        </button>
                                        <div
                                            className={`navbar-drawer-submenu-links ${isAdminSubmenuOpen ? 'open' : ''}`}>
                                            <Link to="/admin/balance/adjustment"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Корректировка баланса</span>
                                            </Link>
                                            <Link to="/admin/points/adjustments"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Корректировка баллов</span>
                                            </Link>
                                            <Link to="/admin/newsletter"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Рассылка</span>
                                            </Link>
                                            <Link to="/admin/users/deactivate"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Деактивация пользователей</span>
                                            </Link>
                                            <Link to="/admin/reports"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Отчеты</span>
                                            </Link>
                                            <Link to="/admin/special-offers"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Спецпредложения</span>
                                            </Link>
                                            <Link to="/admin/events"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Управление мероприятиями</span>
                                            </Link>
                                            <Link to="/admin/loyalty"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Управление скидками</span>
                                            </Link>
                                            <Link to="/admin/membership/adjustment"
                                                  className="navbar-drawer-link navbar-drawer-sublink" onClick={() => {
                                                setIsMenuOpen(false);
                                                setIsAdminSubmenuOpen(false);
                                            }}>
                                                <span>Корректировка членства</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
