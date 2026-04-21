import React, { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { spacing } from '../constants/theme';
import { auth } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';
import { isAdminEmailAllowed } from '../services/adminAccessService';
import { scaleFont } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const { login, selectedRole } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      await loginSchema.validate(form, { abortEarly: false });

      if (selectedRole === 'admin') {
        const allowed = await isAdminEmailAllowed(form.email);
        if (!allowed) {
          throw new Error('This email is not approved for admin access. Use a registered admin account.');
        }
      }

      setLoading(true);
      await login(form.email.trim(), form.password);
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
        Alert.alert('Login failed', error.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.email.trim();

    if (!email) {
      Alert.alert('Reset password', 'Enter your email address first.');
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Reset email sent', 'Check your inbox for the password reset link.');
    } catch (error) {
      Alert.alert('Reset failed', error.message || 'Could not send reset email.');
    } finally {
      setResetLoading(false);
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
          <Text style={[styles.title, { fontFamily }]}>{selectedRole === 'admin' ? 'Admin Login' : 'Student Login'}</Text>
          <Text style={styles.subtitle}>
            {selectedRole === 'admin'
              ? 'Login to manage students and meal details'
              : 'Login to continue managing your hostel'}
          </Text>

          <View style={styles.card}>
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

            <CustomButton title="Login" onPress={handleSubmit} loading={loading} />
            <CustomButton
              type="secondary"
              title="Forgot Password?"
              onPress={handleForgotPassword}
              loading={resetLoading}
            />
            {selectedRole === 'admin' ? null : (
              <CustomButton
                type="secondary"
                title="Create Account"
                onPress={() => navigation.navigate('Signup')}
              />
            )}
            <CustomButton
              type="secondary"
              title="Change Role"
              onPress={() => navigation.navigate('RoleSelect')}
            />
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
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}
