import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Validates whether the current environment is a browser.
 * This is crucial for Next.js to prevent localStorage from throwing errors during Server-Side Rendering (SSR).
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Create a centralized Axios instance.
 * 
 * We use `NEXT_PUBLIC_API_URL` to allow dynamic environments (development/staging/production).
 * If undefined, we fallback to the local Express backend default.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // A sensible timeout limit (e.g., 10 seconds) prevents the client from hanging indefinitely
  timeout: 10000, 
});

/**
 * ==========================================
 * Request Interceptor
 * ==========================================
 * 
 * Intercepts every outgoing request *before* it leaves the application.
 * If an authentication token exists in local storage, we automatically attach it to the `Authorization: Bearer <token>` header.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Only attempt to read localStorage if we are safely executing in the browser
    if (isBrowser) {
      const token = localStorage.getItem('tracker-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Return any config errors immediately so they can be handled by the caller
    return Promise.reject(error);
  }
);

/**
 * ==========================================
 * Response & Error Interceptor
 * ==========================================
 * 
 * Intercepts every incoming response *before* it hits your components' `try/catch` blocks or `.then()` chains.
 */
apiClient.interceptors.response.use(
  (response) => {
    // The backend uses a standardized response shape: { success: true, data: [...] }
    // We unwrap this layer here so our components receive the pure data array/object directly.
    
    // If the backend didn't use this wrapper, we could just return `response.data`.
    // We safely check if `.data` exists inside `response.data` to accommodate both.
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      return response.data.data;
    }
    
    // Fallback: Return raw parsed JSON body
    return response.data;
  },
  (error: AxiosError | Error) => {
    // 1. Is this an Axios HTTP Error (from the server)?
    if (axios.isAxiosError(error)) {
      
      // If the backend sent a response (4xx, 5xx)
      if (error.response) {
        
        // Handle 401 Unauthorized (Token expired/invalid)
        if (error.response.status === 401) {
          console.warn("Unauthorized API access detected. Clearing user session.");
          
          if (isBrowser) {
            localStorage.removeItem('tracker-token');
            useAuthStore.getState().logout();
            localStorage.removeItem('tracker-last-login-state');
            
            // Dispatch a custom event to force the app to reset back to "Mock Mode" 
            // or trigger a redirect to /login if you have a dedicated page for it.
            window.dispatchEvent(new Event('auth-expired'));
          }
        }

        // Return the specific message sent by the backend (if available), otherwise the default Axios error string
        const serverMessage = (error.response.data as any)?.message || (error.response.data as any)?.detail;
        return Promise.reject(new Error(serverMessage || error.message));
      }
      
      // If the request was made but no response was received (Network Error / Server Offline)
      if (error.request) {
        console.error("Network Error: The backend server is unreachable.");
        
        // We throw a specific recognizable error string or object that the frontend can catch
        // This ensures the offline-first application doesn't crash entirely and can trigger local fallback states.
        return Promise.reject(new Error("NETWORK_ERROR_OFFLINE"));
      }
    }

    // 2. Generic Unknown JavaScript Error
    return Promise.reject(error);
  }
);

export default apiClient;
