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
  Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter
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
    name: '',
    data: '',
    getData: '',
    search: false,
    rightMenu: false,
    img: false,
  }
  onUnityMessage(handler) {
    console.log(handler.name); // the message name
    console.log(handler.data); // the message data
    if(handler.data!=null){
      let boneDisease = this.hexToStr(handler.data.boneDisease)
      this.setState({
        name: handler.name,
        data: boneDisease,
        rightMenu: true,
      })
    }
    
    setTimeout(() => {
      // handler.send('I am callback!');
    }, 2000);
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
        if(closeBigImg==true)
        this.setState({
          img: false
        })
      }
    )
  };
  componentWillUnmount() {
    _.each(this.listeners, listener => {
      listener.remove();
    });
    this.timer && clearInterval(this.timer);
  }
  render() {
    return (
      <View style={styles.container}>
        <UnityView
          ref={(ref) => this.unity = ref}
          onUnityMessage={this.onUnityMessage.bind(this)}
          style={{
            width: screen.width,
            height: screen.height,
            zIndex: -1
          }} />
          {/* 底部详情 */}
          <View style={{
                    backgroundColor: "black", width: '100%', height: size(0.0001),
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                }}>
                </View>
        <Details navigation={this.props.navigation}
          sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)} />
        {/* 顶部/搜索 */}
        <SearchComponent navigation={this.props.navigation}
          pushRightMune={(pat_no) => this.pushDetails(pat_no)}
          setSearch={(bool) => this.setSearchComponent(bool)}
        />
        {/* 点击疾病后图片 */}
        {this.state.img && !this.state.search ? this.imgOpen() : null}
        {/* 右侧菜单及关闭按钮 */}
        {this.state.rightMenu && !this.state.search ? [this.rightMenu(), this.rightMenuClose()] : <View style={styles.place}></View>}
        
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
  imgOpen() {
    return (
      <View style={styles.detailsImage}>
        <Image style={{ width: '100%', height: '100%' }}
          source={{ uri: this.state.getData.img_url }}
        />
        <TouchableHighlight style={{ width: 20, height: 20, position: 'absolute', right: 5, top: 5 }}
          onPress={() => this.closeImg()}>
          <Image style={{ width: 20, height: 20, }}
            source={require('../../img/unity/cclose.png')}
          />
        </TouchableHighlight>
      </View>
    )
  }
  closeImg() {
    this.setState({
      img: false
    })
    DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
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
        <Text style={styles.boneName}>{this.state.name}</Text>
        <Text style={styles.boneDisease} onPress={() => this.showDetails()}>{this.state.data}</Text>
      </View>
    )
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

  showDetails() {
    DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
    DeviceEventEmitter.emit("getData", { getData: this.state.getData });
    this.setState({
      rightMenu: false
    })
    this.pushDetails('BLCJ001')////////////////////////////////////////////////////////临时固定pat_no =》 this.state.data
  }
  closeRightMenu() {
    this.setState({
      rightMenu: false,
    })
  }
}