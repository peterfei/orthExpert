import React, {PureComponent, Component} from "react"
import {
    View,
    Text,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
    Image,
    TextInput,
    DeviceEventEmitter
} from "react-native"
import {inject, observer} from "mobx-react/native"
import UserStore from "../../mobx/User"
import {screen, system} from "../../common";

import {NavigationActions,StackActions} from "react-navigation";
import NetInfoDecorator from "../../common/NetInfoDecorator";
import Toast, {DURATION} from "react-native-easy-toast";
import {storage} from "../../common/storage";
import DeviceInfo from "react-native-device-info";
import Loading from "../../common/Loading";
import api from "../../api";
import {NativeModules} from "react-native";
import {size, setSpText} from "../../common/ScreenUtil";
import CountDownButton from '../Register/countDownButton.js'

var WxEntry = NativeModules.Wxentry;

@NetInfoDecorator
@observer

export default class LoginPageForm extends Component {

    componentDidMount() {
        try {
            WxEntry.registerApp(api.APPID);
        } catch (e) {
        }

        this.bookMarkListener = DeviceEventEmitter.addListener('asynBookMark', (member) => {

            this.asynBookMark(member);
        })

    }

    constructor(props) {
        super(props)
        //拿到是否游客引导 引导需要隐藏我先看看
        this.state = {
            username: "",
            password: "",
            hideYoukeBtn: false,
            reviewState: false,
            code: '',
            verify_code: '',
            pwdLogin: true
        }
        this.store = new UserStore(props.rootStore)
    }

    componentWillReceiveProps(nextProps) {
        const {isConnected} = nextProps
        console.log("========isConnected==========" + isConnected)
    }


    async componentWillMount() {

        if (Platform.OS === "ios") {
            let state = await checkEnvironment(this)
            this.setState({
                reviewState: state
            })
        }
    }

    componentWillUnmount() {
        this.bookMarkListener.remove();
    }

    loginWithTourist = async () => {
        let curr = this
        // 游客登陆
        const {isConnected} = this.props
        console.log("isConnected is" + isConnected)
        if (!isConnected) {
            this.refs.toast.show("网络连接失败,请检查网络设置")
            return
        }
        const device = {}
        device.DeviceID = DeviceInfo.getUniqueID()
        this.store.params_data["deviceId"] = DeviceInfo.getUniqueID()
        console.log("设备的UUID==>" + device.DeviceID)
        curr.Loading.show("游客登录中..")
        let resp = await this.store.loginWithTourist()
        if (resp.code == 0) {
            curr.Loading.close()
            this.store.props = this.props
            const userDatas = resp
            await storage.save("userTokens", "", resp)
            await storage.save("memberInfo", "", resp.member)
            //alert(JSON.stringify(resp))
            if (userDatas.token != undefined) {
                storage.loadObj("user", userDatas.token)
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({
                            routeName: "NewHome"
                        })
                    ]
                })
                this.store.props.navigation.dispatch(resetAction)
            }
        } else {
            console.log("游客登陆出错")
        }
    }


    //同步书签
    asynBookMark(member) {
        this.sendMsgToUnity("mb_id", member.mbId, "");
    }


    onButtonPress = async () => {
        const {isConnected} = this.props
        console.log("isConnected is" + isConnected)
        if (!isConnected) {
            this.refs.toast.show("网络连接失败,请检查网络设置")
            return;
        }
        if (this.state.pwdLogin) {
            if (this.state.username == "" || this.state.password == "") {
                this.refs.toast.show("用户名或密码不能为空");
                return;
            }
            // this.Loading.show("正在登录");
            // storage.clearMap();
            storage.clearMapForKey("mystructList");
            storage.clearMapForKey("versionByInitMyStruct");
            storage.clearMapForKey("initMyStruct");
            storage.clearMapForKey("userTokens");
            storage.clearMapForKey("memberInfo");

            this.store.params_data["tellAndEmail"] = this.state.username;
            this.store.params_data["password"] = this.state.password;
            this.store.params_data["device_id"] = DeviceInfo.getUniqueID();
            this.store.params_data["business"] = 'orthope';
            let resp = await this.store.LoginAction();
            if (resp.code == 0) {
                // alert(JSON.stringify(resp));
                //进入登录页面就清掉缓存
                this.store.props = this.props;
                this.Loading.close();
                // console.log("userData" + JSON.stringify(resp));
                const userDatas = resp;
                await storage.save("userTokens", "", resp);
                await storage.save("memberInfo", "", resp.member);
                let obj = {
                    userName: this.state.username,
                    loginType: 'tell'
                }
                await storage.save("auth", "", obj);

                if (userDatas.token != undefined) {
                    storage.loadObj("user", userDatas.token);
                    //同步书签
                    this.asynBookMark(resp.member);
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({
                                routeName: "NewHome"
                            })
                        ]
                    });
                    this.store.props.navigation.dispatch(resetAction);
                }
            } else {
                this.Loading.close();

                this.refs.toast.show(resp.msg);
            }
        } else {
            if (this.state.username == "" || this.state.verify_code == "") {
                this.refs.toast.show("用户名或验证码不能为空");
                return;
            }
            this.Loading.show("正在登录");
            storage.clearMapForKey("mystructList");
            storage.clearMapForKey("versionByInitMyStruct");
            storage.clearMapForKey("initMyStruct");
            storage.clearMapForKey("userTokens");
            storage.clearMapForKey("memberInfo");

            let url = api.base_uri + "/v1/app/member/codeLogin?tellAndEmail=" + this.state.username + "&code=" + this.state.verify_code + "&business=orthope";

            await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(resp => resp.json())
                .then(resp => {
                    if (resp.code == 0) {
                        //进入登录页面就清掉缓存
                        this.store.props = this.props;
                        this.Loading.close();
                        const userDatas = resp;
                        storage.save("userTokens", "", resp);
                        storage.save("memberInfo", "", resp.member);

                        if (userDatas.token != undefined) {
                            storage.loadObj("user", userDatas.token);
                            //同步书签
                            this.asynBookMark(resp.member);
                            const resetAction = StackActions.reset({
                                index: 0,
                                actions: [
                                    NavigationActions.navigate({
                                        routeName: "NewHome"
                                    })
                                ]
                            });
                            this.store.props.navigation.dispatch(resetAction);
                        }
                    } else {

                        this.Loading.close();
                        if (resp.code == 500) {
                            this.refs.toast.show("短信验证码错误!");
                        } else {
                            this.refs.toast.show("验证码错误!" + resp.code);
                        }

                    }
                })
        }


    };

    onRegister() {
        this.props.navigation.navigate("RegisterPage");
        // 注册
    }

    onForgetPass() {
        this.props.navigation.navigate("ForgetPasswordPage");
    }


    wechatLogin = async () => {
        let _this = this;
        _this.startLogin();
    };

    async startLogin() {
        this.Loading.show("正在登录");
        let response = await WxEntry.sendAuthRequest("snsapi_userinfo", "wechat")
            .then(resp => {
                this.getOpenId(resp)
            })
            .catch(error => {
                this.Loading.close()
                this.refs.toast.show(
                    "****wechatLogin  error is****" + JSON.stringify(error)
                )
            })
    }

    /// 获取openId
    getOpenId(code) {
        code = Platform.OS === "ios" ? code.code : code;
        let requestUrl =
            "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxa452dfe169d3c11c&secret=21a25d1a7762a4d6caf49cd18e9ad116&code=" +
            code +
            "&grant_type=authorization_code"
        fetch(requestUrl)
            .then(response => response.json())
            .then(json => {
                console.log(code + "---->" + JSON.stringify(json))
                this.getUnionId(json.access_token, json.openid)
            })
            .catch(error => {
                this.refs.toast.show("微信授权登录失败! 2" + JSON.stringify(error))
            })
    }

    async getUnionId(accessToken, openId) {
        let requestUrl =
            "https://api.weixin.qq.com/sns/userinfo?access_token=" +
            accessToken +
            "&openid=" +
            openId
        await fetch(requestUrl)
            .then(response => response.json())
            .then(async json => {
                //检测是否首次登录微信
                this.checkFirstWeixin(json);

                // TODO: 这里openId和unionId都已经成功获取了，调用用户自己的接口传递openId或unionId登录或注册
                // put your login method here...
            })
            .catch(error => {
                // this.Loading.close();
                this.refs.toast.show("微信授权登录失败! - " + JSON.stringify(error))
            })
    }

    //判断用户是否绑定手机号
    async isBindTellNumber(token) {
        let url = api.base_uri + "/v1/app/member/isBoundTellNumber";
        let status = await fetch(url, {
            method: 'get',
            headers: {
                "Content-Type": "application/json",
                token: token
            }
        }).then(resp => resp.json())
            .then(result => {
                if (result.result == "yes") {
                    return new Promise((resolve, reject) => {
                        resolve(true)
                    })
                } else {
                    return new Promise((resolve, reject) => {
                        resolve(false)
                    })
                }
            })
        return status;
    }

    //检测是否首次微信登录
    async checkFirstWeixin(weixininfo) {
        if (weixininfo.unionid != undefined) {
            this.Loading.show("正在登录");
            const url =
                api.base_uri +
                "v1/app/member/isFirstWeixin?unionid=" +
                weixininfo.unionid;
            fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(resp => resp.json())
                .then(async result => {
                    this.Loading.close();

                    let obj = {
                        userName: weixininfo.unionid,
                        loginType: 'weixin'
                    }
                    await storage.save("auth", "", obj);

                    if (result.code == 0) {
                        if (result.mbId != 0) {


                            //检查是否绑定手机号
                            let isBind = await this.isBindTellNumber(result.token);
                            if (isBind) {

                                // 同步书签
                                await storage.save("WXUnionId", "", weixininfo.unionid);

                                this.asynBookMark(result.member);
                                //不是第一次登录
                                storage.save("userTokens", "", result);
                                storage.save("memberInfo", "", result.member);
                                this.Loading.close();

                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({routeName: "NewHome"})]
                                });
                                this.props.navigation.dispatch(resetAction);

                            } else {
                                console.log("------1>" + JSON.stringify({
                                    loginData: result,
                                    weixininfoLogin: weixininfo
                                }))
                                this.props.navigation.navigate("BindPhoneSkip", {
                                    loginData: result,
                                    weixininfoLogin: weixininfo
                                })
                            }


                        } else {

                            await storage.save("WXUnionId", "", weixininfo.unionid);
                            this.Loading.close();
                            this.props.navigation.navigate("SelectIdentity", {
                                obj: weixininfo
                            });

                        }

                    } else {
                        this.refs.toast.show("微信授权登录失败 3:" + JSON.stringify(result));
                    }


                });
        } else {
            this.Loading.close();
            this.refs.toast.show("微信授权登录失败+44:" + JSON.stringify(weixininfo));
        }
    }


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


    shouldStartCountdown = async (shouldStartCountting) => {

        if (this.state.username == '') {
            this.refs.toast.show("电话号码不能为空哦!");
            shouldStartCountting(false)
            return;
        } else {
            this.Loading.show('发送中...');
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
                        this.Loading.close();
                        if (result.code == 0) {
                            this.refs.toast.show("验证码发送成功!");
                            shouldStartCountting(true)
                        } else {
                            this.refs.toast.show(result.msg);
                            shouldStartCountting(false)
                        }
                    });
            } catch (error) {
                this.Loading.close();
                shouldStartCountting(false)
            }
        }
    };

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

    renderIsLogin() {
        if (this.state.pwdLogin) {
            return (
                <View style={{marginTop: size(60)}}>
                    <TextInput style={{height: size(80), fontSize: setSpText(26),}}
                               placeholder="请输入手机号/邮箱"
                               placeholderTextColor="#B9B9B9"
                               underlineColorAndroid="transparent"
                               onChangeText={text =>
                                   this.setState({
                                       username: text
                                   })
                               }
                    />
                    <View style={{width: '100%', height: size(2), backgroundColor: '#e0e0e0'}}/>
                    <View style={{marginTop: size(10), flexDirection: 'row'}}>
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
                        <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                          onPress={this.onForgetPass.bind(this)}>
                            <Text style={{color: '#0D0D0D', fontSize: setSpText(22), fontWeight: 'bold'}}>忘记密码？</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', height: size(2), backgroundColor: '#e0e0e0'}}/>
                </View>
            )
        } else {
            return (
                <View style={{marginTop: size(60)}}>
                    <TextInput style={{height: size(80), fontSize: setSpText(26),}}
                               placeholder="请输入手机号"
                               placeholderTextColor="#B9B9B9"
                               underlineColorAndroid="transparent"
                               onChangeText={text =>
                                   this.setState({
                                       username: text
                                   })
                               }
                    />
                    <View style={{width: '100%', height: size(2), backgroundColor: '#e0e0e0'}}/>
                    <View style={{marginTop: size(10), flexDirection: 'row',}}>
                        <TextInput
                            onChangeText={(text) =>
                                this.setState({
                                    verify_code: text
                                })}
                            enablesReturnKeyAutomatically={true}
                            style={{height: size(80), fontSize: setSpText(26), flex: 3,}}
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
                    <View style={{width: '100%', height: size(2), backgroundColor: '#e0e0e0'}}/>
                </View>
            )
        }
    }

    render() {
        // let pwdbottomColor = this.state.pwdLogin ? '#4FA5F4' : '#e0e0e0';
        // let pwdColor = this.state.pwdLogin ? '#4FA5F4' : '#0D0D0D';
        // let pwdHeight = this.state.pwdLogin ? size(2) : size(1);
        // let bottomColor = !this.state.pwdLogin ? '#4FA5F4' : '#e0e0e0';
        // let Color = !this.state.pwdLogin ? '#4FA5F4' : '#0D0D0D';
        // let height = !this.state.pwdLogin ? size(2) : size(1);
        return (
            <View style={styles.imgStyle}>
                <KeyboardAvoidingView>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: size(146),
                        marginBottom: size(128)
                    }}>
                        <Image source={require('../../img/login/vesalLogo.png')}
                               style={{width: size(372), height: size(64),resizeMode: 'contain'}}/>
                    </View>
                    {/*<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>*/}
                    {/*<TouchableOpacity style={{*/}
                    {/*width: '50%',*/}
                    {/*alignItems: 'center',*/}
                    {/*}} onPress={() => {*/}
                    {/*this.setState({*/}
                    {/*pwdLogin: true*/}
                    {/*})*/}
                    {/*}}>*/}
                    {/*<Text style={{color: pwdColor, fontSize: setSpText(32), fontWeight: '500'}}>密码登录</Text>*/}
                    {/*<View style={{*/}
                    {/*height: pwdHeight,*/}
                    {/*backgroundColor: pwdbottomColor,*/}
                    {/*width: '100%',*/}
                    {/*marginTop: size(18)*/}
                    {/*}}/>*/}
                    {/*</TouchableOpacity>*/}

                    {/*<TouchableOpacity style={{*/}
                    {/*width: '50%',*/}
                    {/*alignItems: 'center',*/}
                    {/*}} onPress={() => {*/}
                    {/*this.setState({*/}
                    {/*pwdLogin: false*/}
                    {/*})*/}
                    {/*}}>*/}
                    {/*<Text style={{color: Color, fontSize: setSpText(32), fontWeight: '500'}}>验证码登录</Text>*/}
                    {/*<View style={{*/}
                    {/*height: height,*/}
                    {/*backgroundColor: bottomColor,*/}
                    {/*width: '100%',*/}
                    {/*marginTop: size(18)*/}
                    {/*}}/>*/}
                    {/*</TouchableOpacity>*/}
                    {/*</View>*/}
                    <View>
                        <Text style={{fontSize: setSpText(34), color: '#0D0D0D', fontWeight: '500'}}>{this.state.pwdLogin ? '账号密码登录' : '验证码登录'}</Text>
                    </View>
                    {this.renderIsLogin()}
                    <TouchableOpacity style={{
                        height: size(80),
                        marginTop: size(80),
                        borderRadius: setSpText(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#4FA5F4',
                    }} onPress={this.onButtonPress.bind(this)}>
                        <Text style={{fontSize: setSpText(32), color: '#ffffff'}}>登录</Text>
                    </TouchableOpacity>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                pwdLogin: !this.state.pwdLogin
                            })
                        }} style={{flex:1,}}>
                            <Text style={{
                                fontSize: setSpText(26),
                                color: '#B9B9B9',
                                marginTop: size(30),
                            }}>{this.state.pwdLogin ? '验证码登录' : '账号密码登录'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.onRegister.bind(this)} style={{flex:1,}}>
                            <Text style={{
                                fontSize: setSpText(26),
                                color: '#4FA5F4',
                                marginTop: size(30),
                                textAlign:'right'
                            }}>立即注册
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems: "center", marginTop: size(200)}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View style={{
                                width: size(188),
                                height: size(0.5),
                                backgroundColor: '#CFCFCF',
                            }}/>
                            <Text style={{
                                color: "#0D0D0D",
                                fontSize: setSpText(26),
                                marginLeft: size(5),
                                marginRight: size(5)
                            }}>其他登录方式</Text>
                            <View style={{
                                width: size(188),
                                height: size(0.5),
                                backgroundColor: '#CFCFCF',
                            }}/>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: size(400),
                                marginTop: size(45)
                            }}>
                            {!this.state.reviewState ?
                                (<View style={{alignItems: "center", flex: 1}}>
                                    <TouchableOpacity onPress={this.wechatLogin.bind(this)}>
                                        <Image
                                            resizeMode="contain"
                                            style={styles.avatar}
                                            source={require("../../img/login/wxlg03.png")}
                                        />
                                        <Text
                                            style={{
                                                alignItems: "center",
                                                marginTop: 2,
                                                color: "#adadad",
                                                textAlign: "center"
                                            }}>
                                            微信登录
                                        </Text>
                                    </TouchableOpacity>
                                </View>) : null}


                            <View style={{alignItems: "center", flex: 1}}>
                                <TouchableOpacity
                                    onPress={this.loginWithTourist.bind(this)}
                                    style={{
                                        alignItems: "center"
                                    }}>
                                    <Image
                                        resizeMode="contain"
                                        style={styles.avatar}
                                        source={require("../../img/login/login_03.png")}
                                    />
                                    <Text
                                        style={{
                                            alignItems: "center",
                                            marginTop: 2,
                                            color: "#adadad",
                                            textAlign: "center"
                                        }}>
                                        我先看看
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

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
            </View>
        )
    }
}

const styles = StyleSheet.create({
    TitleSty: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: screen.width * 0.85,
        marginTop: size(15)
    },
    logoAndTitleSty: {
        flexDirection: "row",
        alignItems: "center"
    },
    ChineseTitleAndPhoto: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: screen.width * 0.85,
        paddingTop: size(110),
        marginTop: -size(50)
    },
    TextTotalStyle: {
        marginTop: -size(100)
    },
    textInputViewStyle: {
        //设置宽度减去30将其居中左右便有15的距离
        width: screen.width * 0.85,
        //设置边框的宽度
        borderWidth: 0,
        //内边距
        paddingLeft: 4,
        paddingRight: 4,
        //外边距
        marginTop: size(15),
        //设置相对父控件居中
        alignSelf: "center"
    }, //输入框样式
    textInputStyle: {
        width: screen.width - 40,
        height: size(100),
        //paddingLeft: 8,
        backgroundColor: "#00000000",
        fontSize: 15,
        // alignSelf: 'center',
        //根据不同平台进行适配
        marginTop: Platform.OS === "ios" ? 4 : 8,
        borderBottomWidth: size(1),
        borderBottomColor: "#c1c1c1"
    }, //登录按钮View样式
    avatar: {
        width: size(68),
        height: size(68),
        marginTop: 10,
        marginLeft: 7
    },
    container: {
        flex: 1
    },
    input: {
        height: 40,
        backgroundColor: "rgba(225,225,225,0.2)",
        marginBottom: 10,
        padding: 10,
        color: "#fff"
    },
    buttonContainer: {
        backgroundColor: "#00bbe3",
        paddingVertical: 15
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "700"
    },
    loginButton: {
        backgroundColor: "#00bbe3",
        color: "#fff"
    },
    buttonGroups: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: screen.width / 2
    },

    imgStyle: {
        marginLeft: size(85),
        marginRight: size(85)
    },

    textLoginViewStyle: {
        width: screen.width - 80,
        height: 40,
        backgroundColor: "#0094e1",
        borderRadius: 8,
        marginTop: size(35),
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    textLoginStyle: {
        //fontSize: 15,
        color: "white"
    },
    buttons: {
        marginTop: size(25),
        width: screen.width * 0.85,
        alignItems: "flex-end"
        // backgroundColor:'yellow',
    },
    loginContainer: {
        alignItems: "center",
        flexGrow: 1,
        justifyContent: "center"
    }
})
