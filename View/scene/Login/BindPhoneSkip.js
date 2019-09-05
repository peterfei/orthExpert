import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    DeviceEventEmitter
} from "react-native";
import {size, setSpText} from "../../common/ScreenUtil";
import CountDownButton from '../Register/countDownButton.js'
import Toast, {DURATION} from "react-native-easy-toast";
import {storage} from "../../common/storage";
import GraphicValidate from '../../common/components/GraphicValidate';
import {NavigationActions,StackActions} from "react-navigation";
import Loading from "../../common/Loading";
import NavBar from "../../common/components/NavBar"
import ETTLightStatus from "../../common/ETTLightStatus";
import { NetInterface,HttpTool } from '../../common';

export default class BindPhoneSkip extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: '绑定手机号',
            username: "",
            password: "",
            text: '',
            code: '',
            uuid: '',
            imgURL: '',
            loginData: props.navigation.state.params.loginData,
            weixininfoLogin: props.navigation.state.params.weixininfoLogin,
            invisiblePassword: false

        }
    }

    componentWillReceiveProps(nextProps, nextContent) {

        this.setState({
            loginData: nextProps.navigation.state.params.loginData,
            weixininfoLogin: nextProps.navigation.state.params.weixininfoLogin
        })

    }

    async handleCodeToMessage(code, uuid) {
        // alert(1)
        this.Loading.show('发送中...');
        const url = NetInterface.gk_getCodeAndCheckCapt + "?tellAndEmail=" +
            this.state.username + "&uuid=" + uuid + "&captchaCode=" + code;
        try {
            let responseData = HttpTool.GET_JP(url)
                .then(result => {
                    this.Loading.close();
                    // alert(JSON.stringify(result));
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

    async goToLogin() {
        let weixininfo = this.state.weixininfoLogin;
        let result = this.state.loginData;
        if (result.code == 0) {
            if (result.mbId != 0) {
                // 同步书签
                await storage.save("WXUnionId", "", weixininfo.unionid);
                DeviceEventEmitter.emit('asynBookMark', result.member);
                //不是第一次登录
                storage.save("userTokens", "", result);
                storage.save("memberInfo", "", result.member);

                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: "HomeScreen"})]
                });
                this.props.navigation.dispatch(resetAction);

            }else{
                this.refs.toast.show("微信授权登录失败 5:" + JSON.stringify(result));
            }

        } else {
            this.Loading.close();
            this.refs.toast.show("微信授权登录失败 3:" + JSON.stringify(result));
        }
    }

    //绑定手机号及设置密码
    async bindPhonePassword() {

        if (this.state.username && this.state.verify_code && this.state.password) {
            await storage.save("WXUnionId", "", this.state.weixininfoLogin.unionid);

            let unionid = this.state.weixininfoLogin.unionid;
            let url = NetInterface.gk_boundTellNumberAndPassword + "?unionid=" +
                unionid + "&tell=" + this.state.username + "&password=" + this.state.password + "&code=" + this.state.verify_code;
            try {
                let responseData =HttpTool.POST_JP(url)
                    .then(result => {

                        if (result.code == 0) {
                            let member = this.state.loginData.member;
                            member['mbTell']=this.state.username;
                            this.refs.toast.show("绑定成功!");
                            storage.save("memberInfo", "", member);
                            this.goToLogin();
                        } else {
                            this.refs.toast.show((result.msg));
                        }
                    });
            } catch (error) {
                this.refs.toast.show("网络错误!");
            }
            return true;
        }
        this.refs.toast.show("电话号码、密码不能为空!");
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
            <View style={styles.container}>
                <ETTLightStatus color={'#0094e5'}/>
                <NavBar title={this.state.title} navigation={this.props.navigation}

                        navigation={this.props.navigation} rightTitle='跳过' rightAction={() => {this.goToLogin()}}
                />

                <View style={styles.header}>
                    <Text style={{color: '#2D2D2D', fontSize: setSpText(24)}}>为保障您的信息数据安全 我们建议您绑定常用手机号</Text>
                </View>
                {/*输入手机号*/}
                <View style={{
                    backgroundColor: '#ffffff',
                    marginTop: size(80),
                    flexDirection: 'row',
                    marginRight:size(25),
                    marginLeft: size(25)
                }}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/my/shouji.png')}
                               style={{width: size(22), height: size(32)}}/>
                    </View>
                    <TextInput
                        autoFocus={true}
                        onChangeText={(text) => this.setState({
                            username: text
                        })}
                        style={{height: size(80), flex: 7}}
                        placeholderTextColor={"#B9B9B9"}
                        placeholder={"请输入您的手机号"}
                    />
                </View>
                {/*短信验证码*/}
                <View style={{
                    backgroundColor: '#ffffff',
                    marginTop: size(30),
                    flexDirection: 'row',
                    marginRight:size(25),
                    marginLeft: size(25)
                }}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/my/yanzhengma.png')}
                               style={{width: size(32), height: size(32)}}/>
                    </View>
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
                        textStyle={{color: '#0094e1'}}
                        timerCount={60}
                        timerTitle={'获取验证码'}
                        timerActiveTitle={['请在（', 's）后重试']}
                        onClick={(shouldStartCountting) => {
                            let isPhone = this.onChange(this.state.username)
                            if (isPhone) {
                                this.startTimer = shouldStartCountting;
                                this.GraphicValidate.show();
                            } else {
                                this.refs.toast.show("请输入合法手机号");
                            }

                        }}/>
                </View>

                {/*输入密码*/}
                <View style={{
                    backgroundColor: '#ffffff',
                    marginTop: size(30),
                    flexDirection: 'row',
                    marginRight:size(25),
                    marginLeft: size(25)
                }}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/my/mima.png')}
                               style={{width: size(26), height: size(32)}}/>
                    </View>
                    <TextInput

                        secureTextEntry={!this.state.invisiblePassword}
                        value={this.state.password}
                        style={{height: size(80), flex: 4, fontSize: setSpText(26)}}
                        placeholderTextColor={"#B9B9B9"}
                        placeholder={"请输入密码"}
                        onChangeText={(text) => this.setState({
                            password: text
                        })}
                    />
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


                <TouchableOpacity style={styles.bind} onPress={() => {
                    this.bindPhonePassword();
                }}>
                    <Text style={styles.bindText}>立即绑定</Text>
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
                <GraphicValidate
                    ref={r => {
                        this.GraphicValidate = r
                    }}
                    validateCode={(code, uuid) => {
                        this.GraphicValidate.hide();
                        this.handleCodeToMessage(code, uuid);
                    }}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    header: {
        height: size(70),
        width: '100%',
        backgroundColor: '#FBE7B5',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bind: {
        marginRight:size(25),
        height: size(80),
        backgroundColor: '#0094e5',
        borderRadius: setSpText(40),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: size(70),
        marginLeft: size(25)
    },
    bindText: {
        fontSize: setSpText(32),
        color: '#ffffff',
        fontWeight: '500'
    }

});