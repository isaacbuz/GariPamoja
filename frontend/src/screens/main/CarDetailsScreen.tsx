import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@navigation/MainNavigator';

type CarDetailsRouteProp = RouteProp<MainStackParamList, 'CarDetails'>;

export default function CarDetailsScreen() {
  const route = useRoute<CarDetailsRouteProp>();
  const { carId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Car Details</Text>
        <Text style={styles.subtitle}>Car ID: {carId}</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Car details coming soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 32,
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
}); 