/**
 * Created by xzh on 08:44 2019-08-12
 *
 * @Description:
 */

import React from "react";
import {
    Image,
    ImageBackground,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    DeviceEventEmitter
} from "react-native";
import {
  AppDef,
  BaseComponent,
  ContainerView,
  deviceWidth,
  FuncUtils,
  HttpTool,
  isIPhoneXFooter,
  isIPhoneXPaddTop,
  NetInterface,
  size,
} from '../../common';
import { storage } from "../../common/storage";
import ChooseMotionView from './ChooseMotionView';
import EditPlanInfo from './EditPlanInfo';
import MotionListCell from './MotionListCell';
import MotionEditCell from './MotionEditCell';
import DragTable from '../../common/DragTable';
import {NavigationActions,StackActions} from "react-navigation";
const statusBarHeight = StatusBar.currentHeight;
import Device from "react-native-device-info";

export default class CreatePlan extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      navbarOpacity: 0,
      isEdit: false,
      planInfo: {
        planName: '',
        description: '',
        icon2Url: null,
        labelA: ''
      },
      amList: [],
      isMB: props.navigation.state.params.isMB,
      planId: props.navigation.state.params.planId,
      scrollEnabled: true,
      sick: props.navigation.state.params.sick,
      currArea: props.navigation.state.params.currArea
    }

    this.offsetY = 0;

    this._panResponder = PanResponder.create({

    })
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      isMB: nextProps.navigation.state.params.isMB,
      planId: nextProps.navigation.state.params.planId,
      sick: nextProps.navigation.state.params.sick,
      currArea: nextProps.navigation.state.params.currArea
    })
  }

  componentWillMount() {
  }

  componentDidMount() {
    let isMB = this.props.navigation.state.params.isMB;
    if (isMB) { // 编辑模板
      this.requestMBData();
    }
  }

  requestMBData() {
    let planId = this.props.navigation.state.params.planId;
    const url = NetInterface.planDetail + '?planId=' + planId + '&plat=android';
    this.mainView._showLoading('加载中...');
    HttpTool.GET(url)
      .then(res => {
        this.mainView._closeLoading();
        if (res.code == 0 && res.msg == 'success') {
          let newPlanInfo = FuncUtils.filterUnderLine(res.plan);
          let newAmList = [];
          res.amList.forEach((motion) => {
            let newMotion = FuncUtils.filterUnderLine(motion);
            newAmList.push(newMotion);
          })

          let desc = newPlanInfo.description;
          let isHtml = desc.indexOf('.html') == -1 ? false : true
          if (isHtml) {
            newPlanInfo.description = '';
          }

          this.setState({
            planInfo: newPlanInfo,
            amList: newAmList,
          })
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(error));
      })
  }

  async requestSavePlan() {
    let list = [];
    this.state.amList.forEach((motion, index) => {
      let item = {
        sort: index,
        amNo: motion.amNo,
        taTime: motion.taTime,
        taType: motion.taType,
        rest: motion.rest,
        repetitions: motion.repetitions,
        time: motion.time,
        equipNoList: motion.equipNoList
      }
      list.push(item);
    })

    // alert(JSON.stringify(this.state.amList));

    if (list.length <= 0) {
      this.mainView._toast('请至少选择一个康复动作!');
      return;
    }
    if (this.state.planInfo.planName.length <= 0) {
      this.mainView._toast('请为您的方案起个名字吧!');
      return;
    }

    let params = {
      planName: this.state.planInfo.planName,
      description: this.state.planInfo.description,
      category:"康复",
      businessList:"kfxl",
      iconUrl: this.state.planInfo.iconUrl,
      icon2Url: this.state.planInfo.icon2Url,
      isPub:"no",
      labelA: this.state.planInfo.labelA,
      trainAnimations: list,
      patNo: this.state.sick.pat_no
    }
    this.mainView._showLoading('加载中...');
    // alert(JSON.stringify(params));
    // console.log(JSON.stringify(params));
    let tokens = await storage.get("userTokens");
    let auth = await storage.get("auth")
    // let userName = (auth.userName==undefined)?Device.getUniqueID():auth.userName;
    let userName = auth.userName||Device.getUniqueID()
    let loginType = auth.loginType||'tell';
    const url = NetInterface.createPlan + '?token=' + tokens.token + '&userName=' + userName + '&loginType=' + loginType;
    console.log(JSON.stringify(url));
    console.log(JSON.stringify(params));
    HttpTool.POST(url, params)
      .then(res => {
        this.mainView._closeLoading();
        if (res.code == 0 && res.msg == 'success') {
          // alert(JSON.stringify(res));
          this.mainView._toast("创建成功, 请前往-'我的定制'-界面查看");
          DeviceEventEmitter.emit('UpdateMyCustom');
          this.props.navigation.goBack(this.props.navigation.state.params.b_key);
        } else {
          this.mainView._toast(JSON.stringify(res.msg));
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        console.log(error);
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

  confirmSelectMotions(result) {

      if (result.length <= 0) {
        this.mainView._toast('请先选择一个动作进行添加!')
      } else {
          result.forEach((motion, index) => {
              motion.sort = index;
              motion.rest = '10';
              motion.taType = motion.amType;
              motion.repetitions = '10';
              motion.taTime = '10';

          })
          // alert(JSON.stringify(result));
          this.setState({
              amList: [...this.state.amList, ...result]
          }, () => {
              this.ChooseMotionView.close();
          })
      }
  }

  recieveData(result) {
    // alert(JSON.stringify(result));
    this.setState({
      amList: [...this.state.amList, ...result]
    })
  }

  editPlanInfo() {
    this.EditView.show(this.state.planInfo);
  }

  editMotions() {
    if (this.state.isEdit) { // 保存
      // alert(JSON.stringify(this.state.amList));
      this.setState({
        isEdit: false
      })
    } else {
      this.setState({
        isEdit: true
      })
    }
  }

  deleteMotion(index) {
    let list = this.state.amList;
    list.splice(index, 1);
    this.setState({
      amList: list
    })
  }

  _renderHeader() {
    let planInfo = this.state.planInfo;
    let planName = '';
    let desc = '';
    let labelA = '';
    let uri = {uri: ''};
    let isHtml = false;
    if (planInfo) {
      planName = planInfo.planName.length <= 0 ? '方案名称' : planInfo.planName;
      labelA = planInfo.labelA.length <= 0 ? '方案简介' : planInfo.labelA;
      desc = planInfo.description.length <= 0 ? '方案描述信息' : planInfo.description;
      uri =  planInfo.icon2Url ? {uri: planInfo.icon2Url} : require('../../img/kf_main/kf_plan_default_back.png');
      isHtml = desc.indexOf('.html') == -1 ? false : true;
    }

    return (
      <ImageBackground style={styles.bannerImg} source={uri}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: size(35), marginLeft: size(25)}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text numberOfLines={1} style={{color: AppDef.White, fontSize: size(50), fontWeight: '600', width: deviceWidth - size(200)}}>
              {planName}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {this.editPlanInfo()}}>
            <View style={{borderColor: 'rgba(101, 239, 227, 1)', borderWidth: size(0.5), borderRadius: size(10), justifyContent: 'center', alignItems: 'center', marginLeft: size(10), marginRight: size(25)}}>
              <Text style={{color: 'rgba(101, 239, 227, 1)', fontSize: size(26), marginLeft: size(13), marginRight: size(13), marginTop: size(8), marginBottom: size(8)}}>编辑名称</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', marginLeft: size(25), marginRight: size(40), marginBottom: size(35)}}>
          <Text numberOfLines={1} style={{color: AppDef.White, fontSize: size(24), marginRight: size(35), flex: 1}}>
            {labelA}
          </Text>
          {
            (isHtml || planInfo.description.length <= 0) ? null
              :
              <TouchableOpacity onPress={() => {this.props.navigation.navigate('kfPlanDescHtml', {planName: planName, desc: desc})}}>
                <View style={{justifyContent: 'center', alignItems: 'center', borderRadius: size(5), borderColor: AppDef.White, borderWidth: size(0.5),
                  paddingLeft: size(8), paddingRight: size(8), paddingTop: size(5), paddingBottom: size(5)}}>
                  <Text style={{color: 'rgba(215,215,215,1)', fontSize: size(20)}}>
                    查看更多
                  </Text>
                </View>
              </TouchableOpacity>
          }

        </View>
      </ImageBackground>
    )
  }

  _renderMotions() {

    let title = '已添加' + this.state.amList.length + '个动作';
    let text = this.state.isEdit ? '保存' : '修改';
    return (
      <View style={{width: '100%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: size(25), marginRight: size(25), marginTop: size(40), paddingTop: size(10), paddingBottom: size(10)}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: AppDef.Black, fontSize: size(28),}}>{title}</Text>
          </View>
          <TouchableOpacity onPress={() => {this.editMotions()}}>
            <View style={{borderColor: AppDef.Black, borderWidth: size(0.5), borderRadius: size(10), justifyContent: 'center', alignItems: 'center'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: size(25), marginRight: size(25), marginTop: size(8), marginBottom: size(8)}}>
                <Image source={require('../../img/kf_main/kf_plan_edit.png')} style={{width: size(27), height: size(24)}}/>
                <Text style={{color: AppDef.Black, fontSize: size(26), marginLeft: size(11)}}>{text}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          <DragTable
            dataSource={this.state.amList}
            parentWidth={deviceWidth}
            childrenWidth= {deviceWidth}
            childrenHeight={this.state.isEdit ? size(253) : size(195)}
            onDragStart={(startIndex,endIndex)=>{
              this.setState({
                scrollEnabled: false
              })
            }}
            onDragEnd={(startIndex)=>{
              this.setState({
                scrollEnabled: true
              })
            }}
            onDataChange = {(data)=>{
              this.setState({
                amList: data
              })
            }}
            onClickItem={(data,item,index)=>{
              // click delete
              // if (this.state.isEnterEdit) {
              //     const newData = [...data]
              //     newData.splice(index,1)
              //     this.setState({
              //         data: newData
              //     })
              // }
              // alert('点击了cell');
            }}
            keyExtractor={(item,index)=> index} // FlatList作用一样，优化
            renderItem={(item,index)=>{
              return this._rendMotionsView(item,index)
            }}
          />
        </View>
      </View>
    )
  }

  _rendMotionsView(motion, index) {
    if (this.state.isEdit) {
      return (
        <MotionEditCell key={index} motion={motion} lastOne={index == this.state.amList.length - 1} deleteAction={(motion) => {this.deleteMotion(index)}}/>
      )
    } else {
      return (
        <MotionListCell key={index} motion={motion} lastOne={index == this.state.amList.length - 1}/>
      )
    }
  }

  _renderAddButton() {
    return (
      <TouchableOpacity onPress={() => {
        // this.ChooseMotionView.show();
        this.props.navigation.navigate('kfAddAction',{sick:this.state.sick, currArea: this.state.currArea, recieveData: this.recieveData.bind(this)})
      }}>
        <View style={{width: deviceWidth - size(50), height: size(80), marginLeft: size(25), marginTop: size(40), marginBottom: size(30),
          borderColor: AppDef.Blue, borderWidth: size(0.5), borderRadius: size(20),
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../img/kf_main/kf_plan_add.png')} style={{width: size(32), height: size(32)}}/>
          <Text style={{color: AppDef.Black, fontSize: size(28), fontWeight: '400', marginLeft: size(25)}}>添加康复动作</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderFooter() {
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.startTouchStyle} onPress={() => {this.requestSavePlan()}}>
        <Text style={styles.startTextStyle}>完成</Text>
      </TouchableOpacity>
    )
  }

  _renderAnimationNav() {
    let planName = this.state.planInfo ? this.state.planInfo.planName : '';
    return (
      <View style={[styles.navbarStyle, {position: 'absolute', top: 0, left: 0, right: 0,}]} opacity={this.state.navbarOpacity}>
        <Text style={{fontSize: size(34), fontWeight: 'bold', color: '#fff'}}>{planName}</Text>
      </View>
    )
  }

  _renderBackIcon() {
      // height: Platform.OS === 'android' ? size(148) :  size(88) + isIPhoneXPaddTop(0),
      //     paddingTop: isIPhoneXPaddTop(0) +  ( Platform.OS === 'android' ? statusBarHeight : 0),
    return (
      <TouchableOpacity
        style={{position: 'absolute', left: size(20), top: isIPhoneXPaddTop(0) + ( Platform.OS === 'android' ? statusBarHeight : 0) , width: size(80), height: size(80), justifyContent: 'center', zIndex: 9999}}
        onPress={() => {
          this.props.navigation.goBack();
        }}>
        <Image source={require('../../img/search/backjt.png')}
               style={{width: size(36), height: size(36)}}/>
      </TouchableOpacity>
    )
  }

  _renderChooseView() {
    return (
      <ChooseMotionView
          ref={r => this.ChooseMotionView = r}
          sick={this.state.sick}
          currArea={this.state.currArea}
          selectMotions={(result) => {this.confirmSelectMotions(result)}}/>
    )
  }

  _renderEditView() {
    let _this = this;
    return (
      <EditPlanInfo ref={r => this.EditView = r} editComplete={(result) => {

        _this.setState({
          planInfo: result
        }, () => {
          _this.EditView.close();
        })
      }}/>
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
          scrollEnabled={this.state.scrollEnabled}
          style={{flex: 1}}>

          {this._renderHeader()}

          {this._renderMotions()}

          {this._renderAddButton()}

        </ScrollView>

        {this._renderFooter()}

        {this._renderAnimationNav()}

        {this._renderBackIcon()}

        {this._renderChooseView()}

        {this._renderEditView()}
      </ContainerView>
    );
  }

}

const styles = StyleSheet.create({
  bannerImg: {
    width: '100%',
    height: size(400) + isIPhoneXPaddTop(0),
    justifyContent: 'flex-end'
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
    height: Platform.OS === 'android' ? size(128) :size(88) + isIPhoneXPaddTop(0),
    backgroundColor: '#5EB4F1',
    paddingTop: isIPhoneXPaddTop(0) +  ( Platform.OS === 'android' ? statusBarHeight : 0),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// height: Platform.OS === 'android' ? size(148) :  size(88) + isIPhoneXPaddTop(0),
//     paddingTop: isIPhoneXPaddTop(0) +  ( Platform.OS === 'android' ? statusBarHeight : 0),