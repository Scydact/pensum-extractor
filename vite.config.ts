import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    Object.assign(process.env, loadEnv(mode, process.cwd()))
    return {
        base: process.env.VITE_BASE_URL ?? '',
        plugins: [
            react(),
            // Workaround has been applied to install this!
            // https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/110#issuecomment-2521205274
            nodePolyfills(),
            VitePWA({
                registerType: 'autoUpdate',
                workbox: {
                    cleanupOutdatedCaches: true,
                    sourcemap: true,
                },
                manifest: {
                    name: 'Pensum DO',
                    short_name: 'Pensum',
                    start_url: '.',
                    display: 'standalone',
                    background_color: '#21557F',
                    description: 'Seguidor de pensum para carreras de RD (coming soon).',
                    theme_color: '#0070cc',
                    icons: [
                        {
                            src: './favicon/favicon-256x256.png',
                            sizes: '256x256',
                            type: 'image/png',
                        },
                    ],
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    }
})
