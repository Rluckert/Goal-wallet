import { FlatList, StyleSheet, Text, View } from 'react-native';
import { DepositInput } from '../../infrastructure/nativeLibrary/DepositInput';
import {
  makeDeposit,
  selectAllGoals,
  selectGoalProgress,
  type GoalDTO,
} from '../../infrastructure/redux/goalsSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';

export interface GoalListScreenProps {
  onSelectGoal: (goalId: string) => void;
}

export function GoalListScreen({ onSelectGoal }: GoalListScreenProps) {
  const goals = useAppSelector(selectAllGoals);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container} testID="goal-list-screen">
      <Text style={styles.title}>My Savings Goals</Text>
      <FlatList
        data={goals}
        keyExtractor={goal => goal.id}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            onOpenDetail={() => onSelectGoal(item.id)}
            onDeposit={amount => dispatch(makeDeposit({ goalId: item.id, amount }))}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No goals yet.</Text>}
      />
    </View>
  );
}

function GoalCard({
  goal,
  onOpenDetail,
  onDeposit,
}: {
  goal: GoalDTO;
  onOpenDetail: () => void;
  onDeposit: (amount: number) => void;
}) {
  const percent = selectGoalProgress(goal);

  return (
    <View style={styles.card} testID={`goal-card-${goal.id}`}>
      <Text style={styles.goalName} onPress={onOpenDetail} testID={`goal-card-${goal.id}-open`}>
        {goal.name}
      </Text>
      <Text style={styles.amounts}>
        ${goal.savedAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)} ({percent}%)
      </Text>
      <DepositInput onConfirm={onDeposit} style={styles.depositInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  empty: {
    color: '#6b7280',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
  },
  amounts: {
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
  },
  depositInput: {
    marginTop: 4,
  },
});
