import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_THEME_NAME,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  getFontFamilyByName,
  getFontSizeByName,
  getThemeByName,
  themeOptions,
} from '../constants/theme';

const THEME_STORAGE_KEY = 'hostelmate_theme';
const FONT_FAMILY_STORAGE_KEY = 'hostelmate_font_family';
const FONT_SIZE_STORAGE_KEY = 'hostelmate_font_size';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(DEFAULT_THEME_NAME);
  const [fontFamilyName, setFontFamilyName] = useState(DEFAULT_FONT_FAMILY);
  const [fontSizeName, setFontSizeName] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const [savedTheme, savedFontFamily, savedFontSize] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(FONT_FAMILY_STORAGE_KEY),
          AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY),
        ]);

        if (savedTheme) setThemeName(savedTheme);
        if (savedFontFamily) setFontFamilyName(savedFontFamily);
        if (savedFontSize) setFontSizeName(savedFontSize);
      } catch (error) {
        console.error('Unable to load saved theme:', error);
      }
    }

    loadSavedTheme();
  }, []);

  const setTheme = async (nextThemeName) => {
    setThemeName(nextThemeName);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeName);
    } catch (error) {
      console.error('Unable to save selected theme:', error);
    }
  };

  const setFontFamily = async (nextFontFamilyName) => {
    setFontFamilyName(nextFontFamilyName);

    try {
      await AsyncStorage.setItem(FONT_FAMILY_STORAGE_KEY, nextFontFamilyName);
    } catch (error) {
      console.error('Unable to save selected font family:', error);
    }
  };

  const setFontSize = async (nextFontSizeName) => {
    setFontSizeName(nextFontSizeName);

    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, nextFontSizeName);
    } catch (error) {
      console.error('Unable to save selected font size:', error);
    }
  };

  const themeConfig = useMemo(() => getThemeByName(themeName), [themeName]);
  const fontFamilyConfig = useMemo(() => getFontFamilyByName(fontFamilyName), [fontFamilyName]);
  const fontSizeConfig = useMemo(() => getFontSizeByName(fontSizeName), [fontSizeName]);

  const value = useMemo(
    () => ({
      themeName,
      setTheme,
      fontFamilyName,
      setFontFamily,
      fontSizeName,
      setFontSize,
      colors: themeConfig.colors,
      isDark: themeConfig.isDark,
      themeOptions,
      fontOptions: FONT_FAMILY_OPTIONS,
      fontSizeOptions: FONT_SIZE_OPTIONS,
      fontFamily: fontFamilyConfig.family,
      fontScale: fontSizeConfig.scale,
    }),
    [fontFamilyConfig.family, fontFamilyName, fontSizeConfig.scale, fontSizeName, themeConfig.colors, themeConfig.isDark, themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
