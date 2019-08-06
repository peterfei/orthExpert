/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View,
  Dimensions, TouchableHighlight, TextInput
} from 'react-native';
import { screen, system } from "../../common";

import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
let unity = UnityView;



export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    name: '',
    data: '',
  }
  onUnityMessage(handler) {
    console.log(handler.name); // the message name
    console.log(handler.data); // the message data
    alert(handler.name)
    alert(JSON.stringify(handler.data.boneDisease))
    this.setState({
      name: handler.name,
      data: handler.data
    })
    setTimeout(() => {
      // You can also create a callback to Unity.
      handler.send('I am callback!');
    }, 2000);
  }
  render() {
    return (
      <View style={styles.container}>
        <UnityView
          ref={(ref) => this.unity = ref}
          onUnityMessage={this.onUnityMessage.bind(this)}
          style={{
            width: screen.width,
            height: screen.height
          }} />
        <View style={styles.body}>
          <View style={styles.top}>
            <TouchableHighlight
              onPress={() => this.My()}>
              <View style={[styles.button, { marginLeft: 5 }]}>
                <Text>我的</Text>
              </View>
            </TouchableHighlight>
            <TextInput
              style={styles.input} />
            <TouchableHighlight
              onPress={() => this.Message()}>
              <View style={[styles.button, { marginRight: 5 }]}>
                <Text>消息</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
  My() {
    this.props.navigation.navigate('MyScreen');
  }
  Message() {
    this.props.navigation.navigate('MessageNotice');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  body: {
    position: "absolute",
    width: screen.width,
    //height: 20,
    backgroundColor: 'rgba(250,250,250,0)'
  },
  top: {
    marginTop: 30,
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  input: {
    height: 40,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 3
  },
});
