/**
 * Created by xzh on 19:54 2019-08-01
 *
 * @Description:
 */

import React, {Component} from 'react';
import {View} from 'react-native';
import {size} from './Tool/ScreenUtil';

export default class Line extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    const { color, height, left, right } = this.props;
    return(
      <View style={{
        height: height ? height : size(0.5),
        marginLeft: left ? left : 0,
        marginRight: right ? right : 0,
        backgroundColor: color ? color : 'rgba(235,235,235,0.5)'}}/>
    )
  }
}