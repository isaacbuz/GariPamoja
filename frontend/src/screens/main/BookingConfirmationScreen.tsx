import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, Divider } from 'react-native-paper';
import { MainStackParamList } from '@navigation/MainNavigator';
import { useBookings } from '@hooks/useBookings';
import { format } from 'date-fns';

type BookingConfirmationRouteProp = RouteProp<MainStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen() {
  const route = useRoute<BookingConfirmationRouteProp>();
  const navigation = useNavigation<any>();
  const { bookingId } = route.params;
  
  const {
    currentBooking,
    isLoading,
    error,
    getBookingById,
  } = useBookings();

  useEffect(() => {
    getBookingById(bookingId);
  }, [bookingId]);

  const handleViewBookings = () => {
    navigation.navigate('Bookings');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleContactOwner = () => {
    // TODO: Navigate to chat with owner
    console.log('Contact owner pressed');
  };

  const handleProceedToPayment = () => {
    if (currentBooking) {
      navigation.navigate('Payment', {
        bookingId: currentBooking.id,
        amount: currentBooking.totalAmount,
      });
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your booking has been created successfully
          </Text>
        </View>

        {/* Booking Status */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(currentBooking.status) }]}
                textStyle={styles.statusChipText}
              >
                {getStatusText(currentBooking.status)}
              </Chip>
            </View>
            <Text style={styles.bookingId}>Booking ID: {currentBooking.id}</Text>
          </Card.Content>
        </Card>

        {/* Car Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Car Details</Text>
            <View style={styles.carInfo}>
              <Text style={styles.carName}>
                {currentBooking.car.make} {currentBooking.car.model}
              </Text>
              <Text style={styles.carYear}>{currentBooking.car.year}</Text>
            </View>
            <Text style={styles.ownerInfo}>
              Owner: {currentBooking.car.owner.firstName} {currentBooking.car.owner.lastName}
            </Text>
          </Card.Content>
        </Card>

        {/* Booking Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentBooking.startDate)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Return Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentBooking.endDate)}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Location:</Text>
              <Text style={styles.detailValue}>
                {currentBooking.pickupLocation.address}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Return Location:</Text>
              <Text style={styles.detailValue}>
                {currentBooking.dropoffLocation.address}
              </Text>
            </View>
            
            {currentBooking.notes && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>
                    {currentBooking.notes}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Payment Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Payment Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {formatPrice(currentBooking.totalAmount)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status:</Text>
              <Chip
                style={[
                  styles.paymentChip,
                  { backgroundColor: currentBooking.paymentStatus === 'paid' ? '#10B981' : '#f59e0b' }
                ]}
                textStyle={styles.paymentChipText}
              >
                {currentBooking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Next Steps</Text>
            
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Wait for owner confirmation (if status is pending)
              </Text>
            </View>
            
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Contact the owner to arrange pickup details
              </Text>
            </View>
            
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Pick up the car at the scheduled time
              </Text>
            </View>
            
            <View style={styles.stepRow}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>
                Return the car on time and in good condition
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleProceedToPayment}
            style={styles.primaryButton}
            contentStyle={styles.primaryButtonContent}
          >
            Proceed to Payment
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
            contentStyle={styles.secondaryButtonContent}
          >
            Back to Car Details
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
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
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
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
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#374151',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  bookingId: {
    fontSize: 14,
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
  carInfo: {
    marginBottom: 8,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  carYear: {
    fontSize: 14,
    color: '#6B7280',
  },
  ownerInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  paymentChip: {
    height: 24,
  },
  paymentChipText: {
    fontSize: 12,
    color: '#fff',
  },
  divider: {
    marginVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 8,
  },
  primaryButtonContent: {
    padding: 16,
  },
  secondaryButton: {
    borderRadius: 8,
  },
  secondaryButtonContent: {
    padding: 16,
  },
}); 