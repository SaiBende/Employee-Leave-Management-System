const BASE_URL = '/api'

export interface ApiErrorPayload {
  success?: boolean
  message?: string
  data?: unknown
}

export class ApiError extends Error {
  status: number
  payload: ApiErrorPayload | null

  constructor(message: string, status: number, payload: ApiErrorPayload | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  let data: ApiErrorPayload | null = null
  try {
    data = await res.json()
  } catch {
    // empty or non-JSON body (e.g. 401/403 from Spring Security)
  }

  if (!res.ok) {
    const isCredentialCheck =
      endpoint === '/auth/login' ||
      endpoint === '/auth/setup' ||
      endpoint === '/auth/signup-company' ||
      endpoint === '/auth/change-password'
    const sessionExpired =
      token && (res.status === 401 || (res.status === 403 && !data))
    if (sessionExpired && !isCredentialCheck) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw new ApiError(
      data?.message || `Request failed (${res.status} ${res.statusText})`,
      res.status,
      data,
    )
  }

  return data as T
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}
