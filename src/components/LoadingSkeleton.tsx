import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/colors';

interface LoadingSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export function LoadingSkeleton({ style }: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 650,
          toValue: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 650,
          toValue: 0.35,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return <Animated.View style={[styles.block, { opacity }, style]} />;
}

export function CoinRowSkeleton() {
  return (
    <View style={styles.row}>
      <LoadingSkeleton style={styles.avatar} />
      <View style={styles.rowText}>
        <LoadingSkeleton style={styles.primaryText} />
        <LoadingSkeleton style={styles.secondaryText} />
      </View>
      <View style={styles.rowRight}>
        <LoadingSkeleton style={styles.price} />
        <LoadingSkeleton style={styles.pill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  block: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
  },
  pill: {
    borderRadius: 999,
    height: 26,
    width: 68,
  },
  price: {
    height: 16,
    width: 88,
  },
  primaryText: {
    height: 16,
    width: 128,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 'auto',
  },
  rowText: {
    gap: 8,
  },
  secondaryText: {
    height: 12,
    width: 84,
  },
});
