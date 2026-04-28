import {useSearchParams} from 'react-router-dom'
import {useEffect, useState} from 'react'

export function useUserId() {
    const [searchParams] = useSearchParams()
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const urlUserId = searchParams.get('id')
        
        if (urlUserId) {
            localStorage.setItem('userId', urlUserId)
            setUserId(urlUserId)
        } else {
            const savedUserId = localStorage.getItem('userId')
            if (savedUserId) {
                setUserId(savedUserId)
            }
        }
    }, [searchParams])

    return userId
}
