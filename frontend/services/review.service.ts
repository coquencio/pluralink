import { apiClient } from './api';
import { Review, CreateReviewRequest } from '../types/review.types';
import { ApiResponse } from '../types/api.types';

export const reviewService = {
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create review');
  },

  async getProviderReviews(providerId: number): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/reviews/provider/${providerId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch reviews');
  },

  async getClientReviews(clientId: number): Promise<Review[]> {
    const response = await apiClient.get<Review[]>(`/reviews/client/${clientId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch reviews');
  },
};

