package com.vesal.orthexpert;

import android.app.DownloadManager;

import android.content.BroadcastReceiver;

import android.content.Context;

import android.content.Intent;

import android.content.SharedPreferences;

import android.database.Cursor;

import android.net.Uri;

import android.os.Environment;

import android.util.Log;

import android.widget.Toast;

import java.io.File;
import android.os.Build;
import android.text.TextUtils;
import android.webkit.MimeTypeMap;

/**
 * 
 * Created by audaque on 2016/9/6.
 * 
 */

public class DownLoadBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        long myDwonloadID = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
        Toast.makeText(context, "myDwonloadID is " + myDwonloadID + "", Toast.LENGTH_LONG).show();
        SharedPreferences sPreferences = context.getSharedPreferences("ggfw_download", 0);

        long refernece = sPreferences.getLong("ggfw_download_apk", 0);

        if (refernece == myDwonloadID) {

            DownloadManager dManager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);

            Intent install = new Intent(Intent.ACTION_VIEW);

            // Uri downloadFileUri = dManager.getUriForDownloadedFile(myDwonloadID);

            DownloadManager.Query querybyId = new DownloadManager.Query();

            querybyId.setFilterById(myDwonloadID);

            Cursor myDownload = dManager.query(querybyId);

            String dolownname = null;

            if (myDownload.moveToFirst()) {

                int status = myDownload.getInt(myDownload.getColumnIndex(DownloadManager.COLUMN_STATUS));

                if (status == DownloadManager.STATUS_SUCCESSFUL) {

                    // process download

                    // int fileNameIdx =
                    // myDownload.getColumnIndex(DownloadManager.COLUMN_LOCAL_FILENAME);

                    // 此处取得的是完整路径+文件名称

                    // dolownname = myDownload.getString(fileNameIdx);
                    int fileNameIdx = myDownload.getColumnIndex(DownloadManager.COLUMN_LOCAL_FILENAME);
                    dolownname = myDownload.getString(fileNameIdx);

                } else {

                    Toast.makeText(context, "下载失败，删除残留文件", Toast.LENGTH_LONG).show();

                    dManager.remove(myDwonloadID);

                    myDownload.close();

                    return;

                }

                myDownload.close();

            }

            if (dolownname == null) {

                return;

            }
            if (Build.VERSION.SDK_INT < 23) {
                File file = new File(dolownname);

                install.setDataAndType(Uri.fromFile(file), "application/vnd.android.package-archive");

                install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                context.getApplicationContext().startActivity(install);
            } else {
                File file = queryDownloadedApk(context);
                if (file.exists()) {
                    openFile(file, context);
                }
            }

        }

    }

    /**
     * 通过myDwonloadID查询下载的apk，解决6.0以后安装的问题
     * 
     * @param context
     * @return
     */
    public static File queryDownloadedApk(Context context) {
        SharedPreferences sPreferences = context.getSharedPreferences("ggfw_download", 0);

        long myDwonloadID = sPreferences.getLong("ggfw_download_apk", 0);
        // long myDwonloadID = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID,
        // -1);
        File targetApkFile = null;
        DownloadManager downloader = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
        // long downloadId = SharePreHelper.getIns().getLongData("refernece", -1);
        if (myDwonloadID != -1) {
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(myDwonloadID);
            query.setFilterByStatus(DownloadManager.STATUS_SUCCESSFUL);
            Cursor cur = downloader.query(query);
            if (cur != null) {
                if (cur.moveToFirst()) {
                    String uriString = cur.getString(cur.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI));
                    if (!TextUtils.isEmpty(uriString)) {
                        targetApkFile = new File(Uri.parse(uriString).getPath());
                    }
                }
                cur.close();
            }
        }
        return targetApkFile;

    }

    private void openFile(File file, Context context) {
        Intent intent = new Intent();
        intent.addFlags(268435456);
        intent.setAction("android.intent.action.VIEW");
        String type = getMIMEType(file);
        intent.setDataAndType(Uri.fromFile(file), type);
        try {
            context.startActivity(intent);
        } catch (Exception var5) {
            var5.printStackTrace();
            Toast.makeText(context, "没有找到打开此类文件的程序", Toast.LENGTH_SHORT).show();
        }

    }

    private String getMIMEType(File var0) {
        String var1 = "";
        String var2 = var0.getName();
        String var3 = var2.substring(var2.lastIndexOf(".") + 1, var2.length()).toLowerCase();
        var1 = MimeTypeMap.getSingleton().getMimeTypeFromExtension(var3);
        return var1;
    }

}
