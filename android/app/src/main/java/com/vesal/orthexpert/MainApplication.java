package com.vesal.orthexpert;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.microsoft.codepush.react.CodePush;
import com.syanpicker.RNSyanImagePickerPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.zmxv.RNSound.RNSoundPackage;
import io.realm.react.RealmReactPackage;
import com.reactnative.unity.view.UnityViewPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;


// import io.realm.react.RealmReactPackage;
// import com.reactnative.unity.view.UnityViewPackage;
// import com.github.yamill.orientation.OrientationPackage;
// import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
// import com.rnfs.RNFSPackage;
// import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.BV.LinearGradient.LinearGradientPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.brentvatne.react.ReactVideoPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;
import android.support.multidex.*;
import android.content.Context;

import android.os.Handler;
import android.app.Notification;
import android.widget.RemoteViews;
import android.widget.Toast;

import com.umeng.commonsdk.UMConfigure;
import com.umeng.message.IUmengRegisterCallback;
import com.umeng.message.MsgConstant;
import com.umeng.message.PushAgent;
import com.umeng.message.UTrack;
import com.umeng.message.UmengMessageHandler;
import com.umeng.message.UmengNotificationClickHandler;
import com.umeng.message.entity.UMessage;
//import com.umeng.message.common.UmLog;
import com.umeng.socialize.PlatformConfig;
import com.xiaomi.mipush.sdk.MiPushClient;
import org.android.agoo.huawei.HuaWeiRegister;
import com.vesal.orthexpert.module.SharePackage;

// import com.umeng.message.common.UmLog;

public class MainApplication extends Application implements ReactApplication {

  private static final String TAG = MainApplication.class.getName();
  private Handler handler;
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected String getJSBundleFile(){
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new SplashScreenReactPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG,"http://39.96.179.14:3000"),
            new RNSyanImagePickerPackage(),
            new RNViewShotPackage(),
            new RNSoundPackage(),
            
            
            
            new RealmReactPackage(),
            new UnityViewPackage(),
            new OrientationPackage(),
            new RNGestureHandlerPackage(),
            new RNFSPackage(),
            new RNDeviceInfo(),
            new LinearGradientPackage(),
            new VectorIconsPackage(),
            new KCKeepAwakePackage(),
            new ReactVideoPackage(),
            
          new DplusReactPackage(),
          new com.vesal.orthexpert.wxapi.WxentryPackage(),
          new com.vesal.orthexpert.wxapi.WxpayPackage(),
          new SharePackage(),
          new DownloadApkPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
      super.onCreate();
      SoLoader.init(this, /* native exopackage */ false);
      UMConfigure.setLogEnabled(true);
      RNUMConfigure.init(this, "5d4a984e0cafb25ba6000854", "Umeng", UMConfigure.DEVICE_TYPE_PHONE,
              "4cc540e80284d655e1e14e5a40cae979");
      initUpush();
      MiPushClient.registerPush(this, "2882303761518112786", "5981811265786");
      //华为通道
      HuaWeiRegister.register(this);

  }
  {
    PlatformConfig.setWeixin("wxa452dfe169d3c11c", "21a25d1a7762a4d6caf49cd18e9ad116");
    // PlatformConfig.setQQZone("1106207359", "3JjbG8aXMuh5w0sV");
    // PlatformConfig.setSinaWeibo("2733400964", "fac50980a44e3e3afd4bc968ea572887",
    // "www.baidu.com");
  }


  @Override
  protected void attachBaseContext(Context context){
    super.attachBaseContext(context);
    MultiDex.install(this);
  }

  private void initUpush() {
    PushAgent mPushAgent = PushAgent.getInstance(this);
    handler = new Handler(getMainLooper());

    //sdk开启通知声音
    mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SDK_ENABLE);
    // sdk关闭通知声音
    //		mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);
    // 通知声音由服务端控制
    //		mPushAgent.setNotificationPlaySound(MsgConstant.NOTIFICATION_PLAY_SERVER);

    //		mPushAgent.setNotificationPlayLights(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);
    //		mPushAgent.setNotificationPlayVibrate(MsgConstant.NOTIFICATION_PLAY_SDK_DISABLE);


    UmengMessageHandler messageHandler = new UmengMessageHandler() {
        /**
         * 自定义消息的回调方法
         */
        @Override
        public void dealWithCustomMessage(final Context context, final UMessage msg) {

            handler.post(new Runnable() {

                @Override
                public void run() {
                    // TODO Auto-generated method stub
                    // 对自定义消息的处理方式，点击或者忽略
                    boolean isClickOrDismissed = true;
                    if (isClickOrDismissed) {
                        //自定义消息的点击统计
                        UTrack.getInstance(getApplicationContext()).trackMsgClick(msg);
                    } else {
                        //自定义消息的忽略统计
                        UTrack.getInstance(getApplicationContext()).trackMsgDismissed(msg);
                    }
                    Toast.makeText(context, msg.custom, Toast.LENGTH_LONG).show();
                }
            });
        }

        /**
         * 自定义通知栏样式的回调方法
         */
        @Override
        public Notification getNotification(Context context, UMessage msg) {
            switch (msg.builder_id) {
                case 1:
                    Notification.Builder builder = new Notification.Builder(context);
                    RemoteViews myNotificationView = new RemoteViews(context.getPackageName(), R.layout.notification_view);
                    myNotificationView.setTextViewText(R.id.notification_title, msg.title);
                    myNotificationView.setTextViewText(R.id.notification_text, msg.text);
                    myNotificationView.setImageViewBitmap(R.id.notification_large_icon, getLargeIcon(context, msg));
                    myNotificationView.setImageViewResource(R.id.notification_small_icon, getSmallIconId(context, msg));
                    builder.setContent(myNotificationView)
                        .setSmallIcon(getSmallIconId(context, msg))
                        .setTicker(msg.ticker)
                        .setAutoCancel(true);

                    return builder.getNotification();
                default:
                    //默认为0，若填写的builder_id并不存在，也使用默认。
                    return super.getNotification(context, msg);
            }
        }
    };
    mPushAgent.setMessageHandler(messageHandler);

    /**
     * 自定义行为的回调处理，参考文档：高级功能-通知的展示及提醒-自定义通知打开动作
     * UmengNotificationClickHandler是在BroadcastReceiver中被调用，故
     * 如果需启动Activity，需添加Intent.FLAG_ACTIVITY_NEW_TASK
     * */
    UmengNotificationClickHandler notificationClickHandler = new UmengNotificationClickHandler() {
        @Override
        public void dealWithCustomAction(Context context, UMessage msg) {
            Toast.makeText(context, msg.custom, Toast.LENGTH_LONG).show();
        }
    };
    //使用自定义的NotificationHandler，来结合友盟统计处理消息通知，参考http://bbs.umeng.com/thread-11112-1-1.html
    //CustomNotificationHandler notificationClickHandler = new CustomNotificationHandler();
    mPushAgent.setNotificationClickHandler(notificationClickHandler);


    //注册推送服务 每次调用register都会回调该接口
    mPushAgent.register(new IUmengRegisterCallback() {
        @Override
        public void onSuccess(String deviceToken) {

           // UmLog.i(TAG, "device token: " + deviceToken);
        }

        @Override
        public void onFailure(String s, String s1) {
         //   UmLog.i(TAG, "register failed: " + s + " " + s1);
        }
    });
  }
}
