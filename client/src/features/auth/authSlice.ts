import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UserRole = 'customer' | 'staff' | 'admin'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

// status starts as 'loading' because AuthBootstrapper always attempts a
// /auth/refresh on app boot. ProtectedRoute / StaffRoute check this so they
// show a spinner on the first render instead of evaluating against an empty
// auth state and redirecting to /auth/login.
const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'loading',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: AuthUser; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.status = 'succeeded'
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.status = 'idle'
      state.error = null
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.status = 'failed'
      state.error = action.payload
    },
    setAuthLoading: (state) => {
      state.status = 'loading'
      state.error = null
    },
  },
})

export const { setAuth, clearAuth, setAuthError, setAuthLoading } = authSlice.actions
export default authSlice.reducer
