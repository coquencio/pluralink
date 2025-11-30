export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchParams {
  category_id?: number;
  latitude?: number;
  longitude?: number;
  search?: string;
  min_rating?: number;
}

