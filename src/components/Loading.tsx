import './Loading.css'

interface LoadingProps {
    message?: string
}

function Loading({ message = 'Загрузка...' }: LoadingProps) {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{message}</p>
        </div>
    )
}

export default Loading
