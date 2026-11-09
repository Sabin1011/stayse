
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { store } from "../../app/store/store";
import {
  setAccessToken,
  clearCredentials,
} from "../../app/store/authSlice";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Separate client: prevents refresh requests from triggering
// the response interceptor again.
const refreshClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

let refreshPromise: Promise<string> | null = null;

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableRequestConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !originalRequest.headers.Authorization
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post<RefreshTokenResponse>("/auth/refresh")
          .then(({ data }) => {
            store.dispatch(setAccessToken(data.accessToken));
            return data.accessToken;
          })
          .catch((refreshError) => {
            store.dispatch(clearCredentials());
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      store.dispatch(clearCredentials());
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
