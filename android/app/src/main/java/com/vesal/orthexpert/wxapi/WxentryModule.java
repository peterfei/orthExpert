package com.vesal.orthexpert.wxapi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.tencent.mm.opensdk.modelpay.PayReq;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.tencent.mm.opensdk.modelmsg.SendAuth;

class WxentryModule extends ReactContextBaseJavaModule {

  private IWXAPI api;
  static String APP_ID = "";
  static Promise promise = null;

  WxentryModule(ReactApplicationContext reactContext) {
    super(reactContext);
    api = WXAPIFactory.createWXAPI(reactContext, null);
  }

  @Override
  public String getName() {
    return "Wxentry";
  }

  @ReactMethod
  public void registerApp(String APP_ID) { // 向微信注册
    WxpayModule.APP_ID = APP_ID;
    api.registerApp(APP_ID);
  }

  @ReactMethod
  public void sendAuthRequest(String scope, String state, Promise promise) {
    WxentryModule.promise = promise;
    SendAuth.Req req = new SendAuth.Req();
    req.scope = scope;
    req.state = state;
    api.sendReq(req);
  }

  @ReactMethod
  public void isSupported(Promise promise) { // 判断是否支持调用微信SDK
    boolean isSupported = api.isWXAppInstalled();
    promise.resolve(isSupported);
  }

}