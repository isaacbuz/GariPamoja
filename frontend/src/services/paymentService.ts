import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'mobile_money';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
  paymentMethodId?: string;
  bookingId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  bookingId: string;
  description: string;
  stripePaymentIntentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface AddPaymentMethodRequest {
  type: 'card' | 'bank_account' | 'mobile_money';
  token?: string;
  cardDetails?: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
  };
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
  };
  mobileMoneyDetails?: {
    phoneNumber: string;
    provider: string;
  };
}

class PaymentService {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const response = await axios.post(`${API_URL}/payments/create-intent/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentIntent> {
    try {
      const response = await axios.post(`${API_URL}/payments/confirm/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to confirm payment');
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await axios.get(`${API_URL}/payments/methods/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment methods');
    }
  }

  async addPaymentMethod(data: AddPaymentMethodRequest): Promise<PaymentMethod> {
    try {
      const response = await axios.post(`${API_URL}/payments/methods/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add payment method');
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/payments/methods/${paymentMethodId}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove payment method');
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    try {
      const response = await axios.post(`${API_URL}/payments/methods/${paymentMethodId}/default/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set default payment method');
    }
  }

  async getTransactions(page: number = 1, limit: number = 10): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/payments/transactions/`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transactions');
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${API_URL}/payments/transactions/${transactionId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transaction details');
    }
  }

  async refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    try {
      const response = await axios.post(`${API_URL}/payments/transactions/${transactionId}/refund/`, {
        amount,
        reason,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refund transaction');
    }
  }

  async getPaymentIntentById(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await axios.get(`${API_URL}/payments/intents/${paymentIntentId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment intent');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await axios.post(`${API_URL}/payments/intents/${paymentIntentId}/cancel/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel payment intent');
    }
  }

  async getPaymentStats(): Promise<{
    totalSpent: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageTransactionAmount: number;
  }> {
    try {
      const response = await axios.get(`${API_URL}/payments/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment stats');
    }
  }

  async validateCard(cardNumber: string, expiryMonth: number, expiryYear: number, cvc: string): Promise<{
    isValid: boolean;
    brand?: string;
    last4?: string;
  }> {
    try {
      const response = await axios.post(`${API_URL}/payments/validate-card/`, {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate card');
    }
  }

  async getSupportedPaymentMethods(): Promise<{
    cards: boolean;
    bankAccounts: boolean;
    mobileMoney: {
      mpesa: boolean;
      airtelMoney: boolean;
      mtm: boolean;
    };
  }> {
    try {
      const response = await axios.get(`${API_URL}/payments/supported-methods/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get supported payment methods');
    }
  }
}

export default new PaymentService(); 