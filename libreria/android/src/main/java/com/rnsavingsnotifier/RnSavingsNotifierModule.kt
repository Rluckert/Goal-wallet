package com.rnsavingsnotifier

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import java.text.NumberFormat
import java.text.ParseException
import java.util.Locale

class RnSavingsNotifierModule(reactContext: ReactApplicationContext) :
  NativeRnSavingsNotifierSpec(reactContext) {

  override fun notifyGoalCompleted(goalName: String) {
    // Toast must run on the UI thread; TurboModule methods aren't guaranteed to.
    UiThreadUtil.runOnUiThread {
      Toast.makeText(
        reactApplicationContext,
        "Goal completed: $goalName!",
        Toast.LENGTH_LONG
      ).show()
    }
  }

  override fun parseDepositAmount(rawAmount: String, promise: Promise) {
    val parsed: Double? = try {
      // Locale-aware parsing: handles "1.234,56" vs "1,234.56" correctly
      // depending on the device's locale, unlike a plain JS Number()/parseFloat().
      NumberFormat.getInstance(Locale.getDefault()).parse(rawAmount.trim())?.toDouble()
    } catch (e: ParseException) {
      null
    }

    if (parsed == null || parsed <= 0.0) {
      UiThreadUtil.runOnUiThread {
        Toast.makeText(
          reactApplicationContext,
          "Enter a valid amount greater than 0.",
          Toast.LENGTH_SHORT
        ).show()
      }
      promise.reject("INVALID_AMOUNT", "Amount must be a positive number, got: $rawAmount")
      return
    }

    triggerHapticFeedback()
    promise.resolve(parsed)
  }

  private fun triggerHapticFeedback() {
    val vibrator = reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
      ?: return
    if (vibrator.hasVibrator()) {
      vibrator.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
    }
  }

  companion object {
    const val NAME = NativeRnSavingsNotifierSpec.NAME
  }
}
