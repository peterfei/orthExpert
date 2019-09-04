/**
 * Created by xzh on 10:17 2019-08-09
 *
 * @Description:
 */

import React from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from "react-native";
import {
  AppDef,
  BaseComponent,
  ContainerView,
  deviceWidth,
  HttpTool,
  Line,
  NavBar,
  NetInterface,
  NullData, screen,
  size
} from '../../common';
import CardCell from '../Recovery/CardCell';
import {color} from "../../widget";

export default class SickPlanList extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      sick: props.navigation.state.params.sick,
      data: []
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      sick: nextProps.navigation.state.params.sick,
    })
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.requestData();
  }

  requestData() {
    const url = NetInterface.planListWithSick + '?patNo=' + this.props.navigation.state.params.sick.pat_no + '&page=1&limit=100&planType=sysTpl';
  //  alert(url)
    this.mainView._showLoading('加载中...');
    HttpTool.GET(url)
      .then(res => {
        this.mainView._closeLoading();
        if (res.code == 0 && res.msg == 'success') {
          this.setState({
            data: res.page.list
          })
        } else {
          this.mainView._toast(res.msg);
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        console.log(error);
      })
  }

  selectCard(plan) {
    this.props.navigation.navigate('kfCreatePlan', {
      'isMB': true,
      'sick': this.props.navigation.state.params.sick,
      'planId': plan.planId,
      'currArea': this.props.navigation.state.params.currArea
    });
  }

  _renderTitle() {
    return(
      <View style={{justifyContent: 'center', marginLeft: size(30), marginTop: size(40)}}>
        <Text style={{width: '100%', color: AppDef.Black, fontSize: size(32), fontWeight: 'bold'}}>方案模板</Text>
      </View>
    )
  }

  _renderCards() {
    let arr = [];
    this.state.data.forEach((plan, index) => {
      arr.push(
        <CardCell cellRow={plan} key={index} selectCard={() => {this.selectCard(plan)}}/>
      )
    })
      if(arr.length == 0){
        return (
            <NullData/>
        )
      }
    return arr;
  }

  _renderCreateButton() {
    return (
      <TouchableOpacity onPress={() => {this.props.navigation.navigate('kfCreatePlan', {
        'isMB': false,
        'sick': this.props.navigation.state.params.sick,
        'planId': '',
        'currArea': this.props.navigation.state.params.currArea,
        'b_key': this.props.navigation.state.key});}}>
        <View style={{width: deviceWidth - size(50), height: size(80), marginLeft: size(25), marginTop: size(40),
          borderColor: AppDef.Blue, borderWidth: size(0.5), borderRadius: size(20),
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../img/kf_main/kf_plan_add.png')} style={{width: size(32), height: size(32)}}/>
          <Text style={{color: AppDef.Black, fontSize: size(28), fontWeight: '400', marginLeft: size(25)}}>创建新方案模板</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.backGround}>
        <View style={styles.topTitle}>
          <TouchableHighlight style={styles.back}
                              onPress={() => this.props.navigation.goBack()}>
            <Image style={styles.backImg}
                   source={require('../../img/public/left.png')} />
          </TouchableHighlight>
          <Text style={styles.title}>{this.state.sick.pat_name + '方案'}</Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>
        {this._renderHeader()}
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          {this._renderTitle()}
          {this._renderCards()}
        </ScrollView>
        {this._renderCreateButton()}
        <Line height={size(30)} color={AppDef.White}/>
      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  backGround: {
    paddingTop: 20,
    width: '100%',
    height: size(130),
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
  back: {
    position: 'absolute',
    left: 10,
    width: size(40),
    height: size(40)
  },
  backImg: {
    height: '100%',
    width: '100%'
  },
  lineStyle: {
    width: screen.width / 2,
    height: 2,
    backgroundColor: color.main
  },
  textStyle: {
    flex: 1,
    // fontSize: 20,
    marginTop: 1,
    height: 20
    // textAlign: "center"
  }
});