import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import paymentService, {
  PaymentMethod,
  PaymentIntent,
  Transaction,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  AddPaymentMethodRequest,
} from '@services/paymentService';

export interface PaymentState {
  paymentMethods: PaymentMethod[];
  currentPaymentIntent: PaymentIntent | null;
  transactions: Transaction[];
  paymentStats: {
    totalSpent: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageTransactionAmount: number;
  } | null;
  supportedMethods: {
    cards: boolean;
    bankAccounts: boolean;
    mobileMoney: {
      mpesa: boolean;
      airtelMoney: boolean;
      mtm: boolean;
    };
  } | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

const initialState: PaymentState = {
  paymentMethods: [],
  currentPaymentIntent: null,
  transactions: [],
  paymentStats: null,
  supportedMethods: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  currentPage: 1,
  hasMore: true,
};

// Async thunks
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (data: CreatePaymentIntentRequest, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPaymentIntent(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async (data: ConfirmPaymentRequest, { rejectWithValue }) => {
    try {
      const response = await paymentService.confirmPayment(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  'payment/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentMethods();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPaymentMethod = createAsyncThunk(
  'payment/addPaymentMethod',
  async (data: AddPaymentMethodRequest, { rejectWithValue }) => {
    try {
      const response = await paymentService.addPaymentMethod(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removePaymentMethod = createAsyncThunk(
  'payment/removePaymentMethod',
  async (paymentMethodId: string, { rejectWithValue }) => {
    try {
      await paymentService.removePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const setDefaultPaymentMethod = createAsyncThunk(
  'payment/setDefaultPaymentMethod',
  async (paymentMethodId: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.setDefaultPaymentMethod(paymentMethodId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTransactions = createAsyncThunk(
  'payment/getTransactions',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await paymentService.getTransactions(
        params.page || 1,
        params.limit || 10
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadMoreTransactions = createAsyncThunk(
  'payment/loadMoreTransactions',
  async (params: { page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await paymentService.getTransactions(
        params.page,
        params.limit || 10
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTransactionById = createAsyncThunk(
  'payment/getTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await paymentService.getTransactionById(transactionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refundTransaction = createAsyncThunk(
  'payment/refundTransaction',
  async ({ transactionId, amount, reason }: { transactionId: string; amount?: number; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await paymentService.refundTransaction(transactionId, amount, reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPaymentStats = createAsyncThunk(
  'payment/getPaymentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSupportedPaymentMethods = createAsyncThunk(
  'payment/getSupportedPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getSupportedPaymentMethods();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPaymentIntent: (state) => {
      state.currentPaymentIntent = null;
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentPaymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Confirm payment
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.currentPaymentIntent = action.payload;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Get payment methods
    builder
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
      });

    // Add payment method
    builder
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods.push(action.payload);
      });

    // Remove payment method
    builder
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        const paymentMethodId = action.payload;
        state.paymentMethods = state.paymentMethods.filter(
          method => method.id !== paymentMethodId
        );
      });

    // Set default payment method
    builder
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        const updatedMethod = action.payload;
        state.paymentMethods = state.paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === updatedMethod.id,
        }));
      });

    // Get transactions
    builder
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load more transactions
    builder
      .addCase(loadMoreTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = [...state.transactions, ...action.payload.transactions];
        state.currentPage = action.payload.page;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(loadMoreTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get transaction by ID
    builder
      .addCase(getTransactionById.fulfilled, (state, action) => {
        // Update transaction in list if it exists
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      });

    // Refund transaction
    builder
      .addCase(refundTransaction.fulfilled, (state, action) => {
        // Update transaction in list
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      });

    // Get payment stats
    builder
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.paymentStats = action.payload;
      });

    // Get supported payment methods
    builder
      .addCase(getSupportedPaymentMethods.fulfilled, (state, action) => {
        state.supportedMethods = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentPaymentIntent,
  resetTransactions,
} = paymentSlice.actions;

export default paymentSlice.reducer; 