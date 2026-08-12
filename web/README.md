# web/ — Savings Goal micro-app

Static HTML/TypeScript micro-app rendered inside the native app's `WebView` for the goal detail + deposit flow. No framework, no backend, no build server required at runtime.

**Per the exam spec, this folder is not evaluated and has no test suite.** The only requirement is that it emits/receives `postMessage` correctly — everything else here (styling, validation UX) is a means to make that demoable, not a graded deliverable.

## postMessage contract

This app talks to the native shell exclusively through `postMessage`, in both directions. The contract is defined in [`src/contract.ts`](./src/contract.ts) and is hand-mirrored (not imported) on the native side at `mobile/src/infrastructure/webview/contracts.ts`.

| Direction | Type | Payload | When |
|---|---|---|---|
| Native → Web | `INIT_SESSION` | `{ sessionId, goalId, userInfo: { id, name }, goal: { id, name, targetAmount, savedAmount } }` | Sent once, right after the WebView loads, with the goal snapshot to render. |
| Web → Native | `DEPOSIT_CONFIRMED` | `{ goalId, amount }` | Sent when the user submits a valid deposit amount on the form. |

Incoming messages are validated with a type guard (`isInitSessionMessage`) before anything is rendered — malformed or unrelated messages are silently ignored, not thrown.

Outgoing messages go through `window.ReactNativeWebView.postMessage(JSON.stringify(message))`. When `ReactNativeWebView` isn't present (see below), the app logs the message to the console instead of throwing, so it stays testable outside the native app.

## How the native app loads this

`mobile/`'s `WebView` loads this as **packaged local assets** (`file:///android_asset/...`), not a dev server — `dist/index.html` + `dist/bundle.js` get copied into `mobile/android/app/src/main/assets/webapp/` during the mobile build. That's why the build output is self-contained with no absolute URLs.

## Build

```bash
npm install
npm run build   # typecheck (tsc --noEmit) + bundle (esbuild) -> dist/bundle.js
```

## Testing standalone (without the native app)

```bash
npm run build
# then open dist/../index.html (which references dist/bundle.js) in a browser
```

Opening `index.html` directly in a desktop browser works for checking rendering and form validation: since there's no native `ReactNativeWebView`, outgoing messages are printed to the DevTools console instead of being sent anywhere. To see the initial render, paste this into the console to simulate the native handshake:

```js
window.postMessage(JSON.stringify({
  type: 'INIT_SESSION',
  payload: {
    sessionId: 'test-session',
    goalId: 'g-1',
    userInfo: { id: 'u-1', name: 'Test User' },
    goal: { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 },
  },
}), '*');
```
