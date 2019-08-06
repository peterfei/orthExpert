/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, Image, Linking,
  Dimensions, TouchableHighlight, TextInput, RefreshControl, ImageBackground, ScrollView, TouchableWithoutFeedback, DeviceEventEmitter, Button
} from 'react-native';
import { color, NavigationItem, SpacingView, DetailCell } from "../../widget";
import { screen, system } from "../../common";
import { size } from "../../common/ScreenUtil";
import { storage } from "../../common/storage";
import Toast, { DURATION } from "react-native-easy-toast";
import { NavigationActions } from "react-navigation";
import _ from "lodash";
//import ChangePassword from "../Register/ChangePassword";
//import InputInviteCode from "../Register/InputInviteCode";
import api from "../../api";
import { checkEnvironment } from '../../common/fun';


export default class MyScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    isRefreshing: false,
    userData: {},
    member: [],
    isFirstShare: true,
    reviewState: true
  }
  onHeaderRefresh() {
    this.setState({
      isRefreshing: true
    });

    setTimeout(() => {
      this.setState({
        isRefreshing: false
      });
    }, 2000);
  }
  componentDidMount() {

    let curr = this;
    DeviceEventEmitter.addListener("reloadAboutUs", async function () {
      let memberInfo = await storage.get("memberInfo");
      curr.setState({
        member: memberInfo
      });
    });
  }
  async componentWillMount() {
    let state = await checkEnvironment(this);
    let tokens = await storage.get("userTokens");
    let memberInfo = await storage.get("memberInfo");
    this.setState({
      member: memberInfo,
      reviewState: state
    });

    storage.loadObj("user", tokens.token, {}, "").then(userData => {
      if (userData == -2) {
        this.refs.toast.show("用户信息已失效,请重新登录");
        setTimeout(
          function () {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
            });
            this.props.navigation.dispatch(resetAction);
          }.bind(this),
          1000
        );
      }
      this.setState({
        userData: userData
      });
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor="gray"
            />
          }>
          {this.renderHeader()}
          {/* <SpacingView /> */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={styles.vipStyle}>
              <Text style={{ fontSize: size(34) }}>VIP会员</Text>
              <TouchableHighlight style={styles.vipButton}
                onPress={() => alert('开通会员')} >
                <Text style={styles.vipButtonText}>开通会员</Text>
              </TouchableHighlight>
            </View>
            <View style={styles.cellStyle}>
              {this.renderCells()}
            </View>
          </View>
        </ScrollView>
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
  renderHeader() {
    // if (this.state.userData) {
    //   if (Object.keys(this.state.userData).length > 0) {
    return (
      <TouchableWithoutFeedback style={styles.topTouch} onPress={() => this.toEditMember()}>
        <View style={styles.backGround}>
          <View style={styles.topTitle}>
            <TouchableHighlight style={styles.back}
              onPress={() => this.props.navigation.goBack()}>
              <Image style={styles.backImg}
                source={require('../../img/public/left.png')} />
            </TouchableHighlight>
            <Text style={styles.title}>个人中心</Text>
          </View>
          <View style={styles.topExternal}>
            <View style={styles.row}>
              <View>
                {this.state.member.mbHeadUrl != null ? (
                  <Image
                    style={styles.avatar}
                    source={{ uri: this.state.member.mbHeadUrl }}
                  />
                ) : (
                    <Image
                      style={styles.avatar}
                      source={require("../../img/my/liuyan.png")}
                    />
                  )}
              </View>
              <View>
                <Text style={styles.username}>
                  {this.state.member.mbName}17391973517
                </Text>
                <Text style={styles.identityTitle}>
                  {this.state.member.identityTitle}信息
                </Text>
              </View>
            </View>
            <View style={styles.overTime}>
              <Text style={styles.identityTitle}>{this.state.member.timer}2019.07.25会员到期</Text>
              <TouchableWithoutFeedback
                onPress={() => alert(111)}>
                <Text style={styles.identityTitle}>{this.state.member.timer}立即续费</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
    //   }
    // }
  }
  renderCells() {
    let cells = [];
    let dataList = this.getDataList();
    for (let i = 0; i < dataList.length; i++) {
      let sublist = dataList[i];
      for (let j = 0; j < sublist.length; j++) {
        let data = sublist[j];
        let cell = (
          <DetailCell
            style={{}}
            image={data.image}
            name={data.name}
            title={data.title}
            subtitle={data.subtitle}
            key={data.title}
            navigation={this.props.navigation}
          />
        );
        cells.push(cell);
      }
      //cells.push(<SpacingView key={i} />);
    }

    return (
      <View
        style={{
          flex: 1
        }}>
        {cells}
      </View>
    );
  }
  async toEditMember() {
    let memberInfo = await storage.get("memberInfo");
    this.setState({
      member: memberInfo
    });
    //如果是游客跳转注册
    if (this.state.member.isYouke == "yes") {
      this.props.navigation.navigate("MemberComplete");
    } else {
      this.props.navigation.navigate("EditMember");
    }
  }
  getDataList() {
    let arr = [
      [{
        title: "我的订单",
        image: require("../../img/my/liuyan.png"),
        name: "MyOrder"
      },
      {
        title: "意见反馈",
        image: require("../../img/my/liuyan.png"),
        name: "MessageBoard"
      },
      {
        title: "版本更新",
        image: require("../../img/my/liuyan.png"),
        name: "version"
      },
      {
        title: "帮助中心",
        image: require("../../img/my/liuyan.png"),
        name: "Help"
      },
      {
        title: "关于维萨里",
        image: require("../../img/my/liuyan.png"),
        name: "AboutVasl"
      },
      {
        title: "退出登录",
        image: require("../../img/my/liuyan.png"),
        name: "logout"
      }]
    ]
    return arr;
  }
}

const styles = StyleSheet.create({
  container: {
    width: screen.width,
    height: screen.height,
    flex: 1,
    zIndex:999,
  },
  backGround: {
    paddingTop: 20,
    width: '100%',
    height: size(333),
    backgroundColor: 'rgb(2, 178, 236)'
  },
  topTitle: {
    width: '100%',
    position: 'absolute',
    top: 30,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: size(33),
    fontWeight: "bold",
    color: "#ffffff"
  },
  topTouch: {
    width: '100%',
    height: size(333),
  },
  topExternal: {
    flexDirection: "row",
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    marginTop: 55
  },
  row: {
    flexDirection: "row",
  },
  overTime: {
    alignItems: 'center',
    width: 180,
    height: 75,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  back: {
    position: 'absolute',
    left: 10,
    width: 30,
    height: 30
  },
  backImg: {
    height: '100%',
    width: '100%'
  },
  avatar: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#cecece",
    marginLeft: 10,
    top: 10
  },
  username: {
    fontSize: size(28),
    fontWeight: "bold",
    width: size(200),
    marginTop: size(20),
    color: "#ffffff"
  },
  identityTitle: {
    fontSize: size(25),
    fontWeight: "bold",
    marginTop: size(20),
    color: "#e5e5e5",
  },
  vipStyle: {
    width: '90%',
    height: 80,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: 'rgba(210,210,210,0.1)',
    backgroundColor: 'rgba(255, 152, 0,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10
  },
  vipButtonText: {
    fontSize: size(28),
    fontWeight: "bold",
    color: "white"
  },
  vipButton: {
    backgroundColor: 'rgb(82, 83, 89)',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 100,
    borderRadius: 3,
  },
  cellStyle: {
    width: '90%',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: 'rgba(210,210,210,0.1)'
  }
});
