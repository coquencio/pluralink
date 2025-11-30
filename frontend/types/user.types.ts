export type UserRole = 'provider' | 'client';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  oauth_id?: string;
  oauth_provider?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_provider?: ServiceProvider;
  client?: Client;
}

export interface ServiceProvider {
  id: number;
  user_id: number;
  business_name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  services?: Service[];
  availabilities?: Availability[];
  bookings?: Booking[];
  reviews?: Review[];
  categories?: Category[];
}

export interface Client {
  id: number;
  user_id: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  bookings?: Booking[];
  reviews?: Review[];
}

