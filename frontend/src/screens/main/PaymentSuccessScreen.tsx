import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Button, Card, IconButton } from 'react-native-paper';
import { MainStackParamList } from '@navigation/MainNavigator';
import { usePayments } from '@hooks/usePayments';
import { useBookings } from '@hooks/useBookings';

type PaymentSuccessRouteProp = RouteProp<MainStackParamList, 'PaymentSuccess'>;

export default function PaymentSuccessScreen() {
  const route = useRoute<PaymentSuccessRouteProp>();
  const navigation = useNavigation<any>();
  const { bookingId, paymentIntentId } = route.params;
  
  const {
    currentPaymentIntent,
    getTransactionById,
  } = usePayments();

  const {
    currentBooking,
    getBookingById,
  } = useBookings();

  useEffect(() => {
    getBookingById(bookingId);
    if (paymentIntentId) {
      // Get transaction details
      getTransactionById(paymentIntentId);
    }
  }, [bookingId, paymentIntentId]);

  const handleViewBooking = () => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleViewBookings = () => {
    navigation.navigate('Bookings');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <IconButton
              icon="check"
              size={48}
              iconColor="#fff"
            />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your booking has been confirmed and payment processed successfully.
          </Text>
        </View>

        {/* Booking Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Booking Confirmation</Text>
            
            <View style={styles.bookingInfo}>
              <Text style={styles.carName}>
                {currentBooking.car.make} {currentBooking.car.model}
              </Text>
              <Text style={styles.carYear}>{currentBooking.car.year}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Booking ID</Text>
                <Text style={styles.detailValue}>#{currentBooking.id}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pickup Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentBooking.startDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pickup Time</Text>
                <Text style={styles.detailValue}>
                  {formatTime(currentBooking.startDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Return Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentBooking.endDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Return Time</Text>
                <Text style={styles.detailValue}>
                  {formatTime(currentBooking.endDate)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.detailValue}>
                  {formatPrice(currentBooking.totalAmount)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>What's Next?</Text>
            
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Receive Confirmation</Text>
                  <Text style={styles.stepDescription}>
                    You'll receive a confirmation email with all booking details.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Pickup Instructions</Text>
                  <Text style={styles.stepDescription}>
                    The car owner will contact you with pickup location and instructions.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Enjoy Your Ride</Text>
                  <Text style={styles.stepDescription}>
                    Pick up your car and enjoy your journey!
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleViewBooking}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            View Booking Details
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleViewBookings}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            View All Bookings
          </Button>
          
          <Button
            mode="text"
            onPress={handleGoHome}
            style={styles.textButton}
          >
            Back to Home
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
    color: '#6B7280',
    fontSize: 16,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 16,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
  },
  textButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 