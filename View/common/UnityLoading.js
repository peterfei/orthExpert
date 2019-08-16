

import React, { Component } from 'react';
import {
  Platform,
  View,
  ActivityIndicator,
  Text,
  StyleSheet
} from 'react-native';

import PropTypes from 'prop-types'

export default class UnityLoading extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      title:"请求中"
    }
  }

  close() {
    if (Platform.OS === 'android') {
      this.setState({modalVisible: false});
    }else {
      this.setState({modalVisible: false});
    }
  }

  show(title) {
    this.setState({modalVisible: true,title:title});
  }

  render() {
    if (!this.state.modalVisible) {
      return null
    }
    return (
      <View style={styles.container}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 100, height: 100, alignItems: 'center'}}>
            <ActivityIndicator
              animating={true}
              color='white'
              style={{
                marginTop: 10,
                width: 60,
                height: 60,
              }}
              size="large" />
            <Text style={{color:"#fff"}}>{this.state.title}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }
})

UnityLoading.PropTypes = {
  hide: PropTypes.bool.isRequired,
};