export interface AppConfig {
  appEnv: string
  appName: string
  apiBaseUrl: string
  googleClientId: string
  razorpayKeyId: string
  appLaunchedDate: string
  enableDevtools: boolean
  isDevelopment: boolean
  isProduction: boolean
}

function loadConfig(): AppConfig {
  const required = ['VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID']
  required.forEach((key) => {
    if (!import.meta.env[key]) {
      console.warn(`Missing env var: ${key}`)
    }
  })

  return {
    appEnv: import.meta.env.VITE_APP_ENV ?? 'develop',
    appName: import.meta.env.VITE_APP_NAME ?? 'Saralam',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID ?? '',
    appLaunchedDate: import.meta.env.VITE_APP_LAUNCHED_DATE ?? '2025-01-01',
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'develop',
    isProduction: import.meta.env.VITE_APP_ENV === 'prod',
  }
}

export const appConfig = loadConfig()
