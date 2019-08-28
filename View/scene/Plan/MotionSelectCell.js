/**
 * Created by xzh on 11:47 2019-08-12
 *
 * @Description:
 */

import React, {Component} from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AppDef, Line, size,} from '../../common';

export default class MotionSelectCell extends Component {


  constructor(props) {
    super(props);
    this.state = {
      motion: props.motion
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      motion: nextProps.motion
    })
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  render() {
    let motion = this.state.motion;
    let name = motion.amChName ? motion.amChName : '';
    let type = motion.lashenDonzuo ? motion.lashenDonzuo : '';
    let uri =  motion.iconUrl ? {uri: motion.iconUrl} : require('../../img/exercise/actimg.jpg');

    return (
      <View>
        <View style={{flex: 1, marginTop: size(30), marginBottom: size(29), marginLeft: size(40), marginRight: size(40), flexDirection: 'row'}}>
          <Image source={uri} style={{width: size(172), height: size(132), borderRadius: size(10), overflow: 'hidden'}}/>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{marginLeft: size(23), justifyContent: 'space-between'}}>
              <Text style={{color: AppDef.Black, fontSize: size(26)}}>{name}</Text>
              <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20), marginTop: size(50)}}>{type}</Text>
            </View>
            <Image source={this.state.motion.isSelect ? require('../../img/kf_main/kf_plan_selected.png') : require('../../img/kf_main/kf_plan_unselect.png')}
                   style={{width: size(48), height: size(48)}}/>
          </View>
        </View>
        <Line color='rgba(227, 227, 227, 0.5)' height={size(1)}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({});