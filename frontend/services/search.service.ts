import { apiClient } from './api';
import { Category, SearchParams } from '../types/api.types';
import { ServiceProvider } from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export const searchService = {
  async searchProviders(params?: SearchParams): Promise<ServiceProvider[]> {
    const response = await apiClient.get<ServiceProvider[]>('/search/providers', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to search providers');
  },

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/search/categories');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch categories');
  },
};

