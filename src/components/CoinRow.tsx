import Feather from '@expo/vector-icons/Feather';
import { type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PercentagePill } from '@/components/PercentagePill';
import { PriceBadge } from '@/components/PriceBadge';
import { SurfaceCard } from '@/components/SurfaceCard';
import { type MarketCoin } from '@/api/models';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatCompactCurrency } from '@/utils/format';

interface CoinRowProps {
  accessory?: ReactNode;
  coin: MarketCoin;
  onPress?: () => void;
  subtitle?: string;
}

export function CoinRow({ accessory, coin, onPress, subtitle }: CoinRowProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <SurfaceCard style={[styles.card, pressed && styles.pressed]}>
          <View style={styles.row}>
            <Image source={{ uri: coin.image }} style={styles.image} />
            <View style={styles.left}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.name}>
                  {coin.name}
                </Text>
                {coin.marketCapRank ? (
                  <View style={styles.rankWrap}>
                    <Text style={styles.rank}>#{coin.marketCapRank}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.symbol}>
                {coin.symbol.toUpperCase()}
                {subtitle ? ` • ${subtitle}` : ''}
              </Text>
              <Text style={styles.meta}>
                Mkt cap {formatCompactCurrency(coin.marketCap)}
              </Text>
            </View>
            <View style={styles.right}>
              {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
              <PriceBadge price={coin.currentPrice} size="sm" />
              <PercentagePill value={coin.priceChangePercentage24h} />
              <View style={styles.chevron}>
                <Feather color={colors.textMuted} name="chevron-right" size={16} />
              </View>
            </View>
          </View>
        </SurfaceCard>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  accessory: {
    marginBottom: 4,
  },
  card: {
    marginBottom: 12,
  },
  chevron: {
    marginTop: 2,
  },
  image: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  name: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  rank: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
  },
  rankWrap: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
    justifyContent: 'center',
    minWidth: 108,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  symbol: {
    color: colors.textSecondary,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
  },
});
