/**
 * Created by xzh on 20:22 2019-08-12
 *
 * @Description:
 */

import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AppDef, BaseComponent, deviceWidth, Line, size,} from '../../common';

export default class MotionEditCell extends BaseComponent {


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

  editRow(type, action) {
    let editValue;
    if (type == 'keep') { // 保持
      editValue = this.state.motion.taTime;
    } else if (type == 'repeat') { // 次数
      editValue = this.state.motion.repetitions;
    } else { // 休息时间
      editValue = this.state.motion.rest;
    }

    if (parseInt(editValue) <= 10) {
      editValue = action == 'jia' ? parseInt(editValue)+1 : parseInt(editValue);
    } else if (parseInt(editValue) >= 99) {
      editValue = action == 'jia' ? parseInt(editValue) : parseInt(editValue)-1;
    } else {
      editValue = action == 'jia' ? parseInt(editValue)+1 : parseInt(editValue)-1;
    }

    if (type == 'keep') { // 保持
      this.state.motion.taTime = editValue;
    } else if (type == 'repeat') { // 次数
      this.state.motion.repetitions = editValue;
    } else { // 休息时间
      this.state.motion.rest = editValue;
    }
    this.setState({
      motion: this.state.motion
    })
  }

  deleteAction() {
    if (this.props.deleteAction) {
      this.props.deleteAction(this.state.motion);
    }
  }

  render() {
    let motion = this.state.motion;
    let name = motion.amChName ? motion.amChName : '';
    let type = motion.lashenDonzuo ? motion.lashenDonzuo : '';
    let uri =  motion.iconUrl ? {uri: motion.iconUrl} : require('../../img/exercise/actimg.jpg');
    let cs = motion.repetitions;
    let seconds = motion.taTime;
    let rest = motion.rest;

    let isShowSeconds = motion.taType.indexOf('秒') == -1 ? true : false;
    let isShowCS = motion.taType.indexOf('次') == -1 ? true : false;

    let isShowLast = this.state.lastOne ? false : true;

    let enableJia = require('../../img/kf_main/kf_plan_edit_jia.png');
    let disableJia = require('../../img/kf_main/kf_plan_unedit_jia.png');
    let enableJian = require('../../img/kf_main/kf_plan_edit_jian.png');
    let disableJian = require('../../img/kf_main/kf_plan_unedit_jian.png');

    return (
      <View style={{width: deviceWidth, backgroundColor: AppDef.White}}>
        <View style={{flex: 1, marginTop: size(30), marginBottom: size(30), marginLeft: size(25), marginRight: size(25), flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity style={{width: size(80), height: size(80), justifyContent: 'center', alignItems: 'center'}} onPress={() => {this.deleteAction()}}>
            <Image source={require('../../img/kf_main/kf_plan_edit_delete.png')} style={styles.editBtn}/>
          </TouchableOpacity>
          <Image source={uri} style={{width: size(172), height: size(132), borderRadius: size(10), overflow: 'hidden'}}/>

          <View style={{flex: 1, marginLeft: size(23), justifyContent: 'space-between'}}>

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={{flexDirection: 'row',alignItems: 'center'}}>
                <Text numberOfLines={1} style={{color: AppDef.Black, fontSize: size(26), width: size(130)}}>{name}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flexDirection: 'row',alignItems: 'center'}}>
                  <Text style={{color: AppDef.Black, fontSize: size(26), marginRight: size(15)}}>保持</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => {this.editRow('keep', 'jia')}} disabled={isShowSeconds}>
                    <Image source={!isShowSeconds ? enableJia : disableJia} style={styles.editBtn}/>
                  </TouchableOpacity>
                  <Text style={{marginLeft: size(15), marginRight: size(15), color: 'rgba(104, 104, 104, 1)', fontSize: size(28)}}>{seconds}</Text>
                  <TouchableOpacity onPress={() => {this.editRow('keep', 'jian')}} disabled={isShowSeconds}>
                    <Image source={!isShowSeconds ? enableJian : disableJian} style={styles.editBtn}/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={{flexDirection: 'row',alignItems: 'center'}}>
                <Text numberOfLines={1} style={{color: AppDef.Black, fontSize: size(26), width: size(130)}}>{type}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flexDirection: 'row',alignItems: 'center'}}>
                  <Text style={{color: AppDef.Black, fontSize: size(26), marginRight: size(15)}}>次数</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity onPress={() => {this.editRow('repeat', 'jia')}} disabled={isShowCS}>
                    <Image source={!isShowCS ? enableJia : disableJia} style={styles.editBtn}/>
                  </TouchableOpacity>
                  <Text style={{marginLeft: size(15), marginRight: size(15), color: 'rgba(104, 104, 104, 1)', fontSize: size(28)}}>{cs}</Text>
                  <TouchableOpacity onPress={() => {this.editRow('repeat', 'jian')}} disable={isShowCS}>
                    <Image source={!isShowCS ? enableJian : disableJian} style={styles.editBtn}/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>

        </View>

        {
          isShowLast
            ?
            <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: size(105), marginBottom: size(30)}}>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {this.editRow('rest', 'jia')}}>
                  <Image source={enableJia} style={styles.editBtn}/>
                </TouchableOpacity>
                <Text style={{marginLeft: size(15), marginRight: size(15), color: 'rgba(104, 104, 104, 1)', fontSize: size(28)}}>{rest}</Text>
                <TouchableOpacity onPress={() => {this.editRow('rest', 'jian')}}>
                  <Image source={enableJian} style={styles.editBtn}/>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row',alignItems: 'center'}}>
                <Text style={{color: AppDef.Black, fontSize: size(26), marginLeft: size(25)}}>休息时间</Text>
              </View>
            </View>
            :
            null
        }

        <Line color='rgba(227, 227, 227, 0.5)' height={size(1)}/>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  editBtn: {
    width: size(48),
    height: size(48)
  }
});