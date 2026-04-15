import Feather from '@expo/vector-icons/Feather';
import { useDeferredValue, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/client';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { ScreenShell } from '@/components/ScreenShell';
import { SearchInput } from '@/components/SearchInput';
import { SectionHeader } from '@/components/SectionHeader';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useSearchMarketsQuery } from '@/features/market/queries';
import { usePortfolioPricesQuery } from '@/features/portfolio/queries';
import { usePortfolioStore } from '@/features/portfolio/store';
import { calculatePortfolioValuation } from '@/features/portfolio/utils';
import { maybeHaptic } from '@/features/settings/actions';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  formatQuantity,
} from '@/utils/format';

export default function PortfolioScreen() {
  const holdings = usePortfolioStore((state) => state.holdings);
  const removeHolding = usePortfolioStore((state) => state.removeHolding);
  const upsertHolding = usePortfolioStore((state) => state.upsertHolding);
  const clearPortfolio = usePortfolioStore((state) => state.clear);
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [quantityValue, setQuantityValue] = useState('');
  const [costValue, setCostValue] = useState('');
  const deferredSearch = useDeferredValue(searchValue.trim());

  const searchQuery = useSearchMarketsQuery(deferredSearch);
  const selectedCoin =
    searchQuery.data.find((coin) => coin.id === selectedCoinId) ?? null;
  const pricesQuery = usePortfolioPricesQuery(holdings);
  const valuation = calculatePortfolioValuation(holdings, pricesQuery.data ?? {});

  const handleAddHolding = async () => {
    if (!selectedCoin) {
      Alert.alert('Select a coin', 'Choose a search result before adding a holding.');
      return;
    }

    const quantity = Number(quantityValue);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      Alert.alert('Invalid quantity', 'Enter a quantity greater than zero.');
      return;
    }

    const averageCost = costValue ? Number(costValue) : null;

    if (averageCost !== null && (!Number.isFinite(averageCost) || averageCost < 0)) {
      Alert.alert('Invalid cost basis', 'Average cost must be zero or greater.');
      return;
    }

    upsertHolding({
      averageCostUsd: averageCost,
      id: selectedCoin.id,
      image: selectedCoin.image,
      name: selectedCoin.name,
      quantity,
      symbol: selectedCoin.symbol,
    });

    await maybeHaptic('impact');
    setCostValue('');
    setQuantityValue('');
    setSearchValue('');
    setSelectedCoinId(null);
  };

  return (
    <ScreenShell>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <SectionHeader
            actionLabel={holdings.length > 0 ? 'Clear' : undefined}
            onActionPress={holdings.length > 0 ? clearPortfolio : undefined}
            subtitle="Manual holdings stay local and revalue against current public prices."
            title="Portfolio"
          />

          <SurfaceCard>
            <Text style={styles.summaryLabel}>Estimated value</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(valuation.summary.totalValueUsd)}
            </Text>
            <View style={styles.summaryMetrics}>
              <View style={styles.summaryMetric}>
                <Text style={styles.metricLabel}>Cost basis</Text>
                <Text style={styles.metricValue}>
                  {formatCompactCurrency(valuation.summary.totalCostBasisUsd)}
                </Text>
              </View>
              <View style={styles.summaryMetric}>
                <Text style={styles.metricLabel}>PnL</Text>
                <Text
                  style={[
                    styles.metricValue,
                    valuation.summary.totalPnlUsd >= 0
                      ? styles.positiveText
                      : styles.negativeText,
                  ]}>
                  {formatCompactCurrency(valuation.summary.totalPnlUsd)}
                </Text>
              </View>
              <View style={styles.summaryMetric}>
                <Text style={styles.metricLabel}>PnL %</Text>
                <Text
                  style={[
                    styles.metricValue,
                    (valuation.summary.totalPnlPercentage ?? 0) >= 0
                      ? styles.positiveText
                      : styles.negativeText,
                  ]}>
                  {formatPercent(valuation.summary.totalPnlPercentage)}
                </Text>
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader
              subtitle="Search, select, and add a position size with optional cost basis."
              title="Add Holding"
            />
            <SearchInput
              onChangeText={(value) => {
                setSearchValue(value);
                if (!value) {
                  setSelectedCoinId(null);
                }
              }}
              placeholder="Search coin to add"
              value={searchValue}
            />
            {searchQuery.error ? (
              <InfoBanner message={getErrorMessage(searchQuery.error)} tone="warning" />
            ) : null}
            {deferredSearch.length >= 2 && !selectedCoin ? (
              <View style={styles.searchResults}>
                {searchQuery.data.slice(0, 5).map((coin) => (
                  <Pressable
                    key={coin.id}
                    onPress={() => {
                      setSelectedCoinId(coin.id);
                      setSearchValue(coin.name);
                    }}
                    style={styles.searchResultRow}>
                    <Text style={styles.searchResultName}>{coin.name}</Text>
                    <Text style={styles.searchResultMeta}>
                      {coin.symbol.toUpperCase()} • {formatCurrency(coin.currentPrice)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {selectedCoin ? (
              <View style={styles.selectionCard}>
                <Text style={styles.selectionTitle}>Selected asset</Text>
                <Text style={styles.selectionName}>
                  {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                </Text>
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setQuantityValue}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  value={quantityValue}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Avg cost (USD)</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setCostValue}
                  placeholder="Optional"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  value={costValue}
                />
              </View>
            </View>

            <Pressable onPress={() => void handleAddHolding()} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add Holding</Text>
            </Pressable>
          </SurfaceCard>

          <SectionHeader
            subtitle="Current portfolio lines with live valuation math."
            title="Holdings"
          />

          {pricesQuery.error && holdings.length > 0 ? (
            <InfoBanner message={getErrorMessage(pricesQuery.error)} tone="warning" />
          ) : null}

          {valuation.items.length === 0 ? (
            <EmptyState
              description="Add a first holding to compute value, cost basis, and unrealized performance locally."
              icon="briefcase"
              title="No Holdings Yet"
            />
          ) : (
            valuation.items.map((item) => (
              <SurfaceCard key={item.id} style={styles.holdingCard}>
                <View style={styles.holdingHeader}>
                  <View style={styles.holdingIdentity}>
                    <Text style={styles.holdingName}>{item.name}</Text>
                    <Text style={styles.holdingSymbol}>{item.symbol.toUpperCase()}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Remove holding',
                        `Remove ${item.name} from your local portfolio?`,
                        [
                          { style: 'cancel', text: 'Cancel' },
                          {
                            style: 'destructive',
                            text: 'Remove',
                            onPress: () => removeHolding(item.id),
                          },
                        ],
                      );
                    }}
                    style={styles.removeButton}>
                    <Feather color={colors.danger} name="trash-2" size={16} />
                  </Pressable>
                </View>
                <View style={styles.holdingMetrics}>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Quantity</Text>
                    <Text style={styles.metricValue}>{formatQuantity(item.quantity)}</Text>
                  </View>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Current value</Text>
                    <Text style={styles.metricValue}>
                      {formatCurrency(item.currentValueUsd)}
                    </Text>
                  </View>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Avg cost</Text>
                    <Text style={styles.metricValue}>
                      {formatCurrency(item.averageCostUsd)}
                    </Text>
                  </View>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Unrealized PnL</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        (item.pnlUsd ?? 0) >= 0 ? styles.positiveText : styles.negativeText,
                      ]}>
                      {formatCurrency(item.pnlUsd)}
                    </Text>
                  </View>
                </View>
              </SurfaceCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 18,
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  holdingCard: {
    marginTop: -2,
  },
  holdingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holdingIdentity: {
    gap: 4,
  },
  holdingMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  holdingName: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  holdingSymbol: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  negativeText: {
    color: colors.danger,
  },
  positiveText: {
    color: colors.success,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    color: colors.background,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: colors.dangerMuted,
    borderRadius: 999,
    padding: 8,
  },
  safeArea: {
    flex: 1,
  },
  searchResultMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  searchResultName: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  searchResultRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchResults: {
    gap: 8,
  },
  selectionCard: {
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectionName: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  selectionTitle: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  summaryMetric: {
    flex: 1,
    gap: 4,
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 34,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
});
