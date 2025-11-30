import { ServiceProvider, Client } from './user.types';
import { Service } from './provider.types';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Booking {
  id: number;
  client_id: number;
  provider_id: number;
  service_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  provider?: ServiceProvider;
  service?: Service;
  review?: Review;
}

export interface CreateBookingRequest {
  provider_id: number;
  service_id: number;
  date: string;
  start_time: string;
  notes?: string;
}

export interface RescheduleBookingRequest {
  date: string;
  start_time: string;
}

import { Review } from './review.types';

