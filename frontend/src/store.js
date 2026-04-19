import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from './features/auth/authSlice'
import { authApi } from './services/authApi'
import { attendanceApi } from './services/attendanceApi'
import { overtimeApi } from './services/overtimeApi'
import { userApi } from './services/userApi'
import { reportApi } from './services/reportApi'

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
