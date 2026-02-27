import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getStoredToken, clearSession } from "@/hooks/authStorage";

//export const BASE_URL = "https://knox.premiumasp.net/api";
export const BASE_URL = "https://localhost:6001/api";
//local host 5001 (http://localhost:5001/api)

/**
 * Configured axios instance for API requests
 * - Automatically attaches auth tokens
 * - Handles 401 unauthorized responses
 * - Supports credentials for refresh tokens
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: Attach access token from localStorage to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't clear session on login/refresh failures
    const isAuthEndpoint = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.error("[API] Unauthorized - clearing session");
      clearSession();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
