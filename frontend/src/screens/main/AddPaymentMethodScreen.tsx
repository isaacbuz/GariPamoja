import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, TextInput, Chip, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { usePayments } from '@hooks/usePayments';
import { AddPaymentMethodRequest } from '@services/paymentService';

type PaymentMethodType = 'card' | 'bank_account' | 'mobile_money';

export default function AddPaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const { addPaymentMethod, supportedMethods, loadSupportedPaymentMethods } = usePayments();

  const [paymentType, setPaymentType] = useState<PaymentMethodType>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Card fields
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    
    // Bank fields
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    
    // Mobile money fields
    phoneNumber: '',
    provider: 'mpesa',
  });

  useEffect(() => {
    loadSupportedPaymentMethods();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    switch (paymentType) {
      case 'card':
        if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvc || !formData.cardholderName) {
          Alert.alert('Error', 'Please fill in all card details');
          return false;
        }
        if (formData.cardNumber.length < 13 || formData.cardNumber.length > 19) {
          Alert.alert('Error', 'Please enter a valid card number');
          return false;
        }
        if (formData.cvc.length < 3 || formData.cvc.length > 4) {
          Alert.alert('Error', 'Please enter a valid CVC');
          return false;
        }
        break;
      
      case 'bank_account':
        if (!formData.accountNumber || !formData.routingNumber || !formData.accountHolderName) {
          Alert.alert('Error', 'Please fill in all bank account details');
          return false;
        }
        break;
      
      case 'mobile_money':
        if (!formData.phoneNumber) {
          Alert.alert('Error', 'Please enter a phone number');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestData: AddPaymentMethodRequest = {
        type: paymentType,
      };

      switch (paymentType) {
        case 'card':
          requestData.cardDetails = {
            number: formData.cardNumber.replace(/\s/g, ''),
            expiryMonth: parseInt(formData.expiryMonth),
            expiryYear: parseInt(formData.expiryYear),
            cvc: formData.cvc,
          };
          break;
        
        case 'bank_account':
          requestData.bankDetails = {
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            accountHolderName: formData.accountHolderName,
          };
          break;
        
        case 'mobile_money':
          requestData.mobileMoneyDetails = {
            phoneNumber: formData.phoneNumber,
            provider: formData.provider,
          };
          break;
      }

      await addPaymentMethod(requestData);
      navigation.goBack();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const renderCardForm = () => (
    <View style={styles.formSection}>
      <TextInput
        label="Card Number"
        value={formData.cardNumber}
        onChangeText={(text) => handleInputChange('cardNumber', formatCardNumber(text))}
        keyboardType="numeric"
        maxLength={19}
        style={styles.input}
        mode="outlined"
      />
      
      <View style={styles.row}>
        <TextInput
          label="Expiry Month"
          value={formData.expiryMonth}
          onChangeText={(text) => handleInputChange('expiryMonth', text)}
          keyboardType="numeric"
          maxLength={2}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          placeholder="MM"
        />
        <TextInput
          label="Expiry Year"
          value={formData.expiryYear}
          onChangeText={(text) => handleInputChange('expiryYear', text)}
          keyboardType="numeric"
          maxLength={4}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          placeholder="YYYY"
        />
      </View>
      
      <View style={styles.row}>
        <TextInput
          label="CVC"
          value={formData.cvc}
          onChangeText={(text) => handleInputChange('cvc', text)}
          keyboardType="numeric"
          maxLength={4}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          secureTextEntry
        />
        <View style={styles.halfInput} />
      </View>
      
      <TextInput
        label="Cardholder Name"
        value={formData.cardholderName}
        onChangeText={(text) => handleInputChange('cardholderName', text)}
        style={styles.input}
        mode="outlined"
        autoCapitalize="words"
      />
    </View>
  );

  const renderBankForm = () => (
    <View style={styles.formSection}>
      <TextInput
        label="Account Number"
        value={formData.accountNumber}
        onChangeText={(text) => handleInputChange('accountNumber', text)}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      
      <TextInput
        label="Routing Number"
        value={formData.routingNumber}
        onChangeText={(text) => handleInputChange('routingNumber', text)}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
      
      <TextInput
        label="Account Holder Name"
        value={formData.accountHolderName}
        onChangeText={(text) => handleInputChange('accountHolderName', text)}
        style={styles.input}
        mode="outlined"
        autoCapitalize="words"
      />
    </View>
  );

  const renderMobileMoneyForm = () => (
    <View style={styles.formSection}>
      <TextInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(text) => handleInputChange('phoneNumber', text)}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        placeholder="+256 700 000 000"
      />
      
      <View style={styles.providerSection}>
        <Text style={styles.providerLabel}>Provider:</Text>
        <View style={styles.providerChips}>
          <Chip
            selected={formData.provider === 'mpesa'}
            onPress={() => handleInputChange('provider', 'mpesa')}
            style={styles.providerChip}
          >
            M-Pesa
          </Chip>
          <Chip
            selected={formData.provider === 'airtelMoney'}
            onPress={() => handleInputChange('provider', 'airtelMoney')}
            style={styles.providerChip}
          >
            Airtel Money
          </Chip>
          <Chip
            selected={formData.provider === 'mtm'}
            onPress={() => handleInputChange('provider', 'mtm')}
            style={styles.providerChip}
          >
            MTN Mobile Money
          </Chip>
        </View>
      </View>
    </View>
  );

  const renderForm = () => {
    switch (paymentType) {
      case 'card':
        return renderCardForm();
      case 'bank_account':
        return renderBankForm();
      case 'mobile_money':
        return renderMobileMoneyForm();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Payment Method</Text>
          <Text style={styles.subtitle}>Choose your preferred payment method</Text>
        </View>

        {/* Payment Type Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Payment Method Type</Text>
            <SegmentedButtons
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as PaymentMethodType)}
              buttons={[
                {
                  value: 'card',
                  label: 'Card',
                  icon: 'credit-card',
                },
                {
                  value: 'bank_account',
                  label: 'Bank',
                  icon: 'bank',
                },
                {
                  value: 'mobile_money',
                  label: 'Mobile',
                  icon: 'cellphone',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Payment Details</Text>
            {renderForm()}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            Add Payment Method
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  formSection: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  providerSection: {
    marginTop: 8,
  },
  providerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  providerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerChip: {
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderRadius: 8,
  },
}); 