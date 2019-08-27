/**
 * Created by xzh on 11:13 2019-08-12
 *
 * @Description:
 */

import React, {Component} from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Animated, Easing} from "react-native";
import {
  Wxpay,
  HttpTool,
  NetInterface,
  NetInfoDecorator,
  StringUtils,
  deviceWidth,
  deviceHeight,
  isIPhoneXPaddTop,
  isIPhoneXFooter,
  isIPhoneX,
  setSpText,
  size,
  AppDef,
  BaseComponent,
  ContainerView,
  Line,
  ListEditCell,
  ListCell,
  MineBuuton,
  GraphicValidate,
  Loading,
  NavBar,
} from '../../common';
import MotionSelectCell from './MotionSelectCell';

export default class ChooseMotionView extends Component {


  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      listViewY: new Animated.Value(deviceHeight),
      sourceData: [],
      motionList: [],
      sick: props.sick
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      sick: nextProps.sick
    })
  }

  componentDidMount() {
    this.requestMotionsData();
  }

  requestMotionsData() {
    const url = NetInterface.motionsList + '?patNo=' + this.props.sick.pat_no + '&business=kfxl';
    HttpTool.GET(url)
            .then(res => {
              // alert(JSON.stringify(res));
              if (res.code == 0 && res.msg == 'success') {
                this.setState({
                  sourceData: res.animationList,
                  motionList: res.animationList
                })
              }
            })
            .catch(error => {
              console.log(error);
            })
  }

  show() {
    let newData = JSON.parse(JSON.stringify(this.state.sourceData));
    this.setState({
      isShow: true,
      motionList: newData,
    }, () => {
      Animated.timing(this.state.listViewY, {
        duration: 150,
        toValue: deviceHeight - size(900),
        easing: Easing.linear,
      }).start();
    })
  }

  close() {
    Animated.timing(this.state.listViewY, {
      duration: 150,
      toValue: deviceHeight,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        isShow: false
      })
    });

  }

  confirm() {
    let arr = [];
    this.state.motionList.forEach((item, index) => {
      if (item.isSelect) {
        arr.push(item);
      }
    })
    // alert(JSON.stringify(this.props));
    if (this.props.selectMotions) {
      this.props.selectMotions(arr);
    }
  }

  _renderMotions() {
    let arr = [];
    this.state.motionList.forEach((item, index) => {
      arr.push(
        <MotionSelectCell key={index} motion={item}/>
      )
    })
    return arr;
  }

  render() {
    return (
      <View style={[styles.container, {top: this.state.isShow ? 0 : deviceHeight * 2}]}>
        <Animated.View style={[styles.listStyle, {position: 'absolute', left: 0, top: this.state.listViewY}]}>
          <View style={styles.closeStyle}>
            <TouchableOpacity onPress={() => {this.close()}}>
              <Image source={require('../../img/kf_main/kf_plan_close.png')} style={{width: size(24), height: size(24), marginLeft: size(40)}}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {this.confirm()}}>
              <Text style={{color: AppDef.Black, fontSize: size(26), marginRight: size(40)}}>确定</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            alwaysBounceVertical={false}
            bounces={false}
            style={{flex: 1}}>
            {this._renderMotions()}
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: deviceWidth,
    height: deviceHeight,
    position: 'absolute',
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10001
  },
  listStyle: {
    width: '100%',
    height: size(900),
    borderTopLeftRadius: size(20),
    borderTopRightRadius: size(20),
    backgroundColor: AppDef.White,
    overflow: 'hidden'
  },
  closeStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: size(30),
    marginBottom: size(30)
  }
});