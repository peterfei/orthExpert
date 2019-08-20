package com.vesal.orthexpert;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import com.umeng.message.PushAgent;
import android.widget.Toast;
import android.view.KeyEvent;
import com.umeng.socialize.UMShareAPI;
import com.vesal.orthexpert.module.*;
public class MainActivity extends ReactActivity {
    private long firstClick;

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
        ShareModule.initActivity(this);
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

    @Override
    protected void onDestroy() {
        // TODO 自动生成的方法存根
        super.onDestroy();
        // unbindService(conn);
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // TODO Auto-generated method stub
        if(keyCode==KeyEvent.KEYCODE_BACK){
            if(System.currentTimeMillis()-firstClick>2000){
                firstClick=System.currentTimeMillis();
                Toast.makeText(this, "再按一次退出", 2000).show();;
            }else{
                System.exit(0);
            }
            return true;
        }
        return false;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);
    }

}
