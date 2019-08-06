import React, { Component } from "react";
import { DeviceEventEmitter, StyleSheet, View, Alert } from "react-native";

import RefreshListView, { RefreshState } from "react-native-refresh-list-view";
import Cell from "./Cell";
import { storage } from "../../common/storage";
import api from "../../api";
import { NavigationActions } from "react-navigation";

export default class OrderItem extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataList: [],
      refreshState: RefreshState.Idle
    };
  }

  componentDidMount() {
    let curr = this;
    DeviceEventEmitter.addListener("reloadOrder", function() {
      curr.onHeaderRefresh();
    });
    this.onHeaderRefresh();
  }

  /*//在组件销毁的时候要将其移除
    componentWillUnmount() {
        alert( "组件销毁")
        DeviceEventEmitter.remove()?"":DeviceEventEmitter.remove();
    }*/

  onHeaderRefresh = async () => {
    this.setState({ refreshState: RefreshState.HeaderRefreshing });
    let { orderState } = this.props;
    let tokens = await storage.get("userTokens");
    let data = {
      page: 1,
      limit: 100,
      ordState: orderState
    };

    const url = api.base_uri + "v1/app/order/myOrder";
    try {
      let responseData = await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          token: tokens.token
        },
        body: JSON.stringify(data)
      })
        .then(resp => resp.json())
        .then(result => {
          if (result.code == 0) {
            this.setState({
              dataList: result.page.list,
              refreshState:
                result.page.list.length == 0
                  ? RefreshState.EmptyData
                  : RefreshState.NoMoreData
            });
          } else if (result.msg.indexOf("token失效") != -1) {
            storage.clearMapForKey("userTokens");
            storage.clearMapForKey("memberInfo");
            // Alert.alert("登录过期,请重新登录")
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
            });
            this.props.navigation.dispatch(resetAction);
          }
        });
    } catch (error) {
      alert("订单查询失败!" + error);
    }
  };

  onFooterRefresh = () => {
    //  alert("foot")
  };

  keyExtractor = (item: any, index: number) => {
    return index;
  };

  renderCell = (info: Object) => {
    console.log(info);
    return <Cell info={info.item} navigation={this.props.navigation} />;
  };

  render() {
    return (
      <View style={styles.container}>
        <RefreshListView
          data={this.state.dataList}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderCell}
          refreshState={this.state.refreshState}
          onHeaderRefresh={this.onHeaderRefresh}
          onFooterRefresh={this.onFooterRefresh}
          // 可选
          footerRefreshingText="玩命加载中..."
          footerFailureText="加载失败啦~~"
          footerNoMoreDataText="--我是有底线的--"
          footerEmptyDataText="-还没有数据哦,下拉刷新试试-"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {
    flex: 1,
    fontSize: 20,
    textAlign: "center"
  },
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});
