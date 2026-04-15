import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatPercent } from '@/utils/format';

interface PercentagePillProps {
  value: number | null | undefined;
}

export function PercentagePill({ value }: PercentagePillProps) {
  const isPositive = (value ?? 0) >= 0;
  const isMissing = value === null || value === undefined || Number.isNaN(value);

  return (
    <View
      style={[
        styles.container,
        isMissing
          ? styles.muted
          : isPositive
            ? styles.positive
            : styles.negative,
      ]}>
      <Text style={styles.text}>{formatPercent(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 30,
    minWidth: 78,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  muted: {
    backgroundColor: colors.surfaceAlt,
  },
  negative: {
    backgroundColor: colors.dangerMuted,
  },
  positive: {
    backgroundColor: colors.successMuted,
  },
  text: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
  },
});
