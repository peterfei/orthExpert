/**
 * Created by xzh on 20:19 2019-08-01
 *
 * @Description: 所有page页面集成此组件, 用于做全页面公用函数等功能;
 * @implementation: <ContainerView ref={r => this.mainView = r}></ContainerView>
 *                  this.mainView._showLoading('需要显示的文字');
 *                  this.mainView._closeLoading();
 *                  this.mainView._toast();
 *                  ...
 */

import React, {Component} from 'react';
import Loading from './Loading';
import UnityLoading from './UnityLoading';
import Toast from 'react-native-easy-toast';
import SelectDialog from './SelectDialog';
import {View, StyleSheet} from "react-native";
import {isIPhoneXFooter} from "./Tool/ScreenUtil";
import PropTypes  from "prop-types";

let that = null;

export default class ContainerView extends Component {

  static propTypes = {
    children: PropTypes.element
  }

  constructor(props) {
    super(props);
    this.state = {
      selectDialogData: [],
      selectDialogType: 'Default',
      selectDialogName: 'Default',
      selectDialogTitle: '请选择',
    }

    that = this;
  }

  componentDidMount() {
  }

  _showLoading(content) {
    this.Loading.show(content);
  }

  _closeLoading() {
    this.Loading.close();
  }

  _showUnityLoading(content) {
    this.UnityLoading.show(content);
  }

  _closeUnityLoading() {
    this.UnityLoading.close();
  }

  _toast(content) {
    this.refs.toast.show(content);
  }

  _showSelectDialog(name, list, type, title) {
    this.setState({
      selectDialogTitle: title ? title : '请选择',
      selectDialogName: name,
      selectDialogData: list,
      selectDialogType: type == 'Mutilple' ? type : 'Default',
    }, () => {
      this.SelectDialog.show();
    })
  }
    _showSelectDialogB() {
        this.SelectDialog.show();
    }

  _closeSelectDialog() {
    this.SelectDialog.close();
  }

  recieveDialogResult(result) {
    if (this.props.selectDialogAction) {
      this.props.selectDialogAction(result)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.children}
        <SelectDialog
          ref={r=>{this.SelectDialog = r}}
          title={this.state.selectDialogTitle}
          type={this.state.selectDialogType}
          data={this.state.selectDialogData}
          name={this.state.selectDialogName}
          selectDialogAction={(result) => {this.recieveDialogResult(result)}}
        />
        <Toast
          ref="toast"
          position="top"
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
        />
        <Loading
          ref={r => {
            this.Loading = r;
          }}
          hudHidden={false}
        />
        <UnityLoading ref={r => {this.UnityLoading = r}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: isIPhoneXFooter(0),
  }
})
