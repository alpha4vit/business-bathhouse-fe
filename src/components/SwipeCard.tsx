import {forwardRef, ReactNode, useImperativeHandle, useState} from 'react'
import './SwipeCard.css'

export interface SwipeCardProps<T> {
    items: T[]
    currentIndex: number
    onIndexChange: (index: number) => void
    renderCard: (item: T, index: number) => ReactNode
    className?: string
    cardClassName?: string
}

export interface SwipeCardRef {
    handlePrevious: () => void
    handleNext: () => void
}

const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps<any>>(function SwipeCard<T>({
                                                                                          items,
                                                                                          currentIndex,
                                                                                          onIndexChange,
                                                                                          renderCard,
                                                                                          className = '',
                                                                                          cardClassName = ''
                                                                                      }: SwipeCardProps<T>, ref: any) {
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
    const [isHorizontalSwipeStarted, setIsHorizontalSwipeStarted] = useState(false)
    const [isSwiping, setIsSwiping] = useState(false)
    const [animationDir, setAnimationDir] = useState<'left' | 'right' | null>(null)
    const [touchStart, setTouchStart] = useState(0)
    const [touchStartY, setTouchStartY] = useState(0)

    useImperativeHandle(ref, () => ({
        handlePrevious,
        handleNext
    }))

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
        setTouchStartY(e.touches[0].clientY)
        setIsDragging(true)
        setSwipeOffset(0)
        setIsHorizontalSwipeStarted(false)
        setIsSwiping(false)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const currentX = e.touches[0].clientX
        const currentY = e.touches[0].clientY
        const diffX = currentX - touchStart
        const diffY = Math.abs(currentY - (touchStartY || 0))

        if (diffY > Math.abs(diffX) && diffY > 30 && !isHorizontalSwipeStarted) {
            setIsDragging(false)
            return
        }

        if (Math.abs(diffX) > 20) {
            setIsHorizontalSwipeStarted(true)
            setIsSwiping(true)
            e.preventDefault()
        }

        const threshold = 50

        if (diffX < -threshold && currentIndex < items.length - 1 && !swipeDirection) {
            setSwipeDirection('left')
        } else if (diffX > threshold && currentIndex > 0 && !swipeDirection) {
            setSwipeDirection('right')
        }

        setSwipeOffset(diffX)
    }

    const handleTouchEnd = () => {
        if (!isDragging) return
        setIsDragging(false)
        setIsHorizontalSwipeStarted(false)
        setIsSwiping(false)

        if (swipeDirection === 'left' && currentIndex < items.length - 1) {
            setIsAnimating(true)
            setAnimationDir('left')
            setTimeout(() => {
                onIndexChange(currentIndex + 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setSwipeDirection(null)
                setAnimationDir(null)
            }, 300)
        } else if (swipeDirection === 'right' && currentIndex > 0) {
            setIsAnimating(true)
            setAnimationDir('right')
            setTimeout(() => {
                onIndexChange(currentIndex - 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setSwipeDirection(null)
                setAnimationDir(null)
            }, 300)
        } else {
            setSwipeOffset(0)
            setSwipeDirection(null)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0 && !isAnimating) {
            setIsAnimating(true)
            setAnimationDir('right')
            setTimeout(() => {
                onIndexChange(currentIndex - 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setAnimationDir(null)
            }, 300)
        }
    }

    const handleNext = () => {
        if (currentIndex < items.length - 1 && !isAnimating) {
            setIsAnimating(true)
            setAnimationDir('left')
            setTimeout(() => {
                onIndexChange(currentIndex + 1)
                setIsAnimating(false)
                setSwipeOffset(0)
                setAnimationDir(null)
            }, 300)
        }
    }

    return (
        <div className={`swipe-card-wrapper ${className}`}>
            <div className="swipe-card-navigation-wrapper">
                <button
                    className="swipe-card-nav-button swipe-card-nav-prev"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || isAnimating}
                    aria-label="Previous"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div
                    className={`swipe-card-container ${isSwiping ? 'swiping' : ''}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {items.map((item, index) => {
                        const isCurrent = index === currentIndex
                        const isIncoming = isAnimating && (
                            (animationDir === 'left' && index === currentIndex + 1) ||
                            (animationDir === 'right' && index === currentIndex - 1)
                        )

                        let animClass = ''
                        if (isAnimating && isCurrent) {
                            animClass = animationDir === 'left' ? 'swiping-left' : 'swiping-right'
                        } else if (isIncoming) {
                            animClass = animationDir === 'left' ? 'sliding-in-from-right' : 'sliding-in-from-left'
                        }

                        return (
                            <div
                                key={index}
                                className={`swipe-card ${cardClassName} ${isCurrent ? 'active' : ''} ${animClass} ${isDragging && isCurrent ? 'dragging' : ''}`}
                                style={{
                                    display: isCurrent || isIncoming ? 'flex' : 'none',
                                    transform: isCurrent && !isAnimating ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)` : undefined
                                }}
                            >
                                {renderCard(item, index)}
                            </div>
                        )
                    })}
                </div>

                <button
                    className="swipe-card-nav-button swipe-card-nav-next"
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1 || isAnimating}
                    aria-label="Next"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    )
})

SwipeCard.displayName = 'SwipeCard'

export default SwipeCard
