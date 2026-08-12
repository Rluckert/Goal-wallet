import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { createGoal } from '../../infrastructure/redux/goalsSlice';
import { useAppDispatch } from '../hooks/redux';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ThemeColors } from '../theme/colors';

export interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateGoalModal({ visible, onClose }: CreateGoalModalProps) {
  const dispatch = useAppDispatch();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setRawAmount('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // No client-side re-validation of name/amount here — CreateGoal
      // (application/) is the one place that rule lives. Duplicating it in
      // the modal risked the two drifting; instead, the real thrown message
      // (e.g. "CreateGoal: targetAmount must be greater than 0.") surfaces
      // directly, plain Number() parsing matching web/src/main.ts's own.
      await dispatch(createGoal({ name, targetAmount: Number(rawAmount) })).unwrap();
      reset();
      onClose();
    } catch (err) {
      // RTK's unwrap() throws the thunk's serialized error (a plain
      // {message, name, ...} shape, not an Error instance) on rejection.
      const message =
        err !== null && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Could not create the goal. Try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      testID="create-goal-modal"
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>New Savings Goal</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. New Bike"
            placeholderTextColor={styles.placeholder.color}
            style={styles.input}
            editable={!isSubmitting}
            testID="create-goal-name-input"
          />

          <Text style={styles.label}>Target amount</Text>
          <TextInput
            value={rawAmount}
            onChangeText={setRawAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={styles.placeholder.color}
            style={styles.input}
            editable={!isSubmitting}
            testID="create-goal-amount-input"
          />

          {error ? (
            <Text style={styles.error} testID="create-goal-error">
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isSubmitting}
              testID="create-goal-cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              style={styles.createButton}
              disabled={isSubmitting}
              testID="create-goal-submit"
            >
              <Text style={styles.createButtonText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    placeholder: {
      color: colors.textDisabled,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    error: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 12,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    createButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    createButtonText: {
      color: colors.textInverse,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
