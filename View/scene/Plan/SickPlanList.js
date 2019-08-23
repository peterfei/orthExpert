/**
 * Created by xzh on 10:17 2019-08-09
 *
 * @Description:
 */

import React from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {
  AppDef,
  BaseComponent,
  ContainerView,
  deviceWidth,
  HttpTool,
  Line,
  NavBar,
  NetInterface,
  NullData,
  size
} from '../../common';
import CardCell from '../Recovery/CardCell';

export default class SickPlanList extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      sick: props.navigation.state.params.sick,
      data: []
    }
    alert(JSON.stringify( props.navigation.state.params.sick));
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
    const url = NetInterface.planListWithSick + '?patNo=' + this.props.navigation.state.params.sick.pat_no + '&planType=';
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
    this.props.navigation.navigate('kfCreatePlan', {'isMB': true, 'sick': this.props.navigation.state.params.sick, 'planId': plan.planId});
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
      <TouchableOpacity onPress={() => {this.props.navigation.navigate('kfCreatePlan', {'isMB': false, 'sick': this.props.navigation.state.params.sick, 'planId': ''});}}>
        <View style={{width: deviceWidth - size(50), height: size(80), marginLeft: size(25), marginTop: size(40),
          borderColor: AppDef.Blue, borderWidth: size(0.5), borderRadius: size(20),
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../img/kf_main/kf_plan_add.png')} style={{width: size(32), height: size(32)}}/>
          <Text style={{color: AppDef.Black, fontSize: size(28), fontWeight: '400', marginLeft: size(25)}}>创建新方案模板</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>
        <NavBar title={this.state.sick.pat_name + '方案'} navigation={this.props.navigation}/>
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

const styles = StyleSheet.create({});