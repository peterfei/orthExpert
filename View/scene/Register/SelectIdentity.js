import React, {Component} from "react";
import {
    Button,
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    Platform
} from "react-native";
import Swiper from "react-native-swiper";
import {NavigationActions,StackActions} from "react-navigation";
import {screen} from "../../common";
import api from "../../api";
import Toast, {DURATION} from "react-native-easy-toast";
import DeviceInfo from "react-native-device-info";
import {storage} from "../../common/storage";
import Loading from "../../common/Loading";

const {width, height} = Dimensions.get("window"); //获取手机的宽和高
import UnityView from 'react-native-unity-view';
import {size} from "../../common/ScreenUtil";

let unity = UnityView;
export default class SelectIdentity extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            identityList: []
        };
    }

    async componentWillMount() {
        this.getAllIdentity();
    }
    //同步书签
    asynBookMark(member) {
        this.sendMsgToUnity("mb_id", member.mbId, "");
    }
    getAllIdentity = async () => {
        const url = api.base_uri + "/v1/app/member/getAllIdentity?state=enabled";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(result => {
                console.log(result.List);
                this.setState({
                    identityList: result.List
                });
            });
    };
    onRegister = async that => {
        this.Loading.show("正在登录");
        let obj = this.props.navigation.state.params.obj;

        const url = api.base_uri + "v1/app/member/weixinLogin";
        let params_data = {
            mbRegSource: Platform.OS,
            mbIdentity: that.identityId,
            openid: obj.openid,
            unionid: obj.unionid,
            nikename: obj.nickname,
            province: obj.province,
            headimgurl: obj.headimgurl,
            sex: obj.sex,
            deviceId: DeviceInfo.getUniqueID()
        };
        // alert("***params***" + JSON.stringify(params_data));
        let responseData = await fetch(url, {
            method: "post",
            body: JSON.stringify(params_data),
            headers: {
                "Content-Type": "application/json",
                accept: "*/*"
            }
        })
            .then(resp => resp.json())
            .then(
                result => {
                    const userDatas = result;
                    console.log("userDatas:"+userDatas)
                    storage.save("userTokens", "", result);
                    storage.save("memberInfo", "", result.member);
                    //同步书签
                    this.asynBookMark(result.member);
                    this.Loading.close();
                    if (userDatas.token != undefined) {
                        storage.loadObj("user", userDatas.token);
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({routeName: "NewHome"})]
                        });
                        this.props.navigation.dispatch(resetAction);

                    }
                },
                error => {
                    this.Loading.close();
                    alert("error:" + JSON.stringify(error));
                    console.log("registerUser error");
                }
            );
    };


    /**
     * 接收unity消息
     * @param event
     */
    async onUnityMessage(event) {

    }

    /**
     * 发送消息给unity
     */
    sendMsgToUnity(name, info, type) {

        if (this.unity) {
            if (type == 'json') {
                let temp = Object.assign({}, info)
                this.unity.postMessageToUnityManager({
                    name: name,
                    data: JSON.stringify(temp)
                })
            } else {
                this.unity.postMessageToUnityManager({
                    name: name,
                    data: info
                })
            }
        }
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <View>
                    <View>
                        <Text
                            style={{
                                fontWeight: "bold",
                                marginTop: 130,
                                fontSize: 30,
                                color: "#292929",
                                marginBottom: 10,
                                width: screen.width,
                                textAlign: "center"
                            }}>
                            你终于来了
                        </Text>
                    </View>
                    <View>
                        <Text
                            style={{
                                fontWeight: "bold",
                                fontSize: 25,
                                marginBottom: 10,
                                width: screen.width,
                                color: "#525252",
                                textAlign: "center"
                            }}>
                            现在请选择您的身份吧
                        </Text>
                    </View>
                </View>

                {this.state.identityList.map((item, index) => (
                    <View
                        style={{
                            alignSelf: "center",
                            marginTop: 10,
                            flexDirection: "row",
                            width: screen.width - 40,
                            alignItems: "center"
                        }}>
                        <TouchableOpacity
                            onPress={() => this.onRegister(item)}
                            style={{
                                flex: 1,
                                backgroundColor: "red",
                                marginRight: 5,
                                height: 50,
                                backgroundColor: "#00bbe3",
                                borderRadius: 10,
                                fontWeight: "bold",
                                color: "#fff"
                            }}>
                            <View>
                                <Text
                                    style={{
                                        textAlign: "center",
                                        lineHeight: 50,
                                        color: "#fff",
                                        fontSize: 20
                                    }}>
                                    {item.identityTitle}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}

                <UnityView
                    ref={(ref) => this.unity = ref}

                    onUnityMessage={this.onUnityMessage.bind(this)}
                    style={{
                        position: 'absolute',
                        height: size(1),
                        width: size(1),
                        top: -1000,
                        bottom: -1000,
                        left: -1000,

                    }}
                />

                <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1, //必写
        backgroundColor: "#fff"
    }
});
