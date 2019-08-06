import React, {Component} from "react";
import {Image, Platform, Text, TouchableOpacity, View, WebView, StyleSheet} from "react-native";
import {size} from "../../../common/ScreenUtil";
import MyTouchableOpacity from '../../../common/components/MyTouchableOpacity';


const BaseScript =
  `
    (function () {
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
            height = document.body.scrollHeight;
            document.body.style.backgroundColor = "black";
            var items = document.getElementsByTagName("p");
            for(var i = 0; i < items.length; i++) {
               items[i].style.backgroundColor = "black";
            }
            if (window.postMessage) {
              window.postMessage(JSON.stringify({
                type: 'setHeight',
                height: height,
              }))
            }
          }
        }
        setTimeout(changeHeight, 100);
    } ())
    `

export default class HtmlUSView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 0,
            source: props.source
        }
    }

    onMessage(event) {
        try {
            const action = JSON.parse(event.nativeEvent.data)
            if (action.type === 'setHeight') {
                this.setState({height: action.height + size(80)})
            }
        } catch (error) {
            // pass
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
        return (
          <View style={styles.htmlSourceStyle}>
              <View style={{
                  height: size(60),
                  width: '100%',
                  marginBottom: -1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.8)',
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
              <WebView
                injectedJavaScript={BaseScript}
                onMessage={this.onMessage.bind(this)}
                automaticallyAdjustContentInsets
                domStorageEnabled
                javaScriptEnabled
                decelerationRate='normal'
                scalesPageToFit={Platform.OS === 'ios' ? true : false}
                source={{uri: this.state.source.content}}
                startInLoadingState={true}
                style={{width: '100%', height: this.state.height}}
                renderError={() => {
                    return <View style={styles.loadWeb}><Text
                      style={{
                          color: "#FFF",
                          alignSelf: "center"
                      }}>
                        资源加载失败!请检查网络设置...
                    </Text></View>

                }}
              />
          </View>
        )
    }
}

const styles = StyleSheet.create({
    htmlSourceStyle: {
        width: '100%',
        height: size(801),
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
        marginBottom: -1,
    },
    loadWeb: {
        marginLeft: size(48), backgroundColor: "#323232", height: '100%'
    }
})