import React, {Component} from "react";
import {Image, Platform, Text, TouchableOpacity, View, WebView, StyleSheet, ScrollView} from "react-native";
import {size} from "../../../common/ScreenUtil";
import MyTouchableOpacity from '../../../common/components/MyTouchableOpacity';

export default class PhotoUSView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            source: props.source
        }
    }

    closeSourceView() {
        this.props.onClose();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            source: nextProps.source
        })
    }

    render() {
      let sourceURL = this.state.source.content;
      return (
        <View style={styles.picOrGifSourceStyle}>
          <View style={{
            height: size(60),
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
            <MyTouchableOpacity onPress={() => {
              this.closeSourceView()
            }}>
              <Image source={require('../../../img/unity/close.png')} style={{
                width: size(36),
                height: size(36),
                marginRight: size(20),
                resizeMode: 'contain'
              }}/>
            </MyTouchableOpacity>
          </View>
          <View style={{width: '100%', height: size(740)}}>
            <Image style={{resizeMode: 'contain', width: size(740), height: size(740)}}
                   source={{uri: sourceURL}}/>
          </View>
        </View>
      )
    }
}

const styles = StyleSheet.create({
    picOrGifSourceStyle: {
      width: '100%',
      height: size(800),
      borderTopLeftRadius: size(20),
      borderTopRightRadius: size(20),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    }
})