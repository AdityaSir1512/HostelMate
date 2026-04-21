import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'hostelmate_token';
const USER_KEY = 'hostelmate_user';

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveUser(user) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const user = await AsyncStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function setCache(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getCache(key) {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}
