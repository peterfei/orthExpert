import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Button,
  DeviceEventEmitter,
  Platform
} from "react-native";
import StarRating from "react-native-star-rating";
import { screen, system,NetInterface, HttpTool } from "../../common";
import _ from "lodash";
import { color } from "../../widget";
import showMessages from "./showMessages";
import { storage } from "../../common/storage";
import { NavigationActions,StackActions } from "react-navigation";
import RefreshListView, { RefreshState } from "react-native-refresh-list-view";
import { size } from "../../common/ScreenUtil";

import {getDate} from "../Unity/LCE"

const that = this;

export default class MessageBoard extends Component {
  static navigationOptions = {
    header: null
  };
  componentDidMount() {
  }
  onShowMessage = () => {
    console.log(`=============`);
    this.props.navigation.navigate("showMessages");
  };
  constructor(props) {
    super(props);
    this.state = {
      starCount: 1,
      content: "",
      dataList: [],
      refreshing: false,
      currentPage: 1,
      pageLimit: 20,
      refreshState: RefreshState.Idle,
      title: '用户评价反馈'
    };
  }
  componentWillMount() {
    this.loadNewData();
  }
  checkUserToken = tokens => {
    if (tokens == -2) {
      this.refs.toast.show("用户信息已失效,请重新登录");
      setTimeout(
        function () {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
          });
          this.props.navigation.dispatch(resetAction);
        }.bind(this),
        1000
      );
    } else if (tokens == -1) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
      });
      this.props.navigation.dispatch(resetAction);
    }
  };
  requestFirstPageData = async () => {
    // this.setState({ refreshState: RefreshState.HeaderRefreshing });
    let data = {
      // lang: "ch",
      page: this.state.currentPage,
      limit: this.state.pageLimit
    };
    console.log(`
      \n传入的请求数据:${JSON.stringify(data)}\n
    `);
    const url = NetInterface.gk_msgList + "?business=orthope";
    console.log(`
      \n当前请求的url:${url}
    `);
    let responseData = HttpTool.GET_JP(url)
      .then(
        result => {
          //alert(JSON.stringify(result));
          if (result && result.page) {
            // alert(JSON.stringify(result.page));
            this.setState({
              dataList: [...this.state.dataList, ...result.page.list],
              totalPage: result.page.totalPage,
              pageLimit: result.page.pageSize,
              currentPage: result.page.currPage,
              refreshState: RefreshState.Idle
            });
          }
        },
        error => {
          console.log(`\n连接网络失败`);
        }
      );
    return responseData;
  };
  requestNextPageData = async () => {
    this.setState({ refreshState: RefreshState.FooterRefreshing });
    if (this.state.totalPage == 1) {
      console.log("=====只有一页=====");
    } else {
      // if(this.state.currentPage)
      if (this.state.currentPage != this.state.totalPage) {
        let nextPage = this.state.currentPage++;
        // const resp = await this.requestFirstPageData();
        this.requestFirstPageData();
        alert(JSON.stringify(resp));
        // debugger;
        // this.setState({
        //   refreshState: RefreshState.FooterRefreshing,
        //   currentPage: nextPage
        // });

        console.log(`
      \n====================
       ${this.state.dataList}
      `);
        // debugger;
        let newDatas = resp.list;
        newDatas = [...this.state.dataList, ...newDatas];
        this.setState({
          dataList: newDatas,
          refreshState: RefreshState.Idle
        });
      } else {

      }
    }

  };

  loadNewData() {
    // alert(JSON.stringify(this.state));
    // return;
    this.state.dataList = [];
    this.state.currentPage = 1;
    this.setState({
      refreshState: RefreshState.HeaderRefreshing
    })
    this.requestFirstPageData();
  }

  loadMoreData() {
    this.state.currentPage = this.state.currentPage + 1;
    this.setState({
      refreshState: RefreshState.FooterRefreshing
    })
    this.requestFirstPageData();
  }

  renderCell = (rowData: any) => {
    // debugger;
    return (
      <TouchableOpacity onPress={() => { }} style={{
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA', marginRight: 10
      }}>


        <View style={{ flexDirection: "row", justifyContent: "space-around" }} >
          <View style={{ margin: 8, flex: 3 }}>
            <Text style={{ fontSize: 14, color: "#8E8E8E" }}>来自{rowData.item.mb_province}用户 {rowData.item.mbName} </Text>
          </View>
          <View style={{ marginTop: 8, marginRight: 5, flex: 1 }}>
           {/* <StarRating style={{ marginRight: 5 }}
              disabled={false}
              maxStars={5}
              emptyStar={"ios-star-outline"}
              fullStar={"ios-star"}
              halfStar={"ios-star-half"}
              iconSet={"Ionicons"}
              rating={rowData.item.msg_grade}
              fullStarColor={"red"}
              starSize={20}

            />*/}
          </View>
        </View>

        <View style={{ flexDirection: "column" }} >
          <View style={{ margin: 8 }}>
            <Text style={{ fontSize: 16, color: "#454545" }}>{rowData.item.content} </Text>
          </View>
          <View style={{ margin: 8, flexDirection: "column" }}>
            {rowData.item.reply_state == 'yes' ? rowData.item.replyList.map((data, index) => {
              return (
                <View>
                  <Text><Text style={{ color: "#FF7F24" }}>系统回复:</Text>{data.reply_content}</Text>
                </View>
              );

            }) : <View />}
          </View>


        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }} >

          <View style={{ margin: 8, flex: 1 }}>
            <Text style={{ textAlign: "right" }}>{getDate(rowData.item.add_time)}</Text>
          </View>

        </View>


      </TouchableOpacity>
    );
  };

  /* <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <View style={{ flexDirection: "column", justifyContent: "center" }}>
                <View style={{ margin: 8 }}>
                  <Text>{rowData.item.content}</Text>
                </View>
              </View>
            </View>*/


  render() {
    return (
      <View>
        <View style={styles.titleBar}>
          <TouchableOpacity style={{ flex: 2, justifyContent: 'center', alignItems: 'center', height: size(60), }}
            onPress={() => { this.props.navigation.goBack() }}>
            <Image source={require('../../img/search/backjt.png')} style={{ width: size(25), height: size(25) }}></Image>
          </TouchableOpacity>
          <View style={{ flex: 11, alignItems: 'flex-start', justifyContent: 'center', height: size(60), }}>
            <Text style={{ fontSize: size(34), color: '#fff', fontWeight: 'bold' }}>{this.state.title}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.onShowMessage();
            }}
            style={{  marginTop:size(16),width:'30%'}}>

            <View style={{flexDirection:'row'}}>
               <View style={{flex:1,alignItems:"flex-end"}}>
                   <Image source={require('../../img/search/fanhui.png')} style={{ width: size(40), height: size(40) }}/>
               </View>
               <View style={{flex:2,}}>
                   <Text style={{color:"#fff",fontSize:size(32),fontWeight:"bold"}}> 提交反馈  </Text>
               </View>

            </View>






          </TouchableOpacity>

        </View >

        <View style={styles.container}>
          <RefreshListView style={{ marginBottom: size(60) }}
                           data={this.state.dataList}
                           renderItem={this.renderCell}
                           refreshState={this.state.refreshState}
                           onHeaderRefresh={() => {this.loadNewData()}}
                           onFooterRefresh={() => {this.loadMoreData()}}
                           removeClippedSubviews={false}
                           footerRefreshingText="玩命加载中.."
                           footerFailureText="我擦嘞，居然失败了.."
                           footerNoMoreDataText="--我是有底线的--"
          />
        </View>

      </View>
    )
  }


}
const styles = StyleSheet.create({
  container: {
    height: screen.height,
    // marginTop: 10,
    // color: "white",
    backgroundColor: "white"
    // flex: 1,
    // justifyContent: "center"
    // alignItems: "center"
  },
  titleBar: {
    height: size(148),
    paddingTop: size(70),
    flexDirection: "row",
    backgroundColor: "#0094e5",
    width: '100%',

  },
});