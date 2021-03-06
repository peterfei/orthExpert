/**
 * Created by xzh on 16:29 2019-08-01
 *
 * @Description:
 */


// 登录模块相关接口
const LoginModule = {
  login: 'v1/app/member/login',
  register: 'v1/app/member/newrRegister',
  verifyCodeLogin: 'v1/app/member/codeLogin',
  forgetPassword: 'v1/app/member/forgetPwd',
  getAllIdentity: 'v1/app/member/getAllIdentity',
  changePassword: 'v1/app/member/updateTellPassword',
  bindPhone: '',
  checkBindStatus: '',
  getVerifyCode: '/app/kfxl/v1/sms/getMessageCode',
  getCodeAndCheckCapt: '/app/kfxl/v1/sms/getMessageCodeWithCaptcha',
  updateUserInfo: '',
  youkeLogin: 'v1/app/member/youkeLogin',
    isFirstWeixin: 'v1/app/member/isFirstWeixin',
    weChatLogin:'v1/app/member/weixinLogin',
  getAppVersion: '/v1/app/member/getAppVersion'
}

const UserModule = {
  getUserInfo: '/v1/app/member/userInfo',
  updateUserInfo: '',
  userVipPremission: '/app/kfxl/v1/member/membershipDeadline',
}

const VipModule = {
  vipInfo: '/app/kfxl/v1/combo/getComboInfo',
  buyVip: '/app/kfxl/v1/order/addOrder',
  vipGuKe:'/v1/app/orthope/combo/getComboInfo'
}

const settingModule = {
  // 帮助中心
  helpList: '/app/kfxl/v1/helpcenter/getHelpList',
  //意见反馈
  opinionList: '/v1/app/msg/msgList',
  pushMsg: '/v1/app/msg/pushMsg',
  // 消息通知相关接口
  messageNotice: 'v1/app/msg/getMessageOfApp',
  systemScreen: 'v1/app/msg/getMessageOfApp',
  messageDetails: 'v1/app/msg/getMessageSingleDetail',
    //我的订单
    myOrder:'app/kfxl/v1/order/myOrder',
    //修改个人信息:
    updateMemberInfo:'v1/app/member/updateMemberInfo'
}

const HomeModulInterface = {
  homeSearch: '',
  homeBanner: 'v1/app/plan/planMapList',
  homeHot: '/app/kfxl/v1/scheme/hotSchemes',
  homeMyExercise: '/app/kfxl/v1/scheme/currMbCreateSchemes',
  homeMyCustom: '/app/kfxl/v1/scheme/currMbCreateSchemes',
  homeScan: '',
}

// 训练计划相关接口
const PlanModuleInterface = {
  planDetail: 'v1/app/trainAnimation/findAmUnityResources',
  motionsList: '/app/kfxl/v1/animation/getAnimationList',
  createPlan: '/app/kfxl/v1/scheme/saveCustomSchemesForOrthope',

  planBackImgList: '/app/kfxl/v1/scheme/getSchemesBackgroudImg',
  myCreatePlanList: 'v1/app/orthope/scheme/myCreateSchemes',
}

//小人相关
const Sick = {
  getSick: 'v1/app/pathology/getSick',
  getSickArea: 'v1/app/pathology/getPathologyAndArea',
  getSickChildPathology: 'v1/app/pathology/getSickChildPathology',
  planListWithSick: '/app/kfxl/v1/scheme/getSchemesByPatNo'
}
//支付相关
const Pay = {
  config: 'v1/app/msg/config',//获取支付方式
  addOrder:"v1/app/order/addOrder",//添加订单, 获取订单号
  wxGetPreyId:"v1/app/pay/wxGetPreyId",//获取微信预付单
  useActiveCode: 'app/kfxl/v1/combo/useActiveCode', // 激活码接口
  checkComboisExpire:'v1/app/orthope/combo/checkComboisExpire',

  // 苹果支付 验证支付凭证
  validateApplePayNotify: '/v1/app/pay/applyPayNotify',
}


//会员权限相关
const Combo = {
    memberComboList: 'v2/app/product/memberComboList',
    checkProductIsUse: 'v2/app/product/checkProductIsUse',
}

// 微课下相关接口
const WkModule = {}

// 图片上传接口
const UploadModule = {
  uploadImg: 'app/v1/mbFile/upload',
}

const Gk = {
  gk_useActiveCode: '/v1/app/orthope/combo/useActiveCode',
  gk_getPathologyRes:'v1/app/pathology/getPathologyRes',
  gk_getSearchHot:"v1/app/pathology/getSearchHot",
  gk_searchPathologyList:"v1/app/pathology/searchPathologyList",
  gk_orderDetail:"/v1/app/order/orderDetail",
  gk_deleteMemberOrder:"/v1/app/order/deleteMemberOrder",
  gk_cancelOrder:"/v1/app/order/cancelOrder",
  gk_msgList:"/app/orthope/v1/msg/msgList",
  gk_pushMsg:'/app/orthope/v1/msg/pushMsg',
  gk_getMessageOfApp:"v1/app/msg/getMessageOfApp",
  gk_getHelpList:"/app/orthope/v1/helpcenter/getHelpList",
  gk_getAllIdentity:"v1/app/member/getAllIdentity",
  gk_updateMemberInfo:"v1/app/member/updateMemberInfo",
  gk_upload:"app/v1/mbFile/upload",
  gk_getComboInfo:"/v1/app/orthope/combo/getComboInfo",
  gk_newAddOrder:"/v1/app/orthope/order/newAddOrder",
  gk_wxGetPreyId:"/v1/app/pay/wxGetPreyId",
  gk_getShareQR: '/v1/app/basic/getShareQRWithGk', // 计划二维码分享
}

export default {
  ...LoginModule,
  ...HomeModulInterface,
  ...PlanModuleInterface,
  ...WkModule,
  ...UploadModule,
  ...UserModule,
  ...VipModule,
  ...settingModule,
  ...Sick,
    ...Combo,
  ...Pay,
  ...Gk
}