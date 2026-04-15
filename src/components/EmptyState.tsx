import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SurfaceCard } from '@/components/SurfaceCard';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface EmptyStateProps {
  actionLabel?: string;
  description: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  onActionPress?: () => void;
  title: string;
}

export function EmptyState({
  actionLabel,
  description,
  icon = 'inbox',
  onActionPress,
  title,
}: EmptyStateProps) {
  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Feather color={colors.accent} name={icon} size={20} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} style={styles.button}>
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  card: {
    marginTop: 12,
  },
  content: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 18,
    textAlign: 'center',
  },
});
