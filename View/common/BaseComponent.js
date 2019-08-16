/**
 * Created by xzh on 20:19 2019-08-01
 *
 * @Description: 所有page页面继承此组件, 用于做全页面公用函数等功能;
 */


import React, {Component} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {AppDef} from './index'

export default class BaseComponent extends Component {

  // navigation 推出的所有视图, 默认去掉自带的顶部导航条
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    console.log('----------')
  }



  sendNotification() {

  }

  Super_TokenExprie() {

  }

  recieveNotification() {

  }

}