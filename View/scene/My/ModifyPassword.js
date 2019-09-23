import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    KeyboardAvoidingView,
    TextInput
} from "react-native";
import {
    BaseComponent,
    ContainerView,
    HttpTool,
    NetInterface,
    FuncUtils,
    size,
} from '../../common';
import CountDownButton from '../../common/components/countDownButton'
import api from "../../api";
import {storage} from "../../common/storage";


export default class ModifyPassword extends BaseComponent {

    constructor(props) {
        super(props);
        let params = props.navigation.state.params;
        this.state = {
            username: "",
            password: "",
            repassword: "",
            verify_code: "",
            code: '',
            invisiblePassword: false
        };
    }

    componentWillMount() {
    }

    shouldStartCountdown = async (shouldStartCountting) => {
        if (this.state.username == '') {
            this.mainView._toast("电话号码不能为空哦!");
            shouldStartCountting(false)
            return;
        } else {
            this.mainView._showLoading('发送中...');
            const url =
                api.base_uri +
                "/v1/app/member/getCodeCheck?tellAndEmail=" + this.state.username;
            try {
                let responseData = await fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(resp => resp.json())
                    .then(result => {
                        this.mainView._closeLoading();
                        if (result.code == 0) {
                            this.mainView._toast("验证码发送成功!");
                            shouldStartCountting(true)
                        } else {
                            this.mainView._toast(result.msg);
                            shouldStartCountting(false)
                        }
                    });
            } catch (error) {
                this.mainView._closeLoading();
                shouldStartCountting(false)
            }
        }
    };

    async _resetPd(){
        this.mainView._showLoading('正在修改密码...');
        let tokens = await storage.get("userTokens");
        let url =  api.base_uri+ 'v1/app/member/updateTellPassword' + "?tell=" + this.state.username + "&code=" + this.state.verify_code + "&password=" + this.state.password;

        await  fetch(url,{
            method: "post",
            headers: {
                "Content-Type": "application/json",
                accept: "*/*",
                token: tokens.token
            }
        })
            .then((resp) => resp.json())
            .then((res) => {
                console.log(res)
                this.mainView._closeLoading();
                        if (res.code == 0) {
                            this.mainView._toast("密码重置成功！");
                            FuncUtils.logout(this)
                        } else {
                            this.mainView._toast(res.msg);
                        }
            })
            .catch(err => {
                        this.mainView._closeLoading();
                        this.mainView._toast(JSON.stringify(err));
                    })
    }

    onConfirmRegister() {

        let isValidatePwd = FuncUtils.validatePwd(this.state.password);
        if (!isValidatePwd) {
            this.mainView._toast('密码只能输入6-20个字母、数字、下划线.')
            return;
        }

        if (this.state.username) {
            this._resetPd()
        }
    }

    render() {
        return (
            <ContainerView ref={r => this.mainView = r}>
                <ScrollView style={styles.container} keyboardShouldPersistTaps={"always"}
                            showsVerticalScrollIndicator={false}>
                    <KeyboardAvoidingView behavior="padding">
                        <View style={{height: size(320)}}>
                            <TouchableOpacity style={styles.backStyle} onPress={() => {
                                this.props.navigation.goBack();
                            }}>
                                <Image source={require('../../img/kf_mine/mine_greyback.png')}
                                       style={styles.backImageStyle}/>
                            </TouchableOpacity>
                            <Image source={require('../../img/kf_main/retrievePass.png')}
                                   style={styles.retrievePassImage}/>
                        </View>
                        <View style={{height: size(500)}}>
                            <TextInput
                                autoFocus={true}
                                style={styles.phoneNumber}
                                placeholder="请输入手机号/邮箱"
                                placeholderTextColor="#B9B9B9"
                                underlineColorAndroid="transparent"
                                onChangeText={text =>
                                    this.setState({
                                        username: text
                                    })}/>
                            {/*短信验证码*/}
                            <View style={styles.verify_code}>
                                <TextInput
                                    onChangeText={(text) =>
                                        this.setState({
                                            verify_code: text
                                        })}
                                    style={{height: size(80), flex: 4, fontSize: size(26)}}
                                    placeholderTextColor={"#B9B9B9"}
                                    placeholder={"请输入验证码"}/>
                                <CountDownButton
                                    enable={true}
                                    style={{flex: 3, height: size(73),}}
                                    textStyle={{color: '#0094e1', fontSize: size(24)}}
                                    timerCount={60}
                                    timerTitle={'获取验证码'}
                                    timerActiveTitle={['请在（', 's）后重试']}
                                    onClick={(shouldStartCountting) => {
                                        let isPhone = FuncUtils.CheckIsPhoneEmail(this.state.username)
                                        if (isPhone) {
                                            this.startTimer = shouldStartCountting;
                                            this.shouldStartCountdown(shouldStartCountting);
                                        } else {
                                            this.mainView._toast("请输入合法手机号");
                                        }
                                    }}/>
                            </View>
                            {/*设置密码*/}
                            <View style={styles.password}>
                                <TextInput
                                    style={{height: size(80), fontSize: size(26), flex: 4,}}
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
                                <TouchableOpacity style={styles.isSeePassword} onPress={() => {
                                    this.setState({
                                        invisiblePassword: !this.state.invisiblePassword
                                    })
                                }}>
                                    <Image
                                        source={this.state.invisiblePassword ? require('../../img/kf_mine/can_see.png') : require('../../img/kf_mine/can_not_see.png')}
                                        style={{width: size(30), height: size(16),}}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/*点击确定*/}
                        <TouchableOpacity style={styles.ensure} onPress={this.onConfirmRegister.bind(this)}>
                            <Text style={{fontSize: size(32), color: '#ffffff'}}>确定</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </ScrollView>
            </ContainerView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginRight: size(25),
        marginLeft: size(25)
    },
    backStyle: {
        height: size(100),
        width: size(100),
        justifyContent: 'center',
        marginTop: size(40)
    },
    backImageStyle: {
        width: size(16), height: size(26)
    },
    retrievePassImage: {
        width: size(225), height: size(53), marginTop: size(50),resizeMode:'contain'
    },
    phoneNumber: {
        height: size(80),
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: size(2),
        fontSize: size(26),
        marginTop: size(50)
    },
    verify_code: {
        marginTop: size(10),
        flexDirection: 'row',
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: size(2),
    },
    password: {
        marginTop: size(10),
        flexDirection: 'row',
        borderBottomColor: '#e0e0e0', borderBottomWidth: size(2),
    },
    isSeePassword: {
        flex: 2.3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ensure: {
        height: size(80),
        borderRadius: size(40),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4FA5F4',
    }

});
