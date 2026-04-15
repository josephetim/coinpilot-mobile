import { LinearGradient } from 'expo-linear-gradient';
import { type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

interface SurfaceCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function SurfaceCard({ children, style }: SurfaceCardProps) {
  return (
    <LinearGradient
      colors={['rgba(16, 32, 57, 0.98)', 'rgba(10, 21, 38, 0.98)']}
      style={[styles.card, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    gap: 12,
    padding: 18,
  },
});
