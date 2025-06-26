import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import bookingService, {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingFilters,
} from '@services/bookingService';

export interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  bookingHistory: Booking[];
  activeBookings: Booking[];
  pendingBookings: Booking[];
  priceCalculation: {
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
  } | null;
  availability: {
    isAvailable: boolean;
    conflicts: Array<{
      startDate: string;
      endDate: string;
    }>;
  } | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  bookingHistory: [],
  activeBookings: [],
  pendingBookings: [],
  priceCalculation: null,
  availability: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  currentPage: 1,
  hasMore: true,
};

// Async thunks
export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (data: CreateBookingRequest, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBookings = createAsyncThunk(
  'booking/getBookings',
  async (params: { filters?: BookingFilters; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookings(
        params.filters,
        params.page || 1,
        params.limit || 10
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadMoreBookings = createAsyncThunk(
  'booking/loadMoreBookings',
  async (params: { filters?: BookingFilters; page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookings(
        params.filters,
        params.page,
        params.limit || 10
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getBookingById',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ bookingId, data }: { bookingId: string; data: UpdateBookingRequest }, { rejectWithValue }) => {
    try {
      const response = await bookingService.updateBooking(bookingId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async ({ bookingId, reason }: { bookingId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirmBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.confirmBooking(bookingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/rejectBooking',
  async ({ bookingId, reason }: { bookingId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await bookingService.rejectBooking(bookingId, reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeBooking = createAsyncThunk(
  'booking/completeBooking',
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.completeBooking(bookingId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkCarAvailability = createAsyncThunk(
  'booking/checkCarAvailability',
  async ({ carId, startDate, endDate }: { carId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await bookingService.checkCarAvailability(carId, startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateBookingPrice = createAsyncThunk(
  'booking/calculateBookingPrice',
  async ({ carId, startDate, endDate }: { carId: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await bookingService.calculateBookingPrice(carId, startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBookingHistory = createAsyncThunk(
  'booking/getBookingHistory',
  async (userId?: string, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingHistory(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getActiveBookings = createAsyncThunk(
  'booking/getActiveBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getActiveBookings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPendingBookings = createAsyncThunk(
  'booking/getPendingBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getPendingBookings();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearPriceCalculation: (state) => {
      state.priceCalculation = null;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Get bookings
    builder
      .addCase(getBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load more bookings
    builder
      .addCase(loadMoreBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = [...state.bookings, ...action.payload.bookings];
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(loadMoreBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get booking by ID
    builder
      .addCase(getBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update booking
    builder
      .addCase(updateBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentBooking = action.payload;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });

    // Confirm booking
    builder
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });

    // Reject booking
    builder
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });

    // Complete booking
    builder
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      });

    // Check car availability
    builder
      .addCase(checkCarAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      });

    // Calculate booking price
    builder
      .addCase(calculateBookingPrice.fulfilled, (state, action) => {
        state.priceCalculation = action.payload;
      });

    // Get booking history
    builder
      .addCase(getBookingHistory.fulfilled, (state, action) => {
        state.bookingHistory = action.payload;
      });

    // Get active bookings
    builder
      .addCase(getActiveBookings.fulfilled, (state, action) => {
        state.activeBookings = action.payload;
      });

    // Get pending bookings
    builder
      .addCase(getPendingBookings.fulfilled, (state, action) => {
        state.pendingBookings = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentBooking,
  clearPriceCalculation,
  clearAvailability,
  resetBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer; 