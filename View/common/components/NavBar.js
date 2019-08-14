import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  StatusBar
} from 'react-native';

import { size } from "../ScreenUtil"
import { isiOS, isiPhoneX } from '../device'

import leftImage from '../../img/search/backjt.png'

const STATUS_BAR_HEIGHT = isiOS() ? (isiPhoneX() ? 34 : 20) : StatusBar.currentHeight
const HEADER_HEIGHT = 44

export default class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // leftTitle和leftImage 优先判断leftTitle (即 文本按钮和图片按钮优先显示文本按钮)
    const { title, leftTitle, leftAction, rightTitle, navigation, rightImage, rightAction } = this.props;
    return (
      <View style={[styles.barView, this.props.style]}>
        <View style={ styles.showView }>
          {
            leftImage
              ?
              <TouchableOpacity style={styles.leftNav} onPress={() => { navigation.goBack()}}>
                <Image style={styles.imgNav} source={leftImage}/>
              </TouchableOpacity>
              :
              (
                leftTitle
                  ?
                  <TouchableOpacity style={styles.leftNav} onPress={ ()=>{leftAction()} }>
                    <View style={{alignItems: 'center'}}>
                      <Text style={styles.barButton}>{leftTitle}</Text>
                    </View>
                  </TouchableOpacity>
                  : null
              )
          }
          {
            title ?
              <View style={{alignItems: 'center'}}>
                <Text style={styles.title}>{title || ''}</Text>
              </View>
              : null
          }
          {
            rightImage ?
              <TouchableOpacity style={styles.rightNav} onPress={ ()=>{rightAction()} }>
                <Image style={styles.imgNav} source={ rightImage }/>
              </TouchableOpacity>
              : (rightTitle ?
              <TouchableOpacity style={styles.rightNav} onPress={ ()=>{rightAction()} }>
                <Text style={styles.barButton}>{rightTitle}</Text>
              </TouchableOpacity>
                : null
              )
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  barView: {
    height: Platform.OS === 'android' ? size(128) :  size(88) + STATUS_BAR_HEIGHT,
    paddingTop: STATUS_BAR_HEIGHT,
    backgroundColor: '#0094e5',
  },
  showView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: size(38),
    fontWeight: 'bold'
  },
  leftNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: size(80),
    height: size(80),
    justifyContent: 'center',
    alignItems: 'center'
  },
  imgNav: {
    width: size(40),
    height: size(40),
  },
  rightNav: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: size(100),
    height: size(80),
    justifyContent: 'center',
    alignItems: 'center'
  },
  barButton: {
    color: 'white',
    fontSize: size(30),
    marginRight: size(20)
  },
})
