import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenShell } from '@/components/ScreenShell';
import { SectionHeader } from '@/components/SectionHeader';
import { SurfaceCard } from '@/components/SurfaceCard';
import { clearCachedMarketData } from '@/features/settings/actions';
import { useApiHealthQuery } from '@/features/settings/queries';
import { useSettingsStore } from '@/features/settings/store';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const healthQuery = useApiHealthQuery();
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((state) => state.setHapticsEnabled);

  return (
    <ScreenShell>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          <SectionHeader
            subtitle="App behavior, cache controls, and public API details."
            title="Settings"
          />

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Haptics</Text>
                <Text style={styles.settingDescription}>
                  Use subtle tactile feedback on watchlist and portfolio actions.
                </Text>
              </View>
              <Switch
                onValueChange={setHapticsEnabled}
                thumbColor={hapticsEnabled ? colors.background : colors.textPrimary}
                trackColor={{
                  false: colors.surfaceAlt,
                  true: colors.accent,
                }}
                value={hapticsEnabled}
              />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>API Health</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>CoinPaprika public API</Text>
                <Text style={styles.settingDescription}>
                  Status: {healthQuery.isSuccess ? 'reachable' : healthQuery.isLoading ? 'checking' : 'unreachable'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  healthQuery.isSuccess ? styles.statusUp : styles.statusDown,
                ]}>
                <Text style={styles.statusText}>
                  {healthQuery.isSuccess ? 'UP' : healthQuery.isLoading ? '...' : 'DOWN'}
                </Text>
              </View>
            </View>
            {healthQuery.isError ? (
              <EmptyState
                description="The health probe failed. Cached data may still be available from recent successful queries."
                icon="wifi-off"
                title="API health check failed"
              />
            ) : null}
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Endpoint Decisions</Text>
            <Text style={styles.endpointLine}>`/global` for overview metrics</Text>
            <Text style={styles.endpointLine}>`/tickers` for ranked market lists and trending proxies</Text>
            <Text style={styles.endpointLine}>`/search?c=currencies` for coin lookup by name or symbol</Text>
            <Text style={styles.endpointLine}>`/tickers/{'{id}'}` for watchlist snapshots and portfolio valuation</Text>
            <Text style={styles.endpointLine}>`/coins/{'{id}'}` for detail metadata and summaries</Text>
            <Text style={styles.endpointLine}>`/coins/{'{id}'}/ohlcv/historical` for chart history with latest-candle fallback</Text>
            <Text style={styles.endpointLine}>`/global` as the settings health check probe</Text>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Cache</Text>
            <Text style={styles.settingDescription}>
              Market responses are persisted locally so the app can show last-successful data while offline.
            </Text>
            <Text
              onPress={() => {
                Alert.alert(
                  'Clear cached market data',
                  'This removes persisted query results but keeps your watchlist, portfolio, and settings.',
                  [
                    { style: 'cancel', text: 'Cancel' },
                    {
                      style: 'destructive',
                      text: 'Clear Cache',
                      onPress: () => void clearCachedMarketData(queryClient),
                    },
                  ],
                );
              }}
              style={styles.actionText}>
              Clear cached market data
            </Text>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Build</Text>
            <Text style={styles.buildText}>App name: CoinPilot</Text>
            <Text style={styles.buildText}>
              Version: {Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
            <Text style={styles.buildText}>Runtime: Expo Router + Zustand + TanStack Query</Text>
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  buildText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  contentContainer: {
    gap: 18,
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  endpointLine: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  safeArea: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.headingMedium,
    fontSize: 18,
  },
  settingCopy: {
    flex: 1,
    gap: 4,
  },
  settingDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statusDown: {
    backgroundColor: colors.dangerMuted,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  statusUp: {
    backgroundColor: colors.successMuted,
  },
});
