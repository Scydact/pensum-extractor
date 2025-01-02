import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setThemePreferenceOnLoad } from './lib/DarkMode/index.ts'
import { registerSW } from 'virtual:pwa-register'

setThemePreferenceOnLoad() // Load dark mode preference

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

registerSW({
    onNeedRefresh() {
        window.dispatchEvent(new CustomEvent('wb-need-refresh'))
    },
})
