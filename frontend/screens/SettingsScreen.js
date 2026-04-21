import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { scaleFont, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const {
    colors,
    fontFamily,
    fontScale,
    themeName,
    setTheme,
    themeOptions,
    fontFamilyName,
    setFontFamily,
    fontOptions,
    fontSizeName,
    setFontSize,
    fontSizeOptions,
  } = useTheme();
  const styles = createStyles(colors, fontScale);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { fontFamily }]}>Theme Settings</Text>
      <Text style={styles.subheading}>
        Choose a color theme. Font colors automatically adjust to match the selected palette.
      </Text>

      {themeOptions.map((option) => {
        const selected = option.value === themeName;

        return (
          <Pressable
            key={option.value}
            onPress={() => setTheme(option.value)}
            style={[styles.optionCard, selected ? styles.optionCardActive : null]}
          >
            <View style={styles.optionTopRow}>
              <Text style={styles.optionTitle}>{option.label}</Text>
              <View style={[styles.radio, selected ? styles.radioActive : null]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </View>
            <Text style={styles.optionDescription}>
              {option.value === 'mono'
                ? 'High-contrast black and white theme for low-light use.'
                : option.value === 'rose'
                  ? 'Warm red palette with soft light-red backgrounds.'
                  : 'Fresh green palette with light-green surfaces.'}
            </Text>
          </Pressable>
        );
      })}

      <Text style={styles.sectionHeading}>Font Style</Text>
      <Text style={styles.subheading}>Choose how the app text should look.</Text>
      {fontOptions.map((option) => {
        const selected = option.value === fontFamilyName;

        return (
          <Pressable
            key={option.value}
            onPress={() => setFontFamily(option.value)}
            style={[styles.optionCard, selected ? styles.optionCardActive : null]}
          >
            <View style={styles.optionTopRow}>
              <Text style={[styles.optionTitle, { fontFamily: option.family }]}>{option.label}</Text>
              <View style={[styles.radio, selected ? styles.radioActive : null]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </View>
            <Text style={[styles.optionDescription, { fontFamily: option.family }]}>Sample text preview for this font.</Text>
          </Pressable>
        );
      })}

      <Text style={styles.sectionHeading}>Font Size</Text>
      <Text style={styles.subheading}>Adjust text size across the app.</Text>
      {fontSizeOptions.map((option) => {
        const selected = option.value === fontSizeName;

        return (
          <Pressable
            key={option.value}
            onPress={() => setFontSize(option.value)}
            style={[styles.optionCard, selected ? styles.optionCardActive : null]}
          >
            <View style={styles.optionTopRow}>
              <Text style={styles.optionTitle}>{option.label}</Text>
              <View style={[styles.radio, selected ? styles.radioActive : null]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </View>
            <Text style={styles.optionDescription}>Preview scale: {Math.round(option.scale * 100)}%</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    heading: {
      fontSize: scaleFont(24, fontScale),
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    sectionHeading: {
      fontSize: scaleFont(18, fontScale),
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    subheading: {
      fontSize: scaleFont(14, fontScale),
      color: colors.muted,
      marginBottom: spacing.md,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    optionCardActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    optionTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    optionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: scaleFont(16, fontScale),
      flex: 1,
    },
    optionDescription: {
      color: colors.muted,
      fontSize: scaleFont(14, fontScale),
      marginTop: 6,
      lineHeight: scaleFont(20, fontScale),
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    radioActive: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  });
}
