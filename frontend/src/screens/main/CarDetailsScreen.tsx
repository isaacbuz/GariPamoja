import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Button, Chip, IconButton, ActivityIndicator, Divider } from 'react-native-paper';
import { MainStackParamList } from '@navigation/MainNavigator';
import { useCars } from '@hooks/useCars';
import { useAuth } from '@hooks/useAuth';

type CarDetailsRouteProp = RouteProp<MainStackParamList, 'CarDetails'>;

const { width } = Dimensions.get('window');

export default function CarDetailsScreen() {
  const route = useRoute<CarDetailsRouteProp>();
  const navigation = useNavigation<any>();
  const { carId } = route.params;
  const { user } = useAuth();
  
  const {
    currentCar,
    isLoading,
    error,
    getCarById,
    toggleFavorite,
  } = useCars();

  useEffect(() => {
    getCarById(carId);
  }, [carId]);

  const handleBookNow = () => {
    navigation.navigate('Booking', { carId });
  };

  const handleContactOwner = () => {
    // TODO: Open chat with owner
    console.log('Contact owner pressed');
  };

  const handleFavoritePress = () => {
    toggleFavorite(carId);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(0)}`;
  };

  const getTransmissionIcon = (transmission: string) => {
    return transmission === 'automatic' ? 'cog' : 'cog-outline';
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return 'lightning-bolt';
      case 'hybrid':
        return 'leaf';
      case 'diesel':
        return 'fuel';
      default:
        return 'gas-station';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading car details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentCar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Car not found'}</Text>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <IconButton
            icon={currentCar.isFavorite ? 'heart' : 'heart-outline'}
            iconColor={currentCar.isFavorite ? '#ef4444' : '#fff'}
            size={24}
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
          />
        </View>

        {/* Car Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentCar.images[0] || 'https://via.placeholder.com/400x300' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {!currentCar.isAvailable && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          )}
        </View>

        {/* Car Info */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{currentCar.make} {currentCar.model}</Text>
            <Text style={styles.year}>{currentCar.year}</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(currentCar.dailyRate)}</Text>
            <Text style={styles.priceUnit}>per day</Text>
            <Text style={styles.hourlyRate}>or {formatPrice(currentCar.hourlyRate)}/hour</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <IconButton icon="star" size={20} iconColor="#fbbf24" />
              <Text style={styles.ratingText}>
                {currentCar.rating.toFixed(1)} ({currentCar.totalReviews} reviews)
              </Text>
            </View>
            {currentCar.isVerified && (
              <Chip icon="check-circle" style={styles.verifiedChip}>
                Verified
              </Chip>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Car Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Car Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <IconButton
                  icon={getTransmissionIcon(currentCar.transmission)}
                  size={20}
                  iconColor="#6B7280"
                />
                <Text style={styles.detailLabel}>Transmission</Text>
                <Text style={styles.detailValue}>{currentCar.transmission}</Text>
              </View>
              <View style={styles.detailItem}>
                <IconButton
                  icon={getFuelIcon(currentCar.fuelType)}
                  size={20}
                  iconColor="#6B7280"
                />
                <Text style={styles.detailLabel}>Fuel Type</Text>
                <Text style={styles.detailValue}>{currentCar.fuelType}</Text>
              </View>
              <View style={styles.detailItem}>
                <IconButton
                  icon="account-group"
                  size={20}
                  iconColor="#6B7280"
                />
                <Text style={styles.detailLabel}>Seats</Text>
                <Text style={styles.detailValue}>{currentCar.seats}</Text>
              </View>
              <View style={styles.detailItem}>
                <IconButton
                  icon="palette"
                  size={20}
                  iconColor="#6B7280"
                />
                <Text style={styles.detailLabel}>Color</Text>
                <Text style={styles.detailValue}>{currentCar.color}</Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {currentCar.features.map((feature, index) => (
                <Chip key={index} style={styles.featureChip}>
                  {feature}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <IconButton
                icon="map-marker"
                size={20}
                iconColor="#6B7280"
              />
              <Text style={styles.locationText}>{currentCar.location.address}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerContainer}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>
                  {currentCar.owner.firstName} {currentCar.owner.lastName}
                </Text>
                <View style={styles.trustScoreContainer}>
                  <IconButton icon="shield-check" size={16} iconColor="#10B981" />
                  <Text style={styles.trustScore}>
                    Trust Score: {currentCar.owner.trustScore}
                  </Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={handleContactOwner}
                icon="message"
              >
                Contact
              </Button>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{currentCar.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <Button
          mode="contained"
          onPress={handleBookNow}
          disabled={!currentCar.isAvailable}
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
        >
          {currentCar.isAvailable ? 'Book Now' : 'Unavailable'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  year: {
    fontSize: 16,
    color: '#6B7280',
  },
  priceSection: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  priceUnit: {
    fontSize: 16,
    color: '#6B7280',
  },
  hourlyRate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: -8,
  },
  verifiedChip: {
    backgroundColor: '#10B981',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 2,
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginBottom: 8,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: -8,
    flex: 1,
  },
  ownerSection: {
    marginBottom: 16,
  },
  ownerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScore: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: -8,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    borderRadius: 8,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
}); 