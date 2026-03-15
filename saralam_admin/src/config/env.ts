export interface AppConfig {
  appEnv: string
  apiBaseUrl: string
  appLaunchedDate: string
  isDevelopment: boolean
  isProduction: boolean
}

function loadConfig(): AppConfig {
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn('Missing env var: VITE_API_BASE_URL')
  }
  return {
    appEnv: import.meta.env.VITE_APP_ENV ?? 'develop',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
    appLaunchedDate: import.meta.env.VITE_APP_LAUNCHED_DATE ?? '2025-01-01',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'develop',
    isProduction: import.meta.env.VITE_APP_ENV === 'prod',
  }
}

export const appConfig = loadConfig()
