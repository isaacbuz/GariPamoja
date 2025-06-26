import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import authService, { LoginCredentials, RegisterData } from '@services/authService';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  setToken,
  clearError
} from '@store/slices/authSlice';
import { RootState, AppDispatch } from '@store/index';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const authState = useSelector((state: RootState) => state.auth);

  // Initialize auth state on app start
  useEffect(() => {
    checkAuthStatus();
    
    // Setup axios interceptors
    authService.setupInterceptors(
      (token) => dispatch(setToken({ token })),
      () => dispatch(logoutAction())
    );
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getToken();
      if (token) {
        // TODO: Verify token with backend and get user data
        // For now, just check if token exists
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          dispatch(logoutAction());
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(credentials);
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }));
      
      // Navigate to main app
      navigation.navigate('Main');
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      Alert.alert('Login Failed', error.message);
    }
  }, [dispatch, navigation]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      dispatch(loginStart());
      const response = await authService.register(userData);
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
      }));
      
      // Navigate to OTP verification
      navigation.navigate('OTPVerification', { 
        type: 'phone',
        contact: userData.phone 
      });
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      Alert.alert('Registration Failed', error.message);
    }
  }, [dispatch, navigation]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      dispatch(logoutAction());
      navigation.navigate('Auth');
    }
  }, [dispatch, navigation]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authService.forgotPassword(email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [navigation]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, [navigation]);

  const verifyOTP = useCallback(async (otp: string, type: 'email' | 'phone' = 'phone') => {
    try {
      await authService.verifyOTP(otp, type);
      // Update user verification status
      dispatch(loginSuccess({
        ...authState,
        user: { ...authState.user!, isVerified: true }
      } as any));
      
      Alert.alert(
        'Success',
        'Your account has been verified successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    }
  }, [authState, dispatch, navigation]);

  const resendOTP = useCallback(async (type: 'email' | 'phone' = 'phone') => {
    try {
      await authService.resendOTP(type);
      Alert.alert('Success', 'OTP has been resent successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }, []);

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyOTP,
    resendOTP,
    clearError: () => dispatch(clearError()),
  };
};

// Hook for protected routes
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
    }
  }, [isAuthenticated, navigation]);

  return isAuthenticated;
}; 