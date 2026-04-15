import Feather from '@expo/vector-icons/Feather';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Missing route' }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Feather color={colors.warning} name="alert-circle" size={28} />
          <Text style={styles.title}>That screen is not part of CoinPilot.</Text>
          <Text style={styles.description}>
            The route is missing or was removed. Jump back to the market dashboard.
          </Text>
          <Link href="/market" style={styles.link}>
            Open Market
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    maxWidth: 360,
    padding: 24,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  link: {
    color: colors.accent,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    marginTop: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
  },
});
