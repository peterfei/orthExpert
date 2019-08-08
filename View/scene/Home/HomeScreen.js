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
  Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity
} from 'react-native';
import { screen, system } from "../../common";
import SearchComponent from "./search";
import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
import { size } from '../../common/ScreenUtil';
import { VoiceUtils } from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import { NavigationActions, StackActions } from "react-navigation";
import { groupBy, changeArr } from "../../common/fun";
import { queryHistoryAll, insertHistory, deleteHistories, queryRecentlyUse } from "../../realm/RealmManager";
import { values, set } from 'mobx';
import Loading from "../../common/Loading";
import Toast from "react-native-easy-toast";
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
    getData:'',
    rightMenu: false,
    details: false,
    video: false,
    bottomIcon: [
      { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
      { img: require('../../img/home/tab1.png'), title: '成因' },
      { img: require('../../img/home/tab2.png'), title: '治疗' },
      { img: require('../../img/home/tab3.png'), title: '3D模型' },
      { img: require('../../img/home/tab4.png'), title: '康复' }
    ]
  }
  onUnityMessage(handler) {
    console.log(handler.name); // the message name
    console.log(handler.data); // the message data
    let boneDisease = this.hexToStr(handler.data.boneDisease)
    this.setState({
      name: handler.name,
      data: boneDisease,
      rightMenu: true,
    })
    setTimeout(() => {
      handler.send('I am callback!');
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
  render() {
    return (
      <View style={styles.container}>
        <UnityView
          ref={(ref) => this.unity = ref}
          onUnityMessage={this.onUnityMessage.bind(this)}
          style={{
            width: screen.width,
            height: screen.height-30
          }} />
        {/* 顶部/搜索 */}
        <SearchComponent navigation={this.props.navigation} pushRightMune={(pat_no)=>this.pushDetails(pat_no)}/>
        {/* 右侧菜单及关闭按钮 */}
        {this.state.rightMenu ? [this.rightMenu(), this.rightMenuClose()] : <View style={{
          position: 'absolute',
         
          right: 0,
          top: screen.height * 0.5,
          backgroundColor: 'rgba(0,0,0,0.5)',
        
          width:size(20),height:size(20),}}></View>}
        {/* 底部详情 */}
        {this.state.details ? this.details() : null}
        {/* 提示组件 */}
        <Loading
          ref={r => {
            this.Loading = r;
          }}
          hudHidden={false}
        />
        <Toast style={{ backgroundColor: '#343434' }} ref="toast" opacity={1} position='top'
          positionValue={size(100)} fadeInDuration={750} textStyle={{ color: '#FFF' }}
          fadeOutDuration={1000} />
      </View>
    );
  }
  async pushDetails(pat_no){
    //获取搜索后数据
    let url = api.base_uri + "v1/app/pathology/getPathologyRes?patNo="+pat_no;
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          getData: result
        },()=>alert(JSON.stringify(this.state.getData)))
      })
  }
  details() {
    return (
      <View style={styles.details}>
        {this.state.video ? this.renderVideo() : null}
        <View style={[styles.detailsRow, { marginTop: 5 }]}>
          <View>
            <Text style={{ color: 'white', fontWeight: 'bold', paddingLeft: 15 }}>{this.state.name}</Text>
          </View>
          <MyTouchableOpacity
            onPress={() => {
              this.fayin(this.state.name + "。" + this.state.name)
            }}
            style={{ position: 'absolute', left: '50%', transform: [{ translateX: -40 }], alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            <Image
              style={{ width: size(30), height: size(30), marginRight: size(10) }}
              source={require('../../img/unity/laba.png')} />
            <Text style={{ color: "white", }}>{this.state.name}</Text>
          </MyTouchableOpacity>
        </View>
        <View style={styles.detailsRow}>
          {this.renderBottomIcon()}
        </View>
      </View>
    )
  }
  rightMenu() {
    return (
      <View style={styles.rightMenu}>
        {/* <Text style={styles.boneName}>{this.state.name}</Text>
        <Text style={styles.boneDisease} onPress={() => this.showDetails()}>{this.state.data}</Text> */}
        <Text style={styles.boneName}>xxx</Text>
        <Text style={styles.boneDisease} onPress={() => this.showDetails()}>{this.state.data}</Text>
      </View>
    )
  }
  rightMenuClose() {
    return (
      <TouchableHighlight
        style={[styles.closeRightMenuStyle]}
        onPress={() => this.closeRightMenu()}>
        <Image style={styles.closeRightMenuImg} resizeMode="contain"
          source={require('../../img/public/right1.png')} />
      </TouchableHighlight>
    )
  }
  renderVideo() {
    return (
      <View style={[styles.videoSourceStyle]}>
        <View style={{
          height: size(60),
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>

          <MyTouchableOpacity onPress={() => {
            alert('关闭')
          }}>
            <Image source={require('../../img/unity/close.png')} style={{
              width: size(36),
              height: size(36),
              marginRight: size(20),
              resizeMode: 'contain'
            }} />
          </MyTouchableOpacity>

        </View>
        <Video
          rotateToFullScreen
          lockPortraitOnFsExit
          scrollBounce

          url={this.state.currentShowSource.content}
          ref={(ref) => {
            this.video = ref
          }}
          onError={(msg) => {
            this.playVideoError(msg)
          }}
          onFullScreen={(status) => {
            status ? this.sendMsgToUnity('landscape', '', '') : this.sendMsgToUnity('portrait', '', '');
            this.setState({
              isPro: !status
            })
          }}
        />
      </View>
    )
  }
  renderBottomIcon() {
    let Arr = [];
    let data = this.state.bottomIcon
    for (let i = 0; i < data.length; i++) {
      Arr.push(
        <TouchableOpacity style={styles.btnStyle} key={i} onPress={() => {
          this.clickBack()
        }}>
          <Image style={styles.btnImgStyle} source={data[i].img} />
          <Text style={styles.btnTextStyle}>{data[i].title}</Text>
        </TouchableOpacity>
      )
    }
    return Arr
    //   let arr = [];
    //   arr.push(
    //     <TouchableOpacity style={styles.btnStyle} onPress={() => {
    //         this.clickBack()
    //     }}>
    //         <Image style={styles.btnImgStyle} source={require('../../img/unity/fanhuiyuan.png')}/>
    //         <Text style={styles.btnTextStyle}>返回</Text>
    //     </TouchableOpacity>
    // )
    // this.state.sourceData.forEach((item, index) => {
    //     let icon = item.res_fy_icon_url;
    //     let rwId = this.state.currentShowSource.rw_id == undefined ? '' : this.state.currentShowSource.rw_id;
    //     let color = rwId == item.rw_id ? '#60ccff' : '#fff';
    //     let data =
    //         arr.push(
    //             <MyTouchableOpacity style={styles.btnStyle} onPress={() => {
    //                 this.handleActionSource(item)
    //             }} key={index}>
    //                 <Image style={[styles.btnImgStyle, {tintColor: color}]} source={{uri: icon}}/>
    //                 <Text style={[styles.btnTextStyle, {color: color}]}>{item.secondFyName}</Text>
    //             </MyTouchableOpacity>
    //         )
    // })
    // return (
    //     <View style={{
    //         flexDirection: 'row',
    //         height: size(90),
    //         alignItems: 'center',
    //         backgroundColor: 'rgba(0,0,0,0.8)',
    //     }}>
    //         {arr}
    //     </View>
    // )
  }
  clickBack() {
    // this.setState({

    // })
    alert('返回')
  }
  showDetails() {
    this.setState({
      details: true,
    })
  }
  closeRightMenu() {
    this.setState({
      rightMenu: false,
      details: false
    })
  }
  fayin(name) {
    name = name.replace("_L", "").replace("_R", "").replace("_左", "").replace("_右", "");
    if (Platform.OS != "ios") {
      this.initVoice();
    }
    VoiceUtils.speak(name);
  }
  initVoice() {
    if (index == 0) {
      VoiceUtils.init(0);
      index++
    }
  }
}


