import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { usePayments } from '@hooks/usePayments';
import PaymentMethodCard from '@components/PaymentMethodCard';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const {
    paymentMethods,
    isLoading,
    error,
    loadPaymentMethods,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePayments();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPaymentMethods();
    setIsRefreshing(false);
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentMethod');
  };

  const handleRemovePaymentMethod = (paymentMethodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removePaymentMethod(paymentMethodId),
        },
      ]
    );
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultPaymentMethod(paymentMethodId);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'credit-card';
      case 'bank_account':
        return 'bank';
      case 'mobile_money':
        return 'cellphone';
      default:
        return 'credit-card';
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    switch (type) {
      case 'card':
        return 'Credit/Debit Cards';
      case 'bank_account':
        return 'Bank Accounts';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return 'Payment Methods';
    }
  };

  const getPaymentMethodCount = (type: string) => {
    return paymentMethods.filter(method => method.type === type).length;
  };

  const groupedPaymentMethods = {
    card: paymentMethods.filter(method => method.type === 'card'),
    bank_account: paymentMethods.filter(method => method.type === 'bank_account'),
    mobile_money: paymentMethods.filter(method => method.type === 'mobile_money'),
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <ActivityIndicator 
            size="small" 
            color="#2563EB" 
            animating={isRefreshing}
          />
        }
        onScrollBeginDrag={handleRefresh}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            Manage your saved payment methods for quick and secure transactions
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Credit/Debit Cards</Text>
              <Text style={styles.summaryCount}>{getPaymentMethodCount('card')}</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Bank Accounts</Text>
              <Text style={styles.summaryCount}>{getPaymentMethodCount('bank_account')}</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Mobile Money</Text>
              <Text style={styles.summaryCount}>{getPaymentMethodCount('mobile_money')}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Payment Methods by Type */}
        {Object.entries(groupedPaymentMethods).map(([type, methods]) => {
          if (methods.length === 0) return null;
          
          return (
            <View key={type} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{getPaymentMethodLabel(type)}</Text>
                <Text style={styles.sectionCount}>{methods.length}</Text>
              </View>
              
              {methods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  onRemove={() => handleRemovePaymentMethod(method.id)}
                  onSetDefault={() => handleSetDefault(method.id)}
                  showActions={true}
                />
              ))}
            </View>
          );
        })}

        {/* Empty State */}
        {paymentMethods.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySubtitle}>
                You haven't added any payment methods yet. Add one to get started with bookings.
              </Text>
              <Button
                mode="contained"
                onPress={handleAddPaymentMethod}
                style={styles.addFirstButton}
                contentStyle={styles.addFirstButtonContent}
              >
                Add Your First Payment Method
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Card.Content>
            <Text style={styles.securityTitle}>🔒 Secure & Encrypted</Text>
            <Text style={styles.securityText}>
              All payment information is encrypted and stored securely. We never store your full card details on our servers.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB for adding new payment method */}
      {paymentMethods.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddPaymentMethod}
          label="Add Payment Method"
        />
      )}
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
    paddingBottom: 80, // Space for FAB
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
  header: {
    marginBottom: 24,
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
    lineHeight: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyCard: {
    marginBottom: 24,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    borderRadius: 8,
  },
  addFirstButtonContent: {
    paddingVertical: 8,
  },
  securityCard: {
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
}); 