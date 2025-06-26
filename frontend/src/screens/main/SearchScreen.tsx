import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar, Button, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useCars } from '@hooks/useCars';
import CarCard from '@components/CarCard';
import { CarFilters } from '@services/carService';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CarFilters>({});
  
  const {
    cars,
    isLoading,
    isSearching,
    error,
    hasMore,
    searchCars,
    loadMoreCars,
    setFilters,
    clearFilters,
    resetSearch,
  } = useCars();

  useEffect(() => {
    // Load initial cars
    handleSearch();
  }, []);

  const handleSearch = () => {
    resetSearch();
    searchCars({
      query: searchQuery,
      filters: activeFilters,
      page: 1,
      limit: 10,
    });
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMoreCars({
        query: searchQuery,
        filters: activeFilters,
        page: Math.ceil(cars.length / 10) + 1,
        limit: 10,
      });
    }
  };

  const handleCarPress = (carId: string) => {
    navigation.navigate('CarDetails', { carId });
  };

  const handleFilterChange = (filter: CarFilters) => {
    const newFilters = { ...activeFilters, ...filter };
    setActiveFilters(newFilters);
    setFilters(newFilters);
    handleSearch();
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    clearFilters();
    handleSearch();
  };

  const onRefresh = () => {
    handleSearch();
  };

  const renderCarItem = ({ item }: { item: any }) => (
    <CarCard
      car={item}
      onPress={() => handleCarPress(item.id)}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.footerText}>Loading more cars...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search cars by make, model, or location..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />
        <Button
          mode="outlined"
          onPress={() => setShowFilters(!showFilters)}
          icon={showFilters ? 'filter-off' : 'filter'}
          style={styles.filterButton}
        >
          Filters
        </Button>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Chip
              selected={!!activeFilters.transmission}
              onPress={() => handleFilterChange({ transmission: 'automatic' })}
              style={styles.filterChip}
            >
              Automatic
            </Chip>
            <Chip
              selected={!!activeFilters.transmission}
              onPress={() => handleFilterChange({ transmission: 'manual' })}
              style={styles.filterChip}
            >
              Manual
            </Chip>
            <Chip
              selected={!!activeFilters.fuelType}
              onPress={() => handleFilterChange({ fuelType: 'electric' })}
              style={styles.filterChip}
            >
              Electric
            </Chip>
            <Chip
              selected={!!activeFilters.fuelType}
              onPress={() => handleFilterChange({ fuelType: 'hybrid' })}
              style={styles.filterChip}
            >
              Hybrid
            </Chip>
            <Chip
              selected={!!activeFilters.seats}
              onPress={() => handleFilterChange({ seats: 5 })}
              style={styles.filterChip}
            >
              5+ Seats
            </Chip>
            <Chip
              selected={!!activeFilters.isAvailable}
              onPress={() => handleFilterChange({ isAvailable: true })}
              style={styles.filterChip}
            >
              Available
            </Chip>
          </ScrollView>
          
          {Object.keys(activeFilters).length > 0 && (
            <Button
              mode="text"
              onPress={handleClearFilters}
              style={styles.clearFiltersButton}
            >
              Clear All Filters
            </Button>
          )}
        </View>
      )}

      {isSearching && cars.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Searching cars...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={onRefresh}>
            Retry
          </Button>
        </View>
      ) : cars.length > 0 ? (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={isSearching} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cars found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search criteria or filters
          </Text>
          <Button mode="outlined" onPress={handleClearFilters}>
            Clear Filters
          </Button>
        </View>
      )}

      <FAB
        icon="magnify"
        style={styles.fab}
        onPress={handleSearch}
        label="Search"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#fff',
  },
  filterButton: {
    elevation: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  clearFiltersButton: {
    marginTop: 12,
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
  carList: {
    padding: 16,
  },
  footerLoader: {
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 