import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import {
  createBooking,
  getBookingById,
  getBookings,
  cancelBooking,
  updateBooking,
  clearCurrentBooking,
  clearBookings,
} from '@store/slices/bookingSlice';
import { RootState, AppDispatch } from '@store/index';
import { CreateBookingRequest, UpdateBookingRequest } from '@services/bookingService';

export const useBookings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const bookingState = useSelector((state: RootState) => state.booking);

  const createBookingAction = useCallback(async (data: CreateBookingRequest) => {
    try {
      const result = await dispatch(createBooking(data)).unwrap();
      Alert.alert('Success', 'Booking created successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Booking Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const getBookingByIdAction = useCallback(async (bookingId: string) => {
    try {
      await dispatch(getBookingById(bookingId)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadBookings = useCallback(async (page: number = 1) => {
    try {
      await dispatch(getBookings({ page })).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadMoreBookings = useCallback(async () => {
    if (!bookingState.hasMore || bookingState.isLoading) return;
    
    try {
      await dispatch(getBookings({
        page: bookingState.currentPage + 1,
      })).unwrap();
    } catch (error: any) {
      Alert.alert('Load More Error', error.message);
    }
  }, [dispatch, bookingState.hasMore, bookingState.isLoading, bookingState.currentPage]);

  const cancelBookingAction = useCallback(async (bookingId: string, reason?: string) => {
    try {
      const result = await dispatch(cancelBooking({ bookingId, reason })).unwrap();
      Alert.alert('Success', 'Booking cancelled successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Cancellation Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const updateBookingAction = useCallback(async (bookingId: string, data: UpdateBookingRequest) => {
    try {
      const result = await dispatch(updateBooking({ bookingId, data })).unwrap();
      Alert.alert('Success', 'Booking updated successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const clearCurrentBookingAction = useCallback(() => {
    dispatch(clearCurrentBooking());
  }, [dispatch]);

  const clearBookingsAction = useCallback(() => {
    dispatch(clearBookings());
  }, [dispatch]);

  return {
    // State
    currentBooking: bookingState.currentBooking,
    bookings: bookingState.bookings,
    isLoading: bookingState.isLoading,
    error: bookingState.error,
    currentPage: bookingState.currentPage,
    hasMore: bookingState.hasMore,

    // Actions
    createBooking: createBookingAction,
    getBookingById: getBookingByIdAction,
    loadBookings,
    loadMoreBookings,
    cancelBooking: cancelBookingAction,
    updateBooking: updateBookingAction,
    clearCurrentBooking: clearCurrentBookingAction,
    clearBookings: clearBookingsAction,
  };
}; 