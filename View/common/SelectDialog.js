/**
 * Created by xzh on 15:10 2019-08-03
 *
 * @Description:  弹出选择框, 支持多选和单选, 使用方法如下
 *
 * @Description:  type == 弹出框类型, 支持 单选(Default)/多选(Mutilple), 默认单选, 不传 type 字段即可
 * @Description:  name == 弹出框功能名称, 方便识别结果
 * @Description:  data == 弹出框可选择的内容
 * @Description:  selectDialogAction == 选择完毕的回调
 * @Description:  closeAction == 关闭弹出框
 *
 * <SelectDialog
 *    ref={r=>{this.SelectDialog = r}}
 *    type={this.state.selectDialogType}
 *    data={this.state.selectDialogData}
 *    name={this.state.selectDialogName}
 *    selectDialogAction={(result) => {this.recieveDialogResult(result)}}
 * />
 *
 * this.SelectDialog.show();
 * this.SelectDialog.close();
 */

import React, {Component} from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Platform} from "react-native";
import {deviceHeight, deviceWidth, size} from "./Tool/ScreenUtil";
import Line from './Line';
import AppDef from './Defined';

export default class SelectDialog extends Component {

  constructor(props) {

    super(props);

    this.state = {
      isShow: false,
      data: props.data,
      title: props.title ? props.title : '请选择',
      type: props.type ? props.type : 'Default',
      name: props.name,
      current: props.type == 'Mutilple' ? [] : {}
    }

    this._gestureHandlers = {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: ()=> false,
      onResponderGrant: ()=>{this.close()},
    }
  }

  async componentWillMount() {
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      data: nextProps.data,
      title: nextProps.title ? nextProps.title : '请选择',
      type: nextProps.type ? nextProps.type : 'Default',
      name: nextProps.name,
      current: nextProps.type == 'Mutilple' ? [] : {},
    })
  }

  show() {
    this.scrollView.scrollTo({x: 0, y: 0, animated: false});
    this.setState({
      isShow: true
    })
  }

  close() {
    this.setState({
      isShow: false
    })
  }

  selectItem(item, type) {
    if (type == 'Mutilple') {
      let selection = this.state.current;
      let index = selection.findIndex((subItem) => {return item.title == subItem.title});
      if (index == -1) {
        selection.push(item);
      } else {
        selection.splice(index, 1)
      }
      this.setState({
        current: selection
      })
    } else {
      this.setState({
        current: item
      }, () => {
        this.confirmResult();
      })
    }
  }

  // 点击确定
  confirmResult() {
    let result = {
      value: this.state.current,
      name: this.state.name
    }
    if (this.props.selectDialogAction) {
      this.props.selectDialogAction(result)
    }
  }

  _renderHeader() {
    return (
      <View style={{width: '100%', height: size(80), justifyContent: 'center', alignItems: 'center', backgroundColor: AppDef.Blue}}>
        <Text style={{color: AppDef.White, fontSize: size(32), fontWeight: 'bold'}}>{this.state.title}</Text>
      </View>
    )
  }

  _renderSelectList() {
    let arr = [];
    let currValue = this.state.current;
    let type = this.state.type;
    this.state.data.forEach((item) => {

      let isSelect = false;
      if (type == 'Mutilple') { // 多选
        let isHave = currValue.find((subItem) => {return item.title == subItem.title});
        isSelect = currValue && isHave != undefined  ? true : false;
      } else {
        isSelect = currValue && currValue == item ? true : false;
      }

      arr.push(
        <TouchableOpacity activeOpacity={1} onPress={() => {this.selectItem(item, type)}}>
          <View style={{width: '100%', height: size(80)}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}>
              <Text style={{fontSize: size(28), color: AppDef.Black, marginLeft: size(20)}}>
                {item.title}
              </Text>
              {
                isSelect
                  ?
                  <Image source={require('../img/public/dialog_check.png')} style={{width: size(36), height: size(36), marginRight: size(20)}}/>
                  :
                  null
              }
            </View>
            <Line/>
          </View>
        </TouchableOpacity>
      )
    })
    return arr;
  }

  _renderFooter() {
    return (
      <View style={{width: '100%', height: size(80), flexDirection: 'row'}}>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => {this.setState({isShow: false})}}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppDef.White}}>
            <Text style={{color: AppDef.Blue, fontSize: size(32), fontWeight: 'bold'}}>取消</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={() => {this.confirmResult()}}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppDef.Blue}}>
            <Text style={{color: AppDef.White, fontSize: size(32), fontWeight: 'bold'}}>确定</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    let isMutil = this.state.type == 'Mutilple';
    return (
      <View
        {...this._gestureHandlers}
        style={[styles.back, {position: 'absolute', right: 0, top: this.state.isShow ? 0 : deviceHeight + (Platform.OS === 'ios' ? 0 : size(148))}]}>
        <View style={styles.dialog}>
          {this._renderHeader()}
          <ScrollView
            ref={r => this.scrollView = r}
            style={[styles.scrollStyle, {height: this.state.data.length >= 7 ? size(520) : 'auto'}]}>
            {this._renderSelectList()}
          </ScrollView>
          {
            isMutil
              ?
              <View>
                {this._renderFooter()}
              </View>
              :
              null
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    width: deviceWidth,
    height: deviceHeight + (Platform.OS === 'ios' ? 0 : size(148)),
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialog: {
    borderRadius: size(20),
    width: deviceWidth * 0.7,
    overflow: 'hidden',
    backgroundColor: AppDef.White
  },
  scrollStyle: {
    width: '100%',
  }
});
