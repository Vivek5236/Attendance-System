import { createSlice } from '@reduxjs/toolkit'

// Load user/token from localStorage on app start
const token = localStorage.getItem('token')
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

const initialState = {
  token: token || null,
  user: user || null,
  isAuthenticated: !!token,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      state.isAuthenticated = true
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token

export default authSlice.reducer
