import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { useCars } from '@hooks/useCars';
import { usePayments } from '@hooks/usePayments';
import CarCard from '@components/CarCard';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const {
    favorites,
    isLoading,
    error,
    loadFavorites,
    loadCarDetails,
  } = useCars();
  const {
    paymentStats,
    loadPaymentStats,
  } = usePayments();

  useEffect(() => {
    loadFavorites();
    loadPaymentStats();
  }, []);

  const handleCarPress = (carId: string) => {
    loadCarDetails(carId);
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Edit profile pressed');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    console.log('Settings pressed');
  };

  const handleHelp = () => {
    // TODO: Navigate to help screen
    console.log('Help pressed');
  };

  const handlePaymentMethods = () => {
    navigation.navigate('PaymentMethods');
  };

  const handleTransactions = () => {
    navigation.navigate('Transactions');
  };

  const onRefresh = () => {
    loadFavorites();
    loadPaymentStats();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Chip icon="check-circle" style={styles.verifiedChip}>
              Verified User
            </Chip>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.actionButton}
              icon="account-edit"
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              onPress={handleSettings}
              style={styles.actionButton}
              icon="cog"
            >
              Settings
            </Button>
            <Button
              mode="outlined"
              onPress={handleHelp}
              style={styles.actionButton}
              icon="help-circle"
            >
              Help & Support
            </Button>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Billing</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handlePaymentMethods}
              style={styles.actionButton}
              icon="credit-card"
            >
              Payment Methods
            </Button>
            <Button
              mode="outlined"
              onPress={handleTransactions}
              style={styles.actionButton}
              icon="receipt"
            >
              Transaction History
            </Button>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </Card.Content>
            </Card>
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statNumber}>
                  {paymentStats ? formatPrice(paymentStats.totalSpent) : '$0.00'}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Search')}
              compact
            >
              Browse More
            </Button>
          </View>
          
          {isLoading && favorites.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading favorites...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="outlined" onPress={onRefresh}>
                Retry
              </Button>
            </View>
          ) : favorites.length > 0 ? (
            favorites.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onPress={() => handleCarPress(car.id)}
                showFavorite={true}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySubtext}>
                Start browsing cars and add them to your favorites
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Search')}
                icon="heart"
              >
                Browse Cars
              </Button>
            </View>
          )}
        </View>

        {/* Logout */}
        <Button
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  verifiedChip: {
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
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
  logoutButton: {
    marginTop: 16,
  },
}); 