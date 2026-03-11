import type { SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_STORE_PREFIX = 'proofflow.supabase';

const webStorage = (): SupportedStorage => ({
  getItem: (key) => {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
});

const nativeStorage = (): SupportedStorage => ({
  getItem: (key) => SecureStore.getItemAsync(`${SECURE_STORE_PREFIX}.${key}`),
  setItem: (key, value) => SecureStore.setItemAsync(`${SECURE_STORE_PREFIX}.${key}`, value),
  removeItem: (key) => SecureStore.deleteItemAsync(`${SECURE_STORE_PREFIX}.${key}`),
});

export const supabaseStorage: SupportedStorage = Platform.OS === 'web' ? webStorage() : nativeStorage();
