import { BACKEND_API_URL } from '../constants/constants';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth } from 'firebase/auth';

// Configuration for retry behavior
const retryConfig = {
  retries: 3, // Maximum number of retries
  initialDelayMs: 1000, // Initial delay in milliseconds
  maxDelayMs: 5000, // Maximum delay in milliseconds
  backoffFactor: 2, // Exponential backoff factor
  statusCodesToRetry: [408, 429, 500, 502, 503, 504], // Status codes to retry
};

// Helper function to determine if we should retry the request
const shouldRetry = (error: AxiosError): boolean => {
  // Don't retry if we don't have a response or if retries are disabled
  if (!error.response) return false;

  // Don't retry if explicitly marked not to retry
  const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
  if (config._retry === false) return false;

  // Don't retry if we've exceeded the maximum retry count
  if (config._retryCount && config._retryCount >= retryConfig.retries) return false;

  // Retry on specific status codes
  return retryConfig.statusCodesToRetry.includes(error.response.status);
};

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
  withCredentials: false,
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const token = await user.getIdToken();
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Initialize retry count
    const retryableConfig = config as AxiosRequestConfig & { _retryCount?: number };
    retryableConfig._retryCount = retryableConfig._retryCount || 0;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle retries
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };

    // If we should retry the request
    if (shouldRetry(error) && config) {
      // Increment the retry count
      config._retryCount = (config._retryCount || 0) + 1;

      // Calculate delay using exponential backoff with jitter
      const delay = Math.min(
        retryConfig.initialDelayMs * Math.pow(retryConfig.backoffFactor, config._retryCount - 1),
        retryConfig.maxDelayMs,
      );

      // Add some randomness to prevent all clients from retrying simultaneously
      const jitter = delay * 0.1 * Math.random();
      const retryDelay = delay + jitter;

      // Log retry information (consider using a proper logging system in production)
      console.log(
        `Retrying request to ${config.url} (Attempt ${config._retryCount}/${retryConfig.retries}) after ${Math.round(retryDelay)}ms`,
      );

      // Wait for the calculated delay
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Retry the request
      return axiosInstance(config);
    }

    // If we shouldn't retry or have exhausted retries, reject with the error
    return Promise.reject(error);
  },
);

export default axiosInstance;
