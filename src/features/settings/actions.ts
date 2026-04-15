import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { type QueryClient } from '@tanstack/react-query';

import { QUERY_CACHE_KEY } from '@/constants/app';
import { useSettingsStore } from '@/features/settings/store';

export async function maybeHaptic(
  style: 'impact' | 'selection' = 'selection',
) {
  if (!useSettingsStore.getState().hapticsEnabled) {
    return;
  }

  try {
    if (style === 'impact') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics can fail on unsupported environments.
  }
}

export async function clearCachedMarketData(queryClient: QueryClient) {
  await AsyncStorage.removeItem(QUERY_CACHE_KEY);
  await queryClient.clear();
}
