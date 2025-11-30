export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' 
  : 'https://your-production-api.com/api';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
} as const;

export const USER_ROLES = {
  PROVIDER: 'provider',
  CLIENT: 'client',
} as const;

