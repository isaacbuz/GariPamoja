import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import carService, { Car, CarSearchParams, CarFilters, CarSearchResponse } from '@services/carService';

export interface CarState {
  cars: Car[];
  featuredCars: Car[];
  favorites: Car[];
  currentCar: Car | null;
  searchResults: CarSearchResponse | null;
  filters: CarFilters;
  makes: string[];
  models: string[];
  features: string[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

const initialState: CarState = {
  cars: [],
  featuredCars: [],
  favorites: [],
  currentCar: null,
  searchResults: null,
  filters: {},
  makes: [],
  models: [],
  features: [],
  isLoading: false,
  isSearching: false,
  error: null,
  currentPage: 1,
  hasMore: true,
};

// Async thunks
export const searchCars = createAsyncThunk(
  'car/searchCars',
  async (params: CarSearchParams, { rejectWithValue }) => {
    try {
      const response = await carService.searchCars(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadMoreCars = createAsyncThunk(
  'car/loadMoreCars',
  async (params: CarSearchParams, { rejectWithValue }) => {
    try {
      const response = await carService.searchCars(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFeaturedCars = createAsyncThunk(
  'car/getFeaturedCars',
  async (_, { rejectWithValue }) => {
    try {
      const cars = await carService.getFeaturedCars();
      return cars;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCarById = createAsyncThunk(
  'car/getCarById',
  async (carId: string, { rejectWithValue }) => {
    try {
      const car = await carService.getCarById(carId);
      return car;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFavorites = createAsyncThunk(
  'car/getFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const cars = await carService.getFavorites();
      return cars;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'car/toggleFavorite',
  async (carId: string, { rejectWithValue }) => {
    try {
      const response = await carService.toggleFavorite(carId);
      return { carId, isFavorite: response.isFavorite };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCarMakes = createAsyncThunk(
  'car/getCarMakes',
  async (_, { rejectWithValue }) => {
    try {
      const makes = await carService.getCarMakes();
      return makes;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCarModels = createAsyncThunk(
  'car/getCarModels',
  async (make: string, { rejectWithValue }) => {
    try {
      const models = await carService.getCarModels(make);
      return { make, models };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAvailableFeatures = createAsyncThunk(
  'car/getAvailableFeatures',
  async (_, { rejectWithValue }) => {
    try {
      const features = await carService.getAvailableFeatures();
      return features;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<CarFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
      state.hasMore = true;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
      state.hasMore = true;
    },
    resetSearch: (state) => {
      state.searchResults = null;
      state.cars = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
    setCurrentCar: (state, action: PayloadAction<Car | null>) => {
      state.currentCar = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Search cars
    builder
      .addCase(searchCars.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchCars.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
        state.cars = action.payload.cars;
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(searchCars.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Load more cars
    builder
      .addCase(loadMoreCars.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreCars.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cars = [...state.cars, ...action.payload.cars];
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(loadMoreCars.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get featured cars
    builder
      .addCase(getFeaturedCars.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedCars.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredCars = action.payload;
      })
      .addCase(getFeaturedCars.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get car by ID
    builder
      .addCase(getCarById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCarById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCar = action.payload;
      })
      .addCase(getCarById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get favorites
    builder
      .addCase(getFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle favorite
    builder
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { carId, isFavorite } = action.payload;
        // Update car in search results
        const carIndex = state.cars.findIndex(car => car.id === carId);
        if (carIndex !== -1) {
          // Add isFavorite property to car
          state.cars[carIndex] = { ...state.cars[carIndex], isFavorite };
        }
        // Update current car
        if (state.currentCar?.id === carId) {
          state.currentCar = { ...state.currentCar, isFavorite };
        }
        // Update featured cars
        const featuredIndex = state.featuredCars.findIndex(car => car.id === carId);
        if (featuredIndex !== -1) {
          state.featuredCars[featuredIndex] = { ...state.featuredCars[featuredIndex], isFavorite };
        }
      });

    // Get car makes
    builder
      .addCase(getCarMakes.fulfilled, (state, action) => {
        state.makes = action.payload;
      });

    // Get car models
    builder
      .addCase(getCarModels.fulfilled, (state, action) => {
        const { make, models } = action.payload;
        // Store models for the specific make
        state.models = models;
      });

    // Get available features
    builder
      .addCase(getAvailableFeatures.fulfilled, (state, action) => {
        state.features = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  resetSearch,
  setCurrentCar,
} = carSlice.actions;

export default carSlice.reducer; 