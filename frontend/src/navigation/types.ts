import { AuthStackParamList } from './AuthNavigator';
import { MainStackParamList, MainTabParamList } from './MainNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type { AuthStackParamList, MainStackParamList, MainTabParamList };

// Navigation prop types
export type AuthNavigationProp = {
  navigate: (screen: keyof AuthStackParamList, params?: any) => void;
  goBack: () => void;
};

export type MainNavigationProp = {
  navigate: (screen: keyof MainStackParamList, params?: any) => void;
  goBack: () => void;
};

export type TabNavigationProp = {
  navigate: (screen: keyof MainTabParamList, params?: any) => void;
}; 