import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { usePayments } from '@hooks/usePayments';
import { Transaction } from '@services/paymentService';

export default function TransactionsScreen() {
  const navigation = useNavigation<any>();
  const {
    transactions,
    paymentStats,
    isLoading,
    hasMore,
    loadTransactions,
    loadMoreTransactions,
    loadPaymentStats,
    refundTransaction,
  } = usePayments();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadPaymentStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadTransactions(),
      loadPaymentStats(),
    ]);
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    await loadMoreTransactions();
    setIsLoadingMore(false);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails', { transactionId: transaction.id });
  };

  const handleRefund = (transaction: Transaction) => {
    Alert.alert(
      'Refund Transaction',
      `Are you sure you want to refund $${transaction.amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: () => refundTransaction(transaction.id),
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '#10B981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Card 
      style={styles.transactionCard}
      onPress={() => handleTransactionPress(item)}
    >
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionAmount}>
              {formatPrice(item.amount)}
            </Text>
            <Text style={styles.transactionDescription}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.transactionStatus}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) + '20' }
              ]}
              textStyle={[
                styles.statusText,
                { color: getStatusColor(item.status) }
              ]}
            >
              {getStatusLabel(item.status)}
            </Chip>
            
            {item.status === 'succeeded' && (
              <IconButton
                icon="refresh"
                size={20}
                onPress={() => handleRefund(item)}
                iconColor="#6B7280"
              />
            )}
          </View>
        </View>
        
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodLabel}>Payment Method:</Text>
          <Text style={styles.paymentMethodValue}>
            {item.paymentMethod.type === 'card' 
              ? `•••• ${item.paymentMethod.last4}`
              : item.paymentMethod.type === 'bank_account'
              ? 'Bank Account'
              : 'Mobile Money'
            }
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Text style={styles.statsTitle}>Payment Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {paymentStats ? formatPrice(paymentStats.totalSpent) : '$0.00'}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {paymentStats?.totalTransactions || 0}
            </Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {paymentStats?.successfulTransactions || 0}
            </Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {paymentStats?.averageTransactionAmount 
                ? formatPrice(paymentStats.averageTransactionAmount)
                : '$0.00'
              }
            </Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your transaction history will appear here once you make your first booking payment.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.browseButton}
          contentStyle={styles.browseButtonContent}
        >
          Browse Cars
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          View all your payment transactions and refunds
        </Text>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={
            <>
              {paymentStats && renderStatsCard()}
              {transactions.length === 0 && renderEmptyState()}
            </>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
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
  header: {
    padding: 16,
    paddingBottom: 8,
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
  listContent: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  paymentMethodValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  emptyCard: {
    marginBottom: 16,
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
  browseButton: {
    borderRadius: 8,
  },
  browseButtonContent: {
    paddingVertical: 8,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
}); 