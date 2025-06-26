import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import {
  searchCars,
  loadMoreCars,
  getFeaturedCars,
  getCarById,
  getFavorites,
  toggleFavorite,
  getCarMakes,
  getCarModels,
  getAvailableFeatures,
  setFilters,
  clearFilters,
  resetSearch,
  setCurrentCar,
} from '@store/slices/carSlice';
import { RootState, AppDispatch } from '@store/index';
import { CarSearchParams, CarFilters } from '@services/carService';

export const useCars = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const carState = useSelector((state: RootState) => state.car);

  // Load initial data
  useEffect(() => {
    loadFeaturedCars();
    loadCarMakes();
    loadAvailableFeatures();
  }, []);

  const searchCarsAction = useCallback(async (params: CarSearchParams) => {
    try {
      await dispatch(searchCars(params)).unwrap();
    } catch (error: any) {
      Alert.alert('Search Error', error.message);
    }
  }, [dispatch]);

  const loadMoreCarsAction = useCallback(async (params: CarSearchParams) => {
    if (!carState.hasMore || carState.isLoading) return;
    
    try {
      await dispatch(loadMoreCars({
        ...params,
        page: carState.currentPage + 1,
      })).unwrap();
    } catch (error: any) {
      Alert.alert('Load More Error', error.message);
    }
  }, [dispatch, carState.hasMore, carState.isLoading, carState.currentPage]);

  const loadFeaturedCars = useCallback(async () => {
    try {
      await dispatch(getFeaturedCars()).unwrap();
    } catch (error: any) {
      console.error('Failed to load featured cars:', error);
    }
  }, [dispatch]);

  const loadCarDetails = useCallback(async (carId: string) => {
    try {
      await dispatch(getCarById(carId)).unwrap();
      navigation.navigate('CarDetails', { carId });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch, navigation]);

  const getCarByIdAction = useCallback(async (carId: string) => {
    try {
      await dispatch(getCarById(carId)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadFavorites = useCallback(async () => {
    try {
      await dispatch(getFavorites()).unwrap();
    } catch (error: any) {
      console.error('Failed to load favorites:', error);
    }
  }, [dispatch]);

  const toggleFavoriteAction = useCallback(async (carId: string) => {
    try {
      await dispatch(toggleFavorite(carId)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadCarMakes = useCallback(async () => {
    try {
      await dispatch(getCarMakes()).unwrap();
    } catch (error: any) {
      console.error('Failed to load car makes:', error);
    }
  }, [dispatch]);

  const loadCarModels = useCallback(async (make: string) => {
    try {
      await dispatch(getCarModels(make)).unwrap();
    } catch (error: any) {
      console.error('Failed to load car models:', error);
    }
  }, [dispatch]);

  const loadAvailableFeatures = useCallback(async () => {
    try {
      await dispatch(getAvailableFeatures()).unwrap();
    } catch (error: any) {
      console.error('Failed to load available features:', error);
    }
  }, [dispatch]);

  const setFiltersAction = useCallback((filters: CarFilters) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const resetSearchAction = useCallback(() => {
    dispatch(resetSearch());
  }, [dispatch]);

  const setCurrentCarAction = useCallback((car: any) => {
    dispatch(setCurrentCar(car));
  }, [dispatch]);

  return {
    // State
    cars: carState.cars,
    featuredCars: carState.featuredCars,
    favorites: carState.favorites,
    currentCar: carState.currentCar,
    searchResults: carState.searchResults,
    filters: carState.filters,
    makes: carState.makes,
    models: carState.models,
    features: carState.features,
    isLoading: carState.isLoading,
    isSearching: carState.isSearching,
    error: carState.error,
    currentPage: carState.currentPage,
    hasMore: carState.hasMore,

    // Actions
    searchCars: searchCarsAction,
    loadMoreCars: loadMoreCarsAction,
    loadFeaturedCars,
    loadCarDetails,
    getCarById: getCarByIdAction,
    loadFavorites,
    toggleFavorite: toggleFavoriteAction,
    loadCarMakes,
    loadCarModels,
    loadAvailableFeatures,
    setFilters: setFiltersAction,
    clearFilters: clearFiltersAction,
    resetSearch: resetSearchAction,
    setCurrentCar: setCurrentCarAction,
  };
}; 