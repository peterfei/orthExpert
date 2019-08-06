package com.orthexpert;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.github.yamill.orientation.OrientationPackage;
import com.rnfs.RNFSPackage;
import io.realm.react.RealmReactPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.reactnative.unity.view.UnityViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;
import android.support.multidex.*;
import android.content.Context;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new OrientationPackage(),
            new RNFSPackage(),
            new RealmReactPackage(),
            new RNDeviceInfo(),
            new RNGestureHandlerPackage(),
          new UnityViewPackage()
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
  }

  @Override
  protected void attachBaseContext(Context context){
    super.attachBaseContext(context);
    MultiDex.install(this);
  }
}
