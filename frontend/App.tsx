import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from '@contexts/AuthContext';
import RootNavigator from '@navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
