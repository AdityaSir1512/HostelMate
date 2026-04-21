import React, { useContext, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { signupSchema } from '../utils/validationSchemas';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

export default function SignupScreen({ navigation }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const { signup, selectedRole } = useContext(AuthContext);
  const isStudent = selectedRole !== 'admin';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    enrollmentNo: '',
    hostelBuilding: '',
    roomNo: '',
    department: '',
    gender: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    profilePic: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingHostel, setFetchingHostel] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow gallery permission to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setForm((prev) => ({ ...prev, profilePic: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      if (!isStudent) {
        throw new Error('Admin accounts are created internally. Please sign in with the approved admin account.');
      }

      await signupSchema.validate(form, { abortEarly: false });

      if (!form.hostelBuilding || !form.roomNo) {
        throw new Error('Please enter hostel building and room number.');
      }

      setLoading(true);
      await signup(
        form.name.trim(),
        form.email.trim(),
        form.password,
        {
          role: selectedRole,
          enrollmentNo: form.enrollmentNo.trim(),
          profilePic: form.profilePic,
          department: isStudent ? form.department.trim() : '',
          gender: isStudent ? form.gender : '',
          fatherName: isStudent ? form.fatherName.trim() : '',
          fatherPhone: isStudent ? form.fatherPhone.trim() : '',
          motherName: isStudent ? form.motherName.trim() : '',
          motherPhone: isStudent ? form.motherPhone.trim() : '',
        }
      );
    } catch (error) {
      if (error.name === 'ValidationError') {
        const nextErrors = {};
        error.inner.forEach((item) => {
          if (!nextErrors[item.path]) {
            nextErrors[item.path] = item.message;
          }
        });
        setErrors(nextErrors);
      } else {
        Alert.alert('Signup failed', error.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.authGradientStart, colors.authGradientEnd]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { fontFamily }]}>{isStudent ? 'Student Sign Up' : 'Admin Sign Up'}</Text>
          <Text style={styles.subtitle}>
            {isStudent ? 'Join HostelMate and stay organized' : 'Create an admin account to manage hostel data'}
          </Text>

          <View style={styles.card}>
            {form.profilePic ? (
              <Image source={{ uri: form.profilePic }} style={styles.previewImage} />
            ) : (
              <View style={styles.previewImagePlaceholder}>
                <Text style={styles.previewImageText}>No profile photo selected</Text>
              </View>
            )}
            <CustomButton type="secondary" title="Choose Profile Photo" onPress={handlePickImage} />

            <CustomInput
              label="Full Name"
              value={form.name}
              error={errors.name}
              onChangeText={(value) => handleChange('name', value)}
            />
            <CustomInput
              label="Email"
              value={form.email}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => handleChange('email', value)}
            />
            <CustomInput
              label="Password"
              value={form.password}
              error={errors.password}
              secureTextEntry
              onChangeText={(value) => handleChange('password', value)}
            />
            <CustomInput
              label="Enrollment Number"
              value={form.enrollmentNo}
              error={errors.enrollmentNo}
              autoCapitalize="characters"
              onChangeText={(value) => handleChange('enrollmentNo', value)}
            />

            {isStudent ? (
              <>
                <CustomInput
                  label="Department of Study"
                  value={form.department}
                  error={errors.department}
                  onChangeText={(value) => handleChange('department', value)}
                />

                <CustomInput
                  label="Hostel Building"
                  value={form.hostelBuilding}
                  error={errors.hostelBuilding}
                  onChangeText={(value) => handleChange('hostelBuilding', value)}
                />

                <CustomInput
                  label="Room Number"
                  value={form.roomNo}
                  error={errors.roomNo}
                  onChangeText={(value) => handleChange('roomNo', value)}
                />

                <Text style={styles.sectionLabel}>Gender</Text>
                <View style={styles.choiceRow}>
                  <ChoiceButton
                    label="Male"
                    active={form.gender === 'male'}
                    onPress={() => handleChange('gender', 'male')}
                    colors={colors}
                  />
                  <ChoiceButton
                    label="Female"
                    active={form.gender === 'female'}
                    onPress={() => handleChange('gender', 'female')}
                    colors={colors}
                  />
                </View>
                {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

                <CustomInput
                  label="Father Name"
                  value={form.fatherName}
                  error={errors.fatherName}
                  onChangeText={(value) => handleChange('fatherName', value)}
                />
                <CustomInput
                  label="Father Phone Number"
                  value={form.fatherPhone}
                  error={errors.fatherPhone}
                  keyboardType="phone-pad"
                  onChangeText={(value) => handleChange('fatherPhone', value)}
                />
                <CustomInput
                  label="Mother Name"
                  value={form.motherName}
                  error={errors.motherName}
                  onChangeText={(value) => handleChange('motherName', value)}
                />
                <CustomInput
                  label="Mother Phone Number"
                  value={form.motherPhone}
                  error={errors.motherPhone}
                  keyboardType="phone-pad"
                  onChangeText={(value) => handleChange('motherPhone', value)}
                />
              </>
            ) : null}

            <CustomButton title="Sign Up" onPress={handleSubmit} loading={loading} />
            <CustomButton
              type="secondary"
              title="Back to Login"
              onPress={() => navigation.goBack()}
            />
            <CustomButton type="secondary" title="Change Role" onPress={() => navigation.navigate('RoleSelect')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    title: {
      color: colors.onPrimary,
      fontSize: scaleFont(34, fontScale),
      fontWeight: '700',
    },
    subtitle: {
      color: colors.accent,
      marginTop: 6,
      marginBottom: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewImage: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignSelf: 'center',
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    previewImagePlaceholder: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignSelf: 'center',
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    previewImageText: {
      fontSize: 11,
      color: colors.muted,
      textAlign: 'center',
    },
    infoBox: {
      marginTop: spacing.sm,
      padding: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    infoText: {
      color: colors.text,
      marginTop: 2,
    },
    sectionLabel: {
      color: colors.text,
      fontWeight: '600',
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    choiceRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    errorText: {
      color: colors.danger,
      marginBottom: spacing.sm,
    },
  });
}

function ChoiceButton({ label, active, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.secondaryButton : colors.surface,
          alignItems: 'center',
        },
      ]}
    >
      <Text style={{ color: active ? colors.primaryDark : colors.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
