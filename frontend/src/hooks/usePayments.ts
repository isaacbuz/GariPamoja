import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getTransactions,
  loadMoreTransactions,
  getTransactionById,
  refundTransaction,
  getPaymentStats,
  getSupportedPaymentMethods,
  clearCurrentPaymentIntent,
  resetTransactions,
} from '@store/slices/paymentSlice';
import { RootState, AppDispatch } from '@store/index';
import { CreatePaymentIntentRequest, ConfirmPaymentRequest, AddPaymentMethodRequest } from '@services/paymentService';

export const usePayments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentState = useSelector((state: RootState) => state.payment);

  // Load initial data
  useEffect(() => {
    loadPaymentMethods();
    loadSupportedPaymentMethods();
  }, []);

  const createPaymentIntentAction = useCallback(async (data: CreatePaymentIntentRequest) => {
    try {
      const result = await dispatch(createPaymentIntent(data)).unwrap();
      return result;
    } catch (error: any) {
      Alert.alert('Payment Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const confirmPaymentAction = useCallback(async (data: ConfirmPaymentRequest) => {
    try {
      const result = await dispatch(confirmPayment(data)).unwrap();
      Alert.alert('Success', 'Payment completed successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Payment Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      await dispatch(getPaymentMethods()).unwrap();
    } catch (error: any) {
      console.error('Failed to load payment methods:', error);
    }
  }, [dispatch]);

  const addPaymentMethodAction = useCallback(async (data: AddPaymentMethodRequest) => {
    try {
      const result = await dispatch(addPaymentMethod(data)).unwrap();
      Alert.alert('Success', 'Payment method added successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const removePaymentMethodAction = useCallback(async (paymentMethodId: string) => {
    try {
      await dispatch(removePaymentMethod(paymentMethodId)).unwrap();
      Alert.alert('Success', 'Payment method removed successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const setDefaultPaymentMethodAction = useCallback(async (paymentMethodId: string) => {
    try {
      await dispatch(setDefaultPaymentMethod(paymentMethodId)).unwrap();
      Alert.alert('Success', 'Default payment method updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadTransactions = useCallback(async (page: number = 1) => {
    try {
      await dispatch(getTransactions({ page })).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const loadMoreTransactionsAction = useCallback(async () => {
    if (!paymentState.hasMore || paymentState.isLoading) return;
    
    try {
      await dispatch(loadMoreTransactions({
        page: paymentState.currentPage + 1,
      })).unwrap();
    } catch (error: any) {
      Alert.alert('Load More Error', error.message);
    }
  }, [dispatch, paymentState.hasMore, paymentState.isLoading, paymentState.currentPage]);

  const getTransactionByIdAction = useCallback(async (transactionId: string) => {
    try {
      await dispatch(getTransactionById(transactionId)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [dispatch]);

  const refundTransactionAction = useCallback(async (transactionId: string, amount?: number, reason?: string) => {
    try {
      const result = await dispatch(refundTransaction({ transactionId, amount, reason })).unwrap();
      Alert.alert('Success', 'Refund processed successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Refund Error', error.message);
      throw error;
    }
  }, [dispatch]);

  const loadPaymentStats = useCallback(async () => {
    try {
      await dispatch(getPaymentStats()).unwrap();
    } catch (error: any) {
      console.error('Failed to load payment stats:', error);
    }
  }, [dispatch]);

  const loadSupportedPaymentMethods = useCallback(async () => {
    try {
      await dispatch(getSupportedPaymentMethods()).unwrap();
    } catch (error: any) {
      console.error('Failed to load supported payment methods:', error);
    }
  }, [dispatch]);

  const clearCurrentPaymentIntentAction = useCallback(() => {
    dispatch(clearCurrentPaymentIntent());
  }, [dispatch]);

  const resetTransactionsAction = useCallback(() => {
    dispatch(resetTransactions());
  }, [dispatch]);

  return {
    // State
    paymentMethods: paymentState.paymentMethods,
    currentPaymentIntent: paymentState.currentPaymentIntent,
    transactions: paymentState.transactions,
    paymentStats: paymentState.paymentStats,
    supportedMethods: paymentState.supportedMethods,
    isLoading: paymentState.isLoading,
    isProcessing: paymentState.isProcessing,
    error: paymentState.error,
    currentPage: paymentState.currentPage,
    hasMore: paymentState.hasMore,

    // Actions
    createPaymentIntent: createPaymentIntentAction,
    confirmPayment: confirmPaymentAction,
    loadPaymentMethods,
    addPaymentMethod: addPaymentMethodAction,
    removePaymentMethod: removePaymentMethodAction,
    setDefaultPaymentMethod: setDefaultPaymentMethodAction,
    loadTransactions,
    loadMoreTransactions: loadMoreTransactionsAction,
    getTransactionById: getTransactionByIdAction,
    refundTransaction: refundTransactionAction,
    loadPaymentStats,
    loadSupportedPaymentMethods,
    clearCurrentPaymentIntent: clearCurrentPaymentIntentAction,
    resetTransactions: resetTransactionsAction,
  };
}; 