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
import { Button, Card, TextInput, Divider, ActivityIndicator } from 'react-native-paper';
import { MainStackParamList } from '@navigation/MainNavigator';
import { useCars } from '@hooks/useCars';
import { useBookings } from '@hooks/useBookings';
import DatePicker from '@components/DatePicker';
import { addDays, isAfter, isBefore, differenceInHours, differenceInDays } from 'date-fns';

type BookingRouteProp = RouteProp<MainStackParamList, 'Booking'>;

export default function BookingScreen() {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<any>();
  const { carId } = route.params;
  
  const { currentCar, getCarById } = useCars();
  const {
    priceCalculation,
    availability,
    isCreating,
    calculateBookingPrice,
    checkCarAvailability,
    createBooking,
    clearPriceCalculation,
    clearAvailability,
  } = useBookings();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getCarById(carId);
    // Set default pickup location to car location
    if (currentCar) {
      setPickupLocation(currentCar.location.address);
      setDropoffLocation(currentCar.location.address);
    }
  }, [carId]);

  useEffect(() => {
    if (currentCar) {
      setPickupLocation(currentCar.location.address);
      setDropoffLocation(currentCar.location.address);
    }
  }, [currentCar]);

  useEffect(() => {
    if (startDate && endDate) {
      checkAvailability();
      calculatePrice();
    }
  }, [startDate, endDate]);

  const checkAvailability = () => {
    if (startDate && endDate) {
      checkCarAvailability(carId, startDate.toISOString(), endDate.toISOString());
    }
  };

  const calculatePrice = () => {
    if (startDate && endDate) {
      calculateBookingPrice(carId, startDate.toISOString(), endDate.toISOString());
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (startDate && endDate && isBefore(endDate, startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (startDate && isBefore(startDate, new Date())) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = 'Please enter pickup location';
    }

    if (!dropoffLocation.trim()) {
      newErrors.dropoffLocation = 'Please enter dropoff location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    if (!availability?.isAvailable) {
      Alert.alert('Car Not Available', 'This car is not available for the selected dates.');
      return;
    }

    try {
      const bookingData = {
        carId,
        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        pickupLocation: {
          latitude: currentCar?.location.latitude || 0,
          longitude: currentCar?.location.longitude || 0,
          address: pickupLocation,
        },
        dropoffLocation: {
          latitude: currentCar?.location.latitude || 0,
          longitude: currentCar?.location.longitude || 0,
          address: dropoffLocation,
        },
        notes: notes.trim() || undefined,
      };

      const booking = await createBooking(bookingData);
      
      // Navigate to booking confirmation
      navigation.replace('BookingConfirmation', { bookingId: booking.id });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDuration = () => {
    if (!startDate || !endDate) return '';
    
    const days = differenceInDays(endDate, startDate);
    const hours = differenceInHours(endDate, startDate) % 24;
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  if (!currentCar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading car details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Car Info Card */}
        <Card style={styles.carCard}>
          <Card.Content>
            <Text style={styles.carTitle}>{currentCar.make} {currentCar.model}</Text>
            <Text style={styles.carYear}>{currentCar.year}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(currentCar.dailyRate)}</Text>
              <Text style={styles.priceUnit}>/day</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <DatePicker
            label="Pickup Date & Time"
            value={startDate}
            onChange={setStartDate}
            minimumDate={new Date()}
            error={errors.startDate}
          />

          <DatePicker
            label="Return Date & Time"
            value={endDate}
            onChange={setEndDate}
            minimumDate={startDate || new Date()}
            error={errors.endDate}
          />

          {startDate && endDate && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>Duration: {formatDuration()}</Text>
            </View>
          )}
        </View>

        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup & Return Location</Text>
          
          <TextInput
            label="Pickup Location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
            mode="outlined"
            style={styles.input}
            error={!!errors.pickupLocation}
          />
          {errors.pickupLocation && (
            <Text style={styles.errorText}>{errors.pickupLocation}</Text>
          )}

          <TextInput
            label="Return Location"
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
            mode="outlined"
            style={styles.input}
            error={!!errors.dropoffLocation}
          />
          {errors.dropoffLocation && (
            <Text style={styles.errorText}>{errors.dropoffLocation}</Text>
          )}
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            label="Special requests or notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>

        {/* Availability Status */}
        {availability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Card style={[styles.statusCard, { backgroundColor: availability.isAvailable ? '#dcfce7' : '#fef2f2' }]}>
              <Card.Content>
                <Text style={[styles.statusText, { color: availability.isAvailable ? '#166534' : '#dc2626' }]}>
                  {availability.isAvailable ? '✓ Available' : '✗ Not Available'}
                </Text>
                {!availability.isAvailable && availability.conflicts.length > 0 && (
                  <Text style={styles.conflictText}>
                    Conflicts with existing bookings
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Price Breakdown */}
        {priceCalculation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <Card style={styles.priceCard}>
              <Card.Content>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Daily Rate:</Text>
                  <Text style={styles.priceValue}>{formatPrice(priceCalculation.dailyRate)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Duration:</Text>
                  <Text style={styles.priceValue}>{formatDuration()}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Daily Cost:</Text>
                  <Text style={styles.priceValue}>{formatPrice(priceCalculation.breakdown.dailyCost)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Hourly Cost:</Text>
                  <Text style={styles.priceValue}>{formatPrice(priceCalculation.breakdown.hourlyCost)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Fees:</Text>
                  <Text style={styles.priceValue}>{formatPrice(priceCalculation.breakdown.fees)}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalValue}>{formatPrice(priceCalculation.totalAmount)}</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleCreateBooking}
            disabled={isCreating || !availability?.isAvailable}
            loading={isCreating}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
          >
            {isCreating ? 'Creating Booking...' : 'Create Booking'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
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
  carCard: {
    marginBottom: 24,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  priceUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  durationContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  statusCard: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  conflictText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  priceCard: {
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  divider: {
    marginVertical: 8,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  bookButton: {
    borderRadius: 8,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
}); 