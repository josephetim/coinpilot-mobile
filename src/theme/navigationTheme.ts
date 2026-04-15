import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from '@/theme/colors';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.backgroundAlt,
    notification: colors.accent,
    primary: colors.accent,
    text: colors.textPrimary,
  },
};
