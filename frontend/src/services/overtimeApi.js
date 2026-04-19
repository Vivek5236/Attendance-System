import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = import.meta.env.VITE_API_URL +'/api'

export const overtimeApi = createApi({
  reducerPath: 'overtimeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Overtime'],
  endpoints: (builder) => ({
    getMyOvertime: builder.query({
      query: () => '/overtime/my',
      providesTags: ['Overtime'],
    }),
    getPendingOvertime: builder.query({
      query: () => '/overtime/pending',
      providesTags: ['Overtime'],
    }),
    getAllOvertime: builder.query({
      query: () => '/overtime/all',
      providesTags: ['Overtime'],
    }),
    requestOvertime: builder.mutation({
      query: (data) => ({
        url: '/overtime/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),
    reviewOvertime: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/overtime/${id}/review`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Overtime'],
    }),
  }),
})

export const {
  useGetMyOvertimeQuery,
  useGetPendingOvertimeQuery,
  useGetAllOvertimeQuery,
  useRequestOvertimeMutation,
  useReviewOvertimeMutation,
} = overtimeApi
