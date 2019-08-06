import React, {Component} from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity, Alert, Image,
    View,
    TextInput,
    Text

} from "react-native";
import {color} from "../../widget";
import {Button, Colors, LoaderScreen} from "react-native-ui-lib";

import {screen} from "../../common";
import UserStore from "../../mobx/User";
import api from "../../api";
import Toast from "react-native-easy-toast";
import Loading from "../../common/Loading";
import DeviceInfo from "react-native-device-info";
import SelectDialog from 'react-native-select-dialog';
import {size, setSpText} from '../../common/ScreenUtil';
import GraphicValidate from '../../common/components/GraphicValidate';
import CountDownButton from './countDownButton.js';

export default class RegisterPage extends Component {
    static navigationOptions = {
        header: null
    };


    changList(item, index) {
        this.setState({
            title: item.identityTitle,
            mbIdentity: item.identityId,
            valChange: true,
        })
    }

    show() {
        this.refs.showList.show()
    }

    toLogin() {
        this.props.navigation.navigate("LoginPage");
    }

    onChange(text) {
        if (!(/^[0-9]*$/.test(text))) {
            Alert.alert("请输入合法数字！")
        }
        else if ((/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{9}$/.test(text))) {
            Alert.alert("不是完整的11位手机号或者正确的手机号前七位");
            return false;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            repassword: "",
            verify_code: "",
            List: [],
            identityList: [],
            initTxt: '请选择身份',
            title: '',
            mbIdentity: null,
            valChange: false,
            recommendTell: "",
            titleBar: '会员注册',
            code: '',
            uuid: '',
            imgURL: '',

        };
        this.store = new UserStore(props.rootStore);
    }

    async componentWillMount() {
        this.getAllIdentity();

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

    async onConfirmRegister() {
        const device = {};
        device.DeviceID = DeviceInfo.getUniqueID();

        if (this.state.username != '') {
            if (this.state.verify_code == '') {
                this.refs.toast.show("验证码不能为空");
                return false;
            }
            if (this.state.password == '') {
                this.refs.toast.show("密码不能为空!");
                return false;
            }
            if (this.state.mbIdentity == null || this.state.mbIdentity == '') {
                this.refs.toast.show("请选择您的身份");
                return false;
            }

            try {
                this.Loading.show("正在注册");

                let data = {
                    tellAndEmail: this.state.username,
                    password: this.state.password,
                    passwordConfirm: this.state.password,
                    mbRegSource: Platform.OS,
                    mbIdentity: this.state.mbIdentity,
                    code: this.state.verify_code,
                    deviceId: device.DeviceID,
                    recommendTell: this.state.recommendTell
                };
                console.log(data);
                const url = api.base_uri + "/v1/app/member/register";

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
                            this.refs.toast.show("注册成功!");
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
        this.refs.toast.show("电话号码不能为空!");
        return false;
    }

    async handleCodeToMessage(code, uuid) {
        const url = api.base_uri + "/v1/app/member/getCodeAndCheckCapt?option=register&tellAndEmail=" +
            this.state.username + "&uuid=" + uuid + "&captchaCode=" + code;
        this.Loading.show('正在发送验证码...');
        try {
            let responseData = await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(resp => resp.json())
                .then(result => {
                    this.Loading.close();
                    if (result.code == 0) {
                        this.refs.toast.show("验证码发送成功!");
                        this.startTimer(true);
                    } else {
                        this.refs.toast.show(result.msg);
                        this.startTimer(false);
                    }
                });
        } catch (error) {
            this.Loading.close();
            this.startTimer(false)
        }
    }

    render() {
        const initVal = this.state.valChange ? this.state.title : this.state.initTxt;
        return (
            <View style={{height: '100%', backgroundColor: '#ffffff', width: '100%'}}>
                <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}
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
                            <Text style={{
                                fontSize: setSpText(58),
                                color: '#0D0D0D',
                                fontWeight: '500',
                                marginTop: size(50),
                            }}>手机号注册</Text>
                        </View>
                        <View style={{height: size(500),}}>
                            <TextInput
                                autoFocus={true}
                                style={{
                                    height: size(80),
                                    borderBottomColor: '#e0e0e0',
                                    borderBottomWidth: size(2),
                                    fontSize: setSpText(26),
                                    marginTop: size(50)
                                }}
                                placeholder="请输入手机号"
                                placeholderTextColor="#B9B9B9"
                                underlineColorAndroid="transparent"
                                onChangeText={text => {
                                    this.onChange(text);
                                    this.setState({
                                        username: text
                                    });
                                }}
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
                                    placeholder={"请输入短信验证码"}
                                />
                                <CountDownButton
                                    enable={true}
                                    style={{flex: 3, height: size(73),}}
                                    textStyle={{color: '#0094e1', fontSize: setSpText(24)}}
                                    timerCount={60}
                                    timerTitle={'获取验证码'}
                                    timerActiveTitle={['请在（', 's）后重试']}
                                    onClick={(shouldStartCountting) => {
                                        if (this.state.username == '') {
                                            this.refs.toast.show("电话号码不能为空!");
                                            shouldStartCountting(false)
                                            return;
                                        }
                                        this.startTimer = shouldStartCountting;
                                        this.GraphicValidate.show();
                                        // this.shouldStartCountdown(shouldStartCountting);
                                    }}/>
                            </View>
                            {/*设置密码*/}
                            <View style={{
                                marginTop: size(10),
                                flexDirection: 'row',
                                borderBottomColor: '#e0e0e0', borderBottomWidth: size(2),
                            }}>
                                <TextInput
                                    style={{height: size(80), fontSize: setSpText(26), flex: 3,}}
                                    placeholder="请输入6-12个字符的密码"
                                    placeholderTextColor="#B9B9B9"
                                    underlineColorAndroid="transparent"
                                    secureTextEntry
                                    onChangeText={text =>
                                        this.setState({
                                            password: text
                                        })
                                    }/>
                            </View>

                            {/*设置身份*/}
                            <View style={{
                                flexDirection: 'row',
                                height: size(80),
                                alignItems: 'center',
                                borderBottomColor: '#e0e0e0',
                                borderBottomWidth: size(2),
                                marginTop: size(10),
                            }}>
                                <Text style={{
                                    color: '#B9B9B9',
                                    marginLeft: size(5),
                                    fontSize: setSpText(26)
                                }}>您选择的身份：</Text>
                                <TouchableOpacity style={[styles.input]} onPress={this.show.bind(this)}>
                                    <Text style={{fontSize: setSpText(26)}}>
                                        {initVal}
                                    </Text>
                                </TouchableOpacity>

                            </View>
                            <SelectDialog
                                ref="showList"
                                titles={'请选择您的身份'}
                                valueChange={this.changList.bind(this)}
                                datas={this.state.identityList}
                                animateType={'fade'}
                                positionStyle={{backgroundColor: '#4FA5F4', textAlign: 'center'}}
                                renderRow={this.defineList.bind(this)}
                                innersWidth={screen.width * 0.8}
                                innersHeight={screen.height * 0.5}
                            />
                        </View>
                        <TouchableOpacity style={{
                            height: size(80),
                            borderRadius: setSpText(40),
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#4FA5F4',
                        }} onPress={this.onConfirmRegister.bind(this)}>
                            <Text style={{fontSize: setSpText(32), color: '#ffffff'}}>注册</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.toLogin.bind(this)}>
                            <Text style={{
                                fontSize: setSpText(26),
                                color: '#B9B9B9',
                                marginTop: size(30),
                                textAlign: 'center'
                            }}>已有账号,
                                <Text style={{color: '#4FA5F4'}}>去登录</Text>
                            </Text>
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
                                this.Loading = r;
                            }}
                            hudHidden={false}
                        />
                    </KeyboardAvoidingView>
                </ScrollView>
                <GraphicValidate
                    ref={r => {
                        this.GraphicValidate = r
                    }}
                    validateCode={(code, uuid) => {
                        this.GraphicValidate.hide();
                        this.handleCodeToMessage(code, uuid);
                    }}/>
            </View>
        );

    }


    defineList(rowData, rowID, highlighted) {
        return (
            <View style={styles.line}>
                <Text style={styles.font}>
                    {rowData.identityTitle}
                </Text>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    littleTitle: {
        fontSize: 16,
        fontWeight: ('bold', '400'),
        color: '#505050',
        marginBottom: 5,
    },
    line: {
        height: 40, lineHeight: 40, alignItems: "center",
    },
    font: {
        color: "#222222", lineHeight: 40, fontSize: setSpText(26)
    },
    input: {
        height: 20,
        width: screen.width - 5,
        borderColor: color.main,
        borderRadius: 4,
        fontSize: setSpText(26),
    },
    submit: {
        width: screen.width - 45,
        height: 42,
        backgroundColor: "#0094e1",
        borderRadius: 5
    },
    container: {
        flex: 1,
        width: size(700),
        marginLeft: size(25)
    },
    groupsVerb: {
        width: screen.width,
        flexDirection: "row",
        justifyContent: "flex-start",
        //backgroundColor:"yellow"
    },
    countdown: {
        width: screen.width * 0.28,
        height: 32,
        // fontSize: 18,
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
        paddingTop: screen.height * 0.1,
        width: screen.width,
        height: screen.height
    }, flexRow: {

        flexDirection: 'row',
    },

    flex1: {
        flex: 1,
    },
    Acenter: {
        alignItems: 'center',
    },
});

//
//
// {/*<CountdownView*/}
// {/*ref={r => (this.countdown = r)}*/}
// {/*time={90}*/}
// {/*title="获取验证码"*/}
// {/*overTitle="重新发送"*/}
// {/*style={[styles.countdown]}*/}
// {/*titleStyle={[styles.countdownTitle]}*/}
// {/*countingTitleTemplate="已发送({time})"*/}
// {/*countingStyle={styles.countingdown}*/}
// {/*countingTitleStyle={styles.countingTitle}*/}
// {/*shouldStartCountdown={this.shouldStartCountdown}*/}
// {/*onNetworkFailed={this.handleNetworkFailed}*/}
// {/*/>*/}
