import React, {Component} from "react";
import {
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    View,
    TextInput,
    Text,
} from "react-native";
import {color, NavigationItem, SpacingView} from "../../widget";
import {
    Button,
    LoaderScreen,
    Colors
} from "react-native-ui-lib";
import Loading from "../../common/Loading";

import {screen, system} from "../../common";
import UserStore from "../../mobx/User";
import api, {encryptionWithStr} from "../../api";
import Toast, {DURATION} from "react-native-easy-toast";
import {storage} from "../../common/storage";
import {size, setSpText} from "../../common/ScreenUtil";
import CountDownButton from './countDownButton.js'

export default class ForgetPasswordPage extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        let params = props.navigation.state.params;
        this.state = {
            username: "",
            password: "",
            repassword: "",
            verify_code: "",
            img: (params == undefined) ? require('../../img/login/forgetPass.png') : require('../../img/login/RetrievePass.png'),
            code: '',
            uuid: '',
            imgURL: '',
            invisiblePassword: false

        };
        this.store = new UserStore(props.rootStore);
    }

    async componentWillMount() {
        this.setUUID();
    }

    setUUID() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
        }

        let url = api.base_uri + "/appCaptcha?uuid=" + guid;
        this.setState({
            imgURL: url,
            uuid: guid
        })

    }

    shouldStartCountdown = async (shouldStartCountting) => {
        let tokens = await storage.get("userTokens");

        if (this.state.username == '') {
            this.refs.toast.show("电话号码不能为空!");
            shouldStartCountting(false)
            return;
        }
        else {
            this.Loading.show('发送中...');
            const url =
                api.base_uri +
                "/v1/app/member/getCodeCheck?tellAndEmail=" + this.state.username;
            try {
                let responseData = await fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                        token: tokens.token
                    }
                })
                    .then(resp => resp.json())
                    .then(result => {
                        this.Loading.close()
                        if (result.code == 0) {
                            this.refs.toast.show("验证码发送成功!");
                            shouldStartCountting(true)
                        } else {
                            this.refs.toast.show(result.msg);
                            shouldStartCountting(false)
                        }
                    });
            } catch (error) {
                this.Loading.close()
                shouldStartCountting(false)
            }
        }
    };

    async onConfirmRegister() {
        if (this.state.username) {
            this.Loading.show('正在修改密码...');
            try {
                let data = {
                    tellAndEmail: this.state.username,
                    password: this.state.password,
                    passwordConfirm: this.state.password,
                    code: this.state.verify_code
                };
                console.log(data);
                const url = api.base_uri + "/v1/app/member/forgetPwd";
                let responseData = await fetch(url, {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })
                    .then(resp => resp.json())
                    .then(result => {
                        this.Loading.close();
                        if (result.code == 0) {
                            this.refs.toast.show("密码重置成功!");
                            this.timer = setTimeout(() => {
                                this.props.navigation.navigate("LoginPage", {});
                            }, 1000);
                        } else {
                            this.refs.toast.show(result.msg);
                        }
                    });
            } catch (error) {
                this.Loading.close();
                this.refs.toast.show("网络错误!");
            }
            return true;
        }

        this.refs.toast.show("电话号码或邮箱不能为空!");
        return false;
    }
    onChange(poneInput) {
        let rs = false;
        let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        let email =  new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (myreg.test(poneInput)) {
            rs  = true;
        }
        if (!rs){
            if (email.test(poneInput)){
                rs  = true;
            }
        }
        return rs;
    }
    render() {
        return (
            <View style={{height: '100%', backgroundColor: '#ffffff'}}>
                <ScrollView style={styles.container} keyboardShouldPersistTaps={"always"}
                            showsVerticalScrollIndicator={false}>
                    <KeyboardAvoidingView behavior="padding">
                        <View style={{
                            height: size(320),
                        }}>
                            <TouchableOpacity style={{
                                height: size(100),
                                width: size(100),
                                justifyContent: 'center',
                                marginTop: size(40)
                            }} onPress={() => {
                                this.props.navigation.goBack();
                            }}>
                                <Image source={require('../../img/login/greyback.png')}
                                       style={{
                                           width: size(16), height: size(26),
                                       }}/>
                            </TouchableOpacity>
                            <Image source={this.state.img} style={{width:size(225),height:size(53),marginTop: size(50)}}/>

                        </View>
                        <View style={{height: size(500)}}>
                            <TextInput
                                autoFocus={true}
                                style={{
                                    height: size(80),
                                    borderBottomColor: '#e0e0e0',
                                    borderBottomWidth: size(2),
                                    fontSize: setSpText(26),
                                    marginTop: size(50)
                                }}
                                placeholder="请输入手机号/邮箱"
                                placeholderTextColor="#B9B9B9"
                                underlineColorAndroid="transparent"
                                onChangeText={text =>
                                    this.setState({
                                        username: text
                                    })
                                }
                            />
                            {/*短信验证码*/}
                            <View style={{
                                marginTop: size(10),
                                flexDirection: 'row',
                                borderBottomColor: '#e0e0e0',
                                borderBottomWidth: size(2),
                            }}>
                                <TextInput
                                    onChangeText={(text) =>
                                        this.setState({
                                            verify_code: text
                                        })}
                                    style={{height: size(80), flex: 4, fontSize: setSpText(26)}}
                                    placeholderTextColor={"#B9B9B9"}
                                    placeholder={"请输入验证码"}
                                />
                                <CountDownButton
                                    enable={true}
                                    style={{flex: 3, height: size(73),}}
                                    textStyle={{color: '#0094e1', fontSize: setSpText(24)}}
                                    timerCount={60}
                                    timerTitle={'获取验证码'}
                                    timerActiveTitle={['请在（', 's）后重试']}
                                    onClick={(shouldStartCountting) => {
                                        let isPhone = this.onChange(this.state.username)
                                        if (isPhone) {
                                            this.startTimer = shouldStartCountting;
                                            this.shouldStartCountdown(shouldStartCountting);
                                        } else {
                                            this.refs.toast.show("请输入合法手机号");
                                        }
                                    }}/>
                            </View>
                            {/*设置密码*/}
                            <View style={{
                                marginTop: size(10),
                                flexDirection: 'row',
                                borderBottomColor: '#e0e0e0', borderBottomWidth: size(2),
                            }}>
                                <TextInput
                                    style={{height: size(80), fontSize: setSpText(26), flex: 4,}}
                                    placeholder="请输入6-12个字符的密码"
                                    placeholderTextColor="#B9B9B9"
                                    underlineColorAndroid="transparent"
                                    secureTextEntry={!this.state.invisiblePassword}
                                    value={this.state.password}
                                    onChangeText={text =>
                                        this.setState({
                                            password: text
                                        })
                                    }/>
                                <TouchableOpacity style={{
                                    flex: 2.3,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }} onPress={() => {
                                    this.setState({
                                        invisiblePassword: !this.state.invisiblePassword
                                    })
                                }}>
                                    <Image
                                        source={this.state.invisiblePassword ? require('../../img/login/can_see.png') : require('../../img/login/can_not_see.png')}
                                        style={{width: size(30), height: size(16),}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/*点击确定*/}
                        <TouchableOpacity style={{
                            height: size(80),
                            borderRadius: setSpText(40),
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#4FA5F4',
                        }} onPress={this.onConfirmRegister.bind(this)}>
                            <Text style={{fontSize: setSpText(32), color: '#ffffff'}}>确定</Text>
                        </TouchableOpacity>
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
                                this.Loading = r
                            }}
                            hudHidden={false}
                        />
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    input: {
        height: 30,
        width: screen.width - 5,
        borderColor: color.main,
        borderRadius: 4
    },
    littleTitle: {
        fontSize: 15,
        fontWeight: ("bold", "400"),
        color: "#505050",
        paddingTop: 3,
        marginBottom: size(8)
    },
    submit: {
        width: screen.width - 80,
        height: 40,
        backgroundColor: "#0094e1",
        borderRadius: 10
    },
    container: {
        flex: 1,
        marginRight:size(25),
        marginLeft: size(25)
    },
    groupsVerb: {
        width: screen.width,
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    countdown: {
        width: screen.width * 0.3,
        height: 35,
        fontSize: 18,
        borderRadius: 5,
        backgroundColor: "#0094e1"
    },
    countingdown: {
        backgroundColor: "transparent",
        borderWidth: StyleSheet.hairlineWidth
    },
    countdownTitle: {
        color: "#fff"
    },
    countingTitle: {
        color: "#898989"
    },
    bottomview: {
        backgroundColor: "#ECEDF1",
        flex: 1
    },
    buttonview: {
        backgroundColor: color.main,
        margin: 3,
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center"
    },
    logintext: {
        color: "#FFFFFF",
        marginTop: 10,
        marginBottom: 10
    },
    imgStyle: {
        paddingTop: screen.height * 0.015,
        width: screen.width
        // height: screen.height
    }
});
