import React, {Component} from "react";
import {
    Button,
    DeviceEventEmitter,
    KeyboardAvoidingView,
    Keyboard,
    TextInput,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    ScrollView,
    Image,
    Platform
} from "react-native";
import Loading from "../../common/Loading";
import {size} from "../../common/ScreenUtil";
import {getDate} from "./LCE"
import Toast from "react-native-easy-toast";
import api from "../../api";
import {storage} from "../../common/storage";
import {NavigationActions,StackActions} from "react-navigation";
import DeviceInfo from "react-native-device-info";
import {ifnull} from "./LCE"

export default class Comment extends Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            currModel: this.props.currModel,
            info: this.props.info,
            keyboardHeight: size(0.01),
            isPublic: true,
            content: "",
            dataList: [],

        }
    }


    async send() {
        //post

        let contact = "";
        if (this.state.content != "") {
            this.refs.textInput.blur();
            this.refs.textInput.clear();
            this.Loading.show("发送中...");
            let tokens = await storage.get("userTokens");
            let memberInfo = await storage.get("memberInfo");

            if (memberInfo != -1 && memberInfo != -2 && tokens != -1 && tokens != -2) {

                if (memberInfo.mbEmail != "") {
                    contact = memberInfo.mbEmail
                }
                if (memberInfo.mbTell != "") {
                    contact = memberInfo.mbTell
                } else {
                    contact = memberInfo.mbName
                }
                // 提交数据
                let url = api.base_uri + "/v1/app/msg/pushMsg";
                console.info("url is " + url);
                let deviceInfo = "手机型号:" + DeviceInfo.getModel() + ",品牌:" + DeviceInfo.getBrand() + ",手机版本:" + DeviceInfo.getSystemVersion() + ",维萨里软件版本:" + DeviceInfo.getVersion() + ",产品:" + this.props.info.struct_name + "(" + this.props.info.app_id + ")" + ",子模型:" + ifnull(this.props.currModel.chName) + "(" + ifnull(this.props.currModel.smName) + ")";

                let responseData = fetch(url, {
                    method: "post",
                    body: JSON.stringify({
                        content: this.state.content,
                        msgType: this.state.isPublic ? "public" : "private",
                        msgGrade: 5,
                        plat: Platform.OS,
                        contact: contact,
                        deviceInfo: deviceInfo,
                        appId: this.props.info.app_id,
                        smName: ifnull(this.props.currModel.smName),
                        smChName: ifnull(this.props.currModel.chName)
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        token: tokens.token
                    }
                })
                    .then(resp => resp.json())
                    .then(
                        result => {

                            if (result.code == 0) {
                                this.Loading.close();
                                this.refs.toast.show("发送成功! ");
                                this.getData();

                            }
                        },
                        error => {
                            this.refs.toast.show("网络异常~ ");
                        }
                    );


            } else {
                this.refs.toast.show("登录超时, 请重新登录");
            }


        } else {
            this.refs.toast.show("发送内容为空~~");
        }


    }

    async componentDidMount() {
        this.getData()
    }

    async getData() {
        //msgListBy
        const url = api.base_uri + "/v1/app/msg/msgListBy";
        try {
            this.Loading.show("加载中...");
            let tokens = await storage.get("userTokens");
            if (tokens == -1 || tokens == -2) {
                this.refs.toast.show("登录过期 ,请重新登录!");
            }
            let responseData = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token,

                }, body: JSON.stringify({
                    smName: ifnull(this.state.currModel.smName),
                    appId: ifnull(this.state.info.app_id)
                })
            })
                .then(resp => resp.json())
                .then(result => {
                    this.Loading.close();
                    if (result.code == 0) {
                        this.setState({
                            dataList: result.list
                        })
                    } else {

                    }


                });
        } catch (error) {
            this.Loading.close();
        }
    }

    changePublic() {
        let txt = this.state.isPublic ? "不公开评论,仅平台可见" : "已开启公开评论"
        this.refs.toast.show(txt);
        this.setState({
            isPublic: this.state.isPublic ? false : true
        })

    }

    render() {
        let gk = require('../../img/unity/gongkai.png');
        let yc = require('../../img/unity/yinchang.png');


        return (
            <View style={styles.parent}>
                <View style={{
                    backgroundColor: "#000",
                    width: "100%",
                    borderTopRightRadius: size(50),
                    borderTopLeftRadius: size(50),
                    justifyContent: "center",
                    height: size(68),
                    flexDirection: "row"
                }}>
                    <View style={{flex: 1}}>
                        <Text></Text>
                    </View>
                    <View style={{flex: 5, justifyContent: "center", textAlign: "center"}}>
                        <Text style={{
                            alignSelf: "center",
                            color: "#dadada",
                            fontSize: size(20),
                            fontWeight: "bold"
                        }}>{this.state.dataList.length}条评论</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.hideWin()
                        }}
                        style={{flex: 1, justifyContent: "center", color: "#dadada",}}>
                        <Image
                            source={require('../../img/unity/close.png')}
                            style={{
                                width: size(40),
                                alignSelf: "center",
                                height: size(40)
                            }}/>
                    </TouchableOpacity>
                </View>
                <ScrollView>


                    {/*for*/}
                    {this.state.dataList.map((data, index) => {
                        let reply_content = null;
                        let headUrl  = data.mb_head_url;
                        if (data.mb_head_url==null|| data.mb_head_url==undefined||data.mb_head_url=='' ||data.mb_head_url=="RYKJ/") {

                            headUrl = "http://filetest1.vesal.site/upload/default/head.png";
                        }
                        if (data.reply_content != '') {
                            reply_content = <Text style={{
                                fontSize: size(26),
                                color: "#f2f2f2",
                                lineHeight: size(40),
                                marginTop: size(15)
                            }}>

                                <Text style={{color: "#b8b8b8", fontSize: size(24),}}>系统回复:</Text>
                                {data.reply_content}
                            </Text>
                        }

                        return (
                            <View style={{width: "100%", flexDirection: "row", marginTop: size(20)}}>

                                <View style={{flex: 1, marginLeft: size(20)}}>
                                    <Image
                                        source={{uri: headUrl}}
                                        style={{
                                            width: size(80),
                                            height: size(80),
                                            borderRadius: size(80)
                                        }}/>
                                </View>
                                <View style={{flex: 5, marginRight: size(10),}}>
                                    <Text style={{
                                        color: "#bbbbbb",
                                        fontSize: size(26),
                                        fontWeight: "bold"
                                    }}> @{data.mb_name}</Text>
                                    <Text style={{color: "#f2f2f2", fontSize: size(26), lineHeight: size(40)}}>
                                        {data.content}
                                        <Text style={{color: "#cacaca", fontSize: size(22)}}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                            {getDate(data.add_time)}</Text>
                                    </Text>
                                    {reply_content}


                                </View>


                            </View>)


                    })}


                </ScrollView>

                <View   style={[styles.form,{bottom:this.state.keyboardHeight}]}>
                    <View style={{
                        flexDirection: "row",
                    }}>
                        <TouchableOpacity onPress={() => {
                            this.changePublic()
                        }} style={{flex: 1, color: "#FFF", justifyContent: "center", alignItems: "center"}}>
                            <Image
                                source={this.state.isPublic ? gk : yc}
                                style={{
                                    width: size(36),
                                    height: size(36),
                                }}/>
                        </TouchableOpacity>
                        <TextInput
                            onChangeText={text =>
                                this.setState({
                                    content: text
                                })
                            }
                            maxLength={300}
                            ref="textInput"
                            selectionColor={'#FFF'}
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid="transparent"
                            placeholderTextColor={"#828282"}
                            placeholder="留下您的意见，让我们做得更好~"
                            style={{width: '100%', flex: 6, color: "#FFF", height: size(100)}}
                            multiline={true}

                        />

                        <TouchableOpacity
                            onPress={() => {
                                this.send()
                            }}
                            style={{width: '100%', flex: 1, alignItems: "center", justifyContent: "center"}}>
                            <Text style={{color: "#ffffff"}}>发送</Text>
                        </TouchableOpacity>

                    </View>


                </View>
                <Toast style={{backgroundColor: '#FFFF'}} ref="toast" opacity={1} position='top'
                       positionValue={size(100)} fadeInDuration={750} textStyle={{color: '#323232'}}
                       fadeOutDuration={1000}/>
                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />
            </View>
        );
    }


    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    componentWillMount() {
        if (Platform.OS === 'android') {

        }
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    _keyboardDidShow(e) {

        this.setState({
            keyboardHeight: e.endCoordinates.height
        })

    }

    _keyboardDidHide(e) {
        this.setState({
            keyboardHeight: size(1)
        })
    }

}
const styles = StyleSheet.create({
    parent: {
        flex: 1,
        width: '100%', backgroundColor: "rgba(0,0,0,0.8)",
        top: size(200), left: 0, right: 0, borderRadius: size(20), bottom: size(0.01),
        position: 'absolute',
    },
    form: {
        flex: 1,
        width: '100%', backgroundColor: "#000",
        height: size(100), left: 0, right: 0,bottom:size(1),
        position: 'absolute',
    },


});
