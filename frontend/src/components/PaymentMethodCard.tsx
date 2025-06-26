import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, IconButton, Chip } from 'react-native-paper';
import { PaymentMethod } from '@services/paymentService';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
}

export default function PaymentMethodCard({
  paymentMethod,
  isSelected = false,
  onSelect,
  onRemove,
  onSetDefault,
  showActions = true,
}: PaymentMethodCardProps) {
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
        return 'Credit/Debit Card';
      case 'bank_account':
        return 'Bank Account';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return 'Payment Method';
    }
  };

  const getDisplayText = () => {
    if (paymentMethod.type === 'card' && paymentMethod.last4) {
      return `•••• ${paymentMethod.last4}`;
    } else if (paymentMethod.type === 'bank_account') {
      return 'Bank Account';
    } else if (paymentMethod.type === 'mobile_money') {
      return 'Mobile Money';
    }
    return 'Payment Method';
  };

  const getBrandText = () => {
    if (paymentMethod.type === 'card' && paymentMethod.brand) {
      return paymentMethod.brand.toUpperCase();
    }
    return '';
  };

  return (
    <Card
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
      onPress={onSelect}
    >
      <Card.Content style={styles.content}>
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <IconButton
              icon={getPaymentMethodIcon(paymentMethod.type)}
              size={24}
              iconColor={isSelected ? '#2563EB' : '#6B7280'}
            />
          </View>
          
          <View style={styles.details}>
            <Text style={styles.label}>{getPaymentMethodLabel(paymentMethod.type)}</Text>
            <Text style={styles.displayText}>{getDisplayText()}</Text>
            {getBrandText() && (
              <Text style={styles.brandText}>{getBrandText()}</Text>
            )}
            {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
              <Text style={styles.expiryText}>
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </Text>
            )}
          </View>

          <View style={styles.statusContainer}>
            {paymentMethod.isDefault && (
              <Chip style={styles.defaultChip} textStyle={styles.defaultChipText}>
                Default
              </Chip>
            )}
            {isSelected && (
              <IconButton
                icon="check-circle"
                size={20}
                iconColor="#10B981"
              />
            )}
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            {!paymentMethod.isDefault && (
              <IconButton
                icon="star-outline"
                size={20}
                onPress={onSetDefault}
                iconColor="#6B7280"
              />
            )}
            <IconButton
              icon="delete-outline"
              size={20}
              onPress={onRemove}
              iconColor="#ef4444"
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCard: {
    borderColor: '#2563EB',
    backgroundColor: '#eff6ff',
  },
  content: {
    padding: 16,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  displayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  brandText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  expiryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  defaultChip: {
    height: 20,
    backgroundColor: '#10B981',
    marginBottom: 4,
  },
  defaultChipText: {
    fontSize: 10,
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
}); 