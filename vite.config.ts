import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Business Bathhouse',
                short_name: 'Bathhouse',
                description: 'Business Bathhouse management application',
                theme_color: '#2563eb',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: '/icon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/telegram\.org\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'telegram-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30
                            }
                        }
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 1
                            }
                        }
                    }
                ]
            }
        })
    ],
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
