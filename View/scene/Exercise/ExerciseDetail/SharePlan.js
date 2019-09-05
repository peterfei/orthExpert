import React from "react";
import ViewShot, {captureScreen, captureRef} from "react-native-view-shot";
import {
    Button,
    WebView,
    DeviceEventEmitter,
    Image,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Platform,
    Dimensions
} from "react-native";
import {NetInterface,HttpTool} from "../../../common"
import {size} from "../../../common/Tool/ScreenUtil";
import UShare from "../../../share/share";
import SharePlatform from "../../../share/SharePlatform";
import Toast from "react-native-easy-toast";
import {storage} from "../../../common/storage";
import Loading from "../../../common/Loading";

const jsForInjection = `
  var el = document.getElementsByTagName('body')[0];
  el.style.height = '${Dimensions.get('window').height}px';
`
export default class SharePlan extends React.Component {

    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            showShare: this.props.showShare,
            planName: this.props.planName,
            planId: this.props.planId,
            shareUrl: "",
            showMenu: true,
            Imageuri: ""
        };
    }

    componentWillMount() {

    }

    startShare(Imageuri, type) {

        this.setState({
            showShare: false,
            showMenu: true
        });
        this.props.closeShare()
        let appName = "维萨里健身";
        let title = "我正在维萨里健身训练#" + this.state.planName + "#,邀请你一起来挑战!";
        let openUrl = this.state.shareUrl;
        let icon = "http://fileprod.vesal.site/upload/vesaliicon/v1/ic_launcher.png";

        if (type == 'hy') {

            UShare.shareImage(
                Imageuri,
                SharePlatform.WECHAT,
                message => {
                    this.refs.toast.show("分享成功");

                }
            );

            /*  UShare.share(
                  appName,
                  title,
                  openUrl,//openUri
                  icon,//icon
                  SharePlatform.WECHAT,
                  message => {
                      if (Platform.OS == 'ios') {
                          this.refs.toast.show(message, 300);
                      } else {
                          this.refs.toast.show("分享成功");
                      }
                  }
              );*/
        } else if (type == 'pyq') {
            UShare.shareImage(
                Imageuri,
                SharePlatform.WECHATMOMENT,
                message => {
                    this.refs.toast.show("分享成功");

                }
            );

            /*  UShare.share(
                  appName,
                  title,
                  openUrl,
                  icon,
                  SharePlatform.WECHATMOMENT,
                  message => {
                      if (Platform.OS == 'ios') {
                          this.refs.toast.show(message, 300);
                      } else {
                          this.refs.toast.show("分享成功");
                      }
                  }
              );*/
        }
    }

    async toPlatform(type) {

        await this.setState({
            showMenu: false
        })

        captureScreen({
            format: "jpg",
            quality: 1
        }).then(
            uri => {
                let Imageuri = (uri.toLowerCase()).includes('file://') ? uri : 'file://' + uri//判断是否有file://，没有则添加
                this.setState({
                    Imageuri: Imageuri
                })
                this.startShare(Imageuri, type);
            },
            error => console.log("Oops, snapshot failed==" + error)
        );
    }

    gotoShare(base64, mbName, planNo, planName) {


        let openUrl = "http://slb-sport.vesal.cn/share/index.html?DT=" + base64 + "&userName=" + mbName + "&PID=" + planNo;
        this.setState({
            shareUrl: openUrl,
            planName: planName
        })

    }

    async share() {
        //获取二维码base64
        let url = NetInterface.gk_getShareQR + '?planId=' + this.state.planId;
        let memberInfo = await storage.get("memberInfo");
        let mbName = encodeURI(memberInfo.mbName);
        try {
            this.Loading.show('请稍等...')
            HttpTool.GET_JP(url)
                .then(result => {
                    this.Loading.close()
                    if (result.code == 0) {
                        this.gotoShare(result.base64, mbName, result.plan.planNo, result.plan.planName)
                    }
                });
        } catch (error) {
            this.Loading.close()
        }


    }


    componentWillReceiveProps(nextProps) {
        //点击了分享
        if (nextProps.showShare) {
            if (this.state.shareUrl == '') {
                //生产分享链接
                this.share()
            } else {

            }

        }

        this.setState({
            showShare: nextProps.showShare,
            planName: nextProps.planName,
            showMenu: true
        });
    }

    render() {

        return this.state.showShare ?
            (
                <View
                    style={{
                        position: 'absolute',
                        bottom: size(0.00001),
                        left: 0,
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(52,52,52,0.5)",
                        zIndex:100000
                    }}>
                    {/*    {this.state.Imageuri != '' ? <Image   resizeMode="cover" source={{uri: this.state.Imageuri}}
                                                        style={{width: '100%', height: '100%'}}/> : null}*/}
                    <View
                        ref="webWin"
                        style={{width: "100%", marginTop: size(48), height: '99%',}}>
                        <WebView
                            source={{uri: this.state.shareUrl, method: 'GET'}}
                            scalesPageToFit={false}
                            style={{width: '100%'}}
                            injectedJavaScript={jsForInjection}/>
                    </View>
                    {this.state.showMenu ? <View style={{
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
                                <Image source={require('../../../img/weixin/wexin-haoyou.png')}
                                       style={{width: size(60), height: size(60)}}/>
                                <Text>微信好友</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.toPlatform('pyq')
                                }}
                                style={{flex: 1, alignItems: "center"}}>
                                <Image source={require('../../../img/weixin/weixin-pyq.png')}
                                       style={{width: size(60), height: size(60)}}/>
                                <Text>微信朋友圈</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={{alignItems: "center", width: '100%', height: size(150), justifyContent: "center"}}
                            onPress={() => {
                                this.props.closeShare()
                            }}>
                            <Text>取&nbsp;消&nbsp;分&nbsp;享</Text>
                        </TouchableOpacity>

                    </View> : null}
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
                </View>
            ) : <Toast
                ref="toast"
                position="top"
                positionValue={200}
                fadeInDuration={750}
                fadeOutDuration={1000}
                opacity={0.8}
            />;
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1
    }


});
