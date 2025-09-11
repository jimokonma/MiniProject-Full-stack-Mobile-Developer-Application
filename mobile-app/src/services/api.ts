import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import * as SecureStore from 'expo-secure-store';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://doovo-full-stack-mobile-developer.onrender.com';

const rawBaseQuery = fetchBaseQuery({ baseUrl });

// Typed custom baseQuery that injects auth headers and refreshes on 401
const authorizedBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const accessToken = await SecureStore.getItemAsync('accessToken');

  const preparedArgs: FetchArgs = typeof args === 'string' ? { url: args } : { ...(args as FetchArgs) };
  preparedArgs.headers = {
    ...(preparedArgs.headers as Record<string, string> | undefined),
    ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
  } as Record<string, string>;

  let result = await rawBaseQuery(preparedArgs, api, extraOptions);

  if (result.error && (result.error as FetchBaseQueryError).status === 401) {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', headers: { authorization: `Bearer ${refreshToken}` } },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const { accessToken: newAccess, refreshToken: newRefresh } = refreshResult.data as any;
        await SecureStore.setItemAsync('accessToken', newAccess);
        await SecureStore.setItemAsync('refreshToken', newRefresh);

        const retryArgs: FetchArgs = typeof args === 'string'
          ? { url: args as string, headers: { authorization: `Bearer ${newAccess}` } }
          : {
              ...(args as FetchArgs),
              headers: {
                ...((args as FetchArgs).headers as Record<string, string> | undefined),
                authorization: `Bearer ${newAccess}`,
              },
            };
        result = await rawBaseQuery(retryArgs, api, extraOptions);
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    } else {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: authorizedBaseQuery,
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string; refreshToken: string }, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    createBooking: builder.mutation<any, { body: any; idempotencyKey: string }>({
      query: ({ body, idempotencyKey }) => ({ url: '/bookings', method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
      invalidatesTags: ['Booking'],
    }),
    myBookings: builder.query<any[], void>({
      query: () => ({ url: '/bookings?me=true' }),
      providesTags: ['Booking'],
    }),
    bookingById: builder.query<any, string>({
      query: (id) => ({ url: `/bookings/${id}` }),
      providesTags: ['Booking'],
    }),
  }),
});

export const { useLoginMutation, useCreateBookingMutation, useMyBookingsQuery, useBookingByIdQuery } = api;


