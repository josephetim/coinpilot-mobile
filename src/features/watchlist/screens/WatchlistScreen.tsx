import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/client';
import { type MarketCoin } from '@/api/models';
import { CoinRow } from '@/components/CoinRow';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { CoinRowSkeleton } from '@/components/LoadingSkeleton';
import { ScreenShell } from '@/components/ScreenShell';
import { SectionHeader } from '@/components/SectionHeader';
import { SurfaceCard } from '@/components/SurfaceCard';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WatchlistToggleButton } from '@/features/watchlist/components/WatchlistToggleButton';
import { useWatchlistMarketsQuery } from '@/features/watchlist/queries';
import { useWatchlistStore } from '@/features/watchlist/store';
import { formatCompactCurrency, formatPercent } from '@/utils/format';

export default function WatchlistScreen() {
  const router = useRouter();
  const ids = useWatchlistStore((state) => state.ids);
  const clearWatchlist = useWatchlistStore((state) => state.clear);
  const watchlistQuery = useWatchlistMarketsQuery(ids);
  const coins = watchlistQuery.data ?? [];

  if (ids.length === 0) {
    return (
      <ScreenShell>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.emptyWrap}>
            <SectionHeader
              subtitle="Pinned coins stay on-device and sync from public market data."
              title="Watchlist"
            />
            <EmptyState
              description="Star coins from the market board to build a fast personal watchlist."
              icon="star"
              title="No Watchlist Items"
            />
          </View>
        </SafeAreaView>
      </ScreenShell>
    );
  }

  const showSkeletons = watchlistQuery.isLoading && coins.length === 0;
  const listData: Array<MarketCoin | string> = showSkeletons
    ? Array.from({ length: 6 }, (_, index) => `watchlist-skeleton-${index}`)
    : coins;

  return (
    <ScreenShell>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <FlashList<MarketCoin | string>
          contentContainerStyle={styles.contentContainer}
          data={listData}
          keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <SectionHeader
                actionLabel="Clear"
                onActionPress={clearWatchlist}
                subtitle="Locally persisted coin set with live market snapshots."
                title="Watchlist"
              />
              {watchlistQuery.error && coins.length > 0 ? (
                <InfoBanner
                  message={getErrorMessage(watchlistQuery.error)}
                  tone="warning"
                />
              ) : null}
              <View style={styles.metricsRow}>
                <SurfaceCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Tracked assets</Text>
                  <Text style={styles.metricValue}>{coins.length}</Text>
                </SurfaceCard>
                <SurfaceCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Combined market cap</Text>
                  <Text style={styles.metricValue}>
                    {formatCompactCurrency(
                      coins.reduce((total, coin) => total + (coin.marketCap ?? 0), 0),
                    )}
                  </Text>
                </SurfaceCard>
                <SurfaceCard style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Average 24h move</Text>
                  <Text style={styles.metricValue}>
                    {formatPercent(
                      coins.length > 0
                        ? coins.reduce(
                            (total, coin) =>
                              total + (coin.priceChangePercentage24h ?? 0),
                            0,
                          ) / coins.length
                        : null,
                    )}
                  </Text>
                </SurfaceCard>
              </View>
            </View>
          }
          onRefresh={() => {
            void watchlistQuery.refetch();
          }}
          refreshing={watchlistQuery.isRefetching}
          renderItem={({ item }) => {
            if (typeof item === 'string') {
              return <CoinRowSkeleton />;
            }

            return (
              <CoinRow
                accessory={<WatchlistToggleButton id={item.id} />}
                coin={item}
                onPress={() =>
                  router.push({
                    params: { id: item.id },
                    pathname: '/coin/[id]',
                  })
                }
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  emptyWrap: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerWrap: {
    gap: 18,
    paddingBottom: 14,
    paddingTop: 10,
  },
  metricCard: {
    flexGrow: 1,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
  },
  metricsRow: {
    gap: 12,
  },
  safeArea: {
    flex: 1,
  },
});
