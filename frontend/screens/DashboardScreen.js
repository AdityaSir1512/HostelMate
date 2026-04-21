import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { scaleFont } from '../constants/theme';

const quickRoutes = [
  { label: 'Complaint', screen: 'Complaint' },
  { label: 'Expense', screen: 'Expense' },
  { label: 'Mess Menu', screen: 'Mess Menu' },
  { label: 'In/Out', screen: 'In/Out' },
  { label: 'Assistant', screen: 'Chatbot' },
];

export default function DashboardScreen() {
  const { colors, fontFamily, fontScale } = useTheme();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const styles = createStyles(colors, fontScale);
  const [stats, setStats] = useState({ complaints: 0, expenses: 0, logs: 0 });

  const studentInfo = useMemo(
    () => ({
      enrollmentNo: user?.enrollmentNo || 'Not available',
      hostelBuilding: user?.hostelBuilding || 'Not available',
      roomNo: user?.roomNo || 'Not available',
    }),
    [user?.enrollmentNo, user?.hostelBuilding, user?.roomNo]
  );

  const loadStats = useCallback(async () => {
    try {
      const [complaintsRes, expensesRes, logsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/expenses'),
        api.get('/logs'),
      ]);

      setStats({
        complaints: complaintsRes.data.length,
        expenses: expensesRes.data.length,
        logs: logsRes.data.length,
      });
    } catch (error) {
      // Keep fallback values if backend is not reachable.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={[colors.heroGradientStart, colors.heroGradientEnd]} style={styles.hero}>
        <Text style={[styles.heroTitle, { fontFamily }]}>Hostel Dashboard</Text>
        <Text style={[styles.heroText, { fontFamily }]}>Track key hostel activities from one place.</Text>
      </LinearGradient>

      <View style={styles.studentCard}>
        <Image
          source={user?.profilePic ? { uri: user.profilePic } : require('../assets/icon.png')}
          style={styles.studentImage}
        />
        <View style={styles.studentDetails}>
          <Text style={[styles.studentHeading, { fontFamily }]}>Student Details</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Enrollment No: {studentInfo.enrollmentNo}</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Hostel Building: {studentInfo.hostelBuilding}</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Room No: {studentInfo.roomNo}</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Department: {user?.department || 'Not available'}</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Gender: {user?.gender || 'Not available'}</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Father: {user?.fatherName || 'Not available'} ({user?.fatherPhone || 'N/A'})</Text>
          <Text style={[styles.studentMeta, { fontFamily }]}>Mother: {user?.motherName || 'Not available'} ({user?.motherPhone || 'N/A'})</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { fontFamily }]}>{stats.complaints}</Text>
          <Text style={[styles.statLabel, { fontFamily }]}>Complaints</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { fontFamily }]}>{stats.expenses}</Text>
          <Text style={[styles.statLabel, { fontFamily }]}>Expenses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { fontFamily }]}>{stats.logs}</Text>
          <Text style={[styles.statLabel, { fontFamily }]}>In/Out Logs</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { fontFamily }]}>Quick Access</Text>
      {quickRoutes.map((route) => (
        <TouchableOpacity
          key={route.screen}
          style={styles.routeCard}
          onPress={() => navigation.navigate(route.screen)}
        >
          <Text style={[styles.routeTitle, { fontFamily }]}>{route.label}</Text>
          <Text style={[styles.routeSubtext, { fontFamily }]}>Open {route.label} module</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
    },
    hero: {
      borderRadius: 20,
      padding: spacing.lg,
    },
    heroTitle: {
      color: colors.onPrimary,
      fontSize: scaleFont(24, fontScale),
      fontWeight: '700',
    },
    heroText: {
      color: colors.accent,
      marginTop: 4,
    },
    studentCard: {
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    studentImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    studentDetails: {
      flex: 1,
    },
    studentHeading: {
      color: colors.text,
      fontSize: scaleFont(16, fontScale),
      fontWeight: '700',
      marginBottom: 4,
    },
    studentMeta: {
      color: colors.muted,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.md,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: scaleFont(24, fontScale),
      fontWeight: '700',
      color: colors.primary,
    },
    statLabel: {
      marginTop: 4,
      color: colors.muted,
      fontSize: scaleFont(12, fontScale),
    },
    sectionTitle: {
      marginVertical: spacing.sm,
      fontSize: scaleFont(18, fontScale),
      fontWeight: '700',
      color: colors.text,
    },
    routeCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    routeTitle: {
      color: colors.text,
      fontSize: scaleFont(16, fontScale),
      fontWeight: '700',
    },
    routeSubtext: {
      color: colors.muted,
      marginTop: 4,
    },
  });
}
