export const getPointsWord = (points: number): string => {
    const lastTwoDigits = points % 100
    const lastDigit = points % 10

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'баллов'
    }

    if (lastDigit === 1) {
        return 'балл'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'балла'
    }

    return 'баллов'
}
