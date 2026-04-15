import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface SearchInputProps {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SearchInput({ onChangeText, placeholder, value }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <Feather color={colors.textMuted} name="search" size={18} />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
      {value ? (
        <Pressable hitSlop={12} onPress={() => onChangeText('')}>
          <Feather color={colors.textMuted} name="x-circle" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: 14,
  },
});
