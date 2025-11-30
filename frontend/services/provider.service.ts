import { apiClient } from './api';
import { ServiceProvider, Service, Availability, CreateAvailabilityRequest } from '../types/provider.types';
import { SearchParams } from '../types/api.types';
import { ApiResponse } from '../types/api.types';

export const providerService = {
  async getProviders(params?: SearchParams): Promise<ServiceProvider[]> {
    const response = await apiClient.get<ServiceProvider[]>('/providers', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch providers');
  },

  async getProvider(id: number): Promise<ServiceProvider> {
    const response = await apiClient.get<ServiceProvider>(`/providers/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch provider');
  },

  async getProviderAvailability(id: number): Promise<Availability[]> {
    const response = await apiClient.get<Availability[]>(`/providers/${id}/availability`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch availability');
  },

  async createProvider(data: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const response = await apiClient.post<ServiceProvider>('/providers', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create provider');
  },

  async updateProvider(data: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const response = await apiClient.put<ServiceProvider>('/providers', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update provider');
  },

  async createAvailability(data: CreateAvailabilityRequest): Promise<Availability> {
    const response = await apiClient.post<Availability>('/availabilities', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create availability');
  },

  async getMyAvailabilities(): Promise<Availability[]> {
    const response = await apiClient.get<Availability[]>('/availabilities');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch availabilities');
  },

  async updateAvailability(id: number, data: CreateAvailabilityRequest): Promise<Availability> {
    const response = await apiClient.put<Availability>(`/availabilities/${id}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to update availability');
  },

  async deleteAvailability(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`/availabilities/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete availability');
    }
  },
};

