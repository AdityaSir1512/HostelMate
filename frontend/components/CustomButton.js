import React, { memo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { scaleFont, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function CustomButton({ title, onPress, loading = false, type = 'primary' }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const styles = createStyles(colors);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={loading}
        style={[styles.button, type === 'secondary' ? styles.secondary : null]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator color={type === 'secondary' ? colors.text : colors.onPrimary} />
        ) : (
          <Text
            style={[
              styles.title,
              { fontFamily, fontSize: scaleFont(14, fontScale) },
              type === 'secondary' ? styles.secondaryTitle : null,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      minHeight: 50,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    secondary: {
      backgroundColor: colors.secondaryButton,
      borderColor: colors.border,
      shadowOpacity: 0.08,
      elevation: 1,
    },
    title: {
      color: colors.onPrimary,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    secondaryTitle: {
      color: colors.secondaryText,
    },
  });
}

export default memo(CustomButton);
