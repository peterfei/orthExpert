import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Button, Alert,
    DeviceEventEmitter,
    Platform, TouchableHighlight,ScrollView
} from "react-native";
import { color } from "../../widget";
import {AppDef, deviceWidth, HttpTool, NetInterface, screen, system, Line, NullData} from "../../common";
import { size } from "../../common/ScreenUtil";
import { storage } from "../../common/storage";
import StarRating from "react-native-star-rating";
import api from "../../api";
import CardCell from './CardCell';
import Device from "react-native-device-info";
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";

var that = null;

export default class MyRecoveryItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CardCellData: [],
            isRefreshing: false,
            refreshState: RefreshState.Idle,
        }

        this.page = 1;
        this.limit = 10;
        that = this;
    }

    componentDidMount() {
        this.requestData();

        this.listener = DeviceEventEmitter.addListener('UpdateMyCustom', () => {
            this.requestData();
        })
    }

    componentWillUnmount() {
        this.listener.remove();
    }

    async requestData() {
        let auth = await storage.get("auth")
        let loginType = auth.loginType||'tell';
        const url = NetInterface.myCreatePlanList+ "?patNo=" + this.props.patNo + "&page=" + this.page + "&limit=" + this.limit + "&business=kfxl&loginType=" + loginType;
        console.log(JSON.stringify(url));

        HttpTool.GET_JP(url)
          .then(result => {

              if (result.code == 0) {
                  if (result.page.list.length > 0) {
                      let newData = result.page.list;
                      let oldData = this.state.CardCellData;
                      let data = this.page == 1 ? newData : [...oldData, ...newData];
                      this.setState({
                          CardCellData: data,
                          refreshState: RefreshState.Idle
                      })
                  } else {
                      this.setState({
                          refreshState: RefreshState.NoMoreData
                      })
                  }
              } else {

              }
          })
          .catch(err => {
              console.log(JSON.stringify(err))
          })
    }

    onHeaderRefresh = () => {
        this.page = 1;
        this.setState({
            refreshState: RefreshState.HeaderRefreshing,
        }, () => {
            this.requestData()
        });
    };

    onFooterRefresh = () => {
        this.page = this.page + 1;
        this.setState({
            refreshState: RefreshState.FooterRefreshing
        }, () => {
            this.requestData()
        });
    };

    _renderCards(item) {
        return (
          <CardCell cellRow={item.item} selectCard={(row) => {that.selectCard(row)}}/>
        );
    }

    keyExtractor = (item: any, index: number) => {
        return index;
    };

    selectCard(data) {
        this.props.navigation.navigate('kfPlanDetail', { 'planId': data.planId })
    }

    render() {
        return (
            <View style={styles.container}>

                {
                    this.state.CardCellData.length > 0
                      ?
                      <RefreshListView
                        style={{flex: 1, backgroundColor: 'white'}}
                        data={this.state.CardCellData}
                        renderItem={this._renderCards}
                        keyExtractor={this.keyExtractor}
                        refreshState={this.state.refreshState}
                        onHeaderRefresh={this.onHeaderRefresh}
                        onFooterRefresh={this.onFooterRefresh}
                        footerRefreshingText="玩命加载中..."
                        footerFailureText="加载失败啦~~"
                        footerNoMoreDataText="--我是有底线的--"
                        footerEmptyDataText="-还没有数据哦,下拉刷新试试-"
                      />
                      :
                      <NullData/>
                }
                <Line height={size(100)} color={'white'}/>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        flex: 1,
        zIndex: 999,
    },
    buttonStyle: {
        color: 'white',
        backgroundColor: '#44B4E9',
        height: 50,
        fontSize: 18,
        fontWeight: 'bold',
        width: screen.width,
        lineHeight: 45,
        textAlign: 'center'
    }
})