/**
 * Created by xzh on 18:36 2019-08-01
 *
 * @Description:
 */

import {size} from './Tool/ScreenUtil';

const ThemeDefined = {
  White: 'white',
  Blue: 'rgba(68, 180, 233, 1)',
  Gray: 'rgba(185, 185, 185, 1)',
  Purple: '',
  Black: 'rgba(38, 38, 38, 1)',
  TitleSize: size(32),
  SubTitleSize: size(28),
  ContentSize: size(26),
  LittleSize: size(20),
  TitleColor: '#2B2B2B',
  SubTitleColor: '#3B3B3B',
  ContentColor: '#4B4B4B',
}

const Space = {
  SLeft: size(20),
  SRight: size(20),
  STop: size(30),
  SBottom: size(30),
}

const ThirdDefined = {

  UMAppkey: '',
  UMAppSecret: '',
  UMAppID: '',

  WXEntryAppkey: '',
  WXEntryAppSecret: '30a65cfe3acb4ce2546c2da171a6209e',
  WXEntryAppID: 'wx1011033f4390b4ad',

  WXPayAppkey: '',
  WXPayAppSecret: '',
  WXPayAppID: '',

  AliPayAppkey: '',
  AliPayAppSecret: '',
  AliPayAppID: '',
}

const NotificationDefined = {

  kNotify_LoginSuccess: 'kNotify_LoginSuccess',
  kNotify_LogoutSuccess: 'kNotify_LogoutSuccess',
  // kNotify_TokensExprie: 'kNotify_TokensExprie',

  kNotify_UpdateUserInfoSuccess: 'kNotify_UpdateUserInfoSuccess',

}
const ComBoCodeDefined = {
  KFXL_VIP: 'KFXL_VIP',
  DINGZHI_VIP: 'DINGZHI_VIP',
  ORTHOPE_VIP: 'ORTHOPE_VIP'
}

export default {
  ...ThemeDefined,
  ...Space,
  ...ThirdDefined,
  ...NotificationDefined,
  ...ComBoCodeDefined
}