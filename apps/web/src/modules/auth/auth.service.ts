import { apiClient } from '@lib/api-client'
import type { AuthUser, AuthTokens } from '@khetly/types'

export interface GoogleSignInResponse {
  user: AuthUser
  tokens: AuthTokens
  isNewUser: boolean
  needsProfileCompletion: boolean
}

export interface CompleteProfileResponse {
  user: AuthUser
  tokens: AuthTokens
}

export const authService = {
  googleSignIn: (idToken: string): Promise<GoogleSignInResponse> =>
    apiClient.post('/auth/google', { idToken }) as Promise<GoogleSignInResponse>,

  completeProfile: (data: { role: 'RENTER' | 'FARMER'; name: string; preferredLanguage?: string }): Promise<CompleteProfileResponse> =>
    apiClient.post('/auth/complete-profile', data) as Promise<CompleteProfileResponse>,

  refreshTokens: (refreshToken: string): Promise<AuthTokens> =>
    apiClient.post('/auth/token/refresh', { refreshToken }) as Promise<AuthTokens>,

  logout: (): Promise<void> =>
    apiClient.post('/auth/logout') as Promise<void>,

  me: (): Promise<AuthUser> =>
    apiClient.get('/auth/me') as Promise<AuthUser>,
}
