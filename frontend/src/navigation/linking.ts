import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['garipamoja://', 'https://garipamoja.com'],
  
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          OTPVerification: 'verify-otp',
          ResetPassword: 'reset-password',
        },
      },
      Main: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Search: 'search',
              Bookings: 'bookings',
              Profile: 'profile',
            },
          },
          CarDetails: 'car/:carId',
          BookingConfirmation: 'booking/:bookingId',
        },
      },
    },
  },
}; 