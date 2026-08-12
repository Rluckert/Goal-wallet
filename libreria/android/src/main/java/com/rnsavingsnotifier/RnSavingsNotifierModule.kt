package com.rnsavingsnotifier

import android.app.AlertDialog
import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

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

  override fun showConfirmDialog(title: String, message: String, promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity to show the confirm dialog on.")
      return
    }

    UiThreadUtil.runOnUiThread {
      AlertDialog.Builder(activity)
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton("Yes") { dialog, _ ->
          dialog.dismiss()
          promise.resolve(true)
        }
        .setNegativeButton("No") { dialog, _ ->
          dialog.dismiss()
          promise.resolve(false)
        }
        .setOnCancelListener {
          // Back button / tap outside — treated the same as "No".
          promise.resolve(false)
        }
        .show()
    }
  }

  companion object {
    const val NAME = NativeRnSavingsNotifierSpec.NAME
  }
}
