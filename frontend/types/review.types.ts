import { Booking } from './booking.types';

export type ReviewerType = 'client' | 'provider';
export type RevieweeType = 'provider' | 'client';

export interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  reviewer_type: ReviewerType;
  reviewee_id: number;
  reviewee_type: RevieweeType;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
  booking?: Booking;
}

export interface CreateReviewRequest {
  booking_id: number;
  reviewee_id: number;
  reviewee_type: RevieweeType;
  rating: number;
  comment?: string;
}

