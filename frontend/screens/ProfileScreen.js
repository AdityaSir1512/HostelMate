import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

export default function ProfileScreen() {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const { user, logout, updateStudentProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    enrollmentNo: user?.enrollmentNo || '',
    hostelBuilding: user?.hostelBuilding || '',
    roomNo: user?.roomNo || '',
    department: user?.department || '',
    gender: user?.gender || '',
    fatherName: user?.fatherName || '',
    fatherPhone: user?.fatherPhone || '',
    motherName: user?.motherName || '',
    motherPhone: user?.motherPhone || '',
    profilePic: user?.profilePic || user?.photoURL || '',
  });

  useEffect(() => {
    setProfileForm({
      displayName: user?.displayName || '',
      enrollmentNo: user?.enrollmentNo || '',
      hostelBuilding: user?.hostelBuilding || '',
      roomNo: user?.roomNo || '',
      department: user?.department || '',
      gender: user?.gender || '',
      fatherName: user?.fatherName || '',
      fatherPhone: user?.fatherPhone || '',
      motherName: user?.motherName || '',
      motherPhone: user?.motherPhone || '',
      profilePic: user?.profilePic || user?.photoURL || '',
    });
  }, [
    user?.displayName,
    user?.enrollmentNo,
    user?.hostelBuilding,
    user?.photoURL,
    user?.profilePic,
    user?.roomNo,
    user?.department,
    user?.gender,
    user?.fatherName,
    user?.fatherPhone,
    user?.motherName,
    user?.motherPhone,
  ]);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || 'U';
    return source.slice(0, 1).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    if (!profileForm.enrollmentNo.trim()) {
      Alert.alert('Enrollment required', 'Please enter enrollment number.');
      return;
    }

    if (!profileForm.hostelBuilding || !profileForm.roomNo) {
      Alert.alert('Hostel details required', 'Please enter hostel building and room number.');
      return;
    }

    setSaving(true);
    try {
      await updateStudentProfile({
        displayName: profileForm.displayName.trim(),
        enrollmentNo: profileForm.enrollmentNo.trim(),
        hostelBuilding: profileForm.hostelBuilding,
        roomNo: profileForm.roomNo,
        department: profileForm.department.trim(),
        gender: profileForm.gender,
        fatherName: profileForm.fatherName.trim(),
        fatherPhone: profileForm.fatherPhone.trim(),
        motherName: profileForm.motherName.trim(),
        motherPhone: profileForm.motherPhone.trim(),
        profilePic: profileForm.profilePic,
      });
      Alert.alert('Saved', 'Profile details updated successfully.');
    } catch (error) {
      Alert.alert('Save failed', error.message || 'Could not update profile details.');
    } finally {
      setSaving(false);
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

        <Text style={[styles.name, { fontFamily }]}>{profileForm.displayName || 'Hostel Resident'}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Details</Text>
          <CustomInput
            label="Full Name"
            value={profileForm.displayName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, displayName: value }))}
          />
          <CustomInput
            label="Enrollment Number"
            value={profileForm.enrollmentNo}
            autoCapitalize="characters"
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, enrollmentNo: value }))}
          />
          <CustomInput
            label="Hostel Building"
            value={profileForm.hostelBuilding}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, hostelBuilding: value }))}
          />
          <CustomInput
            label="Room Number"
            value={profileForm.roomNo}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, roomNo: value }))}
          />
          <CustomInput
            label="Department of Study"
            value={profileForm.department}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, department: value }))}
          />
          <Text style={styles.sectionLabel}>Gender</Text>
          <View style={styles.choiceRow}>
            <GenderChoice
              label="Male"
              active={profileForm.gender === 'male'}
              onPress={() => setProfileForm((prev) => ({ ...prev, gender: 'male' }))}
              colors={colors}
            />
            <GenderChoice
              label="Female"
              active={profileForm.gender === 'female'}
              onPress={() => setProfileForm((prev) => ({ ...prev, gender: 'female' }))}
              colors={colors}
            />
          </View>
          <CustomInput
            label="Father Name"
            value={profileForm.fatherName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, fatherName: value }))}
          />
          <CustomInput
            label="Father Phone Number"
            value={profileForm.fatherPhone}
            keyboardType="phone-pad"
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, fatherPhone: value }))}
          />
          <CustomInput
            label="Mother Name"
            value={profileForm.motherName}
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, motherName: value }))}
          />
          <CustomInput
            label="Mother Phone Number"
            value={profileForm.motherPhone}
            keyboardType="phone-pad"
            onChangeText={(value) => setProfileForm((prev) => ({ ...prev, motherPhone: value }))}
          />
          <Text style={styles.cardText}>Hostel Building: {profileForm.hostelBuilding || 'Not entered yet'}</Text>
          <Text style={styles.cardText}>Room No: {profileForm.roomNo || 'Not entered yet'}</Text>
          <Text style={styles.cardText}>UID: {user?.uid || 'N/A'}</Text>
          <Text style={styles.cardText}>Secure session is stored via Expo SecureStore.</Text>
        </View>

        <CustomButton title="Save Student Profile" onPress={handleSaveProfile} loading={saving} />
        <Text style={styles.helper}>Go to Drawer {'>'} Settings to switch theme colors.</Text>

        <CustomButton title="Logout" onPress={handleLogout} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors, fontScale) {
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
      fontSize: scaleFont(36, fontScale),
      fontWeight: '700',
    },
    name: {
      textAlign: 'center',
      fontSize: scaleFont(22, fontScale),
      fontWeight: '700',
      color: colors.text,
    },
    email: {
      textAlign: 'center',
      marginTop: 4,
      color: colors.muted,
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    cardTitle: {
      color: colors.primary,
      fontSize: scaleFont(16, fontScale),
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    cardText: {
      color: colors.text,
      marginBottom: 6,
    },
    sectionLabel: {
      color: colors.text,
      fontWeight: '600',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    choiceRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    helper: {
      color: colors.muted,
      marginTop: spacing.md,
    },
  });
}

function GenderChoice({ label, active, onPress, colors }) {
  return (
    <CustomButton
      type={active ? 'primary' : 'secondary'}
      title={label}
      onPress={onPress}
    />
  );
}
