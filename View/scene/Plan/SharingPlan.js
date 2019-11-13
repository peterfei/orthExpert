import React, {Component} from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform, Dimensions
} from "react-native";
import {
    ContainerView,
    isIPhoneXPaddTop,
    size,
    NetInterface,
    HttpTool,
    deviceWidth,
    deviceHeight
} from '../../common';
import {storage} from "../../common/storage";
import {captureScreen} from "react-native-view-shot";

// 调用原生分享
const UShare = NativeModules.sharemodule
const SharePlatform = {
    QQ: 0,
    SINA: 1,
    WECHAT: 2,
    WECHATMOMENT: 3
}

export default class SharingPlan extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props)
        this.state = {
            planInfo: {},
            memberInfo: {},
            resAmList: [],
            showImage: false,
            showMenu: true,
            base64: ''
        }
    }

    async componentDidMount() {
        this.mainView._showLoading('加载中...')
        let memberInfo = await storage.get("memberInfo")
        let auth = await storage.get('auth')
        let userName = auth.userName||Device.getUniqueID()
        let loginType = auth.loginType||'tell';
        let planInfo = this.props.navigation.state.params.planInfo;
        let url = NetInterface.gk_getShareQR + `?planId= ${planInfo.plan_id}&userName=${userName}&loginType=${loginType}`
        HttpTool.GET(url)
            .then(res => {
                this.mainView._closeLoading()
                this.setState({
                    base64: res.base64
                })
            })
            .catch(err => this.mainView._toast(JSON.stringify(error)))
        let resAmList = this.props.navigation.state.params.amList
        this.setState({
            planInfo: planInfo,
            resAmList: resAmList.slice(0,3),
            memberInfo: memberInfo
        })
    }

    _renderHeader() {
        let uri = {uri: ''}

        if (this.state.planInfo) {
            uri = {uri: this.state.planInfo.icon2_url};
        }

        return (
            <ImageBackground style={styles.bannerImg} source={uri}>
                {this.state.showMenu
                    ? <TouchableOpacity onPress={() => {this.props.navigation.goBack()}} style={[styles.bannerImgText, {width: size(50), height: size(35), top: size(78)}]}>
                        <Image style={styles.bannerImgBack} source={require('../../img/home/home_share_fanhui.png')} />
                    </TouchableOpacity>
                    : null
                }
                <Text style={[styles.bannerImgText, styles.bannerImgSharer]}>{this.state.memberInfo.mbName} 为你推送了：</Text>
                <Text style={[styles.bannerImgText, styles.bannerImgPlanName]}>{this.state.planInfo.plan_name}</Text>
                <Text style={[styles.bannerImgText, styles.bannerImgPlanDetails]}>{this.state.planInfo.label_a}</Text>
            </ImageBackground>
        )
    }

    _renderSchemeList() {
        let list = []
        this.state.resAmList.forEach(item => {
            list.push(this._renderSchemeItem(item))
        })
        return (
            <View style={styles.amList}>
                {list}
            </View>
        )
    }

    _renderSchemeItem = (item) => {
        return (
            <View style={styles.amItem}>
                <ImageBackground style={styles.amItemImage} source={{uri: item.icon_url}}/>
                <View>
                    <Text numberOfLines={1} style={styles.amItemText}>{item.am_ch_name}</Text>
                </View>
            </View>
        )
    }

    _renderShareQRCode() {
        return (
            <ImageBackground source={require('../../img/home/planQRCodeBackground.png')}
                             style={styles.qrCodeBackground}>
                <Image source={{uri: this.state.base64}} style={styles.qrCode}/>
                <Text style={styles.qrCodeTips}>打开【微信】扫一扫，'我的方案'中即可参与方案训练</Text>
            </ImageBackground>
        )
    }

    _renderBottom() {
        return (
            <View style={styles.bottoms}>
                <Text style={styles.bottomsTip}>没有运动康复训练？</Text>
                <Text style={styles.bottomsTip1}>1.应用商店搜索<Text style={{color: '#72B7EC'}}>“运动康复训练”</Text>即可下载</Text>
            </View>
        )
    }

    _renderBotShare() {
        return (
            <View style={{
                position: 'absolute',
                bottom: size(0.00001),
                left: 0,
                right: 0,
                height: size(180),
                backgroundColor: "rgba(0,0,0,0)"
            }}>
                <View style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.toPlatform('hy')
                        }}
                        style={{flex: 1, alignItems: "center"}}>
                        <Image source={require('../../img/weixin/wexin-haoyou.png')}
                               style={{width: size(60), height: size(60)}}/>
                        <Text>微信好友</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            this.toPlatform('pyq')
                        }}
                        style={{flex: 1, alignItems: "center"}}>
                        <Image source={require('../../img/weixin/weixin-pyq.png')}
                               style={{width: size(60), height: size(60)}}/>
                        <Text>微信朋友圈</Text>
                    </TouchableOpacity>
                </View>

                {/*<TouchableOpacity*/}
                {/*    style={{alignItems: "center", width: '100%', height: size(150), justifyContent: "center"}}*/}
                {/*    onPress={() => {*/}
                {/*        this.props.navigation.goBack()*/}
                {/*    }}>*/}
                {/*    <Text>取&nbsp;消&nbsp;分&nbsp;享</Text>*/}
                {/*</TouchableOpacity>*/}
            </View>
        )
    }

    toPlatform(type) {

        this.setState({
            showMenu: false
        }, () => {
            captureScreen({
                format: "png",
                quality: 1,
                width: deviceWidth,
                height: deviceHeight
            }).then(
                uri => {
                    let Imageuri = '';
                    if (Platform.OS == 'ios') {
                        Imageuri = uri;
                    } else {
                        Imageuri = (uri.toLowerCase()).includes('file://') ? uri : 'file://' + uri;
                    }

                    this.setState({
                        Imageuri: Imageuri,
                        showImage: true,
                        showMenu: true
                    }, () => {
                        this.startShare(Imageuri, type);
                    })
                },
                error => console.log("Oops, snapshot failed==" + error)
            );
        })

    }

    startShare(Imageuri, type) {
        if (type == 'hy') {
            UShare.shareImage(
                Imageuri,
                SharePlatform.WECHAT,
                message => {
                    this.mainView._toast(message);
                }
            );

        } else if (type == 'pyq') {
            UShare.shareImage(
                Imageuri,
                SharePlatform.WECHATMOMENT,
                message => {
                    this.mainView._toast(message);
                }
            );
        }
    }

    render() {
        return (
            <ContainerView ref={r => this.mainView = r}>
                <View style={{flex: 1}}>
                    {this._renderHeader()}
                    {this._renderSchemeList()}
                    {this._renderShareQRCode()}

                    <ImageBackground source={require('../../img/home/planShareBottom.png')} style={styles.bot} />
                    {/*<ImageBackground source={require('../../img/home/planShareBackground.png')}*/}
                    {/*                 style={styles.bot} resizeMode={'cover'}>*/}
                    {/*    */}
                    {/*</ImageBackground>*/}
                    {/*{this.state.showMenu ? this._renderBottomBlank() : null}*/}
                    {this.state.showMenu ? this._renderBotShare() : null}
                </View>
            </ContainerView>
        )
    }

}

const styles = StyleSheet.create({
    scrollViewContainer: {},
    bannerImg: {
        // flex: 0.252,
        width: '100%',
        minHeight: size(350) + isIPhoneXPaddTop(0),
    },
    bannerImgText: {
        position: 'absolute',
        left: size(25),
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    bannerImgBack: {
        width: size(36),
        height: size(28)
    },
    bannerImgSharer: {
        top: size(166),
        fontSize: size(28),
    },
    bannerImgPlanName: {
        top: size(223),
        fontSize: size(38),
    },
    bannerImgPlanDetails: {
        top: size(284),
        fontSize: size(20),
        right: size(40)
    },
    separator: {
        height: size(20),
        backgroundColor: 'rgba(244,244,244,1)'
    },
    amList: {
        // flex: 0.161,
        height: size(224),
        marginLeft: size(4),
        marginRight: size(4),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    amItem: {
        marginLeft: size(38),
        marginRight: size(38),
        alignItems: 'center'
    },
    amItemImage: {
        height: size(130),
        width: size(170),
    },
    amItemText: {
        fontSize: size(24),
        fontWeight: 'bold',
        marginTop: size(10),
        width: size(170),
        color: 'rgba(104,104,104,1)',
        textAlign:'center'
    },
    amItemBotText: {
        marginTop: size(22)
    },
    bot: {
        flex: 1,
        // height: size(250),
        width: deviceWidth
    },
    qrCodeBackground: {
        height: size(488),
        alignItems: 'center',
    },
    qrCode: {
        // flex: 0.461,
        position: 'absolute',
        top: size(96),
        borderColor: '#979797',
        borderWidth: size(1),
        borderRadius: size(10),
        height: size(232),
        width: size(232)
    },
    qrCodeTips: {
        position: 'absolute',
        top: size(400),
        fontWeight: 'bold',

    },
    bottoms: {
        height: size(80),
        paddingLeft: size(40),
    },
    bottomsTip: {
        marginTop: size(10),
        fontSize: size(33),
        fontWeight: 'bold',
        color: 'rgba(90,89,89,1)',
    },
    bottomsTip1: {
        marginTop: size(19),
        fontSize: size(27),
        fontWeight: 'bold',
        color: 'rgba(90,89,89,1)'
    },
    bottomsTip2: {
        marginTop: size(26),
        fontSize: size(27),
        fontWeight: 'bold',
        color: 'rgba(90,89,89,1)'
    }
});