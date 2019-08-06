import React, {Component} from "react";
import {
    ScrollView,
    Animated,
    StyleSheet,
    Text,
    View,
    Button,
    Easing,
    TouchableOpacity,
    Alert,
    TextInput,
    StatusBar,
    ImageBackground,
    BackAndroid,
    Image, DeviceEventEmitter, Platform, WebView
} from "react-native";
import {size} from "../../common/ScreenUtil";
import {screen, system} from "../../common";
import {checkIsUse} from "./LCE"
import {NavigationActions} from 'react-navigation'
import Toast from "react-native-easy-toast";
import ScrollableTabView, {
    DefaultTabBar,
    ScrollableTabBar
} from "react-native-scrollable-tab-view";
import api from "../../api";
import {storage} from "../../common/storage";
import {deleteAllStruct, saveStructList} from "../../realm/RealmManager";
import Comment from "./Comment";
import VideoScreen from "./VideoScreen";
/*import WebView from 'react-native-android-fullscreen-webview-video';*/
import Orientation from 'react-native-orientation';
import {VoiceUtils} from "../../common/VoiceUtils";
let index = 0;
const BaseScript =
    `
    (function () {
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
            height = document.body.scrollHeight;
            if (window.postMessage) {
              window.postMessage(JSON.stringify({
                type: 'setHeight',
                height: height,
              }))
            }
          }
        }
        setTimeout(changeHeight, 100);
    } ())
    `

const groupBy = (targetList, field) => {
    const names = findNames(targetList, field);
    return names.map(name => {
        const value = targetList.filter(target => target[field] === name)
        return {
            firstSort: value[0].firstSort == undefined ? "" : value[0].firstSort,
            secondSort: value[0].secondSort == undefined ? "" : value[0].secondSort,
            key: name,
            "icon_url": value[0].firstIconUrl == undefined ? "" : value[0].firstIconUrl,
            value
        }

    })
}

//排序


function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}


function findNames(targetList, field) {
    const names = []
    targetList.forEach(target => {
        if (!names.includes(target[field])) {
            names.push(target[field])
        }
    })
    return names
}

export default class Menus extends Component {

    static navigationOptions = {
        header: null
    };

    /**
     * web端发送过来的交互消息
     */
    onMessage(event) {
        try {
            const action = JSON.parse(event.nativeEvent.data)
            if (action.type === 'setHeight') {
                this.setState({height: action.height + size(80)})
            }
        } catch (error) {
            // pass
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            isShow: this.props.isShow,
            currSelectList: this.props.currSelectList,
            currSelectKey: this.props.currSelectKey,
            info: this.props.info,
            height: 0,
            isConnect: this.props.isConnect,
            currModel: this.props.currModel,
            licenList: [],
            showComment: this.props.showComment,
            multiOpen: this.props.multiOpen
        };

    }

    async getLinceList() {
        let licenList = await storage.get("licenList");

        this.setState(
            {licenList: licenList}
        )

    }

    componentDidMount() {


    }

    async initVoice() {
        if (index == 0) {
            VoiceUtils.init(0);
            index++
        }
    }

    fayin(name) {
        this.initVoice()
        let str = name + "。" + this.state.currModel.enName;
        str = str.replace("_L", "").replace("_R","").replace("_左", "").replace("_右", "");

        VoiceUtils.speak(str);
    }

    componentWillMount() {
        this.getLinceList();
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener("back", this.goBack);
        }


    }

    goBack = () => {
        let flag = this.state.showComment || this.state.isShow;

        if (flag) {
            this.setState({
                showComment: false,
                isShow: false,
                currSelectKey: ""
            })
        } else if (this.props.titleShow) {
            this.props.sendMsgToUnity("back", {});
        }
        return true;
    };

    componentWillReceiveProps(nextProps) {

        this.setState({
            isShow: nextProps.isShow,
            currSelectList: nextProps.currSelectList,
            currSelectKey: nextProps.currSelectKey,
            currModel: nextProps.currModel,
            info: nextProps.info,
            isConnect: nextProps.isConnect,
            showComment: nextProps.showComment,
            multiOpen: nextProps.multiOpen,
        });
    }

    /**
     * 添加收藏
     * @returns {Promise<void>}
     */
    async addConnect() {

        let memberInfo = await storage.get("memberInfo", "");
        let tokens = await storage.get("userTokens");
        let flag = memberInfo != -1 && memberInfo != -2 && tokens != -1 && tokens != -2;

        if (flag) {
            try {
                await fetch(api.base_uri + "v1/app/member/operateMemberCollection?" +
                    "token=" + tokens.token + "&structId=" + this.state.info.struct_id + "&mbId=" + memberInfo.mbId, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(resp => resp.json()).then(result => {
                    /*clear*/
                    //为了体验 不做任何处理
                    DeviceEventEmitter.emit("showCollectionList");
                });
            } catch (e) {

            }
        }

    }

    /**
     * 点击收藏
     */
    clickShouchang() {
        this.setState({
            isConnect: this.state.isConnect ? false : true
        })
        this.addConnect();
    }

    /**
     * 检测是否购买了系统解剖
     * @param item
     * @param licenList
     */
    checkIsBuySystem(item, licenList) {
        //    alert(JSON.stringify(item))
        let flag = true;
        let url = item.icon_url + "";
        if (url.search("charge") != -1) {
            if (licenList && licenList.length > 0) {
                for (let i = 0; i < licenList.length; i++) {
                    let id = licenList[i].struct_id;
                    let str = [322, 265, 272, 320, 263, 270, 318, 261, 268, 257, 325, 275, 259, 323, 266, 273, 321, 264, 271, 319, 262, 269, 258, 260, 256, 324, 267, 274, 129, 127, 115, 132, 130, 128, 126, 133, 235, 131, 358];
                    if (str.indexOf(id) != -1) {
                        flag = true;
                        break;
                    } else {
                        flag = false;
                    }
                }
            } else {
                flag = false;
            }
        }

        return flag;


    }

    /**
     * 点击功能菜单
     * @param item
     */
    changeView(item) {

        let flag = this.checkIsBuySystem(item, this.state.licenList);
        if (flag) {
            if (item.key == '返回') {
                this.props.sendMsgToUnity('back', {});
            } else if (item.key == this.state.currSelectKey) {

                this.setState({
                    isShow: true,
                    currSelectList: item.value,
                    currSelectKey: item.key
                })

            } else {

                this.setState({
                    isShow: true,
                    height: size(700),
                    currSelectList: item.value,
                    currSelectKey: item.key
                })
            }

        } else {
            Alert.alert("该功能需要付费 ,已为您推荐套餐", "请选择套餐");
            if (Platform.OS == 'ios') {
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({
                            routeName: "Tab",
                            action: NavigationActions.navigate({
                                routeName: 'Shop',
                                params: {
                                    struct_id: "115"
                                },

                            }),
                        })
                    ]
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                this.props.navigation.navigate("Shop", {
                    struct_id: "115"
                });
            }
        }


    }


    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener("back", this.goBack);
        }
    }

    async toVideo(info) {
        await this.props.changeHeight('0.01%');
        let _this = this;
        this.props.navigation.navigate("MenusVideo", {
            video: info, callback: (backdata) => {
                _this.props.changeHeight('100%');
                _this.setState({
                    isShow: false
                })
            }
        });

    }

    async toUse(groupValueListItem, dataList) {
        let tokens = await storage.get("userTokens");
        let memberInfo = await storage.get("memberInfo");
        if (tokens != -1 && tokens && memberInfo) {
            //检查是否可用

            if (groupValueListItem.lince == '未购买') {
                try {
                    const url =
                        api.base_uri +
                        "/v2/app/struct/checkStructIsUse?structId=" +
                        groupValueListItem.struct_id;
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
                                this.use(groupValueListItem, dataList);
                                DeviceEventEmitter.emit("loadHomeData");
                            } else {

                                this.toShopDetail(groupValueListItem.struct_id);
                            }
                        });
                } catch (error) {
                    Alert.alert("会话过期,请重新登录");
                    setTimeout(
                        function () {
                            const resetAction = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({routeName: "Login"})]
                            });
                            this.props.navigation.dispatch(resetAction);
                        }.bind(this), 1000
                    );
                }
            } else {

                if (memberInfo.isYouke == "yes" && groupValueListItem.youke_use == "disabled") {
                    Alert.alert("该结构不支持游客观看, 请先注册");
                    setTimeout(
                        function () {
                            const resetAction = NavigationActions.reset({
                                index: 0,
                                actions: [NavigationActions.navigate({routeName: "Login"})]
                            });
                            this.props.navigation.dispatch(resetAction);
                        }.bind(this), 1000
                    );
                } else {
                    this.use(groupValueListItem, dataList);
                }


            }
        } else {
            Alert.alert("会话过期,请重新登录");
            setTimeout(
                function () {
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({routeName: "Login"})]
                    });
                    this.props.navigation.dispatch(resetAction);
                }.bind(this), 1000
            );
        }


    }


    async toShopDetail(structId) {
        Alert.alert("付费版请先购买", "已为您推荐套餐");
        try {
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
                        //  alert(JSON.stringify(result.List))
                        if (result.List.length > 1) {

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
                            Alert.alert("溫馨提示", "系统暂未发布相关套餐");

                        }
                    } else if (result.msg.indexOf("token失效") != -1) {
                        storage.clearMapForKey("userTokens");
                        storage.clearMapForKey("memberInfo");
                        // Alert.alert("登录过期,请重新登录")
                        this.props.navigation.navigate("Login");
                    }
                });
        } catch (e) {
            Alert.alert("登录过期,请重新登录")
            this.props.navigation.navigate("Login");
        }
    }

    use(groupValueListItem, dataList) {
        this.props.onPress('app',
            groupValueListItem,
            dataList,
            this.state.currSelectList,
            this.state.currSelectKey,
            this.state.info,
            this.state.currModel
        );
        this.setState({
            isShow: false,
            currSelectKey: ""
        })
    }

    /**
     * 打开评论
     * @returns {*}
     */
    openMsg() {

        let currSmName = this.state.currModel.ModelName;
        let currChName = this.state.currModel.chName;
        let currAppid = this.state.info.app_id;
        //  alert(currAppid+":"+currSmName+":"+currChName)
        this.setState({
            showComment: true
        })
    }

    hideWin = () => {
        this.setState({
            showComment: false
        })
    }

    render() {

        let dataList = this.props.dataList;

        let win = null;
        let menu = null;
        let close = null;
        let name = this.state.currModel.chName;
        if (this.state.info.app_type != 'microlesson' && this.state.info.app_type != 'exam') {
            if (name == '' || name == undefined || name == null) {
                name = this.state.info.struct_name
            }
            if (this.state.isShow && dataList.length > 0 && this.props.titleShow) {

                close =

                    <View style={{
                        position: 'absolute',
                        top: size(0.001),
                        width: '100%',
                        height: size(170),
                        bottom: 0,
                        right: 0,
                        alignItems: 'center',
                        backgroundColor: "#323232",
                        flex: 1
                    }}>
                        <View style={{flexDirection: 'row',}}>
                            <View
                                style={{flex: 5, justifyContent: 'center', marginLeft: size(36), marginTop: size(1)}}>
                                <Text style={{color: "#FFF", fontSize: size(36),}}> {name}</Text>
                                <Text style={{color: "#FFF", fontSize: size(24)}}> {this.state.currModel.enName}</Text>
                            </View>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{width: '100%'}}
                                                  onPress={() => {
                                                      this.setState({
                                                          isShow: false,
                                                          currSelectKey: "",
                                                          currSelectList: []
                                                      })

                                                  }}
                                >
                                    <Image
                                        source={require('../../img/unity/close.png')}
                                        style={{
                                            width: size(36),
                                            height: size(36),
                                            alignSelf: 'flex-end',
                                            marginRight: size(30),
                                            marginTop: size(30)
                                        }}/>

                                </TouchableOpacity>
                            </View>

                        </View>


                        <ScrollView
                            horizontal={true}

                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                flexDirection: 'row'

                            }}

                        >

                            {dataList.map((data, index) => {


                                if (data.key != '收藏' && data.key != '返回') {
                                    let color = {}
                                    if (data.key == this.state.currSelectKey) {
                                        color = {
                                            color: "#0094e1", fontWeight: 'bold'
                                        }
                                    }
                                    return (
                                        <TouchableOpacity
                                            style={[styles.menu, {height: size(75), justifyContent: 'center'}]}
                                            onPress={() => this.changeView(data)}>
                                            <Text style={[{
                                                textAlign: "center",
                                                fontSize: size(30),
                                                color: "#FFF",
                                            }, color]}>{data.key} </Text>
                                        </TouchableOpacity>
                                    );
                                }


                            })}
                        </ScrollView>


                    </View>

                ;
                /*窗口*/
                win = <ScrollView style={{
                    width: '100%', backgroundColor: "#323232",
                    top: size(170), left: 0, right: 0, borderRadius: size(20), bottom: size(1),
                    position: 'absolute',
                }}>


                    {groupBy(this.state.currSelectList, 'secondFyName').sort(compare("secondSort")).map((fyItem, index1) => {
                        let groupValueList = groupBy(fyItem.value, 'res_type');


                        return (
                            <View>
                                <Text style={{
                                    fontSize: size(30), color: "#c9c9c9", fontWeight: 'bold',
                                    marginTop: size(54), marginLeft: size(15)
                                }}>
                                    {/*弹框分组名称*/}
                                    {fyItem.key}
                                </Text>


                                {groupValueList.map((groupValueItem, index2) => {

                                    if (groupValueItem.key == 'struct') {

                                        return (
                                            <ScrollView
                                                showsHorizontalScrollIndicator={false}
                                                style={{marginTop: size(22)}}>
                                                <View style={{
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    marginLeft: size(48),
                                                }}>
                                                    {groupValueItem.value.map((groupValueListItem, groupValueItemIndex) => {
                                                        let lince = checkIsUse(groupValueListItem, this.state.licenList);

                                                        groupValueListItem['lince'] = lince;
                                                        if (groupValueListItem.app_type == 'microlesson') {
                                                            return (
                                                                <TouchableOpacity style={{
                                                                    marginBottom: size(20),
                                                                    width: screen.width - size(92),
                                                                    flexDirection: "row",
                                                                    borderBottomWidth: size(2),
                                                                    borderBottomColor: 'gray',
                                                                    width: '100%'
                                                                }} onPress={() => {
                                                                    this.toUse(groupValueListItem, dataList)

                                                                }}
                                                                >
                                                                    <View style={{
                                                                        flex: 1,
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Image
                                                                            source={require('../../img/unity/weikebofang.png')}
                                                                            style={{
                                                                                width: size(34),
                                                                                height: size(34)
                                                                            }}/>
                                                                    </View>
                                                                    <View style={{flex: 5}}>
                                                                        <View>
                                                                            <Text
                                                                                style={{color: "#FFF"}}>{groupValueListItem.struct_name}</Text>

                                                                        </View>
                                                                        <View>
                                                                            <Text style={{
                                                                                color: "#FFF",
                                                                                fontSize: size(24),
                                                                                lineHeight: size(50)
                                                                            }}> {groupValueListItem.Introduce}</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={{
                                                                        flex: 2,
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Image
                                                                            source={{uri: groupValueListItem.first_icon_url}}
                                                                            style={{
                                                                                width: size(50),
                                                                                height: size(50),
                                                                                borderRadius: size(50)
                                                                            }}/>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )
                                                        } else if (groupValueListItem.app_type == 'animation') {
                                                            return (
                                                                <TouchableOpacity style={{
                                                                    marginBottom: size(20),
                                                                    width: screen.width - size(92),
                                                                    flexDirection: "row",
                                                                    borderBottomWidth: size(2),
                                                                    borderBottomColor: 'gray',
                                                                    width: '100%'
                                                                }} onPress={() => {
                                                                    this.toUse(groupValueListItem, dataList)

                                                                }}
                                                                >
                                                                    <View style={{
                                                                        flex: 1,
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Image
                                                                            source={require('../../img/unity/weikebofang.png')}
                                                                            style={{
                                                                                width: size(34),
                                                                                height: size(34)
                                                                            }}/>
                                                                    </View>
                                                                    <View style={{flex: 5}}>
                                                                        <View>
                                                                            <Text
                                                                                style={{color: "#FFF"}}>{groupValueListItem.struct_name}</Text>
                                                                        </View>
                                                                        <View>
                                                                            <Text style={{
                                                                                color: "#FFF",
                                                                                fontSize: size(24),
                                                                                lineHeight: size(50)
                                                                            }}> {groupValueListItem.content}</Text>
                                                                        </View>
                                                                    </View>
                                                                    <View style={{
                                                                        flex: 2,
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Image
                                                                            source={{uri: groupValueListItem.first_icon_url}}
                                                                            style={{
                                                                                width: size(50),
                                                                                height: size(50),
                                                                                borderRadius: size(50)
                                                                            }}/>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            )

                                                        } else {
                                                            return (

                                                                <TouchableOpacity

                                                                    onPress={() => {
                                                                        this.toUse(groupValueListItem, dataList)
                                                                    }}

                                                                    style={styles.structIem}>

                                                                    <Image
                                                                        source={{uri: groupValueListItem.first_icon_url}}
                                                                        style={styles.icon}
                                                                    />
                                                                    <Text
                                                                        style={{
                                                                            textAlign: "center",
                                                                            color: "#f1e6e6",
                                                                            fontWeight: "bold",
                                                                            fontSize: size(26),
                                                                            height: size(40),
                                                                            lineHeight: size(50),
                                                                            marginTop: size(8)
                                                                        }}>
                                                                        {groupValueListItem.struct_name}

                                                                    </Text>
                                                                    <Text style={{
                                                                        color: "#FFF",
                                                                        fontSize: size(20),
                                                                        alignSelf: "center"
                                                                    }}>
                                                                        {groupValueListItem.lince}
                                                                    </Text>

                                                                </TouchableOpacity>

                                                            )
                                                        }


                                                    })}


                                                </View>
                                            </ScrollView>
                                        )
                                    }


                                    if (groupValueItem.key == 'video') {

                                        return (
                                            <View style={{marginTop: size(22)}}>

                                                {groupValueItem.value.map((groupValueListItem, groupValueItemIndex) => {
                                                    return (
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                this.toVideo(groupValueListItem)
                                                            }
                                                        >
                                                            <ImageBackground style={{
                                                                width: size(648),
                                                                height: size(246),
                                                                borderRadius: size(3),
                                                                marginLeft: size(48)
                                                                ,
                                                                marginBottom: size(20)
                                                            }} source={{uri: groupValueListItem.icon_url}}>

                                                                <View style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    backgroundColor: "rgba(0,0,0,0.45)"
                                                                }}>
                                                                    <View style={{
                                                                        flex: 1,
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Image
                                                                            source={require('../../img/unity/bofang.png')}
                                                                            style={{
                                                                                width: size(59),
                                                                                height: size(59),
                                                                                marginTop: size(92)
                                                                            }}/>
                                                                    </View>
                                                                    <Text style={{
                                                                        marginLeft: size(29),
                                                                        color: "#FFF",
                                                                        fontSize: size(30),
                                                                        marginTop: size(16)
                                                                    }}>
                                                                        {groupValueListItem.title}
                                                                    </Text>
                                                                    <Text style={{
                                                                        marginLeft: size(23),
                                                                        color: "#d0d0d0",
                                                                        fontSize: size(30),
                                                                        marginTop: size(16),
                                                                        marginBottom: size(12),
                                                                    }}>
                                                                        {groupValueListItem.vedio_time}
                                                                    </Text>
                                                                </View>

                                                            </ImageBackground>
                                                        </TouchableOpacity>
                                                    );
                                                })}


                                            </View>
                                        );

                                    }


                                    if (groupValueItem.key == 'web') {
                                        return (
                                            <View style={{marginTop: size(22)}}>
                                                <View>
                                                    {groupValueItem.value.map((groupValueListItem, groupValueItemIndex) => {


                                                        if (groupValueListItem.type == 'text') {
                                                            return (
                                                                <View style={{
                                                                    marginLeft: size(48),
                                                                    marginRight: size(30)
                                                                }}>
                                                                    <View>
                                                                        <Text style={{
                                                                            color: "#FFF",
                                                                            lineHeight: size(50)
                                                                        }}>
                                                                            {groupValueListItem.title}
                                                                        </Text>
                                                                    </View>
                                                                    <View>
                                                                        <Text style={{
                                                                            color: "#e9e9e9",
                                                                            lineHeight: size(45),
                                                                            fontSize: size(24),
                                                                            marginLeft: size(20), marginRight: size(30)
                                                                        }}>
                                                                            {groupValueListItem.content}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            )
                                                        } else if (groupValueListItem.type == 'img') {


                                                            return (
                                                                <View style={{
                                                                    marginLeft: size(48),
                                                                    marginRight: size(30)
                                                                }}>
                                                                    <Image
                                                                        source={{uri: groupValueListItem.content}}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: size(800)
                                                                        }}/>
                                                                </View>
                                                            )
                                                        } else if (groupValueListItem.type == 'html') {

                                                            return (
                                                                <WebView
                                                                    injectedJavaScript={BaseScript}
                                                                    onMessage={this.onMessage.bind(this)}
                                                                    automaticallyAdjustContentInsets
                                                                    domStorageEnabled
                                                                    javaScriptEnabled

                                                                    decelerationRate='normal'
                                                                    scalesPageToFit={Platform.OS === 'ios' ? true : false}
                                                                    source={{uri: groupValueListItem.content}}
                                                                    style={{width: '100%', height: this.state.height}}
                                                                    startInLoadingState={true}

                                                                    renderError={() => {
                                                                        return <View style={styles.loadWeb}><Text
                                                                            style={{
                                                                                color: "#FFF",
                                                                                alignSelf: "center"
                                                                            }}>
                                                                            资源加载失败!请检查网络设置...
                                                                        </Text></View>

                                                                    }}

                                                                />
                                                            )
                                                        }

                                                    })}

                                                </View>
                                            </View>
                                        )
                                    }


                                })}


                            </View>
                        );
                    })}

                    {/*<View style={{height: size(206)}}></View>*/}

                </ScrollView>
            }

            if ((dataList.length > 0 && this.props.titleShow) || this.state.multiOpen) {
                let hideShow = null;
                let showInfo = null;
                let structName = null;
                let plun = null;
                let souchang = null;

                if ((this.props.currModel && this.props.currModel.smName != undefined) || this.state.multiOpen) {
                    hideShow = <View style={{
                        flex: 1, flexDirection: "row", alignItems: "center",
                        height: size(65),
                        marginBottom: size(2),

                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.sendMsgToUnity('hideSel', {}
                                );
                            }}
                            style={styles.hideShow}>

                            <Text style={{color: "#FFF", fontSize: size(20)}}>隐藏选择</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.sendMsgToUnity('alphaSel', {}
                                );
                            }}

                            style={styles.hideShow}>

                            <Text style={{color: "#FFF", fontSize: size(20)}}>透明选择</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.sendMsgToUnity('alphaOther', {}
                                );
                            }}

                            style={styles.hideShow}>

                            <Text style={{color: "#FFF", fontSize: size(20)}}>透明其他</Text>
                        </TouchableOpacity>
                        <TouchableOpacity

                            onPress={() => {
                                this.props.sendMsgToUnity('hideOther', {}
                                );
                            }}
                            style={styles.hideShow}>

                            <Text style={{color: "#FFF", fontSize: size(20)}}>隐藏其他</Text>
                        </TouchableOpacity>
                        <TouchableOpacity

                            onPress={() => {
                                this.props.sendMsgToUnity('singleShow', {}
                                );
                            }}
                            style={styles.hideShow}>

                            <Text style={{color: "#FFF", fontSize: size(20)}}>单独显示</Text>
                        </TouchableOpacity>
                    </View>
                }


                if (this.state.currModel.smName != undefined && this.state.currModel.smName != '-1') {


                    showInfo = <View style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        width: '100%',
                        height: size(70),
                    }}>


                        <TouchableOpacity

                            onPress={() => {
                                this.fayin(name)
                            }}

                            style={{flex: 6, alignItems: "center", justifyContent: "center", flexDirection: "row"}}>

                            <Text style={{
                                color: "#FFF",
                                fontSize: size(29),
                                flex: 1,
                                fontWeight: 'bold',
                                marginLeft: size(36)
                            }}>
                                {name}
                            </Text>

                            <Image
                                style={{
                                    color: "#FFF",
                                    fontSize: size(29),
                                    flex: 1,
                                    fontWeight: 'bold'
                                }}
                                source={require('../../img/unity/laba.png')}
                                style={{width: size(34), height: size(34)}}/>

                            <Text style={{
                                color: "#FFF",
                                flex: 1,
                                fontSize: size(19),
                                marginLeft: size(36)
                            }}>
                                {this.state.currModel.enName}
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity

                            onPress={() => {
                                this.openMsg()
                            }}

                            style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                            <Image
                                source={require('../../img/unity/yijian.png')}
                                style={{width: size(30), height: size(30)}}/>
                            <Text style={{fontSize: size(18), color: "#FFF"}}>评论</Text>
                        </TouchableOpacity>


                    </View>;
                } else {


                    structName = <View style={{width: size(420)}}>
                        <Text style={{color: "#FFF", alignSelf: "flex-end"}}>{name}</Text>
                    </View>;

                    souchang = <TouchableOpacity
                        style={[styles.menu]}
                        onPress={() => this.clickShouchang()}>
                        <Image
                            source={{uri: this.state.isConnect ? "http://fileprod.vesal.site/menu/v1/yjinshouchang.png" : "http://fileprod.vesal.site/menu/v1/shouchang.png"}}
                            style={{width: size(36), height: size(36),}}/>
                        <Text style={styles.menuText}>{this.state.isConnect ? "已收藏" : "收藏"} </Text>
                    </TouchableOpacity>


                    plun = <TouchableOpacity
                        style={[styles.menu]}
                        onPress={() => this.openMsg()}>
                        <Image
                            source={require('../../img/unity/yijian.png')}
                            style={{width: size(36), height: size(36)}}/>
                        <Text style={styles.menuText}>评论</Text>
                    </TouchableOpacity>


                }


                menu =
                    <View style={{
                        position: 'absolute',

                        width: '100%',
                        position: 'absolute',
                        bottom: size(0.00001),
                        left: 0,
                        right: 0,


                    }}>

                        {hideShow}


                        <View style={{backgroundColor: "rgba(12,12,12,0.8)",}}>
                            <View>
                                {/*信息与发音*/}
                                {showInfo}
                            </View>

                            <View>

                                {/*滑动菜单*/}
                                <ScrollView
                                    horizontal={true}
                                    style={{height: size(100),}}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderTopLeftRadius: size(20),
                                        borderTopRightRadius: size(20),
                                    }}

                                >


                                    {dataList.map((data, index) => {
                                        return (
                                            <TouchableOpacity
                                                style={[styles.menu]}
                                                onPress={() => this.changeView(data)}>
                                                <Image
                                                    source={{uri: data.icon_url}}
                                                    style={{width: size(36), height: size(36)}}/>
                                                <Text style={styles.menuText}>{data.key} </Text>
                                            </TouchableOpacity>
                                        );
                                    })}

                                    {structName}

                                    {souchang}

                                    {plun}


                                </ScrollView>

                            </View>

                        </View>

                    </View>

            }
        }


        let comment = this.state.showComment ? <Comment

            hideWin={this.hideWin}

            navigation={this.props.navigation}

            currModel={this.state.currModel}

            info={this.state.info}

        /> : null;


        return (

          <View style={{
              height: this.state.isShow || this.state.showComment ? '100%' : 0,
              position: 'absolute',
              bottom: size(0.00001),
              left: 0,
              right: 0
          }}>

                {/*底部菜單欄*/}
                {menu}
                {/*弹框*/}
                {win}

                {/*关闭按钮*/}
                {close}

                {/* 评论*/}
                {comment}


            </View>
        );
    }
}
const styles = StyleSheet.create({
    menu: {
        alignSelf: "center",
        paddingLeft: size(20),
        paddingRight: size(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        textAlign: "center",
        fontSize: size(18), color: "#FFF", marginTop: size(8), alignSelf: "center",
    }, icon: {
        width: size(150),
        height: size(110),
        marginTop: size(5),
        resizeMode: "contain",
        alignSelf: "center",
        // 设置圆角
        borderRadius: size(5),
        opacity: 0.7,
    },
    structIem: {
        width: size(198),
        height: size(209),
        marginRight: size(6),
        /*  borderWidth: size(1),
          borderColor: "#dedede",
          backgroundColor: "#FFF",*/
        color: "#FFf",
        marginTop: size(20),
        alignSelf: "center",
        borderRadius: size(8)
    }, hideShow: {
        marginLeft: size(5),
        width: size(134),
        alignItems: "center",
        justifyContent: "center",
        height: size(47),
        justifyContent: "center",
        backgroundColor: "rgba(12,12,12,0.8)"
    }, loadWeb: {
        marginLeft: size(48), backgroundColor: "#323232", height: '100%'
    }
});
