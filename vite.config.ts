import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Все React зависимости в одном чанке для правильного порядка загрузки
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/scheduler/') ||
                        id.includes('node_modules/object-assign/')) {
                        return 'react-vendor';
                    }
                    
                    // Telegram SDK отдельно
                    if (id.includes('node_modules/@twa-dev/sdk')) {
                        return 'telegram-sdk';
                    }
                    
                    // Все остальные зависимости
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
