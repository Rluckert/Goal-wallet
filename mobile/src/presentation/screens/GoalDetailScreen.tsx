import { useCallback, useRef, type ComponentRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { webViewMessageAdapter } from '../../infrastructure/webview/WebViewMessageAdapter';
import { makeDeposit, selectGoalById } from '../../infrastructure/redux/goalsSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { ThemeColors } from '../theme/colors';

// No auth system in this exam's scope — a fixed demo user/session is enough
// to exercise the INIT_SESSION handshake end to end.
const DEMO_USER = { id: 'u-1', name: 'Demo User' };

export interface GoalDetailScreenProps {
  goalId: string;
  onBack: () => void;
}

export function GoalDetailScreen({ goalId, onBack }: GoalDetailScreenProps) {
  const goal = useAppSelector(state => selectGoalById(state, goalId));
  const dispatch = useAppDispatch();
  const webViewRef = useRef<ComponentRef<typeof WebView>>(null);
  const sessionIdRef = useRef(`session-${Date.now()}`);
  const styles = useThemedStyles(createStyles);

  const sendInitSession = useCallback(() => {
    if (!goal) {
      return;
    }
    const payload = webViewMessageAdapter.buildInitSessionPayload(sessionIdRef.current, DEMO_USER, goal);
    webViewRef.current?.postMessage(payload);
  }, [goal]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const parsed = webViewMessageAdapter.parseIncoming(event.nativeEvent.data);
      if (parsed) {
        dispatch(makeDeposit({ goalId: parsed.goalId, amount: parsed.amount }));
      }
    },
    [dispatch],
  );

  if (!goal) {
    return (
      <View style={styles.container} testID="goal-detail-screen">
        <Text style={styles.backLink} onPress={onBack} testID="goal-detail-back">
          &larr; Back
        </Text>
        <Text>Goal not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="goal-detail-screen">
      <Text style={styles.backLink} onPress={onBack} testID="goal-detail-back">
        &larr; Back
      </Text>
      <WebView
        ref={webViewRef}
        // Android only — packaged as a local asset per web/README.md. iOS
        // loading (a different bundle-resource path) is a known limitation,
        // consistent with libreria/README.md's own iOS note.
        source={{ uri: 'file:///android_asset/webapp/index.html' }}
        originWhitelist={['*']}
        onLoadEnd={sendInitSession}
        onMessage={handleMessage}
        style={styles.webView}
        testID="goal-detail-webview"
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backLink: {
      padding: 16,
      fontSize: 16,
      color: colors.primary,
    },
    webView: {
      flex: 1,
    },
  });
}
