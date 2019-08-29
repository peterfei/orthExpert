/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, Image, Linking, StatusBar, TouchableOpacity,
  Dimensions, TouchableHighlight, TextInput, RefreshControl, ImageBackground, ScrollView, TouchableWithoutFeedback, DeviceEventEmitter, Button
} from 'react-native';
import { storage } from "../../common/storage";
import { ContainerView, BaseComponent, NavBar, ListCell, Line, MineBuuton, AppDef, isIPhoneXPaddTop, size, FuncUtils, deviceWidth } from '../../common';
import api from "../../api";
import MyTouchableOpacity from "../../common/components/MyTouchableOpacity";

const statusBarHeight = StatusBar.currentHeight;

export default class MyScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      isUse: false,//vip是否可以使用
      vipTitle: "开通会员",
      memberInfo: {}
    }
    this.listData = [
      {
        title: '我的订单',
        imgPath: require('../../img/kf_mine/mine_myorder.png'),
        route: 'MyOrder',
      },
      {
        title: '意见反馈',
        imgPath: require('../../img/kf_mine/mine_yjfk.png'),
        route: 'MessageBoard',
      },
      {
        title: '版本信息',
        imgPath: require('../../img/kf_mine/mine_version.png'),
        route: 'version',
      },
      {
        title: '联系客服',
        imgPath: require('../../img/kf_mine/mine_lxkf.png'),
        route: 'contactUs',
      },
      {
        title: '消息通知',
        imgPath: require('../../img/kf_mine/mine_xxtz.png'),
        route: 'MessageNotice',
      },
      {
        title: '帮助中心',
        imgPath: require('../../img/kf_mine/mine_bzzx.png'),
        route: 'Help',
      },
      {
        title: '激活码兑换',
        imgPath: require('../../img/kf_mine/mine_jhm.png'),
        route: 'ActivationCode'
      }
    ]
    this.btnData = [
      {
        title: '我的锻炼',
        imgPath: require('../../img/kf_mine/mine_myexcise.png'),
        route: 'kfMyExercise',
      },
      {
        title: '我的定制',
        imgPath: require('../../img/kf_mine/mine_mycustom.png'),
        route: 'kfMyCustom',
      },
      {
        title: '我的订单',
        imgPath: require('../../img/kf_mine/mine_myorder.png'),
        route: 'kfMyOrder',
      },
      // {
      //   title: '我的订单',
      //   imgPath: require('../../img/kf_mine/mine_myorder.png'),
      //   route: 'kfMyOrder',
      // },
    ]
  }

  async componentDidMount() {
    let combo = await FuncUtils.getComboByCode(AppDef.KFXL_VIP);
    let memberInfo = await storage.get("memberInfo");

    if (combo != null) {
      let isUse = await FuncUtils.checkPerm("yes", AppDef.KFXL_VIP);

      this.setState({
        isUse: isUse,
        combo: combo,
        memberInfo: memberInfo
      })
    } else {
      this.setState({
        memberInfo: memberInfo
      })
    }
  }

  async componentWillMount() {
    this.emit = DeviceEventEmitter.addListener(AppDef.kNotify_UpdateUserInfoSuccess, async () => {
      let memberInfo = await storage.get("memberInfo");
      this.setState({
        memberInfo: memberInfo
      })
    })
  }

  componentWillUnmount() {
    if (this.emit) {
      this.emit.remove()
    }
  }

  gotoDetail() {
    this.props.navigation.navigate('kfMineUserInfo')
  }

  isShowDefalutHeader() {
    if (this.state.memberInfo.mbHeadUrl) {
      return { uri: this.state.memberInfo.mbHeadUrl }
    } else {
      return require('../../img/kf_mine/defalutHead.png')
    }
  }
  _renderHeader() {
    return (
      <ImageBackground source={require('../../img/kf_mine/mine_topback.png')} style={styles.topImgBack}>

        <StatusBar />
        <View style={{justifyContent: 'center', alignItems: 'center',  height: size(88) + isIPhoneXPaddTop(0) + ( Platform.OS === 'android' ? statusBarHeight : 0),
          paddingTop: isIPhoneXPaddTop(0) + ( Platform.OS === 'android' ? statusBarHeight : 0)}}>
          <Text style={{color: AppDef.White, fontWeight: 'bold', fontSize: AppDef.TitleSize}} allowFontScaling={false}>个人中心</Text>

          <MyTouchableOpacity style={{height: size(88) + isIPhoneXPaddTop(0) , justifyContent: 'center', alignItems: 'center',
            position: 'absolute', left: size(20), top: isIPhoneXPaddTop(0) + ( Platform.OS === 'android' ? statusBarHeight : 0)}}
            onPress={() => {this.props.navigation.goBack()}}>
            <Image source={require('../../img/public/left.png')} style={{width: size(36), height: size(36)}}/>
          </MyTouchableOpacity>
        </View>

        <View style={{ width: '100%', flexDirection: 'row', marginBottom: size(41), marginTop: (Platform.OS === 'android' ? size(40) : 0) }}>
          <TouchableOpacity onPress={() => this.gotoDetail()}>
            <Image
              source={this.isShowDefalutHeader()}

              style={{ width: size(100), height: size(100), marginLeft: size(25), borderRadius: size(50) }} />
          </TouchableOpacity>
          <View style={{ marginLeft: size(40), marginRight: size(32), justifyContent: 'center', flex: 1 }}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: AppDef.White, fontSize: AppDef.SubTitleSize }} allowFontScaling={false}>{this.state.memberInfo.mbName}</Text>
                {
                  this.state.isUse
                    ?
                    <Image source={require('../../img/kf_mine/mine_vip_icon.png')} style={{ width: size(26), height: size(25), marginLeft: size(20) }} />
                    : null
                }
              </View>
              <Text style={{ fontSize: size(18), color: AppDef.White, }} allowFontScaling={false}>{this.state.isUse ? this.state.combo.end_time.substring(0, 10) + "到期" : ""}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: size(24), color: AppDef.White, }} allowFontScaling={false}>当前职业: {this.state.memberInfo.identityTitle}</Text>
              {
                this.state.isUse
                  ?
                  <TouchableOpacity activeOpacity={1} onPress={() => {
                    this.props.navigation.navigate('BuyVip')
                  }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', width: size(130), height: size(30), borderColor: AppDef.White, borderWidth: size(0.5), borderRadius: size(10) }}>
                      <Text style={{ fontSize: size(18), color: AppDef.White }} allowFontScaling={false}>立即续费</Text>
                    </View>
                  </TouchableOpacity>
                  :
                  null
              }
            </View>

          </View>
        </View>
      </ImageBackground>
    )
  }

  _renderVipButton() {
    return (
      <TouchableOpacity onPress={() => { this.props.navigation.navigate('BuyVip') }}>
        <View style={{ marginTop: size(39), marginBottom: size(39), marginLeft: size(25), marginRight: size(25) }}>
          <Image source={require('../../img/kf_mine/mine_vipbtn.png')} style={{ width: '100%', height: size(90) }} />
        </View>
      </TouchableOpacity>
    )
  }

  _renderMiddle() {
    let arr = [];
    let marginLeft = ((deviceWidth - size(140)) - 4 * size(93)) / 3;
    this.btnData.forEach((item, index) => {
      arr.push(
        <View style={{ marginLeft: index == 0 ? 0 : marginLeft }}>
          <MineBuuton key={index} title={item.title} imgPath={item.imgPath} route={item.route} clickAction={(route) => {
            // alert(JSON.stringify(route));
            this.props.navigation.navigate(route)
          }} />
        </View>
      )
    })
    return arr;
  }

  _renderList() {
    let arr = [];
    this.listData.forEach((item, index) => {
      arr.push(
        <ListCell title={item.title} imgPath={item.imgPath} route={item.route} navigation={this.props.navigation} />
      )
    })
    return arr;
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>

        <ScrollView bounces={false} style={{ height: '100%' }}>

          {this._renderHeader()}

          {!this.state.isUse ? this._renderVipButton() : null}

          {/* <View style={styles.middleViewStyle}>
            {this._renderMiddle()}
          </View> */}

          <Line height={size(14)} />

          {this._renderList()}

        </ScrollView>

      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  topImgBack: {
    width: '100%',
    height: size(269) + ( Platform.OS === 'android' ? statusBarHeight : 0),
  },
  middleViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: size(70),
    marginRight: size(70),
    paddingTop: size(30),
    paddingBottom: size(30),
    // backgroundColor: 'red'
  }
})