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

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
