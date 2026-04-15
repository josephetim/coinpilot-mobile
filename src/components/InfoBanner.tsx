import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface InfoBannerProps {
  message: string;
  tone?: 'info' | 'warning';
}

export function InfoBanner({ message, tone = 'info' }: InfoBannerProps) {
  return (
    <View
      style={[
        styles.container,
        tone === 'warning' ? styles.warning : styles.info,
      ]}>
      <Feather
        color={tone === 'warning' ? colors.warning : colors.info}
        name={tone === 'warning' ? 'alert-triangle' : 'info'}
        size={16}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  info: {
    backgroundColor: 'rgba(89, 168, 255, 0.10)',
  },
  text: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  warning: {
    backgroundColor: 'rgba(246, 181, 77, 0.10)',
  },
});
