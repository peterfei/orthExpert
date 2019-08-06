import React, {Component} from "react";
import {Image, Platform, Text, TouchableOpacity, View, WebView, StyleSheet, ScrollView} from "react-native";
import {size} from "../../../common/ScreenUtil";
import MyTouchableOpacity from '../../../common/components/MyTouchableOpacity';

export default class TextUSView extends Component {
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
        return (
          <View style={styles.textSourceStyle}>
              <View style={{
                  height: size(60),
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
              }}>
                  <TouchableOpacity onPress={() => {
                      this.closeSourceView()
                  }}>
                      <Image source={require('../../../img/unity/close.png')} style={{
                          width: size(36),
                          height: size(36),
                          marginRight: size(20),
                          resizeMode: 'contain'
                      }}/>
                  </TouchableOpacity>
              </View>
              <View style={{width: '100%', height: size(282), marginTop: -1}}>
                  <ScrollView style={{height: size(280)}}>
                      <View style={{marginBottom: size(20)}}>
                          <Text
                            style={{
                                marginLeft: '2.5%',
                                marginRight: '2.5%',
                                width: "95%",
                                flexWrap: 'wrap',
                                color: '#fff',
                                fontSize: size(26),
                                paddingLeft: size(20), paddingRight: size(20),
                                lineHeight: size(40),
                                flex: 1
                            }}
                          >
                              {(this.state.source.content + "").replace(//g, "足拇")}
                          </Text>
                      </View>
                  </ScrollView>
              </View>


          </View>
        )
    }
}

const styles = StyleSheet.create({
    textSourceStyle: {
        width: '100%',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
    }
})