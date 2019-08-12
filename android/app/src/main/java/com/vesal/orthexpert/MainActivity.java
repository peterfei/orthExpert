package com.vesal.orthexpert;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import com.umeng.message.PushAgent;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
     @Override
      public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }
    @Override
    protected String getMainComponentName() {
        return "orthExpert";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        PushModule.initPushSDK(this);
        PushAgent.getInstance(this).onAppStart();
        // MobclickAgent.setSessionContinueMillis(1000);
        // MobclickAgent.setScenarioType(this, EScenarioType.E_DUM_NORMAL);
        // MobclickAgent.openActivityDurationTrack(false);
    }


    @Override
    public void onResume() {
        super.onResume();
        // MobclickAgent.onResume(this);
    }
    @Override
    protected void onPause() {
        super.onPause();
        // MobclickAgent.onPause(this);
    }
}
