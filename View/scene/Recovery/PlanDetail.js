/**
 * Created by xzh on 16:09 2019-08-09
 *
 * @Description:
 */

import React from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground,StatusBar,DeviceEventEmitter} from "react-native";
import {
  HttpTool,
  NetInterface,
  isIPhoneXPaddTop,
  isIPhoneXFooter,
  AppDef,
  BaseComponent,
  ContainerView,
  Line,
  FuncUtils
} from '../../common';

import { size } from "../../common/ScreenUtil";
import api from "../../api";
import {storage} from "../../common/storage";
const statusBarHeight = StatusBar.currentHeight;


export default class PlanDetail extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      navbarOpacity: 0,
      planId: props.navigation.state.params.planId,
      planInfo: null,
      amList: [],
      equipNoList: [],
    }

    this.offsetY = 0;

  }

  async componentWillMount() {
  }

  componentDidMount() {
    this.requestDetailData()
  }

  requestDetailData() {
    const url = NetInterface.planDetail + '?planId=' + this.state.planId + '&plat=android';
    this.mainView._showLoading('加载中');
    HttpTool.GET(url)
      .then(res => {
        this.mainView._closeLoading();
        if (res.code == 0 && res.msg == 'success') {
          this.setState({
            planInfo: res.plan,
            amList: res.amList,
            equipNoList: res.equipNoList
          })
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(error));
      })
  }

  onScroll(e) {
    let currentOffsetY = e.nativeEvent.contentOffset.y;
    if (this.offsetY < size(200) && currentOffsetY >= size(200)) {
      this.setState({
        navbarOpacity: 1
      })
    }
    if (this.offsetY > size(200) && currentOffsetY <= size(200)) {
      this.setState({
        navbarOpacity: 0
      })
    }
    this.offsetY = currentOffsetY;
  }

  gotoSharePlan() {
    this.props.navigation.navigate("kfSharingPlan", {planInfo: this.state.planInfo, amList: this.state.amList})
  }

  _renderHeader() {
    let planName = '';
    let desc = '';
    let uri = {uri: ''};
    let label_a = '';
    if (this.state.planInfo) {

      planName = this.state.planInfo.plan_name;
      desc = this.state.planInfo.description;
      label_a = this.state.planInfo.label_a;
      uri = {uri: this.state.planInfo.icon2_url};
    }

    return (
      <ImageBackground style={styles.bannerImg} source={uri}>
        <Text style={{color: AppDef.White, fontSize: size(50), fontWeight: '600', marginBottom: size(35), marginLeft: size(25)}}>
          {planName}
        </Text>
        <View style={{flexDirection: 'row', marginLeft: size(25), marginRight: size(40), marginBottom: size(35)}}>
          <Text numberOfLines={1} style={{color: AppDef.White, fontSize: size(20), marginRight: size(35), flex: 1}}>
            {label_a}
          </Text>
          <Text style={{color: 'rgba(215,215,251,1)', fontSize: size(20)}}>
            {/*查看更多*/}
          </Text>
        </View>
      </ImageBackground>
    )
  }

  _renderShare() {
    return (
      <TouchableOpacity style={{marginLeft: size(25), marginRight: size(25), marginTop: size(40), marginBottom: size(20), height: size(70), flex: 1,
                    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(249, 242, 235, 1)', borderRadius: size(10)}}
            onPress={() => this.gotoSharePlan()}>
        <Text style={{color: 'rgba(150, 125, 100, 1)', fontSize: size(28)}} >点击一下，分享此方案吧！</Text>
      </TouchableOpacity>
    )
  }

  gotoAmDetail(data){
  //TODO 处理不需要下载的器械
    this.props.navigation.navigate("RenTi", {
      animation: data,
      equipList:this.state.equipNoList
    })
    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: true });

  }

  async startPlay(){

    //检测权限

    let isUse = await FuncUtils.checkPerm("no",AppDef.KFXL_VIP);
    if (isUse){
      //保存记录
      let downList = {
        amList:this.state.amList,
        equipList:this.state.equipNoList
      }

      this.props.navigation.navigate("TrainPlay", {plan: this.state.planInfo,downList:downList})
    } else{
      this.props.navigation.navigate('BuyVip');
    }

  }

  _renderMotions() {

    let arr = [];

    this.state.amList.forEach((motions, index) => {

      let name = motions.am_ch_name;
      let dzType = motions.lashen_donzuo;
      let isShowCS = motions.am_type.indexOf('次') != -1 ? true : false;
      let isShowSeconds = motions.am_type.indexOf('秒') != -1 ? true : false;
      let cs = ''; let seconds = '';
      cs = isShowCS ? motions.repetitions + '次' : cs;
      seconds = isShowSeconds ? motions.ta_time + '秒' : seconds;
      let rest = motions.rest;
      let isShowLast = index == this.state.amList.length - 1 ? false : true;
      let uri =  motions.icon_url ? {uri: motions.icon_url} : require('../../img/exercise/actimg.jpg');

      arr.push(
        <TouchableOpacity
            onPress={() => {
              this.gotoAmDetail(motions)
            }}
        >
          <View style={{flex: 1, marginTop: size(30), marginBottom: size(30), marginLeft: size(25), flexDirection: 'row'}}>
            <View>
              <Image source={uri} style={{width: size(172), height: size(132), borderRadius: size(10), overflow: 'hidden'}}/>
            </View>
            <View style={{flex: 1, marginLeft: size(23), justifyContent: 'space-between'}}>
              <Text style={{color: AppDef.Black, fontSize: size(26), marginTop: size(11)}}>{name}</Text>
              <View style={{marginBottom: size(13)}}>
                <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20), marginBottom: size(14)}}>{dzType}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>

                  {
                    isShowSeconds
                      ?
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={require('../../img/kf_main/kf_plan_sj.png')} style={{width: size(24), height: size(24), marginRight: size(32)}}/>
                        <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20), marginLeft: size(12)}}>{seconds}</Text>
                      </View>
                      :
                      null
                  }

                  {
                    isShowCS
                      ?
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={require('../../img/kf_main/kf_plan_cs.png')} style={{width: size(24), height: size(24)}}/>
                        <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20), marginLeft: size(12)}}>{cs}</Text>
                      </View>
                      :
                      null
                  }

                </View>
              </View>
            </View>
          </View>

          {
            isShowLast
              ?
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: size(25), marginBottom: size(30)}}>
                <Image source={require('../../img/kf_main/kf_plan_rest.png')} style={{width: size(24), height: size(24)}}/>
                <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20), marginLeft: size(20)}}>休息 {rest}'' 秒</Text>
              </View>
              :
              null
          }

          <Line color='rgba(227, 227, 227, 0.5)' height={size(1)}/>
        </TouchableOpacity>
      )
    })

    let title = this.state.length > 0 ? '共' + this.state.amList.length + '个动作' : '';

    return (
      <View>
        <View style={{marginLeft: size(25), paddingTop: size(10), paddingBottom: size(10)}}>
          <Text style={{color: AppDef.Black, fontSize: size(28),}}>{title}</Text>
        </View>
        {arr}
      </View>
    )
  }

  // _renderFooter() {
  //   return (
  //     <TouchableOpacity activeOpacity={0.8} style={styles.startTouchStyle} onPress={() => {
  //      // alert('开始训练');

  //       this.startPlay()
  //     }}>
  //       <Text style={styles.startTextStyle}>开始训练</Text>
  //     </TouchableOpacity>
  //   )
  // }

  _renderAnimationNav() {
    let planName = this.state.planInfo ? this.state.planInfo.plan_name : '';
    return (
      <View style={[styles.navbarStyle, {position: 'absolute', top: 0, left: 0, right: 0,}]} opacity={this.state.navbarOpacity}>
        <Text style={{fontSize: size(34), fontWeight: 'bold', color: '#fff', paddingTop: statusBarHeight}}>{planName}</Text>
      </View>
    )
  }

  _renderBackIcon() {
    return (
      <TouchableOpacity
        style={{position: 'absolute', left: size(20), top: isIPhoneXPaddTop(0) + statusBarHeight, width: size(80), height: size(80), justifyContent: 'center', zIndex: 9999}}
        onPress={() => {
          this.props.navigation.goBack();
        }}>
        <Image source={require('../../img/search/backjt.png')}
               style={{width: size(36), height: size(36)}}/>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>

        <ScrollView
          ref='scrollView'
          onScroll={this.onScroll.bind(this)}
          scrollEventThrottle={4}
          alwaysBounceVertical={false}
          bounces={false}
          style={{flex: 1}}>

          {this._renderHeader()}

          {this._renderShare()}

          {this._renderMotions()}

        </ScrollView>

        {/* {this._renderFooter()} */}

        {this._renderAnimationNav()}

        {this._renderBackIcon()}

      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  bannerImg: {
    width: '100%',
    height: size(400) + isIPhoneXPaddTop(0),
    justifyContent: 'flex-end',

  },
  startTouchStyle: {
    backgroundColor: AppDef.Blue,
    height: size(88) + isIPhoneXFooter(0),
    width: '100%',
  },
  startTextStyle: {
    fontSize: size(48),
    width: '100%',
    height: size(88) + isIPhoneXFooter(0),
    lineHeight: size(88) + isIPhoneXFooter(0),
    fontWeight: 'bold',
    textAlign: 'center',
    color: AppDef.White
  },
  navbarStyle: {
    width: '100%',
    height: size(88) + isIPhoneXPaddTop(0) + statusBarHeight,
    backgroundColor: '#5EB4F1',
    paddingTop: isIPhoneXPaddTop(0),
    justifyContent: 'center',
    alignItems: 'center',
  },
});