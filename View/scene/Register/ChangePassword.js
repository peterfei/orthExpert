import React, { Component } from "react";
import {
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Alert,
    ImageBackground,
    DeviceEventEmitter
} from "react-native";
import { color, NavigationItem, SpacingView } from "../../widget";
import {
    View,
    TextInput,
    Text,
    Button,
    LoaderScreen,
    Colors
} from "react-native-ui-lib";

import { screen, system } from "../../common";
import CountdownView from "rn-countdown";
import UserStore from "../../mobx/User";
import { NavigationActions,StackActions } from "react-navigation";
import { RadioGroup, RadioButton } from "react-native-flexi-radio-button";
import _ from "lodash";
import { storage } from "../../common/storage";
import Toast, { DURATION } from "react-native-easy-toast";
//公共标题栏
import TitleBar from '../../scene/Home/TitleBar';
import {size,NetInterface,HttpTool} from "../../common";
import CountDownButton from './countDownButton.js'

export default class ChangePassword extends Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            repassword: "",
            verify_code: "",
            title: '修改密码',
            code: '',
            uuid: '',
            imgURL: '',
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

        let url = NetInterface.gk_appCaptcha + "?uuid=" + guid;
        this.setState({
            imgURL: url,
            uuid: guid
        })
    }

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
              NetInterface.gk_getCodeAndCheckCapt +
              "?tellAndEmail=" +
              this.state.username + "&uuid=" + this.state.uuid + "&captchaCode=" + this.state.code;
            try {
                let responseData = HttpTool.GET_JP(url)
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

        if (this.state.username) {
            let data = {
                tellAndEmail: this.state.username,
                password: this.state.password,
                passwordConfirm: this.state.repassword,
                code: this.state.verify_code

            }
            console.log(data)
            const url = NetInterface.gk_forgetPwd
            try {
                let responseData = HttpTool.POST_JP(url,data).then(result => {
                    if (result.code == 0) {
                        this.refs.toast.show("密码修改成功!");
                        // debugger
                        this.timer = setTimeout(() => {
                            this.props.navigation.navigate("Tab");
                        }, 1000);
                    } else {
                        this.refs.toast.show((result.msg));
                    }
                });


            } catch (error) {
                this.refs.toast.show("网络错误!");
            }
            return true;
        }

        this.refs.toast.show("电话号码或邮箱不能为空!");
        return false;

    }

    render() {
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <TitleBar title={this.state.title} navigate={this.props.navigation} />


                <ImageBackground resizeMode='cover' style={styles.imgStyle}
                    source={require('../../img/login/login_bg.png')}>
                    <View flex paddingH-20>

                        <TextInput text65 keyboard={'numeric'}
                                   autoFocus={true} style={styles.input} placeholder=" 请输入手机号或邮箱"
                            onChangeText={text =>
                                this.setState({
                                    username: text
                                })
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

                        <View style={styles.groupsVerb}>
                            <TextInput
                                style={styles.input}
                                containerStyle={{ width: screen.width * 0.6 }}
                                text65
                                placeholder="请输入短信验证码"
                                onChangeText={text => this.setState({ verify_code: text })}
                            />

                            <CountDownButton
                              enable={true}
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
                        <TextInput
                            text65
                            placeholder="设置密码"
                            secureTextEntry
                            style={styles.input}
                            onChangeText={text =>
                                this.setState({
                                    password: text
                                })
                            }
                        />
                        <TextInput
                            text65
                            placeholder="确认密码"
                            secureTextEntry
                            style={styles.input}
                            onChangeText={text =>
                                this.setState({
                                    repassword: text
                                })
                            }
                        />

                        <View center marginT-20>
                            <Button style={styles.submit} text65
                                label="立即修改"
                                onPress={this.onConfirmRegister.bind(this)}
                            />
                        </View>
                        <Toast
                            ref="toast"
                            position="top"
                            positionValue={200}
                            fadeInDuration={750}
                            fadeOutDuration={1000}
                            opacity={0.8}
                        />
                    </View>
                </ImageBackground>
            </KeyboardAvoidingView>

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
    submit: {
        width: '90%',
        height:size(80),
        backgroundColor: color.main,
        borderRadius: size(100)
    },
    container: {
        flex: 1
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
        backgroundColor: color.main,
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
    }, bottomview: {
        backgroundColor: '#ECEDF1',
        flex: 1,
    }, buttonview: {
        backgroundColor: color.main,
        margin: 3,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logintext: {
        color: '#FFFFFF',
        marginTop: 10,
        marginBottom: 10,
    },
    imgStyle: {
        paddingTop: screen.height * 0.34,
        width: screen.width,
        height: screen.height,
    }

});
