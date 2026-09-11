import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@modules/auth/auth.store'

const BASE_URL = `${import.meta.env['VITE_API_URL'] ?? 'http://localhost:4000'}/v1`

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request — attach Bearer token ───────────────────────────────────────────
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token = useAuthStore.getState().tokens?.accessToken

  if (!token) {
    try {
      const stored = localStorage.getItem('khetly-auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        token = parsed?.state?.tokens?.accessToken
      }
    } catch {
      // ignore
    }
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ─── Response — unwrap { success, data } + auto-refresh 401 ──────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  // Unwrap { success: true, data: <payload> } → return <payload> directly
  (response) => {
    const body = response.data
    if (
      body !== null &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in body
    ) {
      return (body as { success: boolean; data: unknown }).data
    }
    return body
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only attempt refresh on 401 and only once
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(normaliseError(error))
    }

    // Get store state
    const authStore = useAuthStore.getState()

    // No refresh token — can't refresh, don't logout (might just be a bad request)
    if (!authStore?.tokens?.refreshToken) {
      return Promise.reject(normaliseError(error))
    }

    // Another refresh is in progress — queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        return axiosClient(originalRequest)
      }).catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Call refresh endpoint directly (not through apiClient to avoid loops)
      const refreshResponse = await axios.post(
        `${BASE_URL}/auth/token/refresh`,
        { refreshToken: authStore.tokens.refreshToken },
        { timeout: 10_000 }
      )

      // Handle both wrapped and unwrapped responses
      const refreshData = refreshResponse.data
      const newTokens =
        refreshData?.data?.accessToken ? refreshData.data :
        refreshData?.accessToken ? refreshData :
        null

      if (!newTokens?.accessToken) {
        throw new Error('Invalid refresh response')
      }

      // Save new tokens
      authStore.setTokens(newTokens)

      // Retry all queued requests
      processQueue(null, newTokens.accessToken)

      // Retry the original request
      originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`
      return axiosClient(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError, null)
      // Only logout if refresh actually failed with auth error
      const status = (refreshError as AxiosError)?.response?.status
      if (status === 401 || status === 403) {
        authStore?.logout()
      }
      return Promise.reject(normaliseError(refreshError as AxiosError))
    } finally {
      isRefreshing = false
    }
  }
)

function normaliseError(error: AxiosError | Error): Error & { code?: string; status?: number } {
  if (!(error instanceof axios.AxiosError)) {
    return error as Error & { code?: string; status?: number }
  }
  const data = error.response?.data as Record<string, unknown> | undefined
  const message =
    typeof data?.['error'] === 'string'
      ? data['error']
      : error.message ?? 'Network error'
  const out = new Error(message) as Error & { code?: string; status?: number }
  out.code = typeof data?.['code'] === 'string' ? data['code'] : 'UNKNOWN'
  out.status = error.response?.status
  return out
}

interface UnwrappedApiClient {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export const apiClient = axiosClient as unknown as UnwrappedApiClient
