import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Button, Card, TextInput, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { MainStackParamList } from '@navigation/MainNavigator';
import { usePayments } from '@hooks/usePayments';
import { useBookings } from '@hooks/useBookings';
import PaymentMethodCard from '@components/PaymentMethodCard';

type PaymentRouteProp = RouteProp<MainStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const route = useRoute<PaymentRouteProp>();
  const navigation = useNavigation<any>();
  const { bookingId, amount } = route.params;
  
  const {
    paymentMethods,
    currentPaymentIntent,
    isProcessing,
    error,
    createPaymentIntent,
    confirmPayment,
    loadPaymentMethods,
    clearCurrentPaymentIntent,
  } = usePayments();

  const {
    currentBooking,
    getBookingById,
  } = useBookings();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getBookingById(bookingId);
    loadPaymentMethods();
  }, [bookingId]);

  useEffect(() => {
    // Auto-select default payment method
    const defaultMethod = paymentMethods.find(method => method.isDefault);
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [paymentMethods]);

  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsLoading(true);
    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        bookingId,
        amount,
        paymentMethodId: selectedPaymentMethod,
      });

      // Confirm payment
      await confirmPayment({
        paymentIntentId: paymentIntent.id,
        paymentMethodId: selectedPaymentMethod,
      });

      // Navigate to success screen
      navigation.replace('PaymentSuccess', { 
        bookingId,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod);
  };

  if (!currentBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your booking payment</Text>
        </View>

        {/* Booking Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Booking Summary</Text>
            <View style={styles.bookingInfo}>
              <Text style={styles.carName}>
                {currentBooking.car.make} {currentBooking.car.model}
              </Text>
              <Text style={styles.carYear}>{currentBooking.car.year}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount:</Text>
              <Text style={styles.amount}>{formatPrice(amount)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Button
              mode="text"
              onPress={handleAddPaymentMethod}
              compact
            >
              Add New
            </Button>
          </View>

          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                paymentMethod={method}
                isSelected={selectedPaymentMethod === method.id}
                onSelect={() => handlePaymentMethodSelect(method.id)}
                onRemove={() => {
                  Alert.alert(
                    'Remove Payment Method',
                    'Are you sure you want to remove this payment method?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive' },
                    ]
                  );
                }}
                onSetDefault={() => {
                  // TODO: Implement set default
                  console.log('Set default payment method');
                }}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No payment methods found</Text>
                <Text style={styles.emptySubtext}>
                  Add a payment method to continue
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleAddPaymentMethod}
                  style={styles.addButton}
                >
                  Add Payment Method
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Payment Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Payment Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking Amount:</Text>
              <Text style={styles.summaryValue}>{formatPrice(amount)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee:</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.totalAmount}>{formatPrice(amount)}</Text>
            </View>

            {getSelectedPaymentMethod() && (
              <View style={styles.selectedMethod}>
                <Text style={styles.selectedMethodLabel}>Payment Method:</Text>
                <Text style={styles.selectedMethodValue}>
                  {getSelectedPaymentMethod()?.type === 'card' 
                    ? `•••• ${getSelectedPaymentMethod()?.last4}`
                    : getSelectedPaymentMethod()?.type === 'bank_account'
                    ? 'Bank Account'
                    : 'Mobile Money'
                  }
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleProcessPayment}
            disabled={!selectedPaymentMethod || isLoading || isProcessing}
            loading={isLoading || isProcessing}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
          >
            {isLoading || isProcessing ? 'Processing...' : `Pay ${formatPrice(amount)}`}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isLoading || isProcessing}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  bookingInfo: {
    marginBottom: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyCard: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  divider: {
    marginVertical: 12,
  },
  selectedMethod: {
    marginTop: 12,
  },
  selectedMethodLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedMethodValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  payButton: {
    borderRadius: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
}); 