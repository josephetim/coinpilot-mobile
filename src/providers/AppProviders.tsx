import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { type PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QUERY_CACHE_KEY } from '@/constants/app';
import { ApiError } from '@/api/client';
import { CoinIdMigrationGate } from '@/features/migration/CoinIdMigrationGate';
import { navigationTheme } from '@/theme/navigationTheme';

export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: 'offlineFirst',
      refetchOnReconnect: true,
      retry(failureCount, error) {
        if (error instanceof ApiError && error.status === 429) {
          return failureCount < 1;
        }

        return failureCount < 2;
      },
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  key: QUERY_CACHE_KEY,
  storage: AsyncStorage,
  throttleTime: 500,
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={appQueryClient}
          persistOptions={{
            maxAge: 1000 * 60 * 60 * 24,
            persister: asyncStoragePersister,
          }}>
          <CoinIdMigrationGate />
          <ThemeProvider value={navigationTheme}>
            <StatusBar style="light" />
            {children}
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
