import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import WebApp from '@twa-dev/sdk'
// import eruda from 'eruda'

// eruda.init()

// Настройка Telegram Web App
WebApp.expand()
WebApp.disableClosingConfirmation();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
