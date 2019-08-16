import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity
} from 'react-native';
import { size, isIPhoneXPaddTop } from "./Tool/ScreenUtil"
import leftImage from '../img/search/backjt.png';
import AppDef from './Defined';

export default class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // leftTitle和leftImage 优先判断leftTitle (即 文本按钮和图片按钮优先显示文本按钮)
    const { hideback, title, leftTitle, leftAction, rightTitle, navigation, rightImage, rightAction, rightBothShow } = this.props;
    return (
      <View style={[styles.barView, this.props.style]}>
        <View style={ styles.showView }>
          {
            !hideback
              ?
              (
                leftImage
                    ?
                  <TouchableOpacity style={styles.leftNav} onPress={() => {this.props.navigation.pop()}}>
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
              )
              : null
          }

          {
            title ?
              <View style={{alignItems: 'center'}}>
                <Text style={styles.title}>{title || ''}</Text>
              </View>
              : null
          }
          {
            !rightBothShow ?
                (rightImage ?
                <TouchableOpacity style={styles.rightNav} onPress={ ()=>{rightAction()} }>
                  <Image style={styles.imgNav} source={ rightImage }/>
                </TouchableOpacity>
                : (rightTitle ?
                <TouchableOpacity style={styles.rightNav} onPress={ ()=>{rightAction()} }>
                  <Text style={styles.barButton}>{rightTitle}</Text>
                </TouchableOpacity>
                  : null
                )) :
                <TouchableOpacity style={styles.rightNav} onPress={ ()=>{rightAction()} }>
                  <Image style={styles.imgNav} source={ rightImage }/>
                  <Text style={styles.barButton}>{ rightTitle }</Text>
                </TouchableOpacity>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  barView: {
    height: Platform.OS === 'android' ? size(128) :  size(88) + isIPhoneXPaddTop(0),
    paddingTop: isIPhoneXPaddTop(0),
    backgroundColor: AppDef.Blue,
  },
  showView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  title: {
    color: 'white',
    fontSize: size(34),
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
    width: size(36),
    height: size(36),
  },
  rightNav: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: size(80),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barButton: {
    color: 'white',
    fontSize: size(30),
    marginRight: size(20)
  },
})
