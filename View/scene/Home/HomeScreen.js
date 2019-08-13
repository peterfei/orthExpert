/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, BackHandler,
  StatusBar,
  Animated,
  Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter, ScrollView
} from 'react-native';
import { screen, system } from "../../common";
import SearchComponent from "./search";
import Details from "./details"
import UnityView, { UnityViewMessageEventData, MessageHandler ,UnityModule} from 'react-native-unity-view';
import { size } from '../../common/ScreenUtil';
import { VoiceUtils } from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import { NavigationActions, StackActions } from "react-navigation";
import { groupBy, changeArr } from "../../common/fun";
import { queryHistoryAll, insertHistory, deleteHistories, queryRecentlyUse } from "../../realm/RealmManager";
import { values, set } from 'mobx';
import api from "../../api";
import historyData from "./History.json";
import styles from './styles';
import Toast from "react-native-easy-toast";
let unity = UnityView;
let index = 0;
import ImagePlaceholder from 'react-native-image-with-placeholder'


export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    getData: '',
    search: false,
    rightMenu: false,
    img: false,
    rightMenuData: '',
    fadeAnim: new Animated.Value(screen.width * 0.4),
    willCloseAnimated: false,
    reconfirm: false,
    EnterNowScreen: "isMainScreen",
    loading: true,
    isUnityReady:false
  }

  Animated() {
    Animated.timing(                  // 随时间变化而执行动画
      this.state.fadeAnim,            // 动画中的变量值
      {
        duration: 300,          // 让动画持续一段时间
        toValue: 0,                         // 动画结束变量值
        useNativeDriver: true
      }
    ).start();

  }
  AnimatedOver() {
    Animated.timing(                  // 随时间变化而执行动画
      this.state.fadeAnim,            // 动画中的变量值
      {
        duration: 300,          // 让动画持续一段时间
        toValue: screen.width * 0.4,                         // 动画结束变量值
        useNativeDriver: true
      }
    ).start();
  }
  onUnityMessage(handler) {
    // DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
    if (handler.name == "title") {
      this.setState({
        isUnityReady:true
      })
      if (this.state.EnterNowScreen == 'isMainScreen') {
        DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
      }
      if (this.state.EnterNowScreen == 'isNotMainScreen') {
        DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
      }
    }
    console.log(handler.name); // the message name
    console.log(handler.data); // the message data
    if (handler.data != null) {
      let boneDisease = this.hexToStr(handler.data.boneDisease)
      this.setState({
        rightMenu: true,
      })
      this.getPathologyAndArea(boneDisease)
    }
  }
  /**
     * 16进制转字符
     * */
  hexToStr(str) {
    var val = "";
    var arr = str.split("_");
    for (var i = 0; i < arr.length; i++) {
      val += String.fromCharCode(parseInt(arr[i], 16));
    }
    return val;
  }
  listeners = {
    update: DeviceEventEmitter.addListener("closeBigImg",
      ({ ...passedArgs }) => {
        let closeBigImg = passedArgs.closeBigImg
        if (closeBigImg == true) {
          this.setState({
            img: false
          })
        }
        if (closeBigImg == false) {
          this.setState({
            img: true
          })
          DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
        }
      }
    )
  };
  componentWillUnmount() {
    _.each(this.listeners, listener => {
      listener.remove();
    });
    this.timer && clearInterval(this.timer);
    BackHandler.removeEventListener("back", this.goBackClicked);
  }
  async componentWillMount() {
    //Unity 是否已加载
    // this.setState({
    //   isUnityReady: await (UnityModule.isReady())
    // }) 
    this.BackHandler()
  }
  BackHandler() {
    BackHandler.addEventListener("back", this.goBackClicked);
  }

  /**
   * 点击物理回退键，
   * 修复闪退
   */
  goBackClicked = () => {
    if (this.state.EnterNowScreen == 'isMainScreen') {
      this.closeRightMenu();
      this.setState({
        img: false
      })
      DeviceEventEmitter.emit("DetailsWinEmitter", { details: false });
      DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
      this.props.navigation.goBack();
      if (!this.state.rightMenu) {
        this.refs.toast.show("再次点击退出");
        BackHandler.removeEventListener("back", this.goBackClicked);
        this.timer = setTimeout(
          () => this.reconfirm(), 1000
        );
      }
    } else if (this.state.EnterNowScreen == 'isNotMainScreen') {
      this.sendMsgToUnity('back', '', '')
    }
    return true;
  };
  reconfirm() {
    this.BackHandler()
  }
  render() {
    return (
      <View style={styles.container}>
        {/**
         * Hide the StatusBar on the top which some cellphone's
         * color always show White.
         * By peterfei.
         */}
        <StatusBar
          hidden={true}
        />
        <UnityView
          ref={(ref) => this.unity = ref}
          onUnityMessage={this.onUnityMessage.bind(this)}
          style={{
            width: screen.width,
            height: screen.height
            
          }} />
        {/* 顶部/搜索 */}
        {this.state.isUnityReady?(
          <SearchComponent navigation={this.props.navigation}
          pushRightMune={(pat_no, img) => this.showDetails(pat_no, img)}
          setSearch={(bool) => this.setSearchComponent(bool)}
        />
        ):null}
        {/* 点击疾病后图片 */}
        {this.state.img && !this.state.search && this.state.rightMenuData.pathologyList != null ? this.imgOpen() : null}
        {/* 右侧菜单及关闭按钮 */}

        {this.state.rightMenu && !this.state.search && this.state.rightMenuData.pathologyList != null ? this.MenuBody() : <View style={styles.place}></View>}
        {/* 底部详情 */}
        <Details navigation={this.props.navigation} setScreen={(Screen) => this.setState({ EnterNowScreen: Screen })}
          sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)} />
          {/* 提示组件 */}
          <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
      </View>
    );
  }
  /**
     * 发送消息给unity
     */
  sendMsgToUnity(name, info, type) {

    if (this.unity) {
      if (type == 'json') {
        let temp = Object.assign({}, info)
        this.unity.postMessageToUnityManager({
          name: name,
          data: JSON.stringify(temp)
        })
      } else {
        this.unity.postMessageToUnityManager({
          name: name,
          data: info
        })
      }
    }
  }
  async pushDetails(pat_no, img, num) { //获取单个疾病资源,包括底部菜单,图片,摄像机参数等
    //获取搜索后数据
    let url = api.base_uri + "v1/app/pathology/getPathologyRes?patNo=" + pat_no;
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          getData: result.pathology
        }
          //, () => alert(JSON.stringify(this.state.getData))
        )
      })
    if (img == "img") {
      this.setState({
        img: true,
      }, () => { this.defaultLocation(num) }
      )
      DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
    } else if (img == "noImg") {
      this.setState({
        img: false
      })
    }
    DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
    DeviceEventEmitter.emit("getData", { getData: this.state.getData });
  }
  async getPathologyAndArea(patAreaNo) {//点击区域获取右侧疾病数据
    let url = api.base_uri + "v1/app/pathology/getPathologyAndArea?patAreaNo=" + patAreaNo;
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          rightMenuData: result
        })
      })
  }
  imgOpen() {
    let _that = this
    return (
      <View style={styles.detailsImage}>
        <ScrollView
          ref={component => this._scrollView = component}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollAnimationEnd.bind(_that)}
          style={{ width: screen.width, height: screen.height }}
        >
          {this.renderImg()}
        </ScrollView>
      </View>
    )
  }
  defaultLocation(num) {
    if (num != null) {
      this.fristTime = setTimeout(() => {
        this._scrollView.scrollTo({ x: num * screen.width, y: 0, animated: false })
      }, 0)
    }
  }
  onScrollAnimationEnd(e) {
    var i = Math.floor(e.nativeEvent.contentOffset.x / (screen.width - 0.01));
    this.pushDetails(this.state.rightMenuData.pathologyList[i].pat_no, "img")
  }
  MenuBody() {
    return (
     // <TouchableOpacity activeOpacity={1} style={{ width: '100%', height: '100%', position: 'absolute' }} >
        [this.rightMenu(),this.rightMenuClose()]
      //</TouchableOpacity>
    )
  }
  renderImg() {
    let arr = []
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      arr.push(
        <View key={i} style={{ width: screen.width, height: screen.height, justifyContent: 'center', alignItems: 'center' }}>
          {/* <Image style={{ width: '80%', height: '80%' }}
            source={{ uri: this.state.rightMenuData.pathologyList[i].img_url }}
          />  */}
          <ImagePlaceholder 
          style={{  flex:1 }}
          duration={1000}
          activityIndicatorProps={{
            size: 'large',
            color: 'green',
          }}
          src={this.state.rightMenuData.pathologyList[i].img_url} 
          placeholder='http://filetest1.vesal.site/image/slt/flowers-small.jpg'
          />
          
          {/* <TouchableHighlight style={{ width: 30, height: 30, position: 'absolute', right: 15, top: 15 }}
            onPress={() => this.closeImg()}>
            <Image style={{ width: 30, height: 30, }}
              source={require('../../img/unity/close.png')}
            />
          </TouchableHighlight> */}
        </View>
      )
      if (this.state.rightMenuData.pathologyList[i].img_url == null) {
        arr.pop()
      }
    }
    return arr
  }

  _onLoadEnd = () => {
    this.setState({
      loading: false
    })
  }
  closeImg() {
    this.setState({
      img: false
    })
    //DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
  }
  setSearchComponent(bool) {
    this.setState({
      search: bool
    })
    if (bool == false) {
      this.setState({
        rightMenu: bool,
        img: bool
      })
    }
    DeviceEventEmitter.emit("DetailsWinEmitter", { search: bool });
  }
  setDetailsComponent(bool) {
    this.setState({
      details: bool
    })
  }
  rightMenu() {
    let { fadeAnim } = this.state;
    this.Animated()
    if (this.state.willCloseAnimated) {
      this.AnimatedOver()
    }
    return (
      <Animated.View                 // 使用专门的可动画化的View组件
        style={{
          position: 'absolute',
          height: screen.height * 0.7,
          right: 0,                 //  将位置指定为动画变量
          top: screen.height * 0.5,
          backgroundColor: 'rgba(0,0,0,0.8)',
          width: screen.width * 0.4,
          transform: [{ translateY: -screen.height * 0.7 * 0.5 }, { translateX: fadeAnim }],
          alignItems: 'center',
          borderRadius: 5,
          zIndex: 999,
        }} >
        <Text style={styles.boneName}>{this.state.rightMenuData.area.pat_name}</Text>
        <ScrollView>
          {this.renderRightMenuBody()}
        </ScrollView>
      </Animated.View>
    )
  }
  renderRightMenuBody() {
    let arr = []
    //alert(JSON.stringify(this.state.rightMenuData.pathologyList) )
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      arr.push(
        <Text style={styles.boneDisease} key={i} onPress={() => this.showDetailsRight(this.state.rightMenuData.pathologyList[i].pat_no, "img", i)}>{this.state.rightMenuData.pathologyList[i].pat_name}</Text>
      )
    }
    //alert(this.state.rightMenuData.pathologyList[1])
    return arr
  }
  showDetailsRight(pat_no, img, i){
    if(this.state.rightMenuData.pathologyList[i].img_url != null){
      this.showDetails(pat_no, "img", i)
    }else{
      this.showDetails(pat_no, "noImg", i)
    }
  }
  rightMenuClose() {
    let { fadeAnim } = this.state;
    this.Animated()
    if (this.state.willCloseAnimated) {
      this.AnimatedOver()
    }
    return (
      <Animated.View                 // 使用专门的可动画化的View组件
        style={{
          height: 40,
          width: 40,
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: 20,
          position: 'absolute',
          top: screen.height * 0.5,
          right: screen.width * 0.4 - 20,
          transform: [{ translateY: -20 }, { translateX: fadeAnim }],
          paddingLeft: 3,
          justifyContent: 'center',
        }
        } >
        <TouchableHighlight onPress={() => this.closeRightMenu()}>
          <Image style={styles.closeRightMenuImg} resizeMode="contain"
            source={require('../../img/public/right1.png')} />
        </TouchableHighlight>
      </Animated.View >
    )
  }

  showDetails(pat_no, img, num) {
    this.pushDetails(pat_no, img, num)
    this.setState({
      rightMenu: false
    })
  }
  closeRightMenu() {
    this.setState({
      willCloseAnimated: true
    })
    this.timer = setTimeout(
      () => this.setState({
        rightMenu: false,
        willCloseAnimated: false
      }), 500
    );
  }
}