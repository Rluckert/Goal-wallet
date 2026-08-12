import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '../../infrastructure/nativeLibrary/ConfirmDialog';
import { selectAllGoals, selectGoalProgress, type GoalDTO } from '../../infrastructure/redux/goalsSlice';
import { useAppSelector } from '../hooks/redux';
import { useThemeColors } from '../theme/useThemeColors';
import type { ThemeColors } from '../theme/colors';

export interface GoalListScreenProps {
  onSelectGoal: (goalId: string) => void;
}

export function GoalListScreen({ onSelectGoal }: GoalListScreenProps) {
  const goals = useAppSelector(selectAllGoals);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="goal-list-screen">
      <Text style={styles.title}>My Savings Goals</Text>
      <FlatList
        data={goals}
        keyExtractor={goal => goal.id}
        renderItem={({ item }) => <GoalCard goal={item} onSelectGoal={onSelectGoal} />}
        ListEmptyComponent={<Text style={styles.empty}>No goals yet.</Text>}
      />
    </View>
  );
}

function GoalCard({
  goal,
  onSelectGoal,
}: {
  goal: GoalDTO;
  onSelectGoal: (goalId: string) => void;
}) {
  const percent = selectGoalProgress(goal);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = async () => {
    const confirmed = await ConfirmDialog.show({
      title: goal.name,
      message: 'Would you like to make a deposit to this goal?',
    });
    if (confirmed) {
      onSelectGoal(goal.id);
    }
  };

  return (
    <View style={styles.card} testID={`goal-card-${goal.id}`}>
      <Text style={styles.goalName} onPress={handlePress} testID={`goal-card-${goal.id}-open`}>
        {goal.name}
      </Text>
      <Text style={styles.amounts}>
        ${goal.savedAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)} ({percent}%)
      </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 12,
      color: colors.text,
    },
    empty: {
      color: colors.textSecondary,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
    },
    goalName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    amounts: {
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 12,
    },
  });
}
