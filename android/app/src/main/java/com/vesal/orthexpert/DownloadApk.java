package com.vesal.orthexpert;

import android.app.DownloadManager;
import android.app.DownloadManager.Request;
import android.content.Context;
import android.app.Activity;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Environment;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;
import android.content.Intent;

public class DownloadApk extends ReactContextBaseJavaModule {

    DownloadManager downManager;

    Activity myActivity;
    private BroadcastReceiver downLoadBroadcast;

    public DownloadApk(ReactApplicationContext reactContext) {

        super(reactContext);

    }

    @Override

    public String getName() {

        return "DownloadApk";

    }

    @ReactMethod

    public void downloading(String url, String description) {
        try{
            myActivity = getCurrentActivity();
        Uri uri = Uri.parse("market://details?id=com.ruanyikeji.vesal.vesal");
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        myActivity.startActivity(intent);
        }catch(Exception e){
            e.printStackTrace();
            Uri uri = Uri.parse("http://app.mi.com/details?id=com.ruanyikeji.vesal.vesal");
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            myActivity.startActivity(intent);
        }
        

        // myActivity = getCurrentActivity();

        // downManager = (DownloadManager)
        // myActivity.getSystemService(Context.DOWNLOAD_SERVICE);

        // Uri uri = Uri.parse(url);

        // DownloadManager.Request request = new Request(uri);

        // request.setAllowedNetworkTypes(Request.NETWORK_WIFI);

        // // 设置通知栏标题

        // request.setNotificationVisibility(Request.VISIBILITY_VISIBLE);

        // request.setMimeType("application/vnd.android.package-archive");

        // request.setTitle("下载");

        // if (description == null || "".equals(description)) {

        // description = "目标apk正在下载";

        // }

        // request.setDescription(description);

        // request.setAllowedOverRoaming(false);

        // // 设置文件存放目录

        // request.setDestinationInExternalFilesDir(myActivity,
        // Environment.DIRECTORY_DOWNLOADS, description);

        // long downloadid = downManager.enqueue(request);

        // SharedPreferences sPreferences =
        // myActivity.getSharedPreferences("ggfw_download", 0);

        // sPreferences.edit().putLong("ggfw_download_apk", downloadid).commit();
        // registerBroadcast(); // 下载成功和点击通知栏动作监听

    }

    /**
     * 注册广播
     */
    // private void registerBroadcast() {
    // /** 注册service 广播 1.任务完成时 2.进行中的任务被点击 */
    // IntentFilter intentFilter = new IntentFilter();
    // intentFilter.addAction(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
    // intentFilter.addAction(DownloadManager.ACTION_NOTIFICATION_CLICKED);
    // registerReceiver(downLoadBroadcast = new DownLoadBroadcastReceiver(),
    // intentFilter);
    // }

}
