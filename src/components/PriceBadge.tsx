import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatCurrency } from '@/utils/format';

interface PriceBadgeProps {
  price: number | null | undefined;
  size?: 'lg' | 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
}

const SIZE_STYLES = {
  lg: {
    badge: 16,
    text: 30,
  },
  md: {
    badge: 12,
    text: 18,
  },
  sm: {
    badge: 8,
    text: 14,
  },
} as const;

export function PriceBadge({ price, size = 'md', style }: PriceBadgeProps) {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View style={[styles.container, { paddingHorizontal: sizeStyle.badge }, style]}>
      <Text style={[styles.text, { fontSize: sizeStyle.text }]}>{formatCurrency(price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentMuted,
    borderRadius: 999,
    paddingVertical: 8,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyBold,
  },
});
