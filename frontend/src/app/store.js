import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '../features/auth/authSlice.js'
import { authApi } from '../services/authApi.js'
import { attendanceApi } from '../services/attendanceApi.js'
import { overtimeApi } from '../services/overtimeApi.js'
import { userApi } from '../services/userApi.js'
import { reportApi } from '../services/reportApi.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [overtimeApi.reducerPath]: overtimeApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      attendanceApi.middleware,
      overtimeApi.middleware,
      userApi.middleware,
      reportApi.middleware,
    ),
})

setupListeners(store.dispatch)
