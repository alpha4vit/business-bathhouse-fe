import React, {useEffect, useState} from 'react'
import {UserSearchDto, userService} from '../services/userService'
import './UserSearch.css'

interface ReferrerSearchProps {
    selectedUser: UserSearchDto | null
    onUserChange: (user: UserSearchDto | null) => void
    placeholder?: string
    disabled?: boolean
}

function ReferrerSearch({
    selectedUser,
    onUserChange,
    placeholder = 'Поиск по фамилии...',
    disabled = false
}: ReferrerSearchProps) {
    const [users, setUsers] = useState<UserSearchDto[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState<UserSearchDto[]>([])
    const [autocompleteOpen, setAutocompleteOpen] = useState(false)
    const [autocompletePosition, setAutocompletePosition] = useState<{
        top: number;
        left: number;
        width: number
    } | null>(null)

    useEffect(() => {
        if (selectedUser) {
            setSearchQuery(selectedUser.fullName)
        }
    }, [selectedUser])

    useEffect(() => {
        loadUsers()
    }, [])

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
        if (value.length > 0) {
            const filtered = users.filter(user =>
                user.fullName && user.fullName.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredUsers(filtered)
            setAutocompleteOpen(true)
        } else {
            setFilteredUsers([])
            setAutocompleteOpen(false)
            // Clear selected user if input is cleared
            onUserChange(null)
        }
    }

    const handleUserSelect = (user: UserSearchDto) => {
        onUserChange(user)
        setSearchQuery(user.fullName)
        setFilteredUsers([])
        setAutocompleteOpen(false)
        setAutocompletePosition(null)
    }

    const handleClear = () => {
        onUserChange(null)
        setSearchQuery('')
        setFilteredUsers([])
        setAutocompleteOpen(false)
        setAutocompletePosition(null)
    }

    return (
        <div className="user-search-container">
            <div className="user-search-wrapper">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value, e)}
                    className="user-search-input"
                    placeholder={placeholder}
                    disabled={disabled || loading}
                />
                {selectedUser && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="user-search-clear-button"
                        disabled={disabled}
                        title="Очистить"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
                {autocompleteOpen && filteredUsers.length > 0 && autocompletePosition && (
                    <div
                        className="user-search-autocomplete"
                        style={{
                            top: `${autocompletePosition.top}px`,
                            left: `${autocompletePosition.left}px`,
                            width: `${autocompletePosition.width}px`
                        }}
                    >
                        {filteredUsers.map(user => (
                            <div
                                key={user.chatId}
                                className="user-search-autocomplete-item"
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className="autocomplete-item-name">{user.fullName}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReferrerSearch
