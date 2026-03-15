export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone?: string
  role: 'seeker' | 'provider'
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number
  user?: AuthResponseUser
}

export interface AuthResponseUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
  subscription_status?: string
}
