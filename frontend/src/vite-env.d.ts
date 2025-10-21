/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_ENABLE_EMAIL_AUTH?: string
  readonly VITE_ENABLE_GOOGLE_AUTH?: string
  readonly VITE_ENABLE_TWITTER_AUTH?: string
  readonly VITE_ENABLE_SIWE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
