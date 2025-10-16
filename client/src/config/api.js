import { Platform } from 'react-native';

// Central API configuration
const SERVER_PORT = 5001;

const getApiBaseUrl = () => {
  if (__DEV__) {
    // For Android emulator
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${SERVER_PORT}/api`;
    }
    // For iOS simulator and web
    return `http://localhost:${SERVER_PORT}/api`;
  }
  return 'https://your-production-server.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
export { SERVER_PORT };