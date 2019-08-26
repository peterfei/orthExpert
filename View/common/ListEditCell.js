/**
 * Created by xzh on 14:09 2019-08-02
 *
 * @Description:
 */


import React, {Component} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {AppDef, Line} from './index';
import {size} from './Tool/ScreenUtil';

export default class ListEditCell extends Component{

  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      content: props.content
    }
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      title: nextProps.title,
      content: nextProps.content
    })
  }

  handleSelection(type) {

    if (type == 'select' || type == 'input') {
      if (this.props.selectAction) {
        this.props.selectAction();
      }
    } else if (type == 'page') {
      if (this.props.pageAction == null) {
        this.props.navigation.navigate(this.state.content);
      }
    } else {

    }
  }

  render() {
    const {imgPath, type} = this.props;
    let leftIcon = (
      <Image style={styles.icon} source={imgPath}/>
    );
    let lineLeft = imgPath ? size(40) + size(78) : size(40);
    let lineRight = imgPath ? 0 : size(40);
    let functionView = null;
    if (type) {
      if (type == 'input') {
        functionView = (
          <Text style={{fontSize: size(24), color: 'rgba(185, 185, 185, 1)', marginRight: size(45)}}>
            {this.state.content}
          </Text>
        )
      } else if (type == 'select') {
        functionView = (
          <Text style={{fontSize: size(24), color: 'rgba(185, 185, 185, 1)', marginRight: size(45)}}>
            {this.state.content}
          </Text>
        )
      } else if (type == 'page') {
        // 没有内容 直接跳转
      } else {
        functionView = (
          <Text style={{fontSize: size(24), color: 'rgba(185, 185, 185, 1)', marginRight: size(45)}}>
            {this.state.content}
          </Text>
        )
      }
    }

    return (
      <TouchableOpacity activeOpacity={1} onPress={() => {this.handleSelection(type)}}>
        <View style={styles.back}>
          <View style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {
                imgPath
                  ?
                  leftIcon
                  :
                  null
              }
              <Text style={{fontSize: AppDef.ContentSize, color: AppDef.Black, marginLeft: size(40)}} allowFontScaling={false}>
                {this.state.title}
              </Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {functionView}
              <Image source={require('../img/kf_mine/mine_arrow.png')} style={{width: size(14), height: size(24), marginRight: size(57)}}/>
            </View>
          </View>
          <Line color='rgba(231,231,231,1)' left={lineLeft} right={lineRight}/>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    width: '100%',
    height: size(92),
  },
  container: {
    width: '100%',
    height: size(91.5),
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  icon: {
    width: size(34),
    height: size(34),
    marginLeft: size(25),
    marginRight: size(18),
    marginTop: size(29),
    marginBottom: size(29),
  }
})
