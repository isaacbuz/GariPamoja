import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isVerified: boolean;
    profilePhoto?: string;
    trustScore?: number;
  };
  token: string;
  refreshToken: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, credentials);
      const data = response.data;
      
      // Store tokens securely
      await this.storeTokens(data.token, data.refreshToken);
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, userData);
      const data = response.data;
      
      // Store tokens securely
      await this.storeTokens(data.token, data.refreshToken);
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        await axios.post(`${API_URL}/auth/logout/`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API call success
      await this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/auth/refresh/`, {
        refreshToken,
      });

      const { token } = response.data;
      await SecureStore.setItemAsync(this.tokenKey, token);
      
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/forgot-password/`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password/`, {
        token,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  async verifyOTP(otp: string, type: 'email' | 'phone' = 'phone'): Promise<void> {
    try {
      const token = await this.getToken();
      await axios.post(
        `${API_URL}/auth/verify-otp/`,
        { otp, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  }

  async resendOTP(type: 'email' | 'phone' = 'phone'): Promise<void> {
    try {
      const token = await this.getToken();
      await axios.post(
        `${API_URL}/auth/resend-otp/`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  }

  // Token management methods
  async storeTokens(token: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(this.tokenKey, token);
    await SecureStore.setItemAsync(this.refreshTokenKey, refreshToken);
  }

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.tokenKey);
  }

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.refreshTokenKey);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(this.tokenKey);
    await SecureStore.deleteItemAsync(this.refreshTokenKey);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Setup axios interceptors for token management
  setupInterceptors(onTokenRefresh: (token: string) => void, onAuthError: () => void): void {
    // Request interceptor to add token
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              onTokenRefresh(newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            onAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService(); 