import React, { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { scaleFont, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function CustomInput({ label, error, style, ...props }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { fontFamily }]}>{label}</Text> : null}
      <TextInput
        style={[styles.input, { fontFamily, fontSize: scaleFont(14, fontScale) }, error ? styles.errorInput : null, style]}
        placeholderTextColor={colors.muted}
        {...props}
      />
      {error ? <Text style={[styles.errorText, { fontFamily }]}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: spacing.sm,
    },
    label: {
      color: colors.text,
      fontWeight: '600',
      fontSize: scaleFont(13, 1),
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    errorInput: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      marginTop: 4,
      fontSize: scaleFont(12, 1),
    },
  });
}

export default memo(CustomInput);
