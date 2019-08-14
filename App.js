/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createStackNavigator,createAppContainer} from 'react-navigation';

import HomeScreen from "./View/scene/Home/HomeScreen";
import MyScreen from "./View/scene/My/MyScreen";
import MyOrder from "./View/scene/Order/MyOrder";
import OrderDetail from "./View/scene/Order/OrderDetail";
import MessageBoard from "./View/scene/My/MessageBoard";
import showMessages from "./View/scene/My/showMessages";
import Help from "./View/scene/Help/help";
import problemDetails from "./View/scene/Help/problemDetails";
import EditMember from "./View/scene/My/EditMember";
import MemberComplete from "./View/scene/Register/MemberComplete";
import RegisterPage from "./View/scene/Register/RegisterPage";
import ForgetPasswordPage from "./View/scene/Register/ForgetPasswordPage";
import ChangePassword from "./View/scene/Register/ChangePassword";
import SelectIdentity from "./View/scene/Register/SelectIdentity";
import LoginPage from "./View/scene/Login/LoginPage";
import Find from "./View/scene/Search/Find";
import Recovery from "./View/scene/Recovery/Recovery";
import BindPhoneSkip from "./View/scene/Login/BindPhoneSkip";

/**消息通知页面 */
import MessageNotice from './View/scene/Search/MessageNotice';
import MessageDetails from './View/scene/Search/MessageDetails';

const RootStack =createAppContainer( createStackNavigator( //跟路由
  {//定义模块
    HomeScreen: {screen: HomeScreen},
    MyScreen: {screen: MyScreen},
    MyOrder:{screen:MyOrder},
    OrderDetail:{screen:OrderDetail},
    MessageBoard:{screen:MessageBoard},
    showMessages:{screen:showMessages},
    Help:{screen:Help},
    problemDetails:{screen:problemDetails},
    EditMember:{screen:EditMember},
    MemberComplete:{screen:MemberComplete},
    RegisterPage:{screen:RegisterPage},
    ForgetPasswordPage:{screen:ForgetPasswordPage},
    ChangePassword:{screen:ChangePassword},
    SelectIdentity:{screen:SelectIdentity},
    LoginPage:{screen:LoginPage},
    MessageNotice:{screen:MessageNotice},
    MessageDetails:{screen:MessageDetails},
    Find:{screen:Find},
    Recovery:{screen:Recovery},
    BindPhoneSkip:{screen:BindPhoneSkip},
  },
  {
    initialRouteName: 'LoginPage',     //设置初始路由为Home
    mode:'modal',
    navigationOptions:{
      header:null,
      headerStyle:{
        //background:'red'
      },
      headerBackTitle:null,
      headerTintColor:'#333333',
      showIcon:true,
      animationEnabled:false,
      gesturesEnabled:false
    }
  }
))

export default class App extends Component {
  render() {                            //将Navigation作为根路径导出
    return <RootStack />;
  }
}