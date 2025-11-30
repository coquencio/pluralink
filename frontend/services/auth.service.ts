import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { User } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'provider' | 'client';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.success && response.data) {
      await AsyncStorage.setItem('auth_token', (response.data as any).token);
      await AsyncStorage.setItem('user', JSON.stringify((response.data as any).user));
      return response.data as AuthResponse;
    }
    throw new Error(response.error || 'Registration failed');
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.success && response.data) {
      await AsyncStorage.setItem('auth_token', (response.data as any).token);
      await AsyncStorage.setItem('user', JSON.stringify((response.data as any).user));
      return response.data as AuthResponse;
    }
    throw new Error(response.error || 'Login failed');
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  },
};

