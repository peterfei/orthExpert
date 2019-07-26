/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View,
  Dimensions
} from 'react-native';
import {screen, system} from "./View/common";

import UnityView, {UnityViewMessageEventData, MessageHandler} from 'react-native-unity-view';
let unity = UnityView;

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

// type Props = {};
export default class App extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //     styles: {width:screen.width,height:screen.width},
    //     /*    info:this.navigation.state.params.info*/
    // };


}
  onUnityMessage(handler) {
      console.log(handler.name); // the message name
      console.log(handler.data); // the message data
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
                        width:screen.width,
                        height: screen.height
                    }}
                />
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
