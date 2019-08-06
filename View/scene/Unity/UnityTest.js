import React from "react";
import {
    Button,
    DeviceEventEmitter,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Text,
    View,
    StyleSheet,
    Image, Platform
} from "react-native";
import TitleBar from '../../scene/Home/TitleBar';
import {size} from "../../common/ScreenUtil";
import Loading from "../../common/Loading";
import Toast, {DURATION} from "react-native-easy-toast";
import api from "../../api";
import {storage} from "../../common/storage";
import {NavigationActions} from "react-navigation";
import {ifnull, checkIsUse, useStart} from "../Unity/LCE";
import {VoiceUtils} from '../../common/VoiceUtils'

export default class UnityTest extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            couponNo: "",
            succWin: false,
            comboName: "",
            endTime: "",
            version: "2",
            appid: "",
        };
    }


    componentWillMount() {

    }

    changeCoupon(value) {

        this.setState({
            couponNo: value
        })
    }

    changeCoupon1(value) {

        this.setState({
            version: value
        })
    }
    changeCoupon2(value) {

        this.setState({
            appid: value
        })
    }

    async active() {
        if (this.state.couponNo.trim() == '') {
            this.refs.toast.show("请输入激活码");
        } else if (this.state.couponNo.trim().length != 16) {
            this.refs.toast.show("请输入16位激活码");
        } else {
            this.Loading.show("正在激活...");

            let tokens = await storage.get("userTokens");
            if (tokens == -1 || tokens == -2) {

                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: "Login"})]
                });
                this.props.navigation.dispatch(resetAction);

            } else {
                let url = api.base_uri + "/v1/app/pay/activeCoupon?couponNo=" + this.state.couponNo.trim();
                fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                        token: tokens.token
                    }
                })
                    .then(resp => resp.json())
                    .then(
                        result => {
                            this.Loading.close();
                            if (result.code == 0) {
                                this.setState({
                                    couponNo: "",
                                    succWin: true,
                                    comboName: result.obj.combo_name,
                                    endTime: this.getTime(result.obj.combo_time_value),
                                })
                                this.refs.toast.show("激活成功! ");
                                DeviceEventEmitter.emit("loadHomeData");
                                //显示激活成功弹框
                            } else {
                                this.refs.toast.show("激活失败!请检查激活码是否正确 ");
                            }
                        }, error => {
                            this.Loading.close();
                            this.refs.toast.show("网络连接失败!请检查网络配置~ ");
                        }
                    );
            }

        }
    }

    loadAb() {
        if (this.state.couponNo == '') {
            alert("请输入zip地址")
        } else if (this.state.version == '') {
            alert("请输入版本号")
        } else if (this.state.appid == '') {
            alert("请输入名词编号")
        } else {
            let json = {
                "struct_version": this.state.version,
                "app_type": "medical",
                "app_version": this.state.version,
                "ab_path": this.state.couponNo,
                "youke_use": "disabled",
                "cate_id": 27,
                "platform": "android,ios,pc",
                "first_icon_url": "http://fileprod.vesal.site/upload/unity3D/android/img/medical/v240/v2/RA0801009.png",
                "visible_identity": null,
                "is_charge": "no",
                "ab_list": "",
                "struct_id": 461,
                "struct_name": "产品预览",
                "struct_sort": null,
                "noun_id": null,
                "struct_code": null,
                "app_id": this.state.appid
            };

            useStart(json, "", this);
        }


    }

    render() {
        let succWin = null;
        if (this.state.succWin) {
            succWin = <View style={{
                position: 'absolute',
                bottom: size(0.00001),
                top: size(160),
                backgroundColor: "rgba(0,148,229,1)",
                left: size(20),
                right: size(20),
                height: size(400),
                borderRadius: size(20),
            }}>
                <View style={{flexDirection: "row", justifyContent: "center", height: size(100),}}>

                    <View style={{
                        flex: 2,
                        alignItems: "flex-end",
                        justifyContent: "center",
                    }}>
                        <Image
                            source={require('../../img/unity/ok.png')}
                            style={{
                                width: size(40),
                                height: size(40)
                            }}/>
                    </View>
                    <View style={{flex: 5, justifyContent: "center",}}>
                        <Text style={{
                            fontSize: size(40),
                            justifyContent: "center",
                            fontWeight: "bold",
                            color: "#FFF"
                        }}>恭喜您,激活成功!</Text>
                    </View>
                </View>

                {/**/}
                <View style={{justifyContent: "center", alignItems: "center", height: size(180),}}>
                    <View>
                        <Text style={{color: "#FFF", fontWeight: "bold"}}>{this.state.comboName}</Text>
                    </View>
                    <View>
                        <Text style={{color: "#FFF", fontWeight: "bold"}}>有效期{this.state.endTime}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            this.toHome()
                        }}
                        style={{
                            marginTop: size(20),
                            alignItems: "center",
                            width: '80%',
                            height: size(80),
                            justifyContent: "center",
                            backgroundColor: "#FFFFFF",
                            borderRadius: size(50),

                        }}>
                        <Text style={{color: "#0094e5", fontWeight: 'bold',}}>开启使用之旅</Text>
                    </TouchableOpacity>
                </View>
            </View>;
        }

        return (
            <View style={styles.parent}>
                <TitleBar title={'模型查看工具'} navigate={this.props.navigation}/>


                <View style={{
                    marginLeft: size(20),
                    marginRight: size(20),
                    marginTop: size(20),
                    borderRadius: size(10),
                    backgroundColor: "#0094e5",
                    height: size(600),
                    alignItems: "center"
                }}>

                    <View style={{flexDirection: 'row', alignItems: "center"}}>
                        <View style={{flex: 1, alignItems: "center"}}>
                            {/* <Image
                                source={require('../../img/unity/kj-icon.png')}
                                style={{
                                    width: size(54),
                                    height: size(36)
                                }}/>*/}
                        </View>
                        <View style={{flex: 4, alignItems: "center"}}>
                            <Text
                                style={{color: "#fff", marginTop: size(20), fontSize: size(25)}}>请分别输入:版本号/下载链接/名词编号</Text>
                        </View>
                        <TouchableOpacity style={{flex: 1, alignItems: "center"}}>
                            <Text style={{color: "#FFF", marginTop: size(20), fontSize: size(18)}}></Text>
                        </TouchableOpacity>
                    </View>

                    {/*input*/}
                    <View style={{flexDirection: 'row', alignItems: "center", marginTop: size(20)}}>
                        <View style={{flex: 1, alignItems: "center"}}>
                            <TextInput ref="textInput"
                                       onChangeText={(value) => this.changeCoupon1(value)}
                                       selectionColor={'#0094e5'}
                                       enablesReturnKeyAutomatically={true}
                                       underlineColorAndroid="transparent"
                                       placeholderTextColor={"#b0b1b4"}
                                       defaultValue={this.state.version}
                                       placeholder="请输入版本号"
                                       style={{
                                           backgroundColor: "#FFF",
                                           width: '80%', color: "#FFA54F",
                                           fontWeight: "bold",
                                           height: size(80),
                                           borderRadius: size(5),

                                       }}/>
                            <TextInput ref="textInput"
                                       onChangeText={(value) => this.changeCoupon(value)}
                                       selectionColor={'#0094e5'}
                                       enablesReturnKeyAutomatically={true}
                                       underlineColorAndroid="transparent"
                                       placeholderTextColor={"#b0b1b4"}
                                       placeholder="请输入zip地址"
                                       defaultValue={this.state.couponNo}
                                       autoFocus={true}
                                       style={{
                                           backgroundColor: "#FFF",
                                           width: '80%', color: "#FFA54F",
                                           fontWeight: "bold",
                                           height: size(80),
                                           borderRadius: size(5),
                                           marginTop: size(20)
                                       }}/>
                            <TextInput ref="textInput"
                                       onChangeText={(value) => this.changeCoupon2(value)}
                                       selectionColor={'#0094e5'}
                                       enablesReturnKeyAutomatically={true}
                                       underlineColorAndroid="transparent"
                                       placeholderTextColor={"#b0b1b4"}
                                       placeholder="请输入名词编号"
                                       defaultValue={this.state.appid}
                                       autoFocus={true}
                                       style={{
                                           backgroundColor: "#FFF",
                                           width: '80%', color: "#FFA54F",
                                           fontWeight: "bold",
                                           height: size(80),
                                           borderRadius: size(5),
                                           marginTop: size(20)
                                       }}/>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            this.loadAb()
                        }}
                        style={{
                            marginTop: size(20),
                            alignItems: "center",
                            width: '80%',
                            height: size(80),
                            justifyContent: "center",
                            backgroundColor: "#FFFFFF",
                            borderRadius: size(50),

                        }}>
                        <Text style={{color: "#0094e5", fontWeight: 'bold',}}>立即加载</Text>
                    </TouchableOpacity>

                </View>

                {/*说明*/}

                {/*激活弹框*/}
                {succWin}

                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
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
    parent: {
        flex: 1, backgroundColor: "#FFF"
    }, txt: {
        fontSize: size(26), marginBottom: size(10)
    }


});
