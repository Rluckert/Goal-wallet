import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DepositInput } from '../DepositInput';
import NativeRnSavingsNotifier from '../NativeRnSavingsNotifier';

jest.mock('../NativeRnSavingsNotifier', () => ({
  __esModule: true,
  default: {
    notifyGoalCompleted: jest.fn(),
    parseDepositAmount: jest.fn(),
  },
}));

const mockedNative = NativeRnSavingsNotifier as jest.Mocked<
  typeof NativeRnSavingsNotifier
>;

describe('DepositInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onConfirm with the native-validated amount and clears the input', async () => {
    mockedNative.parseDepositAmount.mockResolvedValueOnce(150);
    const onConfirm = jest.fn();

    const { getByTestId } = render(<DepositInput onConfirm={onConfirm} />);

    fireEvent.changeText(getByTestId('deposit-input-field'), '150');
    fireEvent.press(getByTestId('deposit-input-button'));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(150));

    expect(mockedNative.parseDepositAmount).toHaveBeenCalledWith('150');
    expect(getByTestId('deposit-input-field').props.value).toBe('');
  });

  it('shows an inline error and does not call onConfirm when native rejects', async () => {
    mockedNative.parseDepositAmount.mockRejectedValueOnce(
      new Error('INVALID_AMOUNT')
    );
    const onConfirm = jest.fn();

    const { getByTestId, findByTestId } = render(
      <DepositInput onConfirm={onConfirm} />
    );

    fireEvent.changeText(getByTestId('deposit-input-field'), '-5');
    fireEvent.press(getByTestId('deposit-input-button'));

    const error = await findByTestId('deposit-input-error');
    expect(error.props.children).toBe('Enter a valid amount greater than 0.');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables the Deposit button while the amount field is empty', () => {
    const { getByTestId } = render(<DepositInput onConfirm={jest.fn()} />);

    expect(getByTestId('deposit-input-button').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
  });
});
