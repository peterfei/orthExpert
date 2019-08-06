import React, {Component} from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  DeviceEventEmitter,
  AppState,
  ActivityIndicator,
  InteractionManager,
} from "react-native";

import HtmlUSView from './HtmlUSView';
import PhotoUSView from './PhotoUSView';
import TextUSView from './TextUSView';
import VideoUSView from './VideoUSView';
import UnityLoading from './UnityLoading';


export {
  HtmlUSView,
  PhotoUSView,
  TextUSView,
  VideoUSView,
  UnityLoading,
};

class UnitySourceView extends Components {

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

    let v = null;
    let source = this.state.source;
    if (this.state.source == '') return;

    if (this.state.source.type == 'html') {
      v = <HtmlUSView source={source} onClose={() => {this.closeSourceView()}}/>
    } else if (this.state.source.type == 'pic' || this.state.source.type == 'gif') {
      v = <PhotoUSView source={source} onClose={() => {this.closeSourceView()}}/>
    } else if (this.state.source.type == 'text') {
      v = <TextUSView source={source} onClose={() => {this.closeSourceView()}}/>
    } else if (this.state.source.type == 'video') {
      v = <VideoUSView source={source} onClose={() => {this.closeSourceView()}}/>
    }

    return (
      {v}
    )
  }

}

module.exports = UnitySourceView;