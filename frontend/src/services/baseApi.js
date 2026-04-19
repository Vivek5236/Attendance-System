import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

const BASE_URL = import.meta.env.VITE_API_URL +'/api'

// Base query with JWT token injection
export const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})
