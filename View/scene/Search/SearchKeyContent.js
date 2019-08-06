import React, { Component } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
    NetInfo,
    Linking,
    DeviceEventEmitter,
    AppState,
    ListView, TextInput, ActivityIndicator,
    InteractionManager
} from "react-native";
import { size } from "../../common/ScreenUtil";
import ScrollableTabView, {
    DefaultTabBar,
    ScrollableTabBar
} from "react-native-scrollable-tab-view";
import { screen, system } from "../../common";
import RefreshListView, { RefreshState } from "react-native-refresh-list-view";
import { color } from "../../widget";
import Loading from "../../common/Loading";
// import WkHomeMenuSecond from "./WkHomeMenuSecond";
import api from "../../api";
import { Colors } from "react-native-ui-lib";
import { NavigationActions } from "react-navigation";

import { storage } from "../../common/storage";
import _ from "lodash";
import Toast, { DURATION } from "react-native-easy-toast";
import DeviceInfo from "react-native-device-info";
import Icon from "react-native-vector-icons/Ionicons"

// @NetInfoDecorator
export default class SearchKeyContent extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
            licenList: [],
            refreshState: RefreshState.Idle,
            isCon: false, //是否联网
            refreshing: false,
            isRefreshing: false,
            refResult: "正在刷新...",
            isLoading: true,
            text: '',
            searchList: [],
            currentStructId: '',
            isConnected: true,
            acceptSearchKeyWords: [],//接收点击关键词后 查询到的关键内容

            keywordsList: [],//存放关键词列表数据
            keyName: this.props.navigation.state.params.keyName,
            keyId: this.props.navigation.state.params.keyId,

            keyCount: this.props.navigation.state.params.keyCount,

            searchKey: "",

        };
    }


    listeners = {
        update: DeviceEventEmitter.addListener(
            "loadWkHomeData",
            ({ ...passedArgs }) => {
                // this.getHomeData();
                // Perform update
            }
        )
    };

    componentDidMount(text) {
        //  alert("--"+this.state.keyName)
        this.getKeySearchList(this.state.keyName, this.state.keyId, this.state.keyCount)
        this.setState({
            isLoading: false
        })
        try {
            //监听网络变化事件
            NetInfo.isConnected.addEventListener("change", networkType => {
                this.setState({ isConnected: networkType });
            });

            NetInfo.isConnected.fetch().done(isConnected => {
                this.setState({ isConnected });
            });
        } catch (e) { }
    }

    //根据关键词列表 点击查询 关键内容
    getKeySearchList = async (keyName, keyId, keyCount) => {
        // alert(keyName)
        if (keyName !== '') {
            let tokens = await storage.get("userTokens");
            let url = api.base_uri + "v1/app/struct/getStructByKeyWord?token=1"
            let parameters = {
                "keyName": keyName,
                "keyId": keyId,
                "keyCount": keyCount,
                "type": "key",
                "plat": "android",
                "appVersion": '2.3.0'

            }
            return fetch(url, {
                method: "post",
                body: JSON.stringify(parameters),
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                }
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        acceptSearchKeyWords: responseJson.result

                    })
                    // this.props.navigation.navigate('SearchKeyContent', { keyName:keyName })
                    // alert(JSON.stringify(this.state.acceptSearchKeyWords))

                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
    _onJump() {
        this.props.navigation.goBack();
    }
    async startUse(info) {
        const { isConnected } = this.props;
        if (isConnected) {
            //联网就保存使用记录
            this.addStructUseLog(info);
        }

        const isTablet = DeviceInfo.isTablet() //是否为平板
        let newData = Object.assign({}, info, { isTablet: isTablet });
        // alert(`JSON.stringify(newData) is ${JSON.stringify(newData)}`)
        //todo 启动unity
        //GotoUnityView.addEvent(JSON.stringify(newData));
    }


    addStructUseLog = async info => {
        try {
            const url =
                api.base_uri +
                "/v1/app/struct/addStructUseLog?structId=" +
                info.struct_id;
            let tokens = await storage.get("userTokens");
            let responseData = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                }
            })
                .then(resp => resp.json())
                .then(result => { });
        } catch (error) { }
        return true;
    };


    buyState(licenList, info) {
        if (licenList != -1 && licenList != -2 && licenList.length > 0) {
            for (let i = 0; i < licenList.length; i++) {
                let item = licenList[i];

                if (item.struct_id == info.struct_id) {
                    let currTime = new Date();
                    if (
                        new Date(item.e_time.substring(0, 10)).getTime() >=
                        currTime.getTime()
                    ) {
                        // this.refs.toast.show("本地授权成功");
                        return true;
                    }
                    break;
                }
            }
            // this.refs.toast.show("本地授权失败");
            return false;
        } else {
            //this.refs.toast.show("本地授权信息查询失败");
            return false;
        }
    }


    checkIsUse = async info => {
        let tokens = await storage.get("userTokens");
        let memberInfo = await storage.get("memberInfo");
        let licenList = await storage.get("licenList");

        if (memberInfo == -1 || memberInfo == -2) {
            this.refs.toast.show("登录过期,请重新登录");

            this.timer = setTimeout(() => {
                this.props.navigation.navigate("Login");
                // const resetAction = NavigationActions.reset({
                //   index: 0,
                //   actions: [NavigationActions.navigate({ routeName: "Login" })]
                // });
                // this.props.navigation.dispatch(resetAction);
            }, 1000);
            return;
        }

        if (info.is_charge == "no") {
            //不收费
            //是游客
            if (memberInfo.isYouke == "yes") {
                if (info.youke_use == "disabled") {
                    //游客不可用
                    this.refs.toast.show("您当前身份是游客,请先注册或登录使用会员功能");

                    this.timer = setTimeout(() => {
                        this.props.navigation.navigate("Login");
                        // const resetAction = NavigationActions.reset({
                        //   index: 0,
                        //   actions: [NavigationActions.navigate({ routeName: "Login" })]
                        // });
                        // this.props.navigation.dispatch(resetAction);
                    }, 1000);
                } else {
                    // this.refs.toast.show("1可以使用,正在准备unity");
                    this.startUse(info);
                }
            } else {
                // this.refs.toast.show("2可以使用,正在准备unity");
                this.startUse(info);
            }
        } else {
            //收费
            if (memberInfo.isYouke == "yes") {
                this.refs.toast.show("您当前身份是游客,请先注册或登录使用会员功能");

                this.timer = setTimeout(() => {
                    this.props.navigation.navigate("Login");
                    // const resetAction = NavigationActions.reset({
                    //   index: 0,
                    //   actions: [NavigationActions.navigate({ routeName: "Login" })]
                    // });
                    // this.props.navigation.dispatch(resetAction);
                }, 1000);
            } else {
                let isBuy = this.buyState(licenList, info); //查看是否购买

                if (isBuy) {
                    //   this.refs.toast.show("3可以使用,正在准备unity");
                    this.startUse(info);
                } else {
                    //如果本地没有授权那就去服务器查一下
                    const { isConnected } = this.state;

                    if (isConnected) {
                        try {
                            const url =
                                api.base_uri +
                                "/v2/app/struct/checkStructIsUse?structId=" +
                                info.struct_id;
                            await fetch(url, {
                                method: "get",
                                headers: {
                                    "Content-Type": "application/json",
                                    token: tokens.token
                                }
                            })
                                .then(resp => resp.json())
                                .then(result => {
                                    if (result.code == 0 && result.count > 0) {
                                        // this.refs.toast.show("服务器查询可以使用,正在准备unity");
                                        this.startUse(info);
                                        DeviceEventEmitter.emit("loadHomeData");
                                    } else {
                                        let _this = this;
                                        /* this.refs.dialog.show(
                                                                 info.struct_name + "为付费版,已为您推荐套餐"
                                                             );
                      */

                                        _this.toShopDetail(info.struct_id);
                                    }
                                });
                        } catch (error) { }
                    } else {
                        this.refs.toast.show("网络连接失败!! 请检查网络配置是否正确");
                    }
                }
            }
        }
    };


    async toShopDetail(structId) {
        Alert.alert("付费版请先购买", "已为您推荐套餐");
        let tokens = await storage.get("userTokens");
        const url =
            api.base_uri +
            "v2/app/struct/findComboByStructId?&structId=" +
            structId +
            "&plat=" +
            Platform.OS +
            "& business=anatomy&appVersion=3.3.0"; //拉取服务器最新版本
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
                if (result.code == 0) {
                    // alert(JSON.stringify(result.List))
                    if (result.List.length > 1) {
                        DeviceEventEmitter.emit("ShopEmitter", {
                            struct_id: structId
                        });
                        this.props.navigation.navigate("Shop", {
                            struct_id: structId
                        });
                    } else if (result.List.length == 1) {
                        this.props.navigation.navigate("ShopDetail", {
                            obj: result.List[0],
                            type_id: this.state.type_id,
                            navigation: this.props.navigation
                        });
                    } else {
                        this.refs.toast.show("未找到相关套餐");
                    }
                } else if (result.msg.indexOf("token失效") != -1) {
                    storage.clearMapForKey("userTokens");
                    storage.clearMapForKey("memberInfo");
                    // Alert.alert("登录过期,请重新登录")
                    this.props.navigation.navigate("Login");
                    // const resetAction = NavigationActions.reset({
                    //   index: 0,
                    //   actions: [NavigationActions.navigate({ routeName: "Login" })]
                    // });
                    // this.props.navigation.dispatch(resetAction);
                }
            });
    }


    getEndTime(licenList, info) {
        if (licenList != -1 && licenList != -2 && licenList.length > 0) {
            for (let i = 0; i < licenList.length; i++) {
                let item = licenList[i];

                if (item.struct_id == info.struct_id) {
                    let currTime = new Date();
                    let flag =
                        new Date(item.e_time.substring(0, 10)).getTime() + 1000 * 60 * 60 * 24 >=
                        currTime.getTime();
                    if (flag) {
                        let use =
                            (new Date(item.e_time.substring(0, 10)).getTime() -
                                currTime.getTime()) /
                            1000 /
                            60 /
                            60 /
                            24;
                        //  return "还可用" + Math.round(use) + "天";
                        return item.e_time.substring(0, 10) + "到期";
                    }
                }
            }
            // this.refs.toast.show("本地授权失败");
            return "";
        } else {
            return "";
        }
    }


    getIsUse = info => {
        //this.state.licenList
        let isTrue = this.getEndTime(this.state.licenList, info);

        return isTrue.toString();
    };




    render() {
        //默认搜索框展示
        return (
            <View style={{ flex: 1 }} >
                <View style={{ height: size(148), paddingTop: size(70), flexDirection: "row", backgroundColor: "#0094e5", width: '100%', }
                }>
                    <TouchableOpacity style={{ flex: 1.1, justifyContent: 'center', alignItems: 'center', height: size(60), }}
                        onPress={this._onJump.bind(this)}>
                        <Image source={require('../../img/search/left.png')} style={{ width: size(25), height: size(25) }}></Image>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.searchBar} onPress={this._onJump.bind(this)}>

                        <Image source={require('../../img/search/search.png')} style={{ marginLeft: size(30), width: size(40), height: size(40) }}></Image>

                        <Text style={{ color: '#eee', marginLeft: size(10) }}>{this.state.keyName}</Text>

                    </TouchableOpacity>

                    <View style={{ flex: 1.2, alignItems: "center", justifyContent: 'center', height: size(60), }}>

                        <TouchableOpacity
                            //点击搜索 提交输入框数据 给 接口
                            onPress={() => {
                                this.props.navigation.navigate('MessageNotice')
                            }} style={{ width: size(95), justifyContent: 'center', alignItems: 'center', height: size(60), }}>
                            <Text style={{ color: "#FFF", fontSize: size(22) }}>搜索</Text>
                        </TouchableOpacity>
                    </View>
                </View >
                <ScrollView>
                    <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                        {
                            this.state.acceptSearchKeyWords.map((data, index) => {
                                return (
                                    <ScrollView>
                                        <View style={{ width: screen.width / 3 }}>
                                            <TouchableOpacity
                                                style={styles.structIem}
                                            // onPress={() => {
                                            /* this.setState({
                                                currentStructId: data.struct_id
                                            }); */

                                            /*   //点击后插入数据
                                              this.addRecentlyUse(data.struct_id, data.struct_name)
                                              //监听点击产品事件
                                              DeviceEventEmitter.emit('refreshRecentlyUse') */
                                            // this.checkIsUse(data);
                                            // }}
                                            >
                                                {/* {iconItem} */}
                                                <Image
                                                    source={{ uri: data.first_icon_url }}
                                                    style={styles.icon}
                                                />
                                                <Text
                                                    style={{
                                                        textAlign: "center",
                                                        color: "423f3f",
                                                        fontWeight: "bold",
                                                        fontSize: size(26),
                                                        height: size(40),
                                                        lineHeight: size(50),
                                                        marginTop: size(8)
                                                    }}>
                                                    {data.struct_name}
                                                </Text>
                                                <Text
                                                    style={{
                                                        textAlign: "center",
                                                        marginTop: size(10),
                                                        fontSize: size(20),
                                                        color: "#868686"
                                                    }}>
                                                    {/* {endTime} */}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                )


                            })
                        }

                    </View>
                </ScrollView>
            </View>


        )





        /*  if (this.state.searchList.length > 0) {

           temp = this.state.searchList.map((data, index) => {
             if (data.value.length !== 0) {
               return (
                 <View style={{ flex: 1, flexDirection: 'column', width: screen.width, marginTop: size(20), }}>
                   <View style={{ flex: 1, justifyContent: 'center', }}>
                     <Text style={{ marginLeft: size(17), fontWeight: 'bold' }}>
                       {data.key}
                     </Text>
                   </View>
                   <View style={{ flex: 4, flexDirection: 'row', flexWrap: 'wrap', }}>
                     {
                       data.value.map(m => {
                         let iconItem = (
                           <Image
                             style={{
                               zIndex: 999,
                               right: size(-2),
                               top: size(9),
                               width: size(40),
                               height: size(40),
                               borderRadius: size(2),
                               position: "absolute"
                             }}
                           />
                         );
                         let endTime = "免费";
                         if (m.is_charge == "yes") {
                           let state = this.getIsUse(m);
                           if (state == "") {
                             iconItem = (
                               <Image
                                 style={{
                                   zIndex: 999,
                                   right: size(0),
                                   top: size(11),
                                   width: size(40),
                                   height: size(40),
                                   borderRadius: size(2),
                                   position: "absolute"
                                 }}
                                 source={require("../../img/home/lock.png")}
                               />
                             );
                             endTime = "未购买";
                           } else {
                             iconItem = (
                               <Image
                                 style={{
                                   zIndex: 999,
                                   right: size(0),
                                   width: size(40),
                                   height: size(40),
                                   borderRadius: size(2),
                                   position: "absolute"
                                 }}
                               />
                             );
                             endTime = state;
                           }
                         }
                         return (
                           <TouchableOpacity onPress={() => {
                             this.setState({
                               currentStructId: m.struct_id
                             });
                             this.addHistory();
                             this.checkIsUse(m);
                             this.hotSearchCounts(m.struct_id, m.struct_name)
                           }}>
                             {iconItem}
                             <View style={{ borderColor: '#d1d1d1', borderWidth: 0.5, height: size(260), width: screen.width / 3.3, marginLeft: size(16), marginTop: size(10) }}>

                               <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                                 <Image source={{ uri: m.first_icon_url }} style={{
                                   width: size(180),
                                   height: size(160),
                                   marginTop: size(5),
                                   resizeMode: "contain",
                                   alignSelf: "center",
                                   opacity: 0.7

                                 }}></Image>
                               </View>
                               <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                 <Text style={{
                                   fontWeight: "bold",
                                   fontSize: size(22),
                                 }}
                                 > {m.struct_name}</Text>
                               </View>
                               <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                 <Text
                                   style={{
                                     textAlign: "center",
                                     fontSize: size(18),
                                     color: "#868686"
                                   }}>
                                   {endTime}
                                 </Text>
                               </View>
                             </View>
                           </TouchableOpacity>

                         )
                       })
                     }
                   </View>
                 </View>
               )
             }
           })
         } */

        //关键词找不到相关内容时

    }
}




// define your styles
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
    },
    loadIcon: {
        width: screen.width * 0.5,
        height: screen.width * 0.5,
        resizeMode: "stretch",
        marginTop: size(100),
        marginBottom: 5,
        alignSelf: "center"
    },
    MainContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff'

    },
    structIem: {
        width: size(230),
        height: size(270),
        borderWidth: size(1),
        borderColor: "#dedede",
        backgroundColor: "#FFF",
        marginTop: size(20),
        alignSelf: "center",
        borderRadius: size(1),
    },

    rowViewContainer: {
        fontSize: 17,
        padding: 10
    },

    TextInputStyleClass: {

        textAlign: 'left',
        height: 40,
        borderWidth: 1,
        borderColor: '#009688',
        borderRadius: 7,
        backgroundColor: "#FFFFFF",
        marginRight: 20

    },
    /* searchBar: {
      width: screen.width * 0.62,
      height: size(74),
      flexDirection: 'row',
      justifyContent: 'flex-start',
      color: '#fff',
      fontSize: size(32),
    }, */
    searchBar: {
        flex: 8.2,
        height: size(60),
        borderRadius: size(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18a2eb',
        // marginLeft: size(30)
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginLeft: 25,
    },
    icon: {
        width: size(180),
        height: size(160),
        marginTop: size(5),
        resizeMode: "contain",
        alignSelf: "center",
        opacity: 0.7
    },
});
