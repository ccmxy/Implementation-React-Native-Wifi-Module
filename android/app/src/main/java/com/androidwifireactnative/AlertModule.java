package com.androidwifireactnative;
/*Modified version of RNSimpleAlertDialogModule by lucas ferreira
https://github.com/lucasferreira/react-native-simpledialog-android/blob/master/src/main/java/com/burnweb/rnsimplealertdialog/RNSimpleAlertDialogModule.java*/
import android.util.Log;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.text.InputType;
import android.widget.Toast;
import android.widget.EditText;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.Map;
import java.util.HashMap;

public class AlertModule extends ReactContextBaseJavaModule {

    private static final String TAG = AlertModule.class.getSimpleName();
    private static final String POSITIVE_BUTTON_KEY = "POSITIVE_BUTTON";
    private static final String NEGATIVE_BUTTON_KEY = "NEGATIVE_BUTTON";
    private static final String NEUTRAL_BUTTON_KEY = "NEUTRAL_BUTTON";

    private Activity mActivity = null;

    public AlertModule(ReactApplicationContext reactContext, Activity mActivity) {
      super(reactContext);

      this.mActivity = mActivity;
    }

    @Override
    public String getName() {
      return "AlertModule";
    }

    @Override
    public Map<String, Object> getConstants() {
      final Map<String, Object> constants = new HashMap<>();
      constants.put(POSITIVE_BUTTON_KEY, POSITIVE_BUTTON_KEY);
      constants.put(NEGATIVE_BUTTON_KEY, NEGATIVE_BUTTON_KEY);
      constants.put(NEUTRAL_BUTTON_KEY, NEUTRAL_BUTTON_KEY);
      return constants;
    }

    @ReactMethod
    public void alert(final String title, final String message, final ReadableArray buttonConfig, final boolean addPassword, final Callback buttonCallback) {
      AlertDialog.Builder builder = new AlertDialog.Builder(this.mActivity);

      if(title != null) builder.setTitle(title);
      if(message != null) builder.setMessage(message);
        final EditText passwordInput = new EditText(this.mActivity);
        passwordInput.setHint("Password");
        passwordInput.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        if(addPassword){
        builder.setView(passwordInput);
      }

      if(buttonConfig != null && buttonConfig.size() > 0) {
        for (int i = 0; i<buttonConfig.size(); i++) {
          ReadableMap button = buttonConfig.getMap(i);
          if(button != null && button.hasKey("type") && button.hasKey("text")) {
            switch(button.getString("type")) {
              case NEGATIVE_BUTTON_KEY:
                builder.setNegativeButton(button.getString("text"), new DialogInterface.OnClickListener() {
                   public void onClick(DialogInterface dialog, int id) {
                   }
                });
                break;
              case NEUTRAL_BUTTON_KEY:
                builder.setNeutralButton(button.getString("text"), new DialogInterface.OnClickListener() {
                   public void onClick(DialogInterface dialog, int id) {
                   }
                });
                break;
              default:
                builder.setPositiveButton(button.getString("text"), new DialogInterface.OnClickListener() {
                   public void onClick(DialogInterface dialog, int id) {
                     if(addPassword){
                       String password = passwordInput.getText().toString();
                       buttonCallback.invoke(password);
                    }
                   }
                });
               break;
           }
          }
        }
      }

      AlertDialog ad = builder.create();
      ad.show();
    }

}
