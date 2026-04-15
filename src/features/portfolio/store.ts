import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/app';
import {
  type PortfolioHolding,
  upsertHolding,
} from '@/features/portfolio/utils';

interface PortfolioState {
  clear: () => void;
  holdings: PortfolioHolding[];
  migrateIds: (mapping: Record<string, string>) => void;
  removeHolding: (id: string) => void;
  upsertHolding: (holding: PortfolioHolding) => void;
}

function mergeMigratedHoldings(
  holdings: PortfolioHolding[],
  mapping: Record<string, string>,
) {
  return holdings.reduce<PortfolioHolding[]>((accumulator, holding) => {
    const migratedHolding = {
      ...holding,
      id: mapping[holding.id] ?? holding.id,
    };

    return upsertHolding(accumulator, migratedHolding);
  }, []);
}

export function createPortfolioStore(storage: StateStorage = AsyncStorage) {
  return create<PortfolioState>()(
    persist(
      (set) => ({
        clear: () => set({ holdings: [] }),
        holdings: [],
        migrateIds: (mapping) =>
          set((state) => ({
            holdings: mergeMigratedHoldings(state.holdings, mapping),
          })),
        removeHolding: (id) =>
          set((state) => ({
            holdings: state.holdings.filter((holding) => holding.id !== id),
          })),
        upsertHolding: (holding) =>
          set((state) => ({
            holdings: upsertHolding(state.holdings, holding),
          })),
      }),
      {
        name: STORAGE_KEYS.portfolio,
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const usePortfolioStore = createPortfolioStore();
