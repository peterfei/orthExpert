import React, {Component} from "react";
import {
    DeviceEventEmitter,
    Image,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    View
} from "react-native";
import {screen} from "../../common";
import {color, DetailCell, SpacingView} from "../../widget";
import Login from "../Login/Login";
import {storage} from "../../common/storage";
import Toast from "react-native-easy-toast";
import {NavigationActions,StackActions} from "react-navigation";
import ChangePassword from "../Register/ChangePassword";
import {size} from "../../common/ScreenUtil";
import ActionSheet from "react-native-actionsheet";
import UShare from "../../share/share";
import SharePlatform from "../../share/SharePlatform";
import api from "../../api";
import Loading from "../../common/Loading";

export default class InputInviteCode extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props: Object) {
        super(props);

        this.state = {
            inviteCode: '',
        };
    }

    componentDidMount() {

    }

    async componentWillMount() {

    }

    async startUse() {
        if (this.state.inviteCode != '') {
            this.Loading.show("正在验证...");
            let tokens = await storage.get("userTokens");

            const url = api.base_uri + "/v1/app/share/verifyInviteCode?inviteCode="+this.state.inviteCode;
            await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                }
            })
                .then(resp => resp.json())
                .then(result => {
                    this.Loading.close();
                    if (result.count==0){
                        this.refs.toast.show("邀请码错误");
                    }else{
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({
                                    routeName: "HomeScreen"
                                })
                            ]
                        });
                        this.props.navigation.dispatch(resetAction);
                    }

                });
        }else{
            this.breakPage();
        }

    }
    breakPage(){
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({
                    routeName: "HomeScreen"
                })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }


    render() {


        return (
            <ImageBackground
                  source={require('../../img/common/input_code.png')}
                  style={{backgroundColor: "#fff", width: screen.width, height: screen.height}}>

                <View>

                    <TextInput
                        style={styles.textInputStyle}
                        placeholder="码"
                        placeholderTextColor="#adadad"
                        underlineColorAndroid="transparent"
                        onChangeText={text =>
                            this.setState({
                                inviteCode: text
                            })
                        }
                    />

                   <View style={{marginTop:size(340)}}>
                       <TouchableOpacity onPress={this.startUse.bind(this)}>
                           <Image source={require('../../img/common/start.png')}
                                  style={{width: size(249), height: size(249),marginTop:size(1),alignSelf:'center'}}/>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this.breakPage.bind(this)}>

                               <Image source={require('../../img/common/break.png')}
                                      style={{width: size(181), height: size(66),marginTop:size(30),alignSelf:'center'}}/>

                       </TouchableOpacity>
                   </View>

                </View>
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

            </ImageBackground>
        );

    }
}
const styles = StyleSheet.create({
    empty: {
        textAlign: 'center', color: "#797979", marginTop: size(30)
    }, textInputStyle: {
        borderWidth: size(1),
        width: '50%',
        height: size(90),
        color: '#222222',
        textAlign:'center',
        fontSize: size(32),
        marginTop:size(220),
        alignSelf: "center",
        borderColor: "#ffffff",
        backgroundColor: "#fff",
        borderRadius: size(80),
        paddingLeft:size(12)

    }, textLoginViewStyle: {
        marginTop: size(30),
        alignSelf: "center",
        width: '50%',
        height: size(70),
        backgroundColor: "#0094e1",
        borderRadius: size(40),
    }, textLoginStyle: {
        color: '#ffffff',
        lineHeight: size(70),
        alignSelf: "center",
    }
});
