package com.vesal.orthexpert.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

    private static final String TAG = "WXEntryActivity";
    private IWXAPI api;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        api = WXAPIFactory.createWXAPI(this, WxentryModule.APP_ID);
        api.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        api.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq req) {
    }

    @Override
    public void onResp(BaseResp baseResp) {
        Log.d(TAG, "onPayFinish, errCode = " + baseResp.errCode);
        if (baseResp.errCode == BaseResp.ErrCode.ERR_OK) {
            // 用户同意
            Log.e("WXEntryActivity", "onResp" + baseResp.errCode);
            Log.e("WXEntryActivity", "onResp" + baseResp.errStr);
            Log.e("WXEntryActivity", "onResp" + baseResp.openId);
        }

        if (baseResp.getType() == 1) {
            SendAuth.Resp resp = (SendAuth.Resp) (baseResp);
            // WritableMap map = Arguments.createMap();
            // Toast.makeText(getApplicationContext(), "****onResp code is ****" +
            // resp.code, Toast.LENGTH_LONG).show();
            Log.e("WXEntryActivity", "onResp" + baseResp);
            Log.e("WXEntryActivity", "onResp" + resp);
            // map.putString("code", (String)resp.code);
            // WxentryModule.promise.resolve(map);
            WxentryModule.promise.resolve(resp.code);

            finish();
        } else if (baseResp.getType() == 2) {
            SendMessageToWX.Resp resp = (SendMessageToWX.Resp) (baseResp);
            // Toast.makeText(getApplicationContext(), "onNewIntent..." + resp,
            // Toast.LENGTH_LONG).show();

            // WxentryModule.promise.resolve(resp);

            finish();
        }
    }
}