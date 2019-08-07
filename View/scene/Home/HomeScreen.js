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
  Dimensions, TouchableHighlight, TextInput, Image,TouchableOpacity
} from 'react-native';
import { screen, system } from "../../common";

import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
import { size } from '../../common/ScreenUtil';
import {VoiceUtils} from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import { values, set } from 'mobx';
let unity = UnityView;
let index = 0;


export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    name: '',
    data: '',
    search: false,
    rightMenu: false,
    details: false,
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
            height: screen.height
          }} />

        {!this.state.search ?
          <View style={styles.body}>
            <View style={styles.top}>
              <TouchableHighlight
                onPress={() => this.My()}>
                <View style={[styles.button, { marginLeft: 10 }]}>
                  <Image style={styles.icon}
                    source={require('../../img/home/left.png')} />
                  <Text style={styles.iconTitle}>我的</Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight style={styles.input}
                onPress={() => this.showSearch()}>
                <TextInput
                  style={{ width: '100%', height: '100%' }}
                  placeholder="请输入病症名称"
                  placeholderTextColor='#757575'
                  editable={false} />
              </TouchableHighlight>
              <TouchableHighlight
                onPress={() => this.Message()}>
                <View style={[styles.button, { marginRight: 10 }]}>
                  <Image style={styles.icon}
                    source={require('../../img/home/right.png')} />
                  <Text style={styles.iconTitle}>消息</Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          :
          <View style={styles.searchBackground}>
            <View style={[styles.top, { justifyContent: 'flex-start' }]}>
              <TouchableHighlight style={[styles.icon, { marginLeft: 10, marginRight: 10 }]}
                onPress={() => this.closeSearch()}>
                <Image style={styles.icon}
                  source={require('../../img/public/left.png')} />
              </TouchableHighlight>
              <TextInput
                style={[styles.input, { width: "80%" }]}
                placeholder="请输入病症名称"
                placeholderTextColor='#757575' />
            </View>
          </View>
        }
        {this.state.rightMenu ?
          <View style={styles.rightMenu}>
            <Text style={styles.boneName}>{this.state.name}</Text>
            <Text style={styles.boneDisease} onPress={() => this.showDetails()}>{this.state.data}</Text>
          </View>
          : null
        }
        {this.state.rightMenu ?
          <TouchableHighlight
            style={[styles.closeRightMenuStyle]}
            onPress={() => this.closeRightMenu()}>
            <Image style={styles.closeRightMenuImg} resizeMode="contain"
              source={require('../../img/public/right1.png')} />
          </TouchableHighlight>
          : null
        }
        {this.state.details ?
          <View style={styles.details}>
            <View style={[styles.detailsRow,{marginTop:5}]}>
              <View>
              <Text style={{ color: 'white', fontWeight: 'bold', paddingLeft:15 }}>{this.state.name}</Text>
              </View>
              <MyTouchableOpacity
                    onPress={() => {
                        this.fayin(this.state.name + "。" + this.state.name)
                    }}
                    style={{position:'absolute',left:'50%',transform: [{ translateX: -40}], alignItems: 'center', justifyContent: 'center',flexDirection: 'row'}}>
                    <Image
                        style={{width: size(30), height: size(30), marginRight: size(10)}}
                        source={require('../../img/unity/laba.png')}/>
                    <Text style={{color: "white",}}>{this.state.name}</Text>
                </MyTouchableOpacity>
            </View>
            <View style={styles.detailsRow}>
              {this.renderBottomIcon()}
            </View>
          </View>
          : null
        }
      </View>
    );
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
  }
  clickBack() {
    // this.setState({

    // })
    alert('返回')
  }
  showSearch() {
    this.setState({
      search: true
    })
  }
  closeSearch() {
    this.setState({
      search: false
    })
  }
  showDetails() {
    this.setState({
      details: true,
    })
  }
  closeRightMenu() {
    this.setState({
      rightMenu: false
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
  My() {
    this.props.navigation.navigate('MyScreen');
  }
  Message() {
    this.props.navigation.navigate('MessageNotice');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightMenu: {
    position: 'absolute',
    height: screen.height * 0.7,
    right: 0,
    top: screen.height * 0.5,
    backgroundColor: '#262626',
    width: 175,
    transform: [{ translateY: -screen.height * 0.7 * 0.5 }],
    alignItems: 'center',
    borderRadius: 5,
    zIndex: 999
  },
  btnStyle: {
    width: size(90),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom:5,
    marginTop:15
  },
  btnTextStyle: {
    textAlign: "center",
    fontSize: size(16),
    color: "#FFF",
    marginTop: size(8),
    alignSelf: "center",
  },
  details: {
    position: 'absolute',
    width: screen.width,
    bottom: 0,
    backgroundColor: '#262626',
  },
  btnImgStyle: {
    width: size(28),
    height: size(28),
    resizeMode: 'contain',
  },
  detailsRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection:'row',
  },
  boneName: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#343434',
    width: '100%',
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  boneDisease: {
    height: 40,
    width: '100%',
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  closeRightMenuStyle: {
    height: 56,
    width: 56,
    backgroundColor: '#262626',
    borderRadius: 28,
    position: 'absolute',
    top: screen.height * 0.5,
    right: 147,
    transform: [{ translateY: -28 }],
    paddingLeft: 5,
    justifyContent: 'center',
  },
  closeRightMenuImg: {
    height: 20,
  },
  searchBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: "absolute",
    width: screen.width,
    height: screen.height
  },
  icon: {
    width: 20,
    height: 20,
  },
  body: {
    position: "absolute",
    width: screen.width,
    //height: 20,
    backgroundColor: 'rgba(250,250,250,0)',
  },
  top: {
    marginTop: 30,
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  input: {
    height: 35,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    margin: 0, padding: 0,
    paddingLeft: 20
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 35,
    borderRadius: 3
  },
  iconTitle: {
    fontSize: size(20),
    color: "#C8C8C8"
  }
});
