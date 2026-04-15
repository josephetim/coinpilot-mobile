import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface SectionHeaderProps {
  actionLabel?: string;
  onActionPress?: () => void;
  subtitle?: string;
  title: string;
}

export function SectionHeader({
  actionLabel,
  onActionPress,
  subtitle,
  title,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
  },
});
