import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Chip, IconButton } from 'react-native-paper';
import { Car } from '@services/carService';
import { useCars } from '@hooks/useCars';

interface CarCardProps {
  car: Car;
  onPress?: () => void;
  showFavorite?: boolean;
}

export default function CarCard({ car, onPress, showFavorite = true }: CarCardProps) {
  const { toggleFavorite } = useCars();

  const handleFavoritePress = () => {
    toggleFavorite(car.id);
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

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: car.images[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        {showFavorite && (
          <IconButton
            icon={car.isFavorite ? 'heart' : 'heart-outline'}
            iconColor={car.isFavorite ? '#ef4444' : '#fff'}
            size={24}
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          />
        )}
        {!car.isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{car.make} {car.model}</Text>
            <Text style={styles.year}>{car.year}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(car.dailyRate)}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <IconButton
                icon={getTransmissionIcon(car.transmission)}
                size={16}
                iconColor="#6B7280"
              />
              <Text style={styles.detailText}>{car.transmission}</Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton
                icon={getFuelIcon(car.fuelType)}
                size={16}
                iconColor="#6B7280"
              />
              <Text style={styles.detailText}>{car.fuelType}</Text>
            </View>
            <View style={styles.detailItem}>
              <IconButton
                icon="account-group"
                size={16}
                iconColor="#6B7280"
              />
              <Text style={styles.detailText}>{car.seats} seats</Text>
            </View>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <IconButton
            icon="map-marker"
            size={16}
            iconColor="#6B7280"
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {car.location.city}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {car.features.slice(0, 3).map((feature, index) => (
            <Chip key={index} style={styles.featureChip} textStyle={styles.featureText}>
              {feature}
            </Chip>
          ))}
          {car.features.length > 3 && (
            <Chip style={styles.featureChip} textStyle={styles.featureText}>
              +{car.features.length - 3} more
            </Chip>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <IconButton
              icon="star"
              size={16}
              iconColor="#fbbf24"
            />
            <Text style={styles.ratingText}>
              {car.rating.toFixed(1)} ({car.totalReviews})
            </Text>
          </View>
          {car.isVerified && (
            <Chip icon="check-circle" style={styles.verifiedChip} textStyle={styles.verifiedText}>
              Verified
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  unavailableText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: -8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: -8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  featureChip: {
    height: 24,
  },
  featureText: {
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: -8,
  },
  verifiedChip: {
    height: 24,
    backgroundColor: '#10B981',
  },
  verifiedText: {
    fontSize: 10,
    color: '#fff',
  },
}); 