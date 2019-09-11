/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
// import HomeScreen from "./View/scene/Home/HomeScreen";
import NewHome from './View/scene/Home/index';
import SickDetail from './View/scene/Home/SickDetail';
import MyScreen from "./View/scene/My/MyScreen";
import MyOrder from "./View/scene/Order/MyOrder";
import OrderDetail from "./View/scene/Order/OrderDetail";
import MessageBoard from "./View/scene/My/MessageBoard";
import showMessages from "./View/scene/My/showMessages";
import Help from "./View/scene/Help/help";
import problemDetails from "./View/scene/Help/problemDetails";
import kfMineUserInfo from "./View/scene/My/UserInfoDetail";//EditMember
import kfAddAction from './View/scene/Plan/AddAction';

import Search from './View/scene/Home/search';
import MemberComplete from "./View/scene/Register/MemberComplete";
import RegisterPage from "./View/scene/Register/RegisterPage";
import ForgetPasswordPage from "./View/scene/Register/ForgetPasswordPage";
import ChangePassword from "./View/scene/Register/ChangePassword";
import SelectIdentity from "./View/scene/Register/SelectIdentity";
import LoginPage from "./View/scene/Login/LoginPage";
import Find from "./View/scene/Search/Find";
import Recovery from "./View/scene/Recovery/Recovery";
import BindPhoneSkip from "./View/scene/Login/BindPhoneSkip";
import BuyVip from "./View/scene/Vip/BuyVip";
import PaymentOrder from './View/scene/Pay/PaymentOrder';
import Pay from './View/scene/Pay/Pay';
import kfPlanDetail from './View/scene/Plan/PlanDetail';
import kfSharingPlan from './View/scene/Plan/SharingPlan';
import kfPlanDescHtml from './View/scene/Plan/PlanDescHtml';
import RenTi from './View/scene/Unity/RenTi';//底部按钮转跳商城
import BonesScene from './View/scene/Unity/BonesScene';
import TrainPlay from './View/scene/Unity/TrainPlay';
import kfSickPlanList from './View/scene/Plan/SickPlanList';
import kfCreatePlan from './View/scene/Plan/CreatePlan';
import kfModifyData from './View/scene/My/ModifyData';
import ActivationCode from './View/scene/My/ActivationCode';
import ModifyPassword from './View/scene/My/ModifyPassword';
import AboutUs from './View/scene/About/AboutUs';
import AboutUsDetails from './View/scene/About/AboutUsDetails';

import  AppUpdate from './View/common/components/APPUpdate';
import ErrorBoundary from './View/ErrorBoundary'

/**消息通知页面 */
import MessageNotice from './View/scene/Search/MessageNotice';
import MessageDetails from './View/scene/Search/MessageDetails';
import {View,Platform,BackHandler,BackAndroid,DeviceEventEmitter,NativeModules,ToastAndroid} from "react-native";

const RootStack = createAppContainer(createStackNavigator( //跟路由
  {//定义模块
    // HomeScreen: { screen: HomeScreen },
    NewHome: { screen: NewHome },
    SickDetail: { screen: SickDetail },
    MyScreen: { screen: MyScreen },
    MyOrder: { screen: MyOrder },
    OrderDetail: { screen: OrderDetail },
    MessageBoard: { screen: MessageBoard },
    showMessages: { screen: showMessages },
    Help: { screen: Help },
    problemDetails: { screen: problemDetails },
    kfMineUserInfo: { screen: kfMineUserInfo },
    MemberComplete: { screen: MemberComplete },
    RegisterPage: { screen: RegisterPage },
    ForgetPasswordPage: { screen: ForgetPasswordPage },
    ChangePassword: { screen: ChangePassword },
    SelectIdentity: { screen: SelectIdentity },
    LoginPage: { screen: LoginPage },
    MessageNotice: { screen: MessageNotice },
    MessageDetails: { screen: MessageDetails },
    Find: { screen: Find },
    Recovery: { screen: Recovery },
    BindPhoneSkip: { screen: BindPhoneSkip },
    BuyVip: { screen: BuyVip },
    PaymentOrder: { screen: PaymentOrder },
    Pay: { screen: Pay },
    kfPlanDetail: { screen: kfPlanDetail },
    kfSharingPlan: { screen: kfSharingPlan },
    kfPlanDescHtml: { screen: kfPlanDescHtml },
    kfSickPlanList: { screen: kfSickPlanList },
    kfCreatePlan: { screen: kfCreatePlan },
    RenTi: { screen: RenTi },
    TrainPlay: { screen: TrainPlay },
    kfModifyData: { screen: kfModifyData },
    ActivationCode: { screen: ActivationCode },
    ModifyPassword: { screen: ModifyPassword },
    BonesScene: { screen: BonesScene },
    Search: { screen: Search },
    AboutUs: { screen: AboutUs },
    AboutUsDetails:{screen:AboutUsDetails},
    kfAddAction:{screen:kfAddAction}
  },
  {
    initialRouteName: 'NewHome',     //设置初始路由为Home
    mode: 'card',
    navigationOptions: {
      header: null,
      headerStyle: {
        //background:'red'
      },
      headerBackTitle: null,
      headerTintColor: '#333333',
      showIcon: true,
      animationEnabled: false,
      gesturesEnabled: false
    }
  }
))
var WxEntry = NativeModules.Wxentry;
let lastBackPressed ;
let current = false;
export default class App extends Component {

    componentWillMount() {
      // SplashScreen.hide();
      if(Platform.OS === 'android'){
          BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

      }
      this.emitter = DeviceEventEmitter.addListener('backExitApp',
          (params) => {
            if (params){
                current = params.value;
            }

          }
      )
  }

  componentWillUnmount() {

      //去除事件
      if(Platform.OS === 'android'){
          BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);

      }
      if (this.emitter) {
          this.emitter.remove()
      }

  }
    //定义返回事件
    onBackAndroid =()=> {
      if (current == true) {//如果是在首页
          if (lastBackPressed && lastBackPressed + 1000 >= Date.now()) {
            // alert(1111)
              //在2秒内按过back返回，可以退出应用
              // BackHandler.exitApp();
              WxEntry.wxExitApp();
            // alert(1)
              return false;
          }else{

              lastBackPressed = Date.now();
              ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
              return true;
          }


      }



  }
  render() {                            //将Navigation作为根路径导出
    return (
        <ErrorBoundary>
            <AppUpdate/>
            <RootStack/>
        </ErrorBoundary>
    )
  }
}