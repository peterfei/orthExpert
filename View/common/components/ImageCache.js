/**
 * Created by xzh on 16:09 2019-11-12
 *
 * @Description:
 */

import React, {Component} from "react";
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground} from "react-native";
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

export default class ImageCache extends Component {


  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
  }

  componentDidMount() {
    Image.prefetch(this.props.source);
  }

  render() {
    return (
      <Image
        resizeMode={'contain'}
        source={this.props.source}
        style={[this.props.style]}
      />
    );
  }
}

const styles = StyleSheet.create({});