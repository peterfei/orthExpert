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

    const url = NetInterface.gk_msgList + "?business=orthope";

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
              refreshState: RefreshState.Idle,
            });
          }
        },
        error => {
        }
      );
    return responseData;
  };
  requestNextPageData = async () => {
    this.setState({ refreshState: RefreshState.FooterRefreshing });
    if (this.state.totalPage == 1) {
    } else {
      // if(this.state.currentPage)
      if (this.state.currentPage != this.state.totalPage) {
        let nextPage = this.state.currentPage++;
        this.requestFirstPageData();
        alert(JSON.stringify(resp));
        // debugger;
        // this.setState({
        //   refreshState: RefreshState.FooterRefreshing,
        //   currentPage: nextPage
        // });
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
              {
                rowData.item.msg_type == "private"
                ?
                    <Text style={{ fontSize: 14, color: "#8E8E8E" }}>来自未知用户 </Text>
                :
                    <Text style={{ fontSize: 14, color: "#8E8E8E" }}>来自 {rowData.item.mb_province}用户 {rowData.item.mbName}</Text>
              }
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
                          //  onFooterRefresh={() => {this.loadMoreData()}}
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




//   async componentDidMount() {
//     this.props.navigation.setParams({
//       handleChangeType: this.onShowMessage
//     });
//     let memberInfo = await storage.get("memberInfo");
//     if (memberInfo.mbEmail != "") {
//       this.setState({
//         phone: memberInfo.mbEmail
//       });
//     }
//     if (memberInfo.mbTell != "") {
//       this.setState({
//         phone: memberInfo.mbTell
//       });
//     }
//   }
//   onShowMessage = () => {
//     console.log(`=============`);
//     this.props.navigation.navigate("showMessages");
//   };
//   constructor(props) {
//     super(props);
//     this.state = {
//       starCount: 5,
//       content: "",
//       onSelectedValue: "public",
//       phone: ""
//     };
//   }
//   onStarRatingPress(rating) {
//     this.setState({
//       starCount: rating
//     });
//   }
//   onSelect(index, value) {
//     this.setState({
//       onSelectedValue: value
//     });
//     console.log(`
//       \n 选中的value ${value}
//     `);
//   }
//   render() {
//     return (
//       <View style={styles.container}>
//         <TextInput
//           style={{
//             borderRadius: 4,
//             margin: 10,
//             fontSize: 20,
//             borderColor: "#F4F4F4",
//             borderWidth: 1,
//             width: screen.width - 10
//           }}
//           defaultValue={this.state.phone}
//           placeholder="请输入您的联系方式"
//           underlineColorAndroid="transparent"
//           onChangeText={text => this.setState({ phone: text })}
//         />
//         <TextInput
//           style={{
//             borderRadius: 4,
//             margin: 10,
//             fontSize: 20,
//             borderColor: "#F4F4F4",
//             borderWidth: 1,
//             width: screen.width - 10
//           }}
//           placeholder="请输入您宝贵的意见!"
//           multiline={true}
//           height={120}
//           underlineColorAndroid="transparent"
//           onChangeText={text => this.setState({ content: text })}
//         />
//         <StarRating
//           disabled={false}
//           maxStars={5}
//           emptyStar={"ios-star-outline"}
//           fullStar={"ios-star"}
//           halfStar={"ios-star-half"}
//           iconSet={"Ionicons"}
//           rating={this.state.starCount}
//           fullStarColor={"red"}
//           selectedStar={rating => this.onStarRatingPress(rating)}
//         />
//         <View style={{ width: screen.width, flexDirection: "row" }}>
//           <RadioGroup
//             onSelect={(index, value) => this.onSelect(index, value)}
//             selectedIndex={0}
//           >
//             <RadioButton value={"public"}>
//               <Text>公开</Text>
//             </RadioButton>
//             <RadioButton value={"private"}>
//               <Text>不公开</Text>
//             </RadioButton>
//           </RadioGroup>
//         </View>
//         <View>
//           <TouchableOpacity onPress={this.onSaveMessage.bind(this)}>
//             <View style={styles.textLoginViewStyle}>
//               <Text style={styles.textLoginStyle}>提交</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//
//         <Toast
//           ref="toast"
//           position="top"
//           positionValue={200}
//           fadeInDuration={750}
//           fadeOutDuration={1000}
//           opacity={0.8}
//         />
//
//         <Loading
//           ref={r => {
//             this.Loading = r;
//           }}
//           hudHidden={false}
//         />
//       </View>
//     );
//   }
//   onSaveMessage = async () => {
//
//     let curr = this;
//     console.log(`
//       ============\n
//       onSaveMessage
//       \n===========
//     `);
//     let tokens = await storage.get("userTokens");
//     console.log(`\n token is =====
//        ${JSON.stringify(tokens)}
//     `);
//     if (this.state.phone == "" || this.state.phone == undefined) {
//       this.refs.toast.show("请输入您的手机号/QQ/邮箱");
//       return;
//     }
//     if (this.state.content != "") {
//       curr.Loading.show("正在提交...");
//       // 提交数据
//       let url = api.base_uri + "/v1/app/msg/pushMsg";
//       console.info("url is " + url);
//       let deviceInfo = "手机型号:"+DeviceInfo.getModel()+",品牌:"+DeviceInfo.getBrand()+",手机版本:"+DeviceInfo.getSystemVersion()+",维萨里软件版本:"+DeviceInfo.getVersion();
//
//       let responseData = fetch(url, {
//         method: "post",
//         body: JSON.stringify({
//           content: this.state.content,
//           msgType: this.state.onSelectedValue,
//           msgGrade: this.state.starCount,
//           plat: Platform.OS,
//           contact: this.state.phone,
//             deviceInfo:deviceInfo
//         }),
//         headers: {
//           "Content-Type": "application/json",
//           token: tokens.token
//         }
//       })
//         .then(resp => resp.json())
//         .then(
//           result => {
//             // debugger;
//
//             if (result.code == 0) {
//               curr.Loading.close();
//               this.refs.toast.show("反馈信息提交成功! ");
//               let _this = this;
//               setTimeout(function() {
//                 _this.props.navigation.goBack();
//               }, 1000);
//
//               // resolve && resolve(result.labelList);
//             }
//           },
//           error => {
//             curr.Loading.close();
//             console.log("getTypeList error");
//             // reject && reject(error);
//           }
//         );
//     } else {
//       this.refs.toast.show("反馈信息内容为空");
//     }
//   };
// }
// const styles = StyleSheet.create({
//   container: {
//     // marginTop: 10,
//     color: "white",
//     backgroundColor: "white",
//     // flex: 1,
//     // justifyContent: "center"
//     alignItems: "center",
//     height: screen.height
//   },
//   textLoginViewStyle: {
//     width: screen.width - 40,
//     height: 50,
//     backgroundColor: color.main,
//     borderRadius: 10,
//     marginTop: 30,
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   //登录Text文本样式
//   textLoginStyle: {
//     fontSize: 18,
//     color: "white"
//   }
// });
