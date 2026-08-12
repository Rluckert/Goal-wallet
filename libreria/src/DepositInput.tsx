import { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';
import { colors } from './theme/colors';

export interface DepositInputProps {
  /** Called with the native-validated numeric amount once the deposit is confirmed. */
  onConfirm: (amount: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Amount input + "Deposit" button. Validation and locale-aware parsing of
 * the raw text happen natively (see NativeRnSavingsNotifier.parseDepositAmount)
 * — this component only renders and reflects the result, it does not
 * duplicate the parsing logic in JS.
 */
export function DepositInput({ onConfirm, style }: DepositInputProps) {
  const [rawAmount, setRawAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const numericAmount =
        await NativeRnSavingsNotifier.parseDepositAmount(rawAmount);
      onConfirm(numericAmount);
      setRawAmount('');
    } catch {
      setError('Enter a valid amount greater than 0.');
    } finally {
      setIsSubmitting(false);
    }
  }, [rawAmount, onConfirm]);

  return (
    <View style={style} testID="deposit-input">
      <TextInput
        value={rawAmount}
        onChangeText={setRawAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        editable={!isSubmitting}
        style={styles.input}
        testID="deposit-input-field"
      />
      {error ? (
        <Text style={styles.error} testID="deposit-input-error">
          {error}
        </Text>
      ) : null}
      <Pressable
        onPress={handlePress}
        disabled={isSubmitting || rawAmount.trim() === ''}
        style={styles.button}
        testID="deposit-input-button"
      >
        <Text style={styles.buttonText}>Deposit</Text>
      </Pressable>
    </View>
  );
}

// Static (light-theme) colors — this component has no dark-mode variant
// today, unlike mobile/'s screens which pick light/dark via useColorScheme().
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: colors.light.error,
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.light.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
