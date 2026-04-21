import { Platform } from 'react-native';

export const THEMES = {
  mono: {
    label: 'Black and White',
    isDark: true,
    colors: {
      primary: '#111111',
      primaryDark: '#000000',
      accent: '#f5f5f5',
      background: '#101010',
      surface: '#1b1b1b',
      text: '#f5f5f5',
      muted: '#b7b7b7',
      danger: '#ff6b6b',
      success: '#80ed99',
      border: '#2f2f2f',
      onPrimary: '#ffffff',
      heroGradientStart: '#000000',
      heroGradientEnd: '#2a2a2a',
      authGradientStart: '#000000',
      authGradientEnd: '#3a3a3a',
      botBubble: '#2a2a2a',
      secondaryButton: '#f0f0f0',
      secondaryText: '#111111',
    },
  },
  rose: {
    label: 'Red and Light Red',
    isDark: false,
    colors: {
      primary: '#b42318',
      primaryDark: '#7a1c12',
      accent: '#ffb4b4',
      background: '#fff5f5',
      surface: '#ffffff',
      text: '#3d0f0f',
      muted: '#8a4d4d',
      danger: '#8f1010',
      success: '#2f9e44',
      border: '#f3caca',
      onPrimary: '#ffffff',
      heroGradientStart: '#b42318',
      heroGradientEnd: '#ef6a61',
      authGradientStart: '#7a1c12',
      authGradientEnd: '#ef6a61',
      botBubble: '#ffe7e6',
      secondaryButton: '#ffd9d7',
      secondaryText: '#7a1c12',
    },
  },
  mint: {
    label: 'Green and Light Green',
    isDark: false,
    colors: {
      primary: '#2b8a3e',
      primaryDark: '#1f6b2f',
      accent: '#b7efc5',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#103b1b',
      muted: '#4f7a58',
      danger: '#c92a2a',
      success: '#2f9e44',
      border: '#ccead2',
      onPrimary: '#ffffff',
      heroGradientStart: '#2b8a3e',
      heroGradientEnd: '#74c69d',
      authGradientStart: '#1f6b2f',
      authGradientEnd: '#74c69d',
      botBubble: '#ddfbe6',
      secondaryButton: '#d9f7e0',
      secondaryText: '#1f6b2f',
    },
  },
};

export const DEFAULT_THEME_NAME = 'mono';

export const FONT_FAMILY_OPTIONS = [
  {
    value: 'system',
    label: 'System',
    family: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  {
    value: 'serif',
    label: 'Serif',
    family: Platform.select({ ios: 'Times New Roman', android: 'serif' }),
  },
  {
    value: 'mono',
    label: 'Mono',
    family: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  {
    value: 'rounded',
    label: 'Rounded',
    family: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-light' }),
  },
  {
    value: 'condensed',
    label: 'Condensed',
    family: Platform.select({ ios: 'Avenir Next Condensed', android: 'sans-serif-condensed' }),
  },
];

export const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', scale: 0.9 },
  { value: 'base', label: 'Base', scale: 1.0 },
  { value: 'medium', label: 'Medium', scale: 1.1 },
  { value: 'large', label: 'Large', scale: 1.2 },
  { value: 'xl', label: 'Extra Large', scale: 1.3 },
];

export const DEFAULT_FONT_FAMILY = FONT_FAMILY_OPTIONS[0].value;
export const DEFAULT_FONT_SIZE = FONT_SIZE_OPTIONS[1].value;

export const colors = THEMES[DEFAULT_THEME_NAME].colors;

export const themeOptions = Object.entries(THEMES).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function getThemeByName(name) {
  return THEMES[name] || THEMES[DEFAULT_THEME_NAME];
}

export function getFontFamilyByName(name) {
  return FONT_FAMILY_OPTIONS.find((option) => option.value === name) || FONT_FAMILY_OPTIONS[0];
}

export function getFontSizeByName(name) {
  return FONT_SIZE_OPTIONS.find((option) => option.value === name) || FONT_SIZE_OPTIONS[1];
}

export function scaleFont(size, fontScale = 1) {
  return Math.round(size * fontScale * 10) / 10;
}

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};
