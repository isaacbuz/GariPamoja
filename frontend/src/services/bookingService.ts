import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

export interface Booking {
  id: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    images: string[];
    dailyRate: number;
    hourlyRate: number;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  cancellationReason?: string;
}

export interface CreateBookingRequest {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
}

export interface UpdateBookingRequest {
  startDate?: string;
  endDate?: string;
  pickupLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notes?: string;
}

export interface BookingFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  carId?: string;
}

class BookingService {
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await axios.post(`${API_URL}/bookings/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  }

  async getBookings(filters?: BookingFilters, page: number = 1, limit: number = 10): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/bookings/`, {
        params: {
          page,
          limit,
          ...filters,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get bookings');
    }
  }

  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get booking details');
    }
  }

  async updateBooking(bookingId: string, data: UpdateBookingRequest): Promise<Booking> {
    try {
      const response = await axios.patch(`${API_URL}/bookings/${bookingId}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update booking');
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/cancel/`, {
        reason,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/confirm/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm booking');
    }
  }

  async rejectBooking(bookingId: string, reason: string): Promise<Booking> {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/reject/`, {
        reason,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject booking');
    }
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/complete/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete booking');
    }
  }

  async checkCarAvailability(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<{
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

  async getBookingHistory(userId?: string): Promise<Booking[]> {
    try {
      const response = await axios.get(`${API_URL}/bookings/history/`, {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get booking history');
    }
  }

  async getActiveBookings(): Promise<Booking[]> {
    try {
      const response = await axios.get(`${API_URL}/bookings/active/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get active bookings');
    }
  }

  async getPendingBookings(): Promise<Booking[]> {
    try {
      const response = await axios.get(`${API_URL}/bookings/pending/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get pending bookings');
    }
  }

  async calculateBookingPrice(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalAmount: number;
    dailyRate: number;
    hourlyRate: number;
    duration: {
      days: number;
      hours: number;
    };
    breakdown: {
      dailyCost: number;
      hourlyCost: number;
      fees: number;
    };
  }> {
    try {
      const response = await axios.get(`${API_URL}/bookings/calculate-price/`, {
        params: {
          car_id: carId,
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to calculate price');
    }
  }
}

export default new BookingService(); 