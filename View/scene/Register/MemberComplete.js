import React, { Component } from "react";
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity, Alert, Image
} from "react-native";
import { color } from "../../widget";
import { Button, Colors, LoaderScreen, Text, TextInput, View } from "react-native-ui-lib";

import { screen } from "../../common";
import CountdownView from "rn-countdown";
import UserStore from "../../mobx/User";
import api from "../../api";
import Toast from "react-native-easy-toast";
import Loading from "../../common/Loading";
import DeviceInfo from "react-native-device-info";
import SelectDialog from 'react-native-select-dialog';
import TitleBar from '../../scene/Home/TitleBar';
import {size} from '../../common/ScreenUtil'
import CountDownButton from './countDownButton.js'

export default class MemberComplete extends Component {
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
    shouldStartCountdown = async (shouldStartCountting) => {

        if (this.state.username == '') {
            // alert(222)
            this.refs.toast.show("电话号码不能为空!");
            shouldStartCountting(false)
            return;
        } else if (this.state.code == '') {
            // alert(111)
            this.refs.toast.show("图形码不能为空!");
            shouldStartCountting(false);
            return;
        } else {
            // alert(333)

            const url =
              api.base_uri +
              "/v1/app/member/getCodeAndCheckCapt?tellAndEmail=" +
              this.state.username + "&uuid=" + this.state.uuid + "&captchaCode=" + this.state.code;
            try {
                let responseData = await fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                  .then(resp => resp.json())
                  .then(result => {
                      // alert(JSON.stringify(result));
                      if (result.code == 0) {
                          this.refs.toast.show("验证码发送成功!");
                          shouldStartCountting(true)
                      } else {
                          this.refs.toast.show(result.msg);
                          // Alert.alert(JSON.stringify(result.msg));
                          shouldStartCountting(false)
                      }
                  });
            } catch (error) {
                // Alert.alert("验证码发送失败,请检查电话或邮箱是否正确");
                shouldStartCountting(false)
            }
        }
    };

    async onConfirmRegister() {
        const device = {};
        device.DeviceID = DeviceInfo.getUniqueID();

        if (this.state.username != '') {
            if (this.state.mbIdentity == null || this.state.mbIdentity == '') {
                this.refs.toast.show("请选择您的身份");
                return false;
            }
            if (this.state.verify_code == '') {
                this.refs.toast.show("验证码不能为空");
                return false;
            }
            try {
                this.Loading.show("正在注册");

                let data = {
                    tellAndEmail: this.state.username,
                    password: this.state.password,
                    passwordConfirm: this.state.repassword,
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

        this.refs.toast.show("电话号码或邮箱不能为空!");
        return false;
    }


    render() {

        const initVal = this.state.valChange ? this.state.title : this.state.initTxt

        return (
            <View style={{height:'100%'}}>
                <TitleBar title={this.state.titleBar} navigate={this.props.navigation} />

                <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}>

                    <View style={styles.loginContainer}>
                        <KeyboardAvoidingView behavior="padding">
                            <View style={{ marginTop: 20 }}>
                                <View paddingH-20>
                                    {/* <Text style={styles.littleTitle}>请输入您的账户：</Text> */}
                                    <TextInput
                                        text65
                                        keyboard={'numeric'}
                                        autoFocus={true}
                                        style={styles.input}
                                        placeholder=" 请输入手机号/邮箱"
                                        placeholderTextColor="#adadad"
                                        onChangeText={text => {
                                            this.onChange(text);

                                            this.setState({
                                                username: text
                                            })
                                        }


                                        }
                                    />

                                    <View style={styles.groupsVerb}>
                                        <TextInput
                                          style={styles.input}
                                          containerStyle={{
                                              width: screen.width * 0.7
                                          }}
                                          text65
                                          placeholder="请输入图形验证码"
                                          onChangeText={text =>
                                            this.setState({
                                                code: text
                                            })
                                          }
                                        />
                                        <Image source={{uri: this.state.imgURL}} style={{width:  screen.width * 0.18, height: size(48)}}/>
                                    </View>

                                    {/* <Text style={styles.littleTitle}>请输入校验码：</Text>                              */}
                                    <View style={styles.groupsVerb}>

                                        <TextInput
                                            style={styles.input}
                                            containerStyle={{ width: screen.width * 0.6 }}
                                            text65
                                            placeholder="请输入短信验证码"
                                            placeholderTextColor="#adadad"
                                            onChangeText={text => this.setState({ verify_code: text })}
                                        />

                                        <CountDownButton enable={true}
                                                          style={{width: 110,marginRight: 10}}
                                                          textStyle={{color: '#0094e1'}}
                                                          timerCount={60}
                                                          timerTitle={'获取验证码'}
                                                          timerActiveTitle={['请在（','s）后重试']}
                                                          onClick={(shouldStartCountting)=>{
                                                              // shouldStartCountting是一个回调函数，根据调用接口的情况在适当的时候调用它来决定是否开始倒计时
                                                              //随机模拟发送验证码成功或失败
                                                              // const requestSucc = Math.random() + 0.5 > 1;
                                                              // shouldStartCounting(requestSucc)
                                                              this.shouldStartCountdown(shouldStartCountting);
                                                          }}/>
                                    </View>





                                    {/* <Text style={styles.littleTitle}>请输入您的新密码：</Text> */}
                                    <TextInput
                                        text65
                                        placeholder="设置密码"
                                        placeholderTextColor="#adadad"
                                        secureTextEntry
                                        style={styles.input}
                                        onChangeText={text =>
                                            this.setState({
                                                password: text
                                            })
                                        }
                                    />
                                    {/* <Text style={styles.littleTitle}>请再次输入您的新密码：</Text> */}
                                    <TextInput
                                        text65
                                        placeholder="确认密码"
                                        placeholderTextColor="#adadad"
                                        secureTextEntry
                                        style={styles.input}
                                        onChangeText={text =>
                                            this.setState({
                                                repassword: text
                                            })
                                        }
                                    />
                                    {/* <Text style={styles.littleTitle}>请输入您的推荐电话：</Text> */}
                                    <TextInput
                                        text65
                                        placeholder="邀请码(可不填)"
                                        placeholderTextColor="#adadad"
                                        style={styles.input}
                                        onChangeText={text =>
                                            this.setState({
                                                recommendTell: text
                                            })
                                        }
                                    />
                                    {/* <Text style={styles.littleTitle}>请输入您的身份：</Text> */}
                                    {/*选择身份*/}
                                    <View>
                                        <TouchableHighlight style={[styles.input]} onPress={this.show.bind(this)}>
                                            <Text style={{ fontSize: 15 }}>
                                                {initVal}
                                            </Text>
                                        </TouchableHighlight>

                                    </View>
                                    <SelectDialog
                                        ref="showList"
                                        titles={'请选择您的身份'}
                                        valueChange={this.changList.bind(this)}
                                        datas={this.state.identityList}
                                        animateType={'fade'}
                                        positionStyle={{ backgroundColor: '#00bbe3' }}
                                        renderRow={this.defineList.bind(this)}
                                        innersWidth={screen.width * 0.8}
                                        innersHeight={screen.height * 0.5}
                                    />

                                    <View center marginT-20>
                                        <Button
                                            style={styles.submit}
                                            text65
                                            label="立即注册"
                                            onPress={this.onConfirmRegister.bind(this)}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={this.toLogin.bind(this)}
                                        style={{ fontSize: 20, marginTop: 10, fontWeight: "bold" }}>
                                        <Text style={{ textAlign: "right", color: color.main }}>
                                            已有账号?点我登录
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
                                </View>
                                <Loading
                                    ref={r => {
                                        this.Loading = r;
                                    }}
                                    hudHidden={false}
                                />
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </ScrollView>
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
        color: "#222222", lineHeight: 40, fontSize: 18
    },
    input: {
        height: 20,
        width: screen.width - 5,
        borderColor: color.main,
        borderRadius: 4,
        fontSize: 15,
    },
    submit: {
        width: screen.width - 45,
        height: 42,
        backgroundColor: "#0094e1",
        borderRadius: 5
    },
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    loginContainer: {
        // alignItems: 'center',
        flexGrow: 1,
        justifyContent: "center"
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
