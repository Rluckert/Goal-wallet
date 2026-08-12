import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Fire-and-forget: shows a native local confirmation (Toast on Android)
   * when a savings goal reaches 100%. No return value expected by callers.
   */
  notifyGoalCompleted(goalName: string): void;

  /**
   * Shows a native confirmation dialog (AlertDialog on Android) with the
   * given title/message and Yes/No buttons. Resolves true on "Yes", false
   * on "No" or on dismissal (back button / tap outside). Two plain string
   * params rather than a {title, message} object — mirrors the primitive
   * params every other method here already uses, keeping this a proven
   * Codegen shape rather than untested territory for this project.
   */
  showConfirmDialog(title: string, message: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RnSavingsNotifier');
