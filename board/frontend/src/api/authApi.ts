import api from './client'

export interface LoginPayload {
  username: string
  password: string
}

export interface SignupPayload {
  username: string
  password: string
  email?: string
}

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export const signup = async (payload: SignupPayload) => {
  const { data } = await api.post('/api/auth/signup', payload)
  return data
}

export const refresh = async (refreshToken: string) => {
  const { data } = await api.post('/api/auth/refresh', { refreshToken })
  return data
}

export const me = async () => {
  const { data } = await api.get('/api/auth/me')
  return data
}

