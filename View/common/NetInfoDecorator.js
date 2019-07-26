/**
 * Created by ljunb on 2017/1/7.
 */
import React, { Component } from "react";
import { NetInfo } from "react-native";


const NetInfoDecorator = WrappedComponent =>
  class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isConnected: true
      };
    }
    
    componentDidMount() {
      //监听网络变化事件
      NetInfo.isConnected.addEventListener("change", networkType => {
        this.setState({ isConnected: networkType });
      });
      //NetInfo.isConnected.addEventListener(
      //  'change',
      //  this._handleNetworkConnectivityChange,
      //);
      //检测网络是否连接
      NetInfo.isConnected.fetch().done(isConnected => {
        this.setState({ isConnected });
      });
    }

    _handleNetworkConnectivityChange = isConnected =>
      this.setState({ isConnected });

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  };

export default NetInfoDecorator;
