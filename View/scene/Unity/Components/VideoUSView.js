import React, {Component} from "react";
import {Image, Platform, Text, TouchableOpacity, View, WebView, StyleSheet, ScrollView, Alert} from "react-native";
import {size} from "../../../common/ScreenUtil";
import MyTouchableOpacity from '../../../common/components/MyTouchableOpacity';
import Video, {Container} from 'react-native-af-video-player';
import Orientation from 'react-native-orientation';

export default class VideoUSView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            source: props.source,
            isPro: true
        }
    }

    closeSourceView() {
        this.props.onClose();
    }

    playVideoError(msg) {
      Alert.alert('', '该视频暂未开放, 敬请期待.', [{text: '我知道了'}])
      this.setState({
        currentShowSource: ''
      })
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            source: nextProps.source
        })
    }

  render() {
        return (
          <View style={[styles.videoSourceStyle, {marginBottom: this.state.isPro ? 0 : size(-90)}]}>
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
            <Video
              rotateToFullScreen
              url={this.state.source.content}
              ref={(ref) => {
                this.video = ref
              }}

              onError={(msg) => {
                this.playVideoError(msg)
              }}
            />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    videoSourceStyle: {
      width: '100%',
      borderTopLeftRadius: size(20),
      borderTopRightRadius: size(20),
      overflow: 'hidden',
      flex: 1
    },
})