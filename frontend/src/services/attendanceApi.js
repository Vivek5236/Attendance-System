import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Attendance'],
  endpoints: (builder) => ({
    // Get today's attendance status
    getTodayAttendance: builder.query({
      query: () => '/attendance/today',
      providesTags: ['Attendance'],
    }),
    // Get logged-in employee's attendance
    getMyAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/my',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    // Admin/Manager: get all or team attendance
    getAllAttendance: builder.query({
      query: (params) => ({
        url: '/attendance/all',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    // Punch In
    punchIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/punch-in',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    // Punch Out
    punchOut: builder.mutation({
      query: () => ({
        url: '/attendance/punch-out',
        method: 'PUT',
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
})

export const {
  useGetTodayAttendanceQuery,
  useGetMyAttendanceQuery,
  useGetAllAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} = attendanceApi
