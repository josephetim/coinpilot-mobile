import { LinearGradient } from 'expo-linear-gradient';
import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

export function ScreenShell({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.backgroundTop, colors.backgroundAlt, colors.background]}
        end={{ x: 0.9, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orb, styles.orbPrimary]} />
      <View style={[styles.orb, styles.orbSecondary]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  orb: {
    borderRadius: 999,
    position: 'absolute',
  },
  orbPrimary: {
    backgroundColor: 'rgba(61, 217, 184, 0.08)',
    height: 240,
    right: -40,
    top: -30,
    width: 240,
  },
  orbSecondary: {
    backgroundColor: 'rgba(89, 168, 255, 0.08)',
    bottom: 140,
    height: 180,
    left: -60,
    width: 180,
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
