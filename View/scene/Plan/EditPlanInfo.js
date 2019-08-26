/**
 * Created by xzh on 14:52 2019-08-12
 *
 * @Description:
 */

import React, {Component} from "react";
import {Animated, Easing, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ImageBackground, ScrollView, Keyboard, Platform, StatusBar} from "react-native";
import {AppDef, deviceHeight, deviceWidth, isIPhoneXPaddTop, Line, size, HttpTool, NetInterface} from '../../common';

const statusBarHeight = StatusBar.currentHeight;
export default class EditPlanInfo extends Component {


  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      backImages: [],
      selectIndex: 0,
      viewY: new Animated.Value(deviceHeight),
      planName: '',
      desc: '',
      labelA: ''
    }
  }

  componentDidMount() {
    this.requestData();
  }

  componentWillMount () {
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', (event) => {this.keyboardDidShow(event)});
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', (event) => {this.keyboardDidHide(event)});
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  keyboardDidShow = (event) => {
    Animated.timing(this.state.viewY, {
      duration: Platform.OS == 'ios' ? event.duration : 100,
      toValue: Platform.OS == 'ios' ? size(40) : statusBarHeight,
    }).start();
  };

  keyboardDidHide = (event) => {
    Animated.timing(this.state.viewY, {
      duration: Platform.OS == 'ios' ? event.duration : 100,
      toValue: size(150),
    }).start();
  };

  requestData() {
    const url = NetInterface.planBackImgList + '?business=kfxl'
    HttpTool.GET(url)
      .then(res => {
        if (res.code == 0 && res.msg == 'success') {
          this.setState({
            backImages: res.backgroudImgList
          })
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  show(planInfo) {
    let selectIndex = this.state.backImages.findIndex((item) => {
      return item.pbId == planInfo.pbId;
    })
    selectIndex = selectIndex == -1 ? 0 : selectIndex;
    this.setState({
      isShow: true,
      planName: planInfo.planName,
      desc: planInfo.description,
      selectIndex: selectIndex,
      labelA: planInfo.labelA
    }, () => {
      Animated.timing(this.state.viewY, {
        duration: 200,
        toValue: size(150),
        easing: Easing.linear,
      }).start();
    })
  }

  close() {
    Animated.timing(this.state.viewY, {
      duration: 200,
      toValue: deviceHeight,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        isShow: false
      })
    });
  }

  saveInfo() {
    let selectImage = this.state.backImages[this.state.selectIndex];
    let params = {
      planName: this.state.planName,
      description: this.state.desc,
      iconUrl: selectImage.smallIconUrl,
      icon2Url: selectImage.detailsIconUrl,
      icon3Url: selectImage.chooseIconUrl,
      pbId: selectImage.pbId,
      labelA: this.state.labelA
    }
    if (this.props.editComplete) {
      this.props.editComplete(params);
    }
  }

  _renderImages() {
    let arr = [];
    this.state.backImages.forEach((item, index) => {
      arr.push(
        <TouchableOpacity onPress={() => {this.setState({selectIndex: index})}}>
          <ImageBackground
            source={{uri: item.chooseIconUrl}}
            key={index}
            style={{width: size(300), height: size(180), marginLeft: size(25), borderRadius: size(10), overflow: 'hidden', marginRight: index == this.state.backImages.length - 1 ? size(25): 0,}}>
            <Image source={this.state.selectIndex == index ? require('../../img/kf_main/kf_plan_img_select.png') : require('../../img/kf_main/kf_plan_img_unselect.png')}
                   style={{width: size(36), height: size(36), position: 'absolute', bottom: size(11), right: size(15)}}/>
          </ImageBackground>
        </TouchableOpacity>
      )
    })
    return arr;
  }

  render() {
    return (
      <View style={[styles.backStyle, {top: this.state.isShow ?  0 : deviceHeight +  (Platform.OS == 'ios' ? 0 : size(148))}]}>
        <Animated.View style={[styles.container, {top: this.state.viewY}]}>
          <ScrollView
            alwaysBounceHorizontal={false}
            bounces={false}
            style={{flex: 1}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: isIPhoneXPaddTop(0)}}>
              <TouchableOpacity onPress={() => {this.close()}}>
                <View style={{width: size(80), height: size(80), justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={require('../../img/kf_main/kf_plan_close.png')} style={{width: size(24), height: size(24)}}/>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {this.saveInfo()}}>
                <View style={{width: size(200), height: size(80), marginRight: size(25), justifyContent: 'center', alignItems: 'flex-end'}}>
                  <Text style={{color: AppDef.Blue, fontSize: size(28)}}>保存</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{marginLeft: size(110), marginRight: size(110), marginTop: size(30)}}>
              <TextInput
                maxLength={8}
                placeholderTextColor={"rgba(197, 197, 197, 1)"}
                underlineColorAndroid="transparent"
                style={styles.textInputStyle}
                clearButtonMode={"while-editing"}
                placeholder={"请输入方案名称"}
                value={this.state.planName}
                onChangeText={text =>
                  this.setState({
                    planName: text
                  })
                }
              />
              <Line height={1}/>
              <Line height={20} color={AppDef.White}/>
              <TextInput
                maxLength={15}
                placeholderTextColor={"rgba(197, 197, 197, 1)"}
                underlineColorAndroid="transparent"
                style={styles.textLabelAStyle}
                clearButtonMode={"while-editing"}
                placeholder={"请输入方案简介"}
                value={this.state.labelA}
                onChangeText={text =>
                  this.setState({
                    labelA: text
                  })
                }
              />
              <Line height={1}/>
              <View style={styles.textAreaView}>
                <TextInput
                  multiline = {true}
                  maxLength={100}
                  placeholderTextColor={"rgba(197, 197, 197, 1)"}
                  underlineColorAndroid="transparent"
                  style={styles.textArea}
                  placeholder={"请输入方案具体描述信息"}
                  value={this.state.desc}
                  onChangeText={text =>
                    this.setState({
                      desc: text
                    })
                  }
                />
                <Text style={{color: 'rgba(227, 227, 227, 1)', fontSize: size(26), position: 'absolute', right: size(28), bottom: size(20)}}>{this.state.desc.length}/100</Text>
              </View>
            </View>

            <View style={{width: '100%', marginTop: size(30)}}>
              <Text style={{color: AppDef.Black, fontSize: size(32), fontWeight: 'bold', marginLeft: size(25)}}>选择方案背景</Text>
              <ScrollView
                style={{width: '100%', height: size(180), marginTop: size(30)}}
                horizontal={true}>
                {this._renderImages()}
              </ScrollView>
            </View>
            <Line height={size(300)} color={AppDef.White}/>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backStyle: {
    width: deviceWidth,
    height: deviceHeight + (Platform.OS == 'ios' ? 0 : size(148)),
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    left: 0,
    zIndex: 99999
  },
  container: {
    width: deviceWidth,
    height: deviceHeight,
    position: 'absolute',
    left: 0,
    backgroundColor: AppDef.White,
    borderTopLeftRadius: size(20),
    borderTopRightRadius: size(20),
    overflow: 'hidden'
  },
  textInputStyle: {
    width: '100%',
    fontSize: size(42),
    color: AppDef.Black,
    marginBottom: size(30)
  },
  textLabelAStyle: {
    width: '100%',
    fontSize: size(34),
    color: AppDef.Black,
    marginBottom: size(30)
  },
  textAreaView: {
    width: '100%',
    height: size(280),
    borderRadius: size(20),
    borderWidth: size(1),
    borderColor: 'rgba(227, 227, 227, 1)',
    paddingLeft: size(28),
    paddingRight: size(28),
    paddingTop: size(22),
    paddingBottom: size(22),
    marginTop: size(30),
  },
  textArea: {
    lineHeight: size(38),
    color: AppDef.Black,
    fontSize: size(30),
    flex: 1
  }
});