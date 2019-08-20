/**
 * Created by xzh on 17:37 2019-08-01
 *
 * @Description:
 */


import {NativeModules} from 'react-native'

export const VoiceUtils = NativeModules.VoiceModule;
export const WxPay = NativeModules.Wxpay;
export const WxEntry = NativeModules.Wxentry;
export const InAppUtils = NativeModules.InAppUtils;
export const UShare = NativeModules.sharemodule;
export const SharePlatform = {
  QQ: 0,
  SINA: 1,
  WECHAT: 2,
  WECHATMOMENT: 3,
// QQZONE: 4,
// FACEBOOK: 5
}

