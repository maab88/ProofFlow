import { Platform } from 'react-native';

import { supabaseStorage } from '@/lib/supabase/storage';

const storageKeyPrefix = 'proofflow.closeout.';

export const closeoutStorage = {
  getItem: async (name: string) => {
    return supabaseStorage.getItem(`${storageKeyPrefix}${name}`);
  },
  setItem: async (name: string, value: string) => {
    await supabaseStorage.setItem(`${storageKeyPrefix}${name}`, value);
  },
  removeItem: async (name: string) => {
    await supabaseStorage.removeItem(`${storageKeyPrefix}${name}`);
  },
};

export function getCloseoutStorageLabel() {
  return Platform.OS === 'web' ? 'browser storage' : 'secure device storage';
}
