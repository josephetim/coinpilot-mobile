import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { maybeHaptic } from '@/features/settings/actions';
import { useWatchlistStore } from '@/features/watchlist/store';

interface WatchlistToggleButtonProps {
  id: string;
}

export function WatchlistToggleButton({ id }: WatchlistToggleButtonProps) {
  const toggle = useWatchlistStore((state) => state.toggle);
  const isWatched = useWatchlistStore((state) => state.ids.includes(id));

  return (
    <Pressable
      hitSlop={10}
      onPress={(event) => {
        event.stopPropagation();
        toggle(id);
        void maybeHaptic();
      }}
      style={[styles.button, isWatched ? styles.active : styles.inactive]}>
      <Feather
        color={isWatched ? colors.warning : colors.textSecondary}
        name={isWatched ? 'star' : 'star'}
        size={16}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: 'rgba(246, 181, 77, 0.14)',
  },
  button: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  inactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
});
