/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Declared in vite.config.ts:config.declare
declare const __APP_VERSION__: string

// Declared in .env
interface ImportMetaEnv {
    readonly VITE_CONTACT_EMAIL: string
    readonly VITE_HOMEPAGE: string
    readonly VITE_REPO_URL: string

    readonly VITE_PENSUM_FORMAT_VERSION: string
    readonly VITE_PENSUM_STORAGE_PENSUM_KEY: string
    readonly VITE_PENSUM_STORAGE_TRACKER_KEY: string
    readonly VITE_PENSUM_STORAGE_PENSUM_LOCALSAVE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
