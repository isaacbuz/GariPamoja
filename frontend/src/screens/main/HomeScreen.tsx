import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { useCars } from '@hooks/useCars';
import CarCard from '@components/CarCard';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const {
    featuredCars,
    isLoading,
    error,
    loadFeaturedCars,
    loadCarDetails,
  } = useCars();

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const handleCarPress = (carId: string) => {
    loadCarDetails(carId);
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleBookingsPress = () => {
    navigation.navigate('Bookings');
  };

  const onRefresh = () => {
    loadFeaturedCars();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to GariPamoja</Text>
          <Text style={styles.subtitle}>
            Hello, {user?.firstName || 'User'}! 👋
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleSearchPress}
              style={styles.actionButton}
              icon="magnify"
            >
              Search Cars
            </Button>
            <Button
              mode="outlined"
              onPress={handleBookingsPress}
              style={styles.actionButton}
              icon="calendar-check"
            >
              My Bookings
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Cars</Text>
            <Button
              mode="text"
              onPress={handleSearchPress}
              compact
            >
              View All
            </Button>
          </View>
          
          {isLoading && featuredCars.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Loading featured cars...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode="outlined" onPress={onRefresh}>
                Retry
              </Button>
            </View>
          ) : featuredCars.length > 0 ? (
            featuredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onPress={() => handleCarPress(car.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No featured cars available</Text>
              <Button mode="outlined" onPress={handleSearchPress}>
                Browse Cars
              </Button>
            </View>
          )}
        </View>

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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 16,
  },
}); 