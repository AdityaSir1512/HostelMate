import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function AdminProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, logout, updateStudentProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    profilePic: user?.profilePic || user?.photoURL || '',
  });

  useEffect(() => {
    setProfileForm({
      displayName: user?.displayName || '',
      profilePic: user?.profilePic || user?.photoURL || '',
    });
  }, [user?.displayName, user?.photoURL, user?.profilePic]);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || 'A';
    return source.slice(0, 1).toUpperCase();
  }, [user]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow gallery access for profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileForm((prev) => ({ ...prev, profilePic: result.assets[0].uri }));
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.displayName.trim()) {
      Alert.alert('Name required', 'Please enter admin name.');
      return;
    }

    setSaving(true);
    try {
      await updateStudentProfile({
        role: 'admin',
        displayName: profileForm.displayName.trim(),
        profilePic: profileForm.profilePic,
      });
      Alert.alert('Saved', 'Admin profile updated successfully.');
    } catch (error) {
      Alert.alert('Save failed', error.message || 'Could not update admin profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {profileForm.profilePic ? (
          <Image source={{ uri: profileForm.profilePic }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}

        <CustomButton type="secondary" title="Change Profile Photo" onPress={handlePickImage} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Profile</Text>
          <CustomInput
            label="Admin Name"
            value={profileForm.displayName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, displayName: value }))}
          />
          <Text style={styles.cardText}>Email: {user?.email || 'No email available'}</Text>
          <Text style={styles.cardText}>Role: Admin</Text>
          <Text style={styles.cardText}>UID: {user?.uid || 'N/A'}</Text>
        </View>

        <CustomButton title="Save Profile" onPress={handleSaveProfile} loading={saving} />
        <CustomButton title="Logout" onPress={handleLogout} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    scrollContent: {
      flexGrow: 1,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    avatarImage: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignSelf: 'center',
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    avatarText: {
      color: colors.onPrimary,
      fontSize: 36,
      fontWeight: '700',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    cardTitle: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    cardText: {
      color: colors.text,
      marginBottom: 6,
    },
  });
}
