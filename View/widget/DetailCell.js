import React, { PureComponent } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ViewPropTypes,
    Alert,
    Linking,
    Platform,
    DeviceEventEmitter
} from "react-native";
import { Heading2, Heading3, Paragraph } from "./Text";
import { screen, system } from "../common";
import { NativeModules } from "react-native";
import _ from "lodash";
import Toast, { DURATION } from "react-native-easy-toast";
import DeviceInfo from "react-native-device-info";
import { storage } from "../common/storage";
import { NavigationActions ,StackActions} from "react-navigation";
import api from "../api";
import UShare from "../share/share";
import SharePlatform from "../share/SharePlatform";
import ActionSheet from "react-native-actionsheet";

// var GotoUnityView = NativeModules.GotoUnityView;
type Props = {
    image?: any,
    style?: ViewPropTypes.style,
    title: string,
    subtitle?: string,
    navigation: any
};

// type Props = {
//     navigation: any
// };

class DetailCell extends PureComponent<Props> {
    constructor(props: Object) {
        super(props);
        this.state = {
            memberInfo: {}
        };
    }

    async componentWillMount() {
        let mem = await storage.get("memberInfo");
        this.setState({
            memberInfo: mem
        });
        // debugger;
        // alert("当前版本:"+currentVersion)
    }

    async checkBindPhone() {
        let tokens = await storage.get("userTokens");
        let url = api.base_uri + "/v1/app/member/isBoundTellNumber";
        await fetch(url, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        }).then(resp => resp.json())
            .then(result => {
                if (result.result == "no") {
                    this.props.navigation.navigate('BindPhone')
                }
                else {
                    Alert.alert('友情提示', '已经绑定过手机, 您的账号非常安全, 感谢支持!')
                }
            })
    }

    userCanceled() {
        return;
    }

    gotoLogout() {
        storage.remove("userTokens") && storage.remove("user");
        DeviceEventEmitter.emit("logoutEmit");
    }

    downloadSoft(url) {
        alert(url);
    }

    async checkVersion() {
        const currVersion = DeviceInfo.getVersion();
        const url =
            api.base_uri +
            "/v1/app/member/getAppVersion?version=" +
            currVersion +
            "&plat=" +
            Platform.OS; //拉取服务器最新版本
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(result => {
                if (result.List.length > 0) {
                    let item = result.List[0];
                    let serverVersion = item.version;
                    let localVersion = new Number(DeviceInfo.getVersion().replace(/\./g, ""));

                    if (serverVersion > localVersion) {
                        Alert.alert(
                            "发现新版本" + item.title + "(" + item.size + ")",
                            item.description,
                            [
                                { text: "稍后再说" },
                                {
                                    text: "立即更新",
                                    onPress: function () {
                                        const downloadUrl = item.url;
                                        NativeModules.DownloadApk.downloading(
                                            downloadUrl,
                                            "vesal.apk"
                                        );
                                    }
                                }
                            ]
                        );
                    } else {
                        Alert.alert(
                            "",
                            "您已是最新版本" + DeviceInfo.getVersion() + ",无需更新!"
                        );
                    }
                } else {
                    Alert.alert(
                        "",
                        "您已是最新版本" + DeviceInfo.getVersion() + ",无需更新!"
                    );
                }
            });
        /*   Alert.alert('版本信息','已经是最新版本2.2.0',
                   [
                       {text:""},
                       {text:""},
    
                   ]
               );*/

        //  Alert.alert("", "当前版本是:" + DeviceInfo.getVersion());
    }

    handlePress = buttonIndex => {
        if (buttonIndex == 0) return;
        //console.log(`click button is ${buttonIndex}`);
        if (buttonIndex == 1) {
            UShare.share(
                "维萨里3D解剖App",
                "维萨里3D解剖，提供全三维人体结构细节，让我们的工作进入您健康的每一个细节",
                "http://vesal.cn:8080/weiChat-master/index.html",
                "http://fileprod.vesal.site/upload/vesaliicon/v1/vesal_icon.png",
                SharePlatform.WECHAT,
                message => {
                    this.refs.toast.show("分享成功");
                    //   debugger;
                    // message:分享成功、分享失败、取消分享
                    // ToastAndroid.show(message,ToastAndroid.SHORT);
                }
            );
        } else if (buttonIndex == 2) {
            UShare.share(
                "维萨里3D解剖App",
                "维萨里3D解剖，提供全三维人体结构细节，让我们的工作进入您健康的每一个细节",
                "http://vesal.cn:8080/weiChat-master/index.html",
                "http://fileprod.vesal.site/upload/vesaliicon/v1/vesal_icon.png",
                SharePlatform.WECHATMOMENT,
                message => {
                    this.refs.toast.show("分享成功");
                    //   debugger;
                    // message:分享成功、分享失败、取消分享
                    // ToastAndroid.show(message,ToastAndroid.SHORT);
                }
            );
        }
    };

    render() {
        let icon = this.props.image && (
            <Image style={styles.icon} source={this.props.image} />
        );

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={async () => {
                        if (this.props.name == "MyClasses") {
                            //   Alert.alert("", "暂未开放");
                            //   debugger;
                            //console.log(
                            //   `用户信息:\n${JSON.stringify(this.state.memberInfo)}`
                            // );
                            // GotoUnityView.studentClass(JSON.stringify(this.state.memberInfo));
                            //   GotoUnityView.addEvent(JSON.stringify(classes));
                        } else if (this.props.name == "share") {
                            this.ActionSheet.show();
                            // this.checkUpdate();
                        } else if (this.props.name == "contactUs") {
                            Linking.openURL("tel:02968579950");
                            // this.checkUpdate();
                        } else if (
                            this.props.name == "MyOrder" ||
                            this.props.name == "MessageBoard"
                        ) {
                            try {
                                let memberInfo = await storage.get("memberInfo");
                                //如果是游客跳转注册
                                if (memberInfo.isYouke == "yes") {
                                    this.props.navigation.navigate("LoginPage");
                                } else {
                                    this.props.navigation.navigate(this.props.name);
                                }
                            } catch (e) {
                                this.props.navigation.navigate("LoginPage");
                            }
                        } else if (this.props.name == "clearCache") {
                            // storage.clearMap();

                            storage.clearMapForKey("mystructList");
                            storage.clearMapForKey("versionByInitMyStruct");
                            storage.clearMapForKey("initMyStruct");
                            storage.clearMapForKey("userTokens");
                            storage.clearMapForKey("memberInfo");
                            Alert.alert("", "清除缓存成功");
                        } else if (this.props.name == "version") {
                            this.checkVersion();
                        } else if (this.props.name == "BindPhone") {
                            this.checkBindPhone();
                        }

                        else if (this.props.name == "logout") {
                            

                            storage.clearMapForKey("userTokens");
                            storage.clearMap();
                            this.refs.toast.show("退出成功");
                            setTimeout(()=>{
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [
                                        NavigationActions.navigate({ routeName: "LoginPage" })
                                    ]
                                });
                                this.props.navigation.dispatch(resetAction);
                            },500)
                            // storage.clearMapForKey("tokens");
                            

                            // console.log("============1111=============")
                            // // alert(111)
                            // Alert.alert(
                            //   "提醒",
                            //   "确定要退出吗?",
                            //   [
                            //     {
                            //       text: "取消",
                            //       onPress: () => this.userCanceled()
                            //     },
                            //     {
                            //       text: "确定",
                            //       onPress: () => {
                            //         storage.clearMapForKey("mystructList");
                            //         storage.clearMapForKey("versionByInitMyStruct");
                            //         storage.clearMapForKey("initMyStruct");
                            //         storage.clearMapForKey("userTokens");
                            //         storage.clearMapForKey("memberInfo");
                            //         // storage.clearMapForKey("tokens");
                            //         const resetAction = StackActions.reset({
                            //           index: 0,
                            //           actions: [
                            //             NavigationActions.navigate({ routeName: "LoginPage" })
                            //           ]
                            //         });
                            //         this.props.navigation.dispatch(resetAction);
                            //       }
                            //     }
                            //   ],
                            //   { cancelable: true }
                            // );
                        } else {
                            this.props.navigation.navigate(this.props.name);
                        }
                    }}>
                    <View style={[styles.content, this.props.style]}>
                        {icon}

                        <Text style={{ fontSize: 14, color: "#54565a" }}>
                            {this.props.title}
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "blue"
                            }}
                        />
                        <Paragraph
                            style={{
                                color: "#999999"
                            }}>
                            {this.props.subtitle}
                        </Paragraph>
                        <Image
                            style={styles.arrow}
                            source={require("../img/public/right.png")}
                        />
                    </View>
                </TouchableOpacity>
                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    title={"请选择需要分享的平台"}
                    options={["取消", "微信", "朋友圈"]}
                    cancelButtonIndex={0}
                    // destructiveButtonIndex={2}
                    onPress={this.handlePress}
                />
                <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white"
    },
    content: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 10
    },
    icon: {
        width: 25,
        height: 25,
        marginRight: 10
    },
    subtitleContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"
    },
    arrow: {
        width: 14,
        height: 14,
        marginLeft: 5
    }
});

export default DetailCell;
