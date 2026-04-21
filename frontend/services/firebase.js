import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyB0rSiXpiuwiCDjsyNXP7dLjE8Jhfckd0M',
  authDomain: 'hostelmate-b7ee6.firebaseapp.com',
  projectId: 'hostelmate-b7ee6',
  storageBucket: 'hostelmate-b7ee6.firebasestorage.app',
  messagingSenderId: '247865784603',
  appId: '1:247865784603:web:4212ab675396fda24c7bbe',
  measurementId: "G-2N2HG27BDE"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // On fast refresh, Auth may already be initialized.
    auth = getAuth(app);
  }
}

export const db = getFirestore(app);
export { auth };
