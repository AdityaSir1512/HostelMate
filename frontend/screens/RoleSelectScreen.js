import React, { useContext } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { scaleFont } from '../constants/theme';

export default function RoleSelectScreen({ navigation }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const { selectedRole, setSelectedRole } = useContext(AuthContext);

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const goToSignup = () => {
    if (selectedRole === 'admin') {
      Alert.alert('Admin access', 'Admin accounts are created internally. Please sign in with the approved admin account.');
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('Signup');
  };

  return (
    <LinearGradient colors={[colors.authGradientStart, colors.authGradientEnd]} style={styles.container}>
      <View style={styles.inner}>
        <Text style={[styles.title, { fontFamily }]}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Select whether you are signing in as an admin or a student.</Text>

        <Pressable
          onPress={() => setSelectedRole('admin')}
          style={[styles.roleCard, selectedRole === 'admin' ? styles.roleCardActive : null]}
        >
          <Text style={[styles.roleTitle, { fontFamily }]}>Admin</Text>
          <Text style={styles.roleText}>Manage student details and meal details.</Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedRole('student')}
          style={[styles.roleCard, selectedRole === 'student' ? styles.roleCardActive : null]}
        >
          <Text style={[styles.roleTitle, { fontFamily }]}>Student</Text>
          <Text style={styles.roleText}>Create your account and access hostel services.</Text>
        </Pressable>

        <View style={styles.actions}>
          <CustomButton title={selectedRole === 'admin' ? 'Admin Sign In' : 'Sign In'} onPress={goToLogin} />
          {selectedRole === 'admin' ? null : (
            <CustomButton type="secondary" title="Create Account" onPress={goToSignup} />
          )}
        </View>
      </View>
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
    title: {
      color: colors.onPrimary,
      fontSize: scaleFont(34, fontScale),
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    subtitle: {
      color: colors.accent,
      marginBottom: spacing.lg,
    },
    roleCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    roleCardActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    roleTitle: {
      color: colors.text,
      fontSize: scaleFont(20, fontScale),
      fontWeight: '700',
      marginBottom: 4,
    },
    roleText: {
      color: colors.muted,
    },
    actions: {
      marginTop: spacing.lg,
    },
  });
}
