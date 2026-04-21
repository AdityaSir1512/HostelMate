import React, { useContext } from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppDrawer from './AppDrawer';
import AdminDrawer from './AdminDrawer';
import SplashScreen from '../screens/SplashScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, authLoading } = useContext(AuthContext);
  const { colors } = useTheme();

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {authLoading ? (
        <SplashScreen />
      ) : user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminHome" component={AdminDrawer} />
          ) : (
            <Stack.Screen name="Home" component={AppDrawer} />
          )}
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
