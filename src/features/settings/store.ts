import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/app';

interface SettingsState {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

export function createSettingsStore(storage: StateStorage = AsyncStorage) {
  return create<SettingsState>()(
    persist(
      (set) => ({
        hapticsEnabled: true,
        setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      }),
      {
        name: STORAGE_KEYS.settings,
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const useSettingsStore = createSettingsStore();
