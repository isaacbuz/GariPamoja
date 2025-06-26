import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';

type OTPVerificationRouteParams = {
  OTPVerification: {
    type: 'email' | 'phone';
    contact: string;
  };
};

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<OTPVerificationRouteParams, 'OTPVerification'>>();
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();
  
  const { type = 'phone', contact = '' } = route.params || {};

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    clearError();
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 5 && newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    await verifyOTP(code, type);
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendOTP(type);
      // Reset timer
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedContact = () => {
    if (type === 'email') {
      const [username, domain] = contact.split('@');
      const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
      return `${maskedUsername}@${domain}`;
    } else {
      return contact.slice(0, 3) + '****' + contact.slice(-3);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify Your {type === 'email' ? 'Email' : 'Phone'}</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {maskedContact()}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => ref && (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : {},
                  error ? styles.otpInputError : {},
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                testID={`otp-input-${index}`}
              />
            ))}
          </View>

          {error && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={() => handleVerify()}
            loading={isLoading}
            disabled={isLoading || otp.some(digit => !digit)}
            style={styles.verifyButton}
            contentStyle={styles.verifyButtonContent}
          >
            Verify Code
          </Button>

          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend code in {formatTime(timer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn't receive the code? Check your {type === 'email' ? 'spam folder' : 'SMS inbox'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  header: {
    marginBottom: 48,
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
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  otpInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: 24,
  },
  verifyButtonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 