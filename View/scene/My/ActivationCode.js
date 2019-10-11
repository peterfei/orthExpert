import React from "react";
import {
    Image,
    ImageBackground,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {
    BaseComponent,
    ContainerView,
    deviceHeight,
    deviceWidth,
    HttpTool,
    isIPhoneXPaddTop,
    NetInterface,
    size
} from '../../common';
import DateUtil from "../../common/DateUtils";
import {NavigationActions, StackActions} from "react-navigation";

const statusBarHeight = StatusBar.currentHeight;


export default class ActivationCode extends BaseComponent {
    constructor(props){
        super(props)
        this.state = {
            title: '激活码',
            code: '',
            showResult: false,
            effective: '',
            packageName: ''
        }
    }

    activationCode(val) {
        this.setState({
            code: val
        })
    }

    active(){
        if (this.state.code.trim().length === 0) {
            this.mainView._toast("请输入激活码")
        } else {
            this.mainView._showLoading("努力激活中...")
            let url = NetInterface.gk_useActiveCode + `?activeCode=${this.state.code}`
            HttpTool.GET_JP(url)
                .then(res => {
                    this.mainView._closeLoading()
                    if (res.code === 0) {
                        console.log(JSON.stringify(res))
                        let effective = DateUtil.getAfterDate(res.active.activeDays)
                        this.setState({
                            effective: effective,
                            packageName: res.active.title,
                            showResult: true
                        })
                    } else {
                        this.mainView._toast(res.msg)
                    }
                    console.log(JSON.stringify(res))
                })
                .catch(err => {
                    this.mainView._toast(JSON.stringify(err))
                })
        }
    }

    closeResult() {

        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: "NewHome"})]
        });
        this.props.navigation.dispatch(resetAction);

        // this.setState({
        //     showResult: false
        // })
    }

    _renderActiveCode(){
        return (
            <ImageBackground source={require('../../img/kf_mine/kf_activeCode_activeBackground.png')} style={styles.activeBackground}>
                <Text style={styles.vipText}>VIP会员</Text>
                <TextInput ref="textInput"
                           onChangeText={(value) => this.activationCode(value)}
                           selectionColor={'#0094e5'}
                           placeholderTextColor={"#b0b1b4"}
                           placeholder="请输入激活码"
                           defaultValue={this.state.code}
                           autoFocus={true}
                           style={styles.codeInput}/>
                <TouchableOpacity style={styles.codeBtn} onPress={() => this.active()}>
                    <Text style={{fontSize: size(32), color: '#ffffff'}}>立即激活</Text>
                </TouchableOpacity>
            </ImageBackground>
        )
    }

    _renderResult() {
        return (
            <ImageBackground style={styles.resultBackgroundImg} source={require('../../img/kf_mine/kf_activeCode_result_background.png')}>
                <Text style={styles.resultContentBackgroundText}>激活码兑换成功</Text>
                <ImageBackground style={styles.resultContentBackgroundImg} source={require('../../img/kf_mine/kf_activeCode_result_content_background.png')}>
                    <Text style={styles.resultContentBackgroundImgTop}>有效起：{this.state.effective}</Text>
                    <Text style={styles.resultContentBackgroundImgBot}>{this.state.packageName}</Text>
                </ImageBackground>
                <TouchableOpacity style={styles.resultContentBackgroundBtn} onPress={() => this.closeResult()}>
                    <Text style={{fontSize: size(32), color: '#ffffff'}}>我知道了</Text>
                </TouchableOpacity>
            </ImageBackground>
        )
    }

    _renderTransparentNavBar() {
        return (
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.leftNav} onPress={() => {this.props.navigation.pop()}}>
                    <Image style={styles.imgNav} source={require('../../img/search/backjt.png')}/>
                </TouchableOpacity>
                <View style={styles.navbarTitle}>
                    <Text style={styles.navbarTitleText}>{this.state.title}</Text>
                </View>
            </View>
        )
    }

    render() {
        return (
            <ContainerView ref={r => this.mainView = r}>

                <ImageBackground resizeMode='stretch' source={require('../../img/kf_mine/kf_activeCode_background.png')} style={styles.codeContent} >
                    {this._renderTransparentNavBar()}
                    {this._renderActiveCode()}
                    <View style={[styles.resultCodeContent, {top: this.state.showResult ? 0 : deviceHeight + (Platform.OS == 'ios' ? 0 : size(148))}]}>
                        {this._renderResult()}
                    </View>
                </ImageBackground>


            </ContainerView>
        )
    }

}

const styles = StyleSheet.create({
    codeContent: {
        flex: 1,
        alignItems: 'center',
    },
    resultCodeContent: {
        position: 'absolute',
        left: 0,
        width: deviceWidth,
        height: deviceHeight + (Platform.OS == 'ios' ? 0 : size(148)),
        alignItems: 'center',
    },
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: deviceWidth,
        height: Platform.OS === 'android' ? size(128) :  size(88) + isIPhoneXPaddTop(0),
        paddingTop: isIPhoneXPaddTop(0) + ( Platform.OS === 'android' ? statusBarHeight : 0),
        backgroundColor: 'rgba(0,0,0,0)',
    },
    leftNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: size(80),
        height: size(80),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    },
    imgNav: {
        width: size(36),
        height: size(36),
    },
    navbarTitle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    navbarTitleText: {
        fontSize: size(32),
        fontWeight: 'bold',
        color: 'rgba(255,255,255,1)'
    },
    activeBackground: {
        width: size(600),
        height: size(639),
        marginTop: size(182) + (Platform.OS == 'ios' ? 0 : size(148)),
        alignItems: 'center',
        // marginLeft: size(75)
    },
    codeInput: {
        marginTop: size(118),
        backgroundColor: "#FFF",
        width: size(480),
        color: "#595959",
        fontWeight: "bold",
        height: size(80),
        borderRadius: size(5),
        borderWidth: size(1),
        borderColor: 'rgba(89,89,89,1)'
    },
    codeBtn: {
        height: size(60),
        width: size(350),
        marginTop: size(77),
        borderRadius: size(10),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4FA5F4'
    },
    vipText: {
        marginTop: size(133),
        fontSize: size(28),
        fontWeight: '400',
        color: 'rgba(158,122,92,1)'
    },
    resultBackgroundImg: {
        position: 'absolute',
        width: size(500),
        height: size(600),
        top: size(345),
        justifyContent: 'center',
        alignItems: 'center'
    },

    resultContentBackgroundText: {
        marginTop: size(47),
        fontSize: size(28),
        fontWeight: '500',
        color: 'rgba(160,106,75,1)'
    },
    resultContentBackgroundImg: {
        marginTop: size(37),
        width: size(363),
        height: size(337),
        justifyContent: 'center',
        alignItems: 'center'
    },
    resultContentBackgroundBtn: {
        marginTop: size(22),
        width: size(300),
        height: size(60),
        borderRadius: size(30),
        backgroundColor: 'rgba(235,72,52,1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    resultContentBackgroundBtnText: {
        fontSize: size(26),
        fontWeight: '500',
        color: 'rgba(255,250,247,1)'
    },
    resultContentBackgroundImgTop: {
        position: 'absolute',
        top: size(29),
        fontSize: size(24),
        fontWeight: '400',
        color: 'rgba(255,255,255,1)',
    },
    resultContentBackgroundImgBot: {
        position: 'absolute',
        top: size(151),
        fontSize: size(32),
        fontWeight: '500',
        color: 'rgba(255,255,255,1)'
    }
})