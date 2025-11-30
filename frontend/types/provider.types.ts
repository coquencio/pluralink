import { Category } from './api.types';
import { Availability } from './api.types';

export interface Service {
  id: number;
  provider_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider?: ServiceProvider;
  category?: Category;
  bookings?: Booking[];
}

export interface Availability {
  id: number;
  provider_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // Format: "HH:MM"
  end_time: string; // Format: "HH:MM"
  is_available: boolean;
  created_at: string;
  updated_at: string;
  provider?: ServiceProvider;
}

export interface CreateAvailabilityRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

import { ServiceProvider } from './user.types';
import { Booking } from './booking.types';

