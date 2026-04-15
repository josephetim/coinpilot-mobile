import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import { applyCoinIdMapping } from '@/api/idResolver';
import { STORAGE_KEYS } from '@/constants/app';

interface WatchlistState {
  add: (id: string) => void;
  clear: () => void;
  ids: string[];
  isWatched: (id: string) => boolean;
  migrateIds: (mapping: Record<string, string>) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
}

export function createWatchlistStore(storage: StateStorage = AsyncStorage) {
  return create<WatchlistState>()(
    persist(
      (set, get) => ({
        add: (id) =>
          set((state) => ({
            ids: state.ids.includes(id) ? state.ids : [id, ...state.ids],
          })),
        clear: () => set({ ids: [] }),
        ids: [],
        isWatched: (id) => get().ids.includes(id),
        migrateIds: (mapping) =>
          set((state) => ({
            ids: applyCoinIdMapping(state.ids, mapping),
          })),
        remove: (id) =>
          set((state) => ({
            ids: state.ids.filter((item) => item !== id),
          })),
        toggle: (id) => {
          if (get().ids.includes(id)) {
            get().remove(id);
            return;
          }

          get().add(id);
        },
      }),
      {
        name: STORAGE_KEYS.watchlist,
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const useWatchlistStore = createWatchlistStore();
