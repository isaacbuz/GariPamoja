import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import authService from '@services/authService';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/index';
import { setToken, logout } from '@store/slices/authSlice';

interface AuthContextType {
  // This context mainly provides the Redux store
  // All auth logic is handled through Redux and hooks
}

const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Inner component that has access to Redux
function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check for stored tokens on app start
    const initializeAuth = async () => {
      try {
        const token = await authService.getToken();
        const refreshToken = await authService.getRefreshToken();
        
        if (token && refreshToken) {
          // Verify token is still valid
          // For now, just set the tokens
          dispatch(setToken({ token, refreshToken }));
          
          // TODO: Fetch user data from backend
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(logout());
      }
    };

    initializeAuth();

    // Setup axios interceptors
    authService.setupInterceptors(
      (token) => dispatch(setToken({ token })),
      () => dispatch(logout())
    );
  }, [dispatch]);

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Provider store={store}>
      <AuthContext.Provider value={{}}>
        <AuthInitializer>{children}</AuthInitializer>
      </AuthContext.Provider>
    </Provider>
  );
} 