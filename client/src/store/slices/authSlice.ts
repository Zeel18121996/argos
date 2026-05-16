import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, User } from '@/interfaces/user.interface'
import { storage } from '@/utils/storage'

const AUTH_KEY = 'argos_auth'

const persisted = storage.get<{ user: User; token: string }>(AUTH_KEY)

const initialState: AuthState = {
  user: persisted?.user ?? null,
  token: persisted?.token ?? null,
  isAuthenticated: !!persisted?.token,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      storage.set(AUTH_KEY, { user: action.payload.user, token: action.payload.token })
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      storage.remove(AUTH_KEY)
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      if (state.token) {
        storage.set(AUTH_KEY, { user: action.payload, token: state.token })
      }
    },
  },
})

export const { loginSuccess, logout, updateUser } = authSlice.actions
export default authSlice.reducer
