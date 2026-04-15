import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/client';
import { type MarketCoin } from '@/api/models';
import { CoinRow } from '@/components/CoinRow';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { CoinRowSkeleton } from '@/components/LoadingSkeleton';
import { ScreenShell } from '@/components/ScreenShell';
import { SearchInput } from '@/components/SearchInput';
import { SectionHeader } from '@/components/SectionHeader';
import { SurfaceCard } from '@/components/SurfaceCard';
import {
  useGlobalOverviewQuery,
  useMarketCoinsQuery,
  useSearchMarketsQuery,
  useTrendingCoinsQuery,
} from '@/features/market/queries';
import {
  applyMarketFilters,
  type MarketFilterKey,
  type MarketSortKey,
} from '@/features/market/utils';
import { WatchlistToggleButton } from '@/features/watchlist/components/WatchlistToggleButton';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatPercent,
} from '@/utils/format';

const FILTER_OPTIONS: Array<{ key: MarketFilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'gainers', label: 'Top Gainers' },
  { key: 'losers', label: 'Top Losers' },
];

const SORT_OPTIONS: Array<{ key: MarketSortKey; label: string }> = [
  { key: 'market_cap', label: 'Market Cap' },
  { key: 'price', label: 'Price' },
  { key: 'change_24h', label: '24h Change' },
];

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function MarketScreen() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [filterKey, setFilterKey] = useState<MarketFilterKey>('all');
  const [sortKey, setSortKey] = useState<MarketSortKey>('market_cap');
  const deferredSearch = useDeferredValue(searchValue.trim());

  const globalQuery = useGlobalOverviewQuery();
  const trendingQuery = useTrendingCoinsQuery();
  const marketQuery = useMarketCoinsQuery();
  const searchQuery = useSearchMarketsQuery(deferredSearch);

  const showSearch = deferredSearch.length >= 2;
  const marketCoins = marketQuery.data ?? [];
  const visibleCoins = showSearch
    ? searchQuery.data
    : applyMarketFilters(marketCoins, filterKey, sortKey);

  const showSkeletons =
    visibleCoins.length === 0 &&
    (showSearch ? searchQuery.isLoading : marketQuery.isLoading);
  const listData: Array<MarketCoin | string> = showSkeletons
    ? Array.from({ length: 7 }, (_, index) => `market-skeleton-${index}`)
    : visibleCoins;

  const listError = showSearch ? searchQuery.error : marketQuery.error;
  const errorMessage = listError ? getErrorMessage(listError) : null;

  return (
    <ScreenShell>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <FlashList<MarketCoin | string>
          contentContainerStyle={styles.contentContainer}
          data={listData}
          keyboardDismissMode="on-drag"
          keyExtractor={(item) => (typeof item === 'string' ? item : item.id)}
          ListEmptyComponent={
            !showSkeletons ? (
              <EmptyState
                actionLabel={showSearch ? 'Clear Search' : undefined}
                description={
                  showSearch
                    ? 'No market-ranked coins match that search. Try a full coin name or ticker symbol.'
                    : 'The market feed is empty right now. Pull to refresh or try again in a moment.'
                }
                icon={showSearch ? 'search' : 'activity'}
                onActionPress={showSearch ? () => setSearchValue('') : undefined}
                title={showSearch ? 'No Search Matches' : 'No Market Data'}
              />
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.headerWrap}>
              <View style={styles.heroRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.kicker}>PUBLIC CRYPTO INTELLIGENCE</Text>
                  <Text style={styles.heroTitle}>CoinPilot</Text>
                  <Text style={styles.heroSubtitle}>
                    Track market leaders, trending flows, watchlists, and your local portfolio from public CoinPaprika data.
                  </Text>
                </View>
              </View>

              <SearchInput
                onChangeText={setSearchValue}
                placeholder="Search by coin name or ticker"
                value={searchValue}
              />

              {deferredSearch.length === 1 ? (
                <InfoBanner message="Type at least 2 characters to search the broader market catalog." />
              ) : null}

              {errorMessage && visibleCoins.length > 0 ? (
                <InfoBanner message={errorMessage} tone="warning" />
              ) : null}

              {!showSearch ? (
                <>
                  <SectionHeader
                    subtitle="Live overview from CoinPaprika public endpoints"
                    title="Market Overview"
                  />
                  <View style={styles.metricsGrid}>
                    <SurfaceCard style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Total market cap</Text>
                      <Text style={styles.metricValue}>
                        {formatCompactCurrency(globalQuery.data?.totalMarketCapUsd)}
                      </Text>
                    </SurfaceCard>
                    <SurfaceCard style={styles.metricCard}>
                      <Text style={styles.metricLabel}>24h volume</Text>
                      <Text style={styles.metricValue}>
                        {formatCompactCurrency(globalQuery.data?.totalVolumeUsd)}
                      </Text>
                    </SurfaceCard>
                    <SurfaceCard style={styles.metricCard}>
                      <Text style={styles.metricLabel}>BTC dominance</Text>
                      <Text style={styles.metricValue}>
                        {formatPercent(globalQuery.data?.btcDominance)}
                      </Text>
                    </SurfaceCard>
                    <SurfaceCard style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Active coins</Text>
                      <Text style={styles.metricValue}>
                        {formatCompactNumber(globalQuery.data?.activeCryptocurrencies)}
                      </Text>
                    </SurfaceCard>
                  </View>

                  <SectionHeader
                    subtitle="High-liquidity movers ranked by recent 24h volume flow"
                    title="Trending Assets"
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                    contentContainerStyle={styles.trendingContent}>
                    {(trendingQuery.data ?? []).map((coin) => (
                      <Pressable
                        key={coin.id}
                        onPress={() =>
                          router.push({
                            params: { id: coin.id },
                            pathname: '/coin/[id]',
                          })
                        }>
                        <SurfaceCard style={styles.trendingCard}>
                          <View style={styles.trendingHeader}>
                            <Image source={{ uri: coin.image }} style={styles.trendingImage} />
                            <WatchlistToggleButton id={coin.id} />
                          </View>
                          <Text numberOfLines={1} style={styles.trendingName}>
                            {coin.name}
                          </Text>
                          <Text style={styles.trendingSymbol}>{coin.symbol.toUpperCase()}</Text>
                          <Text style={styles.trendingPrice}>
                            {formatCompactCurrency(coin.price)}
                          </Text>
                          <Text
                            style={[
                              styles.trendingChange,
                              (coin.priceChangePercentage24h ?? 0) >= 0
                                ? styles.positiveText
                                : styles.negativeText,
                            ]}>
                            {formatPercent(coin.priceChangePercentage24h)}
                          </Text>
                        </SurfaceCard>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <SectionHeader
                    subtitle="Dense market list with local sort and mover filters"
                    title="Market Board"
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}>
                    {FILTER_OPTIONS.map((option) => (
                      <FilterChip
                        active={filterKey === option.key}
                        key={option.key}
                        label={option.label}
                        onPress={() => {
                          setFilterKey(option.key);
                          if (option.key !== 'all') {
                            setSortKey('change_24h');
                          }
                        }}
                      />
                    ))}
                  </ScrollView>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}>
                    {SORT_OPTIONS.map((option) => (
                      <FilterChip
                        active={sortKey === option.key}
                        key={option.key}
                        label={option.label}
                        onPress={() => setSortKey(option.key)}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : (
                <SectionHeader
                  subtitle="Search results enriched with current market data"
                  title="Search Results"
                />
              )}
            </View>
          }
          onRefresh={() => {
            void marketQuery.refetch();
            void globalQuery.refetch();
            void trendingQuery.refetch();
            if (showSearch) {
              void searchQuery.refetch();
            }
          }}
          refreshing={
            marketQuery.isRefetching ||
            globalQuery.isRefetching ||
            trendingQuery.isRefetching ||
            searchQuery.isLoading
          }
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
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  chipRow: {
    gap: 10,
    paddingBottom: 4,
  },
  chipText: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.background,
  },
  contentContainer: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  headerWrap: {
    gap: 18,
    paddingBottom: 14,
    paddingTop: 10,
  },
  heroCopy: {
    gap: 6,
  },
  heroRow: {
    paddingTop: 4,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 420,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 34,
  },
  horizontalScroll: {
    marginHorizontal: -2,
  },
  kicker: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  metricCard: {
    flexBasis: '48.5%',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  negativeText: {
    color: colors.danger,
  },
  positiveText: {
    color: colors.success,
  },
  safeArea: {
    flex: 1,
  },
  trendingCard: {
    marginRight: 12,
    width: 182,
  },
  trendingChange: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  trendingContent: {
    paddingHorizontal: 2,
  },
  trendingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendingImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  trendingName: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  trendingPrice: {
    color: colors.textPrimary,
    fontFamily: fonts.headingMedium,
    fontSize: 18,
  },
  trendingSymbol: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
});
