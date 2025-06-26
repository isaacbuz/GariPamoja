import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

export interface Car {
  id: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    trustScore: number;
  };
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  transmission: 'manual' | 'automatic';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  dailyRate: number;
  hourlyRate: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  images: string[];
  features: string[];
  description: string;
  isAvailable: boolean;
  isVerified: boolean;
  isFavorite?: boolean;
  rating: number;
  totalReviews: number;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CarFilters {
  make?: string;
  model?: string;
  year?: number;
  transmission?: 'manual' | 'automatic';
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  features?: string[];
  isAvailable?: boolean;
}

export interface CarSearchParams {
  query?: string;
  filters?: CarFilters;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CarSearchResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CarService {
  async searchCars(params: CarSearchParams): Promise<CarSearchResponse> {
    try {
      const response = await axios.get(`${API_URL}/cars/search/`, {
        params: {
          query: params.query,
          page: params.page || 1,
          limit: params.limit || 10,
          sort_by: params.sortBy,
          sort_order: params.sortOrder,
          ...params.filters,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search cars');
    }
  }

  async getCarById(carId: string): Promise<Car> {
    try {
      const response = await axios.get(`${API_URL}/cars/${carId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get car details');
    }
  }

  async getFeaturedCars(): Promise<Car[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/featured/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get featured cars');
    }
  }

  async getNearbyCars(latitude: number, longitude: number, radius: number = 10): Promise<Car[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/nearby/`, {
        params: {
          latitude,
          longitude,
          radius,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get nearby cars');
    }
  }

  async getCarMakes(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/makes/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get car makes');
    }
  }

  async getCarModels(make: string): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/models/`, {
        params: { make },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get car models');
    }
  }

  async getAvailableFeatures(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/features/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get available features');
    }
  }

  async toggleFavorite(carId: string): Promise<{ isFavorite: boolean }> {
    try {
      const response = await axios.post(`${API_URL}/cars/${carId}/favorite/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }

  async getFavorites(): Promise<Car[]> {
    try {
      const response = await axios.get(`${API_URL}/cars/favorites/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get favorites');
    }
  }

  async getCarAvailability(carId: string, startDate: string, endDate: string): Promise<{
    isAvailable: boolean;
    conflicts: Array<{
      startDate: string;
      endDate: string;
    }>;
  }> {
    try {
      const response = await axios.get(`${API_URL}/cars/${carId}/availability/`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  }

  async getCarReviews(carId: string, page: number = 1, limit: number = 10): Promise<{
    reviews: Array<{
      id: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
      rating: number;
      comment: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/cars/${carId}/reviews/`, {
        params: {
          page,
          limit,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get car reviews');
    }
  }
}

export default new CarService(); 