/**
 * Created by xzh on 20:22 2019-08-12
 *
 * @Description:
 */

import React from "react";
import {Image, StyleSheet, Text, View} from "react-native";
import {AppDef, BaseComponent, deviceWidth, Line, size,} from '../../common';

export default class MotionListCell extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      motion: props.motion,
      lastOne: props.lastOne,
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      motion: nextProps.motion,
      lastOne: nextProps.lastOne,
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
    let isShowCS = motion.taType.indexOf('次') != -1 ? true : false;
    let isShowSeconds = motion.taType.indexOf('秒') != -1 ? true : false;
    let cs = ''; let seconds = '';
    cs = isShowCS ? motion.repetitions + '次' : cs;
    seconds = isShowSeconds ? motion.taTime + '秒' : seconds;
    let rest = motion.rest;
    let isShowLast = this.state.lastOne ? false : true;

    // 132 + 60 + 30 + 24 + 1
    return (
      <View style={{width: deviceWidth, backgroundColor: AppDef.White,}}>
        <View style={{flex: 1, marginTop: size(30), marginBottom: size(30), marginLeft: size(25), flexDirection: 'row'}}>
          <Image source={uri} style={{width: size(172), height: size(132), borderRadius: size(10), overflow: 'hidden'}}/>
          <View style={{flex: 1, marginLeft: size(50), justifyContent: 'space-between'}}>
            <Text style={{color: AppDef.Black, fontSize: size(26)}}>{name}</Text>
            <View style={{justifyContent: 'space-between'}}>
              <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(20)}}>训练类型: {type}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: size(15)}}>
                {
                  isShowSeconds ?
                    <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150)}}>时长: {seconds}</Text> : null
                }
                {
                  isShowCS ?
                    <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150)}}>次数: {cs}</Text> : null
                }
                <Text style={{color: 'rgba(104, 104, 104, 1)', fontSize: size(24), width: size(150)}}>休息: {rest}s</Text>
              </View>
            </View>
          </View>
        </View>

        <Line color='rgba(227, 227, 227, 0.5)' height={size(1)}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});