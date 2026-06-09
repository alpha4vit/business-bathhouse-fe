import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import eruda from 'eruda'
import WebApp from '@twa-dev/sdk'


// eruda.init()


// Инициализация Telegram Web App SDK
WebApp.ready()

// Логирование данных пользователя для отладки
console.log('=== Telegram Web App Data ===')
console.log('InitData:', WebApp.initData)
console.log('InitDataUnsafe:', WebApp.initDataUnsafe)
console.log('User:', WebApp.initDataUnsafe.user)
console.log('ThemeParams:', WebApp.themeParams)
console.log('ColorScheme:', WebApp.colorScheme)
console.log('==============================')

// Настройка Telegram Web App
WebApp.expand()
WebApp.enableClosingConfirmation()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
