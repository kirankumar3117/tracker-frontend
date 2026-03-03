import apiClient from "../axios";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

/**
 * Registers a new user account.
 * 
 * @param payload - The user details required for registration (name, email, password, confirmPassword)
 * @returns The structured user object and JWT token
 */
export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  // Axios response interceptor unwraps `{ success: true, data: {...} }` and returns `.data` directly
  const response = await apiClient.post<unknown, AuthResponse>("/auth/register", payload);
  return response;
};

/**
 * Authenticates an existing user.
 * 
 * @param payload - The user credentials required for login (email, password)
 * @returns The structured user object and JWT token
 */
export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  // Axios response interceptor unwraps `{ success: true, data: {...} }` and returns `.data` directly
  const response = await apiClient.post<unknown, AuthResponse>("/auth/login", payload);
  return response;
};
