import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, ActivityIndicator, FAB, SegmentedButtons } from 'react-native-paper';
import { useBookings } from '@hooks/useBookings';
import { format } from 'date-fns';

export default function BookingsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    bookings,
    activeBookings,
    pendingBookings,
    isLoading,
    error,
    getBookings,
    loadActiveBookings,
    loadPendingBookings,
    cancelBooking,
  } = useBookings();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    switch (activeTab) {
      case 'active':
        loadActiveBookings();
        break;
      case 'pending':
        loadPendingBookings();
        break;
      default:
        getBookings();
        break;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Load appropriate bookings when tab changes
    setTimeout(() => {
      switch (value) {
        case 'active':
          loadActiveBookings();
          break;
        case 'pending':
          loadPendingBookings();
          break;
        default:
          getBookings();
          break;
      }
    }, 100);
  };

  const handleBookingPress = (bookingId: string) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  const handleCreateBooking = () => {
    navigation.navigate('Search');
  };

  const onRefresh = () => {
    loadBookings();
  };

  const getCurrentBookings = () => {
    switch (activeTab) {
      case 'active':
        return activeBookings;
      case 'pending':
        return pendingBookings;
      default:
        return bookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'active':
        return '#2563EB';
      case 'pending':
        return '#f59e0b';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#ef4444';
      case 'rejected':
        return '#dc2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const renderBookingCard = ({ item }: { item: any }) => (
    <Card style={styles.bookingCard} onPress={() => handleBookingPress(item.id)}>
      <Card.Content>
        <View style={styles.bookingHeader}>
          <View style={styles.carInfo}>
            <Text style={styles.carName}>
              {item.car.make} {item.car.model}
            </Text>
            <Text style={styles.carYear}>{item.car.year}</Text>
          </View>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup:</Text>
            <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Return:</Text>
            <Text style={styles.detailValue}>{formatDate(item.endDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.amount}>{formatPrice(item.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.ownerInfo}>
          <Text style={styles.ownerText}>
            Owner: {item.car.owner.firstName} {item.car.owner.lastName}
          </Text>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => handleCancelBooking(item.id)}
              style={styles.cancelButton}
              textColor="#ef4444"
            >
              Cancel
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No bookings found</Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'all' && 'You haven\'t made any bookings yet'}
        {activeTab === 'active' && 'You don\'t have any active bookings'}
        {activeTab === 'pending' && 'You don\'t have any pending bookings'}
      </Text>
      <Button
        mode="outlined"
        onPress={handleCreateBooking}
        style={styles.createButton}
        icon="plus"
      >
        Browse Cars
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={handleTabChange}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {isLoading && getCurrentBookings().length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={onRefresh}>
            Retry
          </Button>
        </View>
      ) : getCurrentBookings().length > 0 ? (
        <FlatList
          data={getCurrentBookings()}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingList}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        />
      ) : (
        renderEmptyState()
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateBooking}
        label="New Booking"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  segmentedButtons: {
    backgroundColor: '#f3f4f6',
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
  bookingList: {
    padding: 16,
  },
  bookingCard: {
    marginBottom: 16,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carInfo: {
    flex: 1,
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
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  ownerInfo: {
    marginBottom: 12,
  },
  ownerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderColor: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 