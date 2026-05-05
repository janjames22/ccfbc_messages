import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.jpg', 'icon-512.jpg'],
      manifest: {
        name: 'CCFBC Message Archive',
        short_name: 'CCFBC',
        description: 'Review, remember, and reflect on the Word of God shared every week.',
        theme_color: '#1e88e5',
        background_color: '#05070d',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/messages.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-messages-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
