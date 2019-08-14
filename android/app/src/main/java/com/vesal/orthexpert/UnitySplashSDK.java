package com.vesal.orthexpert;

import android.app.Activity;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Color;
import android.media.Image;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import com.unity3d.player.UnityPlayer;
import android.widget.TextView;
import android.view.Gravity;
/**
 * 修改unity启动画面
 */
public class UnitySplashSDK {
 
    // 这是启动画面的图片，这里可以使任意一个View，可以根据自己的需要去自定义
    private ImageView bgView = null;
 
    private UnityPlayer mUnityPlayer = null;
 
    private static UnitySplashSDK mInstance;
 
    public static UnitySplashSDK getInstance() {
 
        if (null == mInstance) {
 
            synchronized (UnitySplashSDK.class) {
 
                if (null == mInstance) {
 
                    mInstance = new UnitySplashSDK();
 
                }
 
            }
 
        }
 
        return mInstance;
 
    }
 
    // 在unity的Activity的onCreate中调用
    public void onCreate(Activity activity, Bundle savedInstanceState) {
        // mUnityPlayer = ((UnityActivity) activity).getUnityPlayer();
        onShowSplash();
    }
 
    void onShowSplash() {
        if (bgView != null)
            return;
        try {
            Log.d("", "UnityActivity_onShowSplash");
            bgView = new ImageView(UnityPlayer.currentActivity);
            bgView.setBackgroundColor(Color.parseColor("#36c3e5"));
            bgView.setBackgroundResource(R.drawable.launch_screen);
            bgView.setScaleType(ImageView.ScaleType.CENTER);
            Resources r = mUnityPlayer.currentActivity.getResources();
            mUnityPlayer.addView(bgView, r.getDisplayMetrics().widthPixels, r.getDisplayMetrics().heightPixels);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
 
    // 在unity的Activity中暴露方法给unity，让unity在准备好内容后调用隐藏启动画面
    public void onHideSplash() {
        try {
            if (bgView == null)
                return;
            // Log.d("", "UnityActivity_onHideSplash");
            UnityPlayer.currentActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mUnityPlayer.removeView(bgView);
                    bgView = null;
                    
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
 
 
}