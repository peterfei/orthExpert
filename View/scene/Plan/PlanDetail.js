/**
 * Created by xzh on 16:09 2019-08-09
 *
 * @Description:
 */

import React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,Alert
} from "react-native";
import {
  AppDef,
  BaseComponent,
  ContainerView, deviceWidth,
  FuncUtils,
  HttpTool,
  isIPhoneXFooter,
  isIPhoneXPaddTop,
  Line,
  NetInterface,
  size
} from '../../common';

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
          //  alert(JSON.stringify(res));
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
    this.props.navigation.navigate("kfSharingPlan", { planInfo: this.state.planInfo, amList: this.state.amList })
  }

  gotoDetail() {

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
        <View style={{flexDirection: 'row', alignItems:'center', marginLeft: size(25), marginRight: size(40), marginBottom: size(35)}}>
          <Text numberOfLines={1} style={{color: AppDef.White, fontSize: size(24), marginRight: size(35), flex: 1}}>
            {label_a}
          </Text>
          <TouchableOpacity onPress={() => {this.props.navigation.navigate('kfPlanDescHtml', {planName: planName, desc: desc})}}>
            <View style={{justifyContent: 'center', alignItems: 'center', borderRadius: size(5), borderColor: AppDef.White, borderWidth: size(0.5),
              paddingLeft: size(8), paddingRight: size(8), paddingTop: size(5), paddingBottom: size(5)}}>
              <Text style={{color: 'rgba(215,215,215,1)', fontSize: size(20)}}>
                查看更多
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    )
  }

  s_to_hs(s) {
    //计算分钟
    //算法：将秒数除以60，然后下舍入，既得到分钟数
    var h;
    h = Math.floor(s / 60);
    //计算秒
    //算法：取得秒%60的余数，既得到秒数
    s = s % 60;
    //将变量转换为字符串
    h += '';
    s += '';
    //如果只有一位数，前面增加一个0
    h = (h.length == 1) ? '0' + h : h;
    s = (s.length == 1) ? '0' + s : s;
    return h + ':' + s;
  }

  _renderShare() {

    let amNum = this.state.planInfo ? this.state.planInfo.am_num : 0;
    let time = 10;
    let completeTime = this.state.planInfo&&this.state.planInfo.complete_time>0 ? this.s_to_hs(this.state.planInfo.complete_time*60) : "-";

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: size(40) }}>
        <ImageBackground source={require('../../img/kf_main/kf_plan_banner_back.png')} style={{ width: size(713), height: size(237) }}>

           <TouchableOpacity onPress={() => { this.gotoSharePlan() }}>
            <View style={{
              marginLeft: size(57), marginRight: size(57), height: size(70), flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
              borderWidth: size(1), borderRadius: size(10), borderColor: 'rgba(158, 122, 92, 1)'
            }}>
              <Image source={require('../../img/kf_main/kf_plan_share_icon.png')} style={{ width: size(33), height: size(28) }} />
              <Text style={{ color: 'rgba(150, 125, 100, 1)', fontSize: size(28), marginLeft: size(30) }} >点击一下，分享此方案吧！</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(28), marginBottom: size(30) }}>个数</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text style={{ color: AppDef.Blue, fontSize: size(38) }}>{amNum}</Text>
                <Text style={{ color: AppDef.Black, fontSize: size(24), marginBottom: size(6) }}> 个动作</Text>
              </View>
            </View>
            <View style={{ width: size(1), height: size(80), backgroundColor: 'rgba(219, 219, 219, 1)' }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(28), marginBottom: size(30) }}>时长</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Text style={{ color: AppDef.Blue, fontSize: size(38) }}>{completeTime}</Text>
                <Text style={{ color: AppDef.Black, fontSize: size(24), marginBottom: size(6) }}> 分钟</Text>
              </View>
            </View>

          </View>
        </ImageBackground>
      </View>
    )
  }

  _renderEquip() {

    let equipments = [];
    let need_equip = this.state.planInfo ? this.state.planInfo.need_equip : "";

    return (
      <View style={{ width: '100%', marginTop: size(30) }}>
        <View style={{ width: '100%', paddingLeft: size(25), paddingRight: size(25) }}>
          <Line />
          <ImageBackground source={require('../../img/kf_main/kf_plan_tip.png')} style={{ width: size(160), height: size(46), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: AppDef.White, fontSize: size(24) }}>准备器材</Text>
          </ImageBackground>
          <View style={{ height: size(80), flexDirection: 'row', alignItems: 'center', marginLeft: size(222) }}>
            <Text style={{color: AppDef.Black, fontSize: size(28)}}>{need_equip}</Text>
            {/*<Text style={{ color: AppDef.Black, fontSize: size(28), marginLeft: size(60) }}>椅子</Text>*/}
          </View>
        </View>
        <View style={{ width: '100%', paddingLeft: size(25), paddingRight: size(25) }}>
          <Line />
          <ImageBackground source={require('../../img/kf_main/kf_plan_tip.png')} style={{ width: size(160), height: size(46), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: AppDef.White, fontSize: size(24) }}>动作解析</Text>
          </ImageBackground>
        </View>
      </View>

    )
  }

  gotoAmDetail(data) {
    //TODO 处理不需要下载的器械
    // this.props.navigation.navigate("RenTi", {
    //   animation: data,
    //   equipList:this.state.equipNoList
    // })
    Alert.alert(
      '立即下载运动康复训练APP', '定制计划',
      [
        { text: "稍后再说" },
        {
          text: "立即下载"
          //,
          // onPress: function () {
          //     const downloadUrl = item.url;
          //     NativeModules.DownloadApk.downloading(
          //         downloadUrl,
          //         "vesal.apk"
          //     );
          // }
        }
      ]
    );
  }

  async startPlay() {

    //检测权限
    this.mainView._showLoading('加载中');
    let isUse = await FuncUtils.checkPerm("no", AppDef.KFXL_VIP);
    if (isUse) {

      //保存记录

      FuncUtils.saveProgress(this.state.planId, 0);

      let downList = {
        amList: this.state.amList,
        equipList: this.state.equipNoList
      }

      this.props.navigation.navigate("TrainPlay", { plan: this.state.planInfo, downList: downList })
    } else {
      this.props.navigation.navigate('Member');
    }
    this.mainView._closeLoading();

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
      let uri = motions.icon_url ? { uri: motions.icon_url } : require('../../img/exercise/actimg.jpg');

      arr.push(
        <TouchableOpacity
          onPress={() => {
            this.gotoAmDetail(motions)
          }}
        >
          <View style={{ flex: 1, marginTop: size(30), marginBottom: size(30), marginLeft: size(25), marginRight: size(50), flexDirection: 'row' }}>
            <View>
              <Image source={uri} style={{ width: size(172), height: size(132), borderRadius: size(10), overflow: 'hidden' }} />
            </View>
            <View style={{ flex: 1, marginLeft: size(50), justifyContent: 'space-between' }}>
              <Text style={{ color: AppDef.Black, fontSize: size(26) }}>{name}</Text>
              <View style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(20) }}>训练类型: {dzType}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: size(15) }}>
                  {
                    isShowSeconds ?
                      <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150) }}>时长: {seconds}</Text> : null
                  }
                  {
                    isShowCS ?
                      <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150) }}>次数: {cs}</Text> : null
                  }
                  <Text style={{ color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150) }}>休息: {rest}s</Text>
                </View>
              </View>
            </View>
          </View>

          <Line color='rgba(227, 227, 227, 0.5)' height={size(1)} />
        </TouchableOpacity>
      )
    })

    let title = this.state.length > 0 ? '共' + this.state.amList.length + '个动作' : '';

    return (
      <View>
        <View style={{ marginLeft: size(25), paddingTop: size(10), paddingBottom: size(10) }}>
          <Text style={{ color: AppDef.Black, fontSize: size(28), }}>{title}</Text>
        </View>
        {arr}
      </View>
    )
  }

  _renderFooter() {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.startTouchStyle} onPress={() => {
        // alert('开始训练');

        this.startPlay()
      }}>
        <Text style={styles.startTextStyle}>开始训练</Text>
      </TouchableOpacity>
    )
  }

  _renderAnimationNav() {
    let planName = this.state.planInfo ? this.state.planInfo.plan_name : '';
    return (
      <View style={[styles.navbarStyle, { position: 'absolute', top: 0, left: 0, right: 0, }]} opacity={this.state.navbarOpacity}>
        <Text style={{ fontSize: size(34), fontWeight: 'bold', color: '#fff', paddingTop: statusBarHeight }}>{planName}</Text>
      </View>
    )
  }

  _renderBackIcon() {
    return (
      <TouchableOpacity
        style={{ position: 'absolute', left: size(20), top: isIPhoneXPaddTop(0) + (Platform.OS === 'android' ? statusBarHeight : 0), width: size(80), height: size(80), justifyContent: 'center', zIndex: 9999 }}
        onPress={() => {
          this.props.navigation.goBack();
        }}>
        <Image source={require('../../img/search/backjt.png')}
          style={{ width: size(36), height: size(36) }} />
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
          style={{ flex: 1 }}>

          {this._renderHeader()}

          {this._renderShare()}

          {this._renderEquip()}

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
    height: size(88) + isIPhoneXPaddTop(0) + (Platform.OS === 'android' ? statusBarHeight : 0),
    backgroundColor: '#5EB4F1',
    paddingTop: isIPhoneXPaddTop(0),
    justifyContent: 'center',
    alignItems: 'center',
  },
});



