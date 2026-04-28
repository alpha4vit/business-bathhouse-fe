import React, { useState, useRef, useEffect } from 'react'
import { DADATA_API_KEY } from '../config/api'
import './CompanyRequisitesInput.css'
import { createPortal } from 'react-dom'

interface CompanyData {
    title: string
    type: string
    inn: string
    kpp: string
    okpo: string
    ogrn: string
    address: string
    ogrnip: string
    okved: string
}

interface CompanyRequisitesInputProps {
    onCompanyDataChange: (data: CompanyData) => void
    companyName: string
}

interface DadataSuggestion {
    value: string
    unrestricted_value: string
    data: {
        type: string
        name: {
            full_with_opf: string
            short_with_opf: string
            legal: string
        }
        inn: string
        kpp: string
        okpo: string
        ogrn: string
        ogrnip: string
        address: {
            value: string
        }
        okved: string
    }
}

function CompanyRequisitesInput({ onCompanyDataChange, companyName }: CompanyRequisitesInputProps) {
    const [value, setValue] = useState<string>(companyName)
    const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const isSuggestionClickRef = useRef(false)

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }

        try {
            const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Token ${DADATA_API_KEY}`
                },
                body: JSON.stringify({ query, count: 5 })
            })

            const data = await response.json()
            setSuggestions(data.suggestions || [])
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            setSuggestions([])
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (value) {
                fetchSuggestions(value)
            } else {
                setSuggestions([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [value])

    useEffect(() => {
        const handleScroll = () => {
            if (showSuggestions && inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect()
                setPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                })
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [showSuggestions])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        setShowSuggestions(true)
        
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
    }

    const handleInputFocus = () => {
        setShowSuggestions(true)
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            })
        }
    }

    const handleInputBlur = () => {
        if (!isSuggestionClickRef.current) {
            setTimeout(() => setShowSuggestions(false), 200)
        }
    }

    const handleSuggestionClick = (suggestion: DadataSuggestion) => {
        isSuggestionClickRef.current = true
        const shortName = suggestion.data.name.short_with_opf || suggestion.data.name.legal || suggestion.value
        const innValue = suggestion.data.inn || ''
        const displayValue = innValue ? `${shortName} (ИНН: ${innValue})` : shortName
        
        const companyData = {
            title: shortName,
            type: suggestion.data.type || '',
            inn: innValue,
            kpp: suggestion.data.kpp || '',
            okpo: suggestion.data.okpo || '',
            ogrn: suggestion.data.ogrn || '',
            address: suggestion.data.address?.value || '',
            ogrnip: suggestion.data.ogrnip || '',
            okved: suggestion.data.okved || ''
        }
        
        console.log('CompanyData after selection:', companyData)
        
        setValue(displayValue)
        onCompanyDataChange(companyData)
        setShowSuggestions(false)
        
        setTimeout(() => {
            isSuggestionClickRef.current = false
        }, 100)
    }

    return (
        <div className="invoice-input-group">
            <label>
                Наименование ЮЛ (ООО / ИП)
            </label>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Введите ИНН или название организации"
                className="invoice-input"
            />
            {showSuggestions && suggestions.length > 0 && createPortal(
                <div
                    ref={suggestionsRef}
                    style={{
                        position: 'fixed',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        width: `${position.width}px`,
                        zIndex: 10000,
                        backgroundColor: '#ffffff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '8px 0'
                    }}
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                backgroundColor: '#ffffff'
                            }}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <div style={{ fontWeight: '600', color: '#2D2D2D', marginBottom: '4px' }}>
                                {suggestion.data.name.full_with_opf || suggestion.data.name.short_with_opf || suggestion.value}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                ИНН: {suggestion.data.inn}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6c757d' }}>
                                {suggestion.data.address?.value}
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    )
}

export default CompanyRequisitesInput
