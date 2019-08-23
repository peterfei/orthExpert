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
    Platform
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
            amList: [],
            showImage: false,
            showMenu: true,
            base64: ''
        }
    }

    async componentDidMount() {
        let memberInfo = await storage.get("memberInfo")
        let planInfo = this.props.navigation.state.params.planInfo;
        // alert(JSON.stringify(planInfo));
        let url = NetInterface.getShareQR + `?planId= ${planInfo.plan_id}`
        HttpTool.GET(url)
            .then(res => {
                this.setState({
                    base64: res.base64
                })
            })
            .catch(err => this.mainView._toast(JSON.stringify(error)))
        let resAmList = this.props.navigation.state.params.amList
        this.setState({
            planInfo: planInfo,
            amList: resAmList.splice(0, 3),
            memberInfo: memberInfo
        })
    }

    _renderHeader() {
        let planName = ''
        let desc = ''
        let uri = {uri: ''}

        if (this.state.planInfo) {
            planName = this.state.planInfo.plan_name;
            desc = this.state.planInfo.description;
            uri = {uri: this.state.planInfo.icon2_url};
        }

        return (
            <ImageBackground style={styles.bannerImg} source={uri}>
                <Text style={[styles.bannerImgText, styles.bannerImgSharer]}>{this.state.memberInfo.mbName} 为你推送了：</Text>
                <Text style={[styles.bannerImgText, styles.bannerImgPlanName]}>{this.state.planInfo.plan_name}</Text>
                <Text style={[styles.bannerImgText, styles.bannerImgPlanDetails]}>{this.state.planInfo.label_a}</Text>
            </ImageBackground>
        )
    }

    _renderSchemeList() {
        return (
            <View style={styles.amList}>
                <FlatList
                    data={this.state.amList}
                    keyExtractor={(item, index) => index}
                    renderItem={this._renderSchemeItem}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        )
    }

    _renderSchemeItem = ({item}) => {
        return (
            <View style={styles.amItem}>
                <ImageBackground style={styles.amItemImage} source={{uri: item.icon_url}}/>
                <View>
                    <Text style={styles.amItemText}>{item.am_ch_name}</Text>
                </View>
            </View>
        )
    }

    _renderShareQRCode() {
        return (
            <ImageBackground source={require('../../img/home/planQRCodeBackground.png')}
                             style={styles.qrCodeBackground}>
                <Image source={{uri: this.state.base64}} style={styles.qrCode}/>
                <Text style={styles.qrCodeTips}>打开【运动康复训练】扫一扫，即刻加入计划</Text>
            </ImageBackground>
        )
    }

    _renderBottom() {
        return (
            <View style={styles.bottoms}>
                <Text style={styles.bottomsTip}>没有运动康复训练？</Text>
                <Text style={styles.bottomsTip1}>1.医用商城搜索“运动康复训练”即可下载</Text>
                <Text style={styles.bottomsTip2}></Text>
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
                height: size(240),
                backgroundColor: "#f4f4f4", borderTopLeftRadius: size(10), borderTopRightRadius: size(10),
                borderTopColor: "#c8c8c8", borderTopWidth: size(1)
            }}>
                <View style={{
                    flexDirection: "row",
                    marginTop: size(20),
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

                <TouchableOpacity
                    style={{alignItems: "center", width: '100%', height: size(150), justifyContent: "center"}}
                    onPress={() => {
                        this.props.navigation.goBack()
                    }}>
                    <Text>取&nbsp;消&nbsp;分&nbsp;享</Text>
                </TouchableOpacity>
            </View>
        )
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}></View>
        )
    }

    _renderBottomBlank() {
        return (
            <View style={{height: size(240)}} />
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
                <ScrollView
                  ref='full'
                  showsVerticalScrollIndicator={false}
                  style={{flex: 1}}
                >
                    {this._renderHeader()}
                    {this._renderSeparator()}
                    <ImageBackground source={require('../../img/home/planShareBackground.png')}
                                     style={styles.bot}>
                        {this._renderSchemeList()}
                        {this._renderShareQRCode()}
                        {this._renderBottom()}
                    </ImageBackground>
                    {/*{this.state.showMenu ? this._renderBottomBlank() : null}*/}
                </ScrollView>
                {this.state.showMenu ? this._renderBotShare() : null}
            </ContainerView>
        )
    }

}

const styles = StyleSheet.create({
    scrollViewContainer: {},
    bannerImg: {
        width: '100%',
        height: size(300) + isIPhoneXPaddTop(0),
    },
    bannerImgText: {
        position: 'absolute',
        left: size(25),
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    bannerImgSharer: {
        top: size(76),
        fontSize: size(28),
    },
    bannerImgPlanName: {
        top: size(143),
        fontSize: size(38),
    },
    bannerImgPlanDetails: {
        top: size(204),
        fontSize: size(20),
        right: size(40)
    },
    separator: {
        height: size(20),
        backgroundColor: 'rgba(244,244,244,1)'
    },
    amList: {
        height: size(200),
        marginLeft: size(4),
        marginRight: size(4),
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    amItem: {
        marginTop: size(30),
        width: size(170),
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
        color: 'rgba(104,104,104,1)',
    },
    amItemBotText: {
        marginTop: size(22)
    },
    bot: {
        height: size(950)
    },
    qrCodeBackground: {
        height: size(421),
        marginTop: size(38),
        alignItems: 'center',
    },
    qrCode: {
        position: 'absolute',
        top: size(56),
        borderColor: '#979797',
        borderWidth: size(1),
        borderRadius: size(10),
        height: size(232),
        width: size(232)
    },
    qrCodeTips: {
        position: 'absolute',
        bottom: size(20),
        fontWeight: 'bold',

    },
    bottoms: {
        marginTop: size(40),
        paddingLeft: size(40),
    },
    bottomsTip: {
        fontSize: size(33),
        fontWeight: 'bold',
        color: 'rgba(90,89,89,1)',
    },
    bottomsTip1: {
        marginTop: size(35),
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