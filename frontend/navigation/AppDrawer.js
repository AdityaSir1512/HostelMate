import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Pressable, StyleSheet, View } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import AnnouncementScreen from '../screens/AnnouncementScreen';
import ComplaintScreen from '../screens/ComplaintScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import MessMenuScreen from '../screens/MessMenuScreen';
import InOutLogScreen from '../screens/InOutLogScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  const { colors, fontFamily, fontScale } = useTheme();

  return (
    <Drawer.Navigator
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
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'HostelMate',
          drawerLabel: 'Dashboard'
        }}
      />
      <Drawer.Screen 
        name="Complaint" 
        component={ComplaintScreen}
        options={{ 
          title: 'HostelMate - Complaints',
          drawerLabel: 'Complaint'
        }}
      />
      <Drawer.Screen 
        name="Announcements" 
        component={AnnouncementScreen}
        options={{ 
          title: 'HostelMate - Announcements',
          drawerLabel: 'Announcements'
        }}
      />
      <Drawer.Screen 
        name="Expense" 
        component={ExpenseScreen}
        options={{ 
          title: 'HostelMate - Expenses',
          drawerLabel: 'Expense'
        }}
      />
      <Drawer.Screen 
        name="Mess Menu" 
        component={MessMenuScreen}
        options={{ 
          title: 'HostelMate - Mess Menu',
          drawerLabel: 'Mess Menu'
        }}
      />
      <Drawer.Screen 
        name="In/Out" 
        component={InOutLogScreen}
        options={{ 
          title: 'HostelMate - In/Out Log',
          drawerLabel: 'In/Out'
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'HostelMate - Profile',
          drawerLabel: 'Profile'
        }}
      />
      <Drawer.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{ 
          title: 'HostelMate - Assistant',
          drawerLabel: 'Chatbot'
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'HostelMate - Settings',
          drawerLabel: 'Settings',
        }}
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
