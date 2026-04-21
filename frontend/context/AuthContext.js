import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { clearToken, clearUser, getToken, saveToken, saveUser } from '../services/storage';
import {
  getUserProfile,
  saveStudentRecord,
} from '../services/studentProfileService';
import { getAdminProfileByEmail } from '../services/adminAccessService';

export const AuthContext = createContext(null);

function isRemoteHttpUrl(value) {
  if (!value) {
    return false;
  }

  return /^https?:\/\//i.test(String(value).trim());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');

  const buildUserModel = useCallback((firebaseUser, profile = null) => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    role: profile?.role || 'student',
    enrollmentNo: profile?.enrollmentNo || '',
    hostelBuilding: profile?.hostelBuilding || '',
    roomNo: profile?.roomNo || '',
    department: profile?.department || '',
    gender: profile?.gender || '',
    fatherName: profile?.fatherName || '',
    fatherPhone: profile?.fatherPhone || '',
    motherName: profile?.motherName || '',
    motherPhone: profile?.motherPhone || '',
    profilePic: profile?.profilePic || firebaseUser.photoURL || '',
  }), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          let profile = await getUserProfile(firebaseUser.uid);

          if (!profile && selectedRole === 'admin') {
            profile = await getAdminProfileByEmail(firebaseUser.email);
            if (profile) {
              await saveStudentRecord(firebaseUser.uid, {
                ...profile,
                role: 'admin',
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || profile.displayName || '',
              });
            }
          }

          const userModel = buildUserModel(firebaseUser, profile);

          await saveToken(token);
          await saveUser(userModel);
          setUser(userModel);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, [buildUserModel]);

  useEffect(() => {
    async function warmSession() {
      try {
        await getToken();
      } catch (error) {
        console.error('Session warm-up failed:', error);
      }
    }

    warmSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (selectedRole === 'admin') {
      const approvedAdmin = await getAdminProfileByEmail(email);
      if (!approvedAdmin) {
        await signOut(auth);
        throw new Error('This email is not approved for admin access. Use a registered admin account.');
      }
    }

    return credentials.user;
  }, []);

  const signup = useCallback(async (name, email, password, profileData) => {
    const {
      role = selectedRole || 'student',
      enrollmentNo,
      profilePic = '',
      hostelBuilding = '',
      roomNo = '',
      department = '',
      gender = '',
      fatherName = '',
      fatherPhone = '',
      motherName = '',
      motherPhone = '',
    } = profileData;

    if (role === 'admin') {
      const approvedAdmin = await getAdminProfileByEmail(email);
      if (!approvedAdmin) {
        throw new Error('This email is not approved for admin access. Add it to adminProfiles before signing up.');
      }
    }

    const credentials = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(credentials.user, {
      displayName: name,
    });

    if (isRemoteHttpUrl(profilePic)) {
      try {
        await updateProfile(credentials.user, {
          photoURL: profilePic,
        });
      } catch (error) {
        console.warn('Skipping invalid signup photoURL for Firebase profile:', error);
      }
    }

    if (role === 'student') {
      await saveStudentRecord(credentials.user.uid, {
        role,
        displayName: name,
        email,
        enrollmentNo,
        hostelBuilding,
        roomNo,
        department,
        gender,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        profilePic: profilePic || '',
      });
    } else {
      await saveStudentRecord(credentials.user.uid, {
        role,
        displayName: name,
        email,
        enrollmentNo: enrollmentNo || '',
        hostelBuilding: '',
        roomNo: '',
        department: '',
        gender: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        profilePic: profilePic || '',
      });
    }

    const userModel = {
      uid: credentials.user.uid,
      email: credentials.user.email,
      displayName: name,
      photoURL: isRemoteHttpUrl(profilePic) ? profilePic : '',
      role,
      enrollmentNo: role === 'student' ? (enrollmentNo || '') : (enrollmentNo || ''),
      hostelBuilding: role === 'student' ? hostelBuilding : '',
      roomNo: role === 'student' ? roomNo : '',
      department: role === 'student' ? department : '',
      gender: role === 'student' ? gender : '',
      fatherName: role === 'student' ? fatherName : '',
      fatherPhone: role === 'student' ? fatherPhone : '',
      motherName: role === 'student' ? motherName : '',
      motherPhone: role === 'student' ? motherPhone : '',
      profilePic: role === 'student' ? (profilePic || '') : (profilePic || ''),
    };

    await saveToken(await credentials.user.getIdToken());
    await saveUser(userModel);
    setUser(userModel);

    return credentials.user;
  }, [selectedRole]);

  const updateStudentProfile = useCallback(async (updates) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No active user found.');
    }

    const nextProfile = {
      enrollmentNo: updates.enrollmentNo || user?.enrollmentNo || '',
      hostelBuilding: updates.hostelBuilding || user?.hostelBuilding || '',
      roomNo: updates.roomNo || user?.roomNo || '',
      role: updates.role || user?.role || 'student',
      department: updates.department || user?.department || '',
      gender: updates.gender || user?.gender || '',
      fatherName: updates.fatherName || user?.fatherName || '',
      fatherPhone: updates.fatherPhone || user?.fatherPhone || '',
      motherName: updates.motherName || user?.motherName || '',
      motherPhone: updates.motherPhone || user?.motherPhone || '',
      profilePic: updates.profilePic || user?.profilePic || '',
    };

    await saveStudentRecord(currentUser.uid, nextProfile);

    const merged = {
      ...(user || {}),
      ...nextProfile,
      displayName: updates.displayName || user?.displayName || currentUser.displayName || '',
      photoURL: updates.profilePic || user?.photoURL || currentUser.photoURL || '',
    };

    // Keep app UI immediately in sync, even if Firebase profile endpoint rejects the photo URL.
    setUser(merged);
    await saveUser(merged);

    if (Object.prototype.hasOwnProperty.call(updates, 'displayName') || Object.prototype.hasOwnProperty.call(updates, 'profilePic')) {
      await updateProfile(currentUser, {
        displayName: updates.displayName || currentUser.displayName || '',
      });

      if (isRemoteHttpUrl(updates.profilePic)) {
        try {
          await updateProfile(currentUser, {
            photoURL: updates.profilePic,
          });
        } catch (error) {
          console.warn('Skipping invalid profile photoURL for Firebase profile:', error);
        }
      }
    }
  }, [user]);

  const logout = useCallback(async () => {
    await signOut(auth);
    await clearToken();
    await clearUser();
    setSelectedRole('student');
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      selectedRole,
      setSelectedRole,
      login,
      signup,
      updateStudentProfile,
      logout,
    }),
    [authLoading, login, logout, selectedRole, signup, updateStudentProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
