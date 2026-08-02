import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Логируем ошибку для дальнейшего анализа
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.error('[ErrorBoundary] Error details:', errorData)

    // Можно отправить ошибку на сервер для мониторинга
    // this.logErrorToServer(errorData)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '15px' }}>Произошла ошибка</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Приложение encountered unexpected error. Мы работаем над исправлением этой проблемы.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f8f8',
                borderRadius: '5px',
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
                  Показать детали ошибки (для разработчиков)
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Обновить страницу
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
