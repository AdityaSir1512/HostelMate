import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

export default function LoadingOverlay({ message = 'Please wait...' }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { fontFamily, fontSize: scaleFont(14, fontScale) }]}>{message}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    text: {
      marginTop: 12,
      color: colors.muted,
      fontWeight: '600',
    },
  });
}
