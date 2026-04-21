import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Pressable, StyleSheet, View } from 'react-native';
import AdminStudentsScreen from '../screens/AdminStudentsScreen';
import AdminMealsScreen from '../screens/AdminMealsScreen';
import AnnouncementScreen from '../screens/AnnouncementScreen';
import AdminProfileScreen from '../screens/AdminProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

const Drawer = createDrawerNavigator();

export default function AdminDrawer() {
  const { colors, fontFamily, fontScale } = useTheme();

  return (
    <Drawer.Navigator
      initialRouteName="Student Details"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.onPrimary,
        headerLeft: ({ tintColor }) => (
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
          >
            <View style={[styles.menuLine, { backgroundColor: tintColor || colors.onPrimary }]} />
            <View style={[styles.menuLine, { backgroundColor: tintColor || colors.onPrimary }]} />
            <View style={[styles.menuLine, { backgroundColor: tintColor || colors.onPrimary }]} />
          </Pressable>
        ),
        headerTitleStyle: {
          fontSize: scaleFont(20, fontScale),
          fontWeight: 'bold',
          color: colors.onPrimary,
          fontFamily,
        },
        drawerLabelStyle: {
          fontFamily,
          fontSize: scaleFont(14, fontScale),
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.surface,
        },
      })}
    >
      <Drawer.Screen
        name="Student Details"
        component={AdminStudentsScreen}
        options={{ title: 'Admin - Student Details', drawerLabel: 'Student Details' }}
      />
      <Drawer.Screen
        name="Meal Details"
        component={AdminMealsScreen}
        options={{ title: 'Admin - Meal Details', drawerLabel: 'Meal Details' }}
      />
      <Drawer.Screen
        name="Announcements"
        component={AnnouncementScreen}
        options={{ title: 'Admin - Announcements', drawerLabel: 'Announcements' }}
      />
      <Drawer.Screen
        name="Profile"
        component={AdminProfileScreen}
        options={{ title: 'Admin - Profile', drawerLabel: 'Profile' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Admin - Settings', drawerLabel: 'Settings' }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLine: {
    width: 20,
    height: 2,
    borderRadius: 2,
    marginVertical: 2,
  },
});
