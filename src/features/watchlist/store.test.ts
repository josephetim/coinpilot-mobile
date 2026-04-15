import { STORAGE_KEYS } from '@/constants/app';
import { createWatchlistStore } from '@/features/watchlist/store';

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    backing: store,
    storage: {
      getItem: (key: string) => store.get(key) ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
  };
}

describe('watchlist persistence', () => {
  it('toggles ids and writes persisted state', async () => {
    const memory = createMemoryStorage();
    const store = createWatchlistStore(memory.storage);

    store.getState().toggle('bitcoin');
    store.getState().toggle('ethereum');

    expect(store.getState().ids).toEqual(['ethereum', 'bitcoin']);

    const raw = memory.backing.get(STORAGE_KEYS.watchlist);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw ?? '{}')).toEqual({
      state: {
        ids: ['ethereum', 'bitcoin'],
      },
      version: 0,
    });
  });
});
