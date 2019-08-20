/**
 * Created by xzh on 08:52 2019-08-08
 *
 * @Description:
 */

import React, {Component} from "react";
import {Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {AppDef, screen} from '../../common';
import { size } from "../../common/ScreenUtil";

export default class CardCell extends Component {


  constructor(props) {
    super(props);
    this.state = {
      cellRow: props.cellRow
    }

    this.getSize(props.cellRow);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.getSize(nextProps.cellRow);
  }

  getSize(cellRow) {
    if (cellRow && cellRow.iconUrl.length > 0) {
      Image.getSize(cellRow.iconUrl, (width, height) => {
        let myHeight = Math.floor((screen.width - size(50))/width*height);
        cellRow.myHieght = myHeight;
      })
      this.setState({
        cellRow: cellRow
      })
    } else {
      cellRow = cellRow ? cellRow : {};
      cellRow['myHieght'] = size(250);
    }
  }

  selectCard() {
    if (this.props.selectCard) {
      this.props.selectCard(this.state.cellRow);
    }
  }

  render() {
    let cellRow = this.state.cellRow;
    let img = cellRow && cellRow.iconUrl ? {uri: cellRow.iconUrl} : require('../../img/recovery/card_back.png');
    let planName = cellRow && cellRow.planName ? cellRow.planName : '';
    let partNumber = cellRow && cellRow.partNumber ? cellRow.partNumber : '';
    let desc = cellRow && cellRow.description ? cellRow.description : '';
    let labelA = cellRow && cellRow.labelA ? cellRow.labelA : '';
    return (
      <TouchableOpacity style={{width:'100%',alignItems:'center'}} onPress={() => {this.selectCard()}}>
        <ImageBackground source={img} style={[styles.imgbackStyle, {height: size(250)}]}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <Text style={{color: AppDef.White, fontSize: size(38), fontWeight: '600'}}>{planName}</Text>

            <View>
              <Text style={{fontSize:size(20),color:"#FFF"}}> {labelA}</Text>
              <Text numberOfLines={2} style={{color: AppDef.White, fontSize: size(20), fontWeight: '400', width: size(300), lineHeight: size(24)}}>{desc}</Text>
              <View style={{flexDirection: 'row', marginTop: size(20), justifyContent: 'space-between', alignItems: 'flex-end'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{color: AppDef.White, fontSize: size(16), fontWeight: '400'}}>{partNumber}人参加</Text>
                  <Text style={{color: AppDef.White, fontSize: size(16), fontWeight: '400', marginLeft: size(60)}}>12组动作(假数据)</Text>
                </View>
                <Text style={{color: AppDef.White, fontSize: size(24), fontWeight: '400'}}></Text>
              </View>
            </View>

          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  imgbackStyle: {
    width: screen.width - size(50),
    //marginLeft: size(25),
    marginTop: size(30),
    borderRadius: size(20),
    paddingTop: size(34),
    paddingBottom: size(35),
    paddingLeft: size(40),
    paddingRight: size(40),
    overflow: 'hidden',
  }
});