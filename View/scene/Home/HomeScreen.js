/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View,
  BackAndroid,
  StatusBar,
  Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter, ScrollView
} from 'react-native';
import { screen, system } from "../../common";
import SearchComponent from "./search";
import Details from "./details"
import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
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
let unity = UnityView;
let index = 0;


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
  }
  onUnityMessage(handler) {
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
      }
    )
  };
  componentWillUnmount() {
    _.each(this.listeners, listener => {
      listener.remove();
    });
    this.timer && clearInterval(this.timer);
  }
  componentWillMount() {
      if (Platform.OS === 'android') {
          BackAndroid.addEventListener("back", this.goBackClicked);
      }
  }
  
  /**
   * 点击物理回退键，
   * 修复闪退
   */
  goBackClicked = () => {
      this.closeRightMenu()
      this.props.navigation.goBack();
      return true;
  };
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
        <SearchComponent navigation={this.props.navigation}
          pushRightMune={(pat_no) => this.showDetails(pat_no)}
          setSearch={(bool) => this.setSearchComponent(bool)}
        />
        {/* 点击疾病后图片 */}
        {this.state.img && !this.state.search && this.state.rightMenuData.pathologyList != null ? this.imgOpen() : null}
        {/* 右侧菜单及关闭按钮 */}
        {this.state.rightMenu && !this.state.search && this.state.rightMenuData.pathologyList != null ? [this.rightMenu(), this.rightMenuClose()] : <View style={styles.place}></View>}
        {/* 底部详情 */}
        <Details navigation={this.props.navigation}
          sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)} />
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
  async pushDetails(pat_no) { //获取单个疾病资源,包括底部菜单,图片,摄像机参数等
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
    this.setState({
      img: true
    })
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
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollAnimationEnd.bind(_that)}
          style={{ width: screen.width, height: screen.height * 0.75 }}
        >
          {this.renderImg()}
        </ScrollView>
      </View>
    )
  }
  onScrollAnimationEnd(e) {
    var i = Math.floor(e.nativeEvent.contentOffset.x / (screen.width - 0.01));
    this.pushDetails(this.state.rightMenuData.pathologyList[i].pat_no)
  }
  renderImg() {
    let arr = []
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      arr.push(
        <View key={i} style={{ width: screen.width, height: screen.height * 0.75 }}>
          <Image style={{ width: '100%', height: '100%' }}
            source={{ uri: this.state.rightMenuData.pathologyList[i].img_url }}
          />
          {/* 无图可能报错 */}
          <TouchableHighlight style={{ width: 30, height: 30, position: 'absolute', right: 15, top: 15 }}
            onPress={() => this.closeImg()}>
            <Image style={{ width: 30, height: 30, }}
              source={require('../../img/unity/close.png')}
            />
          </TouchableHighlight>
        </View>
      )
    }
    return arr
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
    return (
      <View style={styles.rightMenu}>
        <Text style={styles.boneName}>{this.state.rightMenuData.area.pat_name}</Text>
        <ScrollView>
          {this.renderRightMenuBody()}
        </ScrollView>
      </View>
    )
  }
  renderRightMenuBody() {
    let arr = []
    //alert(JSON.stringify(this.state.rightMenuData.pathologyList) )
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      arr.push(
        <Text style={styles.boneDisease} key={i} onPress={() => this.showDetails(this.state.rightMenuData.pathologyList[i].pat_no)}>{this.state.rightMenuData.pathologyList[i].pat_name}</Text>
      )
    }
    //alert(this.state.rightMenuData.pathologyList[1])
    return arr
  }
  rightMenuClose() {
    return (
      <View style={[styles.closeRightMenuStyle]}>
        <TouchableHighlight onPress={() => this.closeRightMenu()}>
          <Image style={styles.closeRightMenuImg} resizeMode="contain"
            source={require('../../img/public/right1.png')} />
        </TouchableHighlight>
      </View>
    )
  }

  showDetails(pat_no) {
    this.pushDetails(pat_no)
    this.setState({
      rightMenu: false
    })
  }
  closeRightMenu() {
    this.setState({
      rightMenu: false,
    })
  }
}