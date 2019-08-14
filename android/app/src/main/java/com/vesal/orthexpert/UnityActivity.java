package com.vesal.orthexpert;
import android.app.Activity;
import android.content.ContextWrapper;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.Window;
import android.widget.Toast;
import android.app.ActivityManager;
import java.util.List;
import com.unity3d.player.UnityPlayer;
import android.content.Context;
import android.content.ComponentName;
import android.app.AlertDialog;
import android.widget.ImageView;


public class UnityActivity extends Activity {

    public static Activity mActivity;
 
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mActivity = this;
        // Activity实例化后就添加启动页面，防止黑屏。只会添加一次，因为这个页面一旦实例化后就不会销毁，具体原因参考这里http://blog.csdn.net/lizhengwei1989/article/details/54631241
        UnitySplashSDK.getInstance().onCreate(mActivity,savedInstanceState);
    }
 
    // 这是暴露给unity调用的方法
    public void hideSplash(){
        UnitySplashSDK.getInstance().onHideSplash();
    }
}