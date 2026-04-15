import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { Stack, useLocalSearchParams } from 'expo-router';

import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { PercentagePill } from '@/components/PercentagePill';
import { PriceBadge } from '@/components/PriceBadge';
import { ScreenShell } from '@/components/ScreenShell';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useCoinDetailQuery } from '@/features/market/queries';
import { WatchlistToggleButton } from '@/features/watchlist/components/WatchlistToggleButton';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import {
  formatCompactCurrency,
  formatCurrency,
  formatQuantity,
} from '@/utils/format';

const CHART_WIDTH = Dimensions.get('window').width - 72;

export default function CoinDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const detailQuery = useCoinDetailQuery(params.id);
  const coin = detailQuery.data;

  if (detailQuery.isLoading && !coin) {
    return (
      <ScreenShell>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.loadingWrap}>
            <LoadingSkeleton style={styles.heroSkeleton} />
            <LoadingSkeleton style={styles.chartSkeleton} />
            <LoadingSkeleton style={styles.summarySkeleton} />
          </View>
        </SafeAreaView>
      </ScreenShell>
    );
  }

  if (detailQuery.isError && !coin) {
    return (
      <ScreenShell>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.loadingWrap}>
            <EmptyState
              description={getErrorMessage(detailQuery.error)}
              icon="alert-circle"
              title="Coin detail unavailable"
            />
          </View>
        </SafeAreaView>
      </ScreenShell>
    );
  }

  if (!coin) {
    return null;
  }

  const chartData = coin.sparkline.map((value) => ({ value }));
  const chartSpacing =
    chartData.length > 1 ? Math.max((CHART_WIDTH - 28) / (chartData.length - 1), 2) : 20;

  return (
    <ScreenShell>
      <Stack.Screen options={{ title: coin.name }} />
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
          {detailQuery.error ? (
            <InfoBanner message={getErrorMessage(detailQuery.error)} tone="warning" />
          ) : null}

          <SurfaceCard>
            <View style={styles.heroHeader}>
              <View style={styles.identity}>
                <Text style={styles.name}>{coin.name}</Text>
                <Text style={styles.symbol}>{coin.symbol.toUpperCase()}</Text>
              </View>
              <WatchlistToggleButton id={coin.id} />
            </View>
            <PriceBadge price={coin.currentPrice} size="lg" />
            <PercentagePill value={coin.priceChangePercentage24h} />
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Market cap</Text>
                <Text style={styles.metricValue}>
                  {formatCompactCurrency(coin.marketCap)}
                </Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>24h volume</Text>
                <Text style={styles.metricValue}>
                  {formatCompactCurrency(coin.totalVolume)}
                </Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>24h high</Text>
                <Text style={styles.metricValue}>{formatCurrency(coin.high24h)}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>24h low</Text>
                <Text style={styles.metricValue}>{formatCurrency(coin.low24h)}</Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Circulating supply</Text>
                <Text style={styles.metricValue}>
                  {formatQuantity(coin.circulatingSupply)}
                </Text>
              </View>
              <View style={styles.metricBlock}>
                <Text style={styles.metricLabel}>Max supply</Text>
                <Text style={styles.metricValue}>{formatQuantity(coin.maxSupply)}</Text>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>7D Price Curve</Text>
            {chartData.length > 1 ? (
              <LineChart
                areaChart
                color={colors.accent}
                curved
                data={chartData}
                disableScroll
                endFillColor="rgba(61, 217, 184, 0.02)"
                endOpacity={0.05}
                height={220}
                hideAxesAndRules
                hideDataPoints
                initialSpacing={0}
                isAnimated
                maxValue={Math.max(...coin.sparkline) * 1.02}
                noOfSections={4}
                spacing={chartSpacing}
                startFillColor="rgba(61, 217, 184, 0.32)"
                startOpacity={0.32}
                thickness={3}
                xAxisLength={CHART_WIDTH}
              />
            ) : (
              <EmptyState
                description="Sparkline data is missing for this asset right now."
                icon="activity"
                title="No sparkline data"
              />
            )}
          </SurfaceCard>

          <SurfaceCard>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>
              {coin.summary ?? 'No descriptive summary is available from the selected public endpoint.'}
            </Text>
          </SurfaceCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chartSkeleton: {
    height: 240,
  },
  contentContainer: {
    gap: 18,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroSkeleton: {
    height: 180,
  },
  identity: {
    gap: 4,
  },
  loadingWrap: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  metricBlock: {
    flexBasis: '47%',
    gap: 4,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
  },
  metricValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 28,
  },
  safeArea: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.headingMedium,
    fontSize: 18,
  },
  summarySkeleton: {
    height: 160,
  },
  summaryText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
  },
  symbol: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
  },
});
