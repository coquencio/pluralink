import { apiClient } from './api';
import { Booking, CreateBookingRequest, RescheduleBookingRequest } from '../types/booking.types';
import { ApiResponse } from '../types/api.types';

export const bookingService = {
  async getBookings(status?: string): Promise<Booking[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get<Booking[]>('/bookings', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch bookings');
  },

  async getBooking(id: number): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch booking');
  },

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<Booking>('/bookings', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to create booking');
  },

  async cancelBooking(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`/bookings/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel booking');
    }
  },

  async rescheduleBooking(id: number, data: RescheduleBookingRequest): Promise<Booking> {
    const response = await apiClient.put<Booking>(`/bookings/${id}/reschedule`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to reschedule booking');
  },
};

