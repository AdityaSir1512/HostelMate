import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

export default function SplashScreen() {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);

  return (
    <LinearGradient colors={[colors.heroGradientStart, colors.heroGradientEnd]} style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={[styles.logoText, { fontFamily }]}>HM</Text>
      </View>
        <Text style={[styles.title, { fontFamily }]}>HostelMate</Text>
      <Text style={styles.subtitle}>Manage hostel life smarter</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </LinearGradient>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logoCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      color: colors.onPrimary,
      fontSize: scaleFont(30, fontScale),
      fontWeight: '700',
    },
    title: {
      marginTop: 18,
      fontSize: scaleFont(30, fontScale),
      fontWeight: '700',
      color: colors.onPrimary,
    },
    subtitle: {
      marginTop: 8,
      color: colors.accent,
    },
    loader: {
      marginTop: 28,
    },
  });
}
