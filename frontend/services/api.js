import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = 5001;

function trimTrailingSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

function getExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  return hostUri ? String(hostUri).split(':')[0] : '';
}

function getDefaultBaseUrl() {
  const host = getExpoHost();

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${DEFAULT_API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  return `http://127.0.0.1:${DEFAULT_API_PORT}`;
}

const defaultBaseUrl = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL) || getDefaultBaseUrl();

export const API_BASE_URL = defaultBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function sendChatMessage(message, history = []) {
  const response = await api.post('/chat', { message, history });
  return response.data;
}

export default api;
