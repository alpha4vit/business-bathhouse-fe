import React, {useEffect, useState, useRef} from 'react'
import {UserDto, userService} from '../services/userService'
import './UserSearch.css'

export interface UserBalanceInfo {
    amount: number | null
    loading: boolean
}

interface UserSearchProps {
    selectedUsers: UserDto[]
    onUsersChange: (users: UserDto[]) => void
    placeholder?: string
    disabled?: boolean
    userBalances?: Record<number, UserBalanceInfo>
    showExpirationDate?: boolean
    showExpirationInSelected?: boolean
}

function UserSearch({
                        selectedUsers,
                        onUsersChange,
                        placeholder = 'Поиск...',
                        disabled = false,
                        userBalances,
                        showExpirationDate = false,
                        showExpirationInSelected = false
                    }: UserSearchProps) {
    const [users, setUsers] = useState<UserDto[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([])
    const [autocompleteOpen, setAutocompleteOpen] = useState(false)
    const [autocompletePosition, setAutocompletePosition] = useState<{
        top: number;
        left: number;
        width: number
    } | null>(null)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    // Detect keyboard visibility on mobile
    useEffect(() => {
        const handleResize = () => {
            const viewport = window.visualViewport
            if (viewport) {
                const keyboardVisible = viewport.height < window.innerHeight * 0.85
                setIsKeyboardVisible(keyboardVisible)
            }
        }

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize)
            handleResize()
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize)
            }
        }
    }, [])

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAutocompleteOpen(false)
                setAutocompletePosition(null)
            }
        }

        if (autocompleteOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [autocompleteOpen])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await userService.getAllUsers()
            setUsers(data)
        } catch (err) {
            console.error('Failed to load users:', err)
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
        const filtered = users.filter(user =>
            user.fullName && user.fullName.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredUsers(filtered)
        setAutocompleteOpen(true)
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        const rect = event.target.getBoundingClientRect()
        setAutocompletePosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
        })
        const filtered = users.filter(user =>
            user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredUsers(filtered)
        setAutocompleteOpen(true)
    }

    const handleBlur = () => {
        // On mobile, don't close on blur when keyboard is hiding
        // Let the click outside handler close it instead
        if (!isKeyboardVisible) {
            setTimeout(() => {
                setAutocompleteOpen(false)
                setAutocompletePosition(null)
            }, 300)
        }
    }

    const handleUserToggle = (user: UserDto, event?: React.MouseEvent) => {
        // Prevent default to avoid losing focus
        if (event) {
            event.preventDefault()
        }
        const isSelected = selectedUsers.find(u => u.chatId === user.chatId)
        if (isSelected) {
            onUsersChange(selectedUsers.filter(u => u.chatId !== user.chatId))
        } else {
            onUsersChange([...selectedUsers, user])
        }
        // Don't close dropdown or clear search - keep focus
    }

    const handleRemoveUser = (chatId: number) => {
        onUsersChange(selectedUsers.filter(u => u.chatId !== chatId))
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

    const formatExpirationDate = (dateString: string | null) => {
        if (!dateString) return 'Не указано'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch {
            return 'Не указано'
        }
    }

    return (
        <div className="user-search-container" ref={containerRef}>
            <div className="user-search-wrapper">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value, e)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="user-search-input"
                    placeholder={placeholder}
                    disabled={disabled || loading}
                />
                {autocompleteOpen && filteredUsers.length > 0 && autocompletePosition && (
                    <div
                        className="user-search-autocomplete"
                        style={{
                            top: `${autocompletePosition.top}px`,
                            left: `${autocompletePosition.left}px`,
                            width: `${autocompletePosition.width}px`
                        }}
                    >
                        {filteredUsers.map(user => {
                            const isSelected = selectedUsers.find(u => u.chatId === user.chatId)
                            return (
                                <div
                                    key={user.chatId}
                                    className={`user-search-autocomplete-item ${isSelected ? 'selected' : ''}`}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleUserToggle(user, e)
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        onChange={() => handleUserToggle(user)}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        className="user-search-checkbox"
                                    />
                                    <div className="autocomplete-item-name">{user.fullName || 'Без имени'}</div>
                                    <div className="autocomplete-item-role">{getRoleDisplay(user.role || 'UNKNOWN')}</div>
                                    {showExpirationDate && (
                                        <div className="autocomplete-item-expiration">
                                            {formatExpirationDate(user.residentUntil)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedUsers.length > 0 && (
                <div className="user-search-selected-users">
                    {selectedUsers.map(user => (
                        <div key={user.chatId} className="user-search-selected-user">
                            <span className="selected-user-name">{user.fullName}</span>
                            <div className="selected-user-right">
                                {userBalances && (
                                    <span className="selected-user-balance">
                                        {userBalances[user.chatId]?.loading
                                            ? <span className="selected-user-balance-loading">...</span>
                                            : userBalances[user.chatId]?.amount != null
                                                ? `${(userBalances[user.chatId]!.amount!).toLocaleString('ru-RU', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })} ₽`
                                                : ''}
                                    </span>
                                )}
                                {showExpirationInSelected && (
                                    <span className="selected-user-expiration">
                                        {formatExpirationDate(user.residentUntil)}
                                    </span>
                                )}
                                {(!userBalances || userBalances[user.chatId]?.loading || userBalances[user.chatId]?.amount == null) && !showExpirationInSelected && (
                                    <span className={`selected-user-role ${getRoleClass(user.role)}`}>
                                        {getRoleDisplay(user.role)}
                                    </span>
                                )}
                                <button
                                    onClick={() => handleRemoveUser(user.chatId)}
                                    className="user-search-remove-button"
                                    title="Удалить"
                                    disabled={disabled}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2"
                                              strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserSearch
