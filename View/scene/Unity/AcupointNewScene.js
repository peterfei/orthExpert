import React, {Component} from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
    BackHandler,
    WebView,
    ScrollView,
    TouchableOpacity, BackAndroid, Alert
} from "react-native";
import {screen, ScreenUtil} from "../../common/index";
import Toast from "react-native-easy-toast";
import UnityView from 'react-native-unity-view';
import {size, deviceWidth, deviceHeight} from "../../common/ScreenUtil";
import ActionSheet from "react-native-actionsheet";
import UShare from "../../share/share";
import SharePlatform from "../../share/SharePlatform";
import {addConnect, checkConnect, hexToStr} from "./LCE";
import Comment from "./Comment";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import SearchModel from './SearchModel';
import {VoiceUtils} from "../../common/VoiceUtils";
import {queryRelationBySmName, queryMarkNailByNoun} from '../../realm/RealmManager';
import MyScrollView from './MyScrollView';
import Orientation from 'react-native-orientation';
import Video, {Container} from 'react-native-af-video-player';
import {allTree, bzgdTree} from './acuSearchJson';
import UnityGuideView from './UnityGuideView';

let index = 0;
let unity = UnityView;

const BaseScript =
    `
    (function () {
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
            height = document.body.scrollHeight;
            if (window.postMessage) {
              window.postMessage(JSON.stringify({
                type: 'setHeight',
                height: height,
              }))
            }
          }
        }
        setTimeout(changeHeight, 100);
    } ())
    `

export default class AcupointNewScene extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            relation: [],
            info: this.props.navigation.state.params.info,
            unityWidth: '100%',
            unityHeight: '100%',
            sharePath: null,//分享路径

            unityReady: false,
            isShowSearch: false,
            isConnect: false,
            branshIsOpen: false,   // 当前是否打开画笔
            selectData: '',        // unity选中后传过来的数据
            showSelectBar: false,
            sourceData: [],        // 所有资源数据数组
            currentShowSource: '', // 当前需要展示的资源数据
            showJGList: false,     // 是否展示结构中的列表下拉框, 默认为false
            height: 0,
            showComment: false,    //显示评论窗口
            showTip: false,
            showGuide: false,
            showVideo: false,
            showRnView: true,
            isPro: true
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.androidBackAction);
    }

    /**
     * ui渲染完后的操作
     */
    async componentDidMount() {
        let info = this.state.info;
        this.sendMsgToUnity("app", info, 'json');//发消息给unity

        let isConnect = await checkConnect(info.struct_id);
        this.setState({
            isConnect: isConnect
        })
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.androidBackAction)
    }

    /**
     * web端发送过来的交互消息
     */
    onMessage(event) {
        try {
            const action = JSON.parse(event.nativeEvent.data)
            if (action.type === 'setHeight') {
                this.setState({height: action.height + size(80)})
            }
        } catch (error) {
            // pass
        }
    }

    androidBackAction=()=> {
        if (this.state.showComment) {
            this.setState({
                showComment: false
            })
            return true;
        } else if (this.state.isShowSearch) {
            this.setState({
                isShowSearch: false
            })
            return true;
        } else if (this.state.currentShowSource != '') {
            this.closeSourceView();
            return true;
        }else {
          this.clickBack();
            return true;
        }
    }

    // 从realm中读取详细信息
    async initialSelectData(data) {
        // data为unity发送过来的消息  通过data.ModelName去realm数据库中查询详细信息
        // alert(JSON.stringify(data));
        let realmData = await queryRelationBySmName(data.zhen);
        let listData = [];
        if (realmData != undefined) {
            realmData.forEach(item => {
                listData.push(item);
            })
        }
        // 穴位没有简介
        listData.sort((a, b) => {
            return a.secondSort - b.secondSort;
        })

        this.setState({
            sourceData: listData,
            showSelectBar: true,
            selectData: data,
            currentShowSource: '',
        })
    }

    async initialNewData(data, titleData) {
        data = data.replace("\"","").replace("\"","");
        let realmData = await queryRelationBySmName(data);
        let listData = [];
        if (realmData != undefined) {
            realmData.forEach(item => {
                listData.push(item);
            })
        }

        this.setState({
            sourceData: listData,
            showSelectBar: true,
            selectData: titleData,
            currentShowSource: '',
        })
    }


    /**
     * 接收unity消息
     * @param event
     */
    async onUnityMessage(event) {

        // alert(JSON.stringify(event))
        if (event.name == 'title') { // 模型已加载完毕
            this.setState({
                unityReady: true
            })
        } else if (event.name == 'exit') {
            this.props.navigation.goBack();
        } else if (event.name == 'back') {//返回
            this.back()
        } else if (event.name == 'model') {//点击模型  选中骨骼
            let name = hexToStr(event.data.Chinese);
            this.refs.toast.show(name);

        } else if (event.name == 'ClickBlank') {//点击空白

        } else if (event.name == 'openBrush') {//打开画笔
            this.setState({
                branshIsOpen: true
            })
        } else if (event.name == 'closeBrush') {//关闭画笔
            this.setState({
                branshIsOpen: false
            })
        } else if (event.name == 'share') {//分享
            let path = event.data.PicturePath + "?V=" + new Date();
            this.setState({
                sharePath: Platform.OS == 'ios' ? path : "file:///" + path,
            })
            this.ActionSheet.show();
        } else if (event.name == "acu") {//unity发送穴位信息过来
            //
            let obj = JSON.parse(hexToStr(event.data.AcuMessage));
            this.initialSelectData(obj);
        } else if (event.name == "jiegou") {
            let obj = hexToStr(event.data.jiegoubiaozhi);
            let titleData = {
                name: '',
                code: ''
            }
            let modelName = obj.replace("\"","").replace("\"","");
            let val = bzgdTree.find((val) => {
                return val.modelName == modelName;
            })
            if (val != undefined) {
                titleData.name = val.videoChName;
                // titleData.code = val.videoEnName;
            }
            this.initialNewData(obj, titleData);
        } else if (event.name == "boneSize") {
            let obj = hexToStr(event.data.boneSize);
            let titleData = {
                name: '',
                code: ''
            }
            let modelName = obj.replace("\"","").replace("\"","");
            let val = bzgdTree.find((val) => {
                return val.modelName == modelName;
            })
            if (val != undefined) {
                titleData.name = val.videoChName;
                // titleData.code = val.videoEnName;
            }
            this.initialNewData(obj, titleData);
        } else if (event.name == "clickSearch") {//点击搜索
            this.setState({
                isShowSearch: true
            });
        } else if (event.name == 'reset') { // 重置
            this.setState({
                unityReady: true,
                showComment: false,
                isShowSearch: false,
                branshIsOpen: false,
                selectData: '',
                showSelectBar: false,
                sourceData: [],
                currentShowSource: '',
            })
        } else if (event.name == 'help') {
          this.setState({
            showGuide: true
          })
        } else if (event.name == 'hideUI') {
            this.setState({
                showRnView: false
            })
        } else if (event.name == 'showUI') {
            this.setState({
                showRnView: true
            })
        } else {
            //    alert("接收到unity消息, 但无逻辑处理," + JSON.stringify(event))
        }

    }

    //String imgPath, final int platform, final Callback resultCallback
    sharePress = buttonIndex => {
        if (buttonIndex == 0) return;

        if (buttonIndex == 1) {

            UShare.shareImage(
                this.state.sharePath,
                SharePlatform.WECHAT,
                message => {
                    this.refs.toast.show("分享成功");
                }
            );
        } else if (buttonIndex == 2) {

            UShare.shareImage(
                this.state.sharePath,
                SharePlatform.WECHATMOMENT,
                message => {
                    this.refs.toast.show("分享成功");
                }
            );
        }
    };


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

    // user action
    collectAction() {
        this.setState({
            isConnect: !this.state.isConnect
        })
        addConnect(this.state.info.struct_id);
        // alert('调用收藏接口');
    }

    // 打开评论界面
    commentAction() {
        this.setState({
            showComment: !this.state.showComment
        })
    }

    clickItem() {
        this.closeSearch();
    }

    clickBack() {
        if (this.state.currentShowSource == '') {
            this.setState({
                showTip: true
            })
        } else {
            this.setState({
                currentShowSource : ''
            })
        }
    }

    handleBack(index) {
        this.setState({
            showTip: false
        })
        if (index == 0) {

        } else {
            this.sendMsgToUnity('back', '', '');
            this.props.navigation.goBack();
        }
    }

    initVoice() {
        if (index == 0) {
            VoiceUtils.init(0);
            index++
        }
    }

    fayin(name) {
        name = name.replace("_L", "").replace("_R","").replace("_左", "").replace("_右", "");
        if (Platform.OS != "ios") {
            this.initVoice();
        }
        VoiceUtils.speak(name);
    }

    closeSearch() {
        this.setState({
            isShowSearch: false
        })
    }

    openSearch() {
        this.setState({
            isShowSearch: true
        })
    }

    // 判断当前需要展示的资源类型
    isShowSource(type) {
        if (this.state.currentShowSource.type == undefined) {
            return false;
        }
        return this.state.currentShowSource.type == type;
    }

    // 初始化视图
    _renderDefaultBar() { // 初始化底部默认显示的收藏、评论等
        return (
            <View style={styles.defaultBarStyle}>
                <View style={styles.dbLeftStyle}>
                    <TouchableOpacity style={styles.btnStyle} onPress={() => {
                        this.clickBack()
                    }}>
                        <Image style={styles.btnImgStyle} source={require('../../img/unity/fanhuiyuan.png')}/>
                        <Text style={styles.btnTextStyle}>返回</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.dbRightStyle}>
                    <Text style={styles.dbTitleStyle}>{this.state.info.struct_name}</Text>

                    <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.collectAction()
                    }}>
                        <Image style={styles.btnImgStyle}
                               source={this.state.isConnect ? require('../../img/acuUnity/acu_collect_select.png') : require('../../img/acuUnity/acu_collect.png')}/>
                        <Text style={styles.btnTextStyle}>
                            {this.state.isConnect ? "已收藏" : "收藏"}
                        </Text>
                    </MyTouchableOpacity>
                    <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.commentAction()
                    }}>
                        <Image style={styles.btnImgStyle} source={require('../../img/unity/yijian.png')}/>
                        <Text style={styles.btnTextStyle}>评论</Text>
                    </MyTouchableOpacity>
                </View>
            </View>
        );
    }

    // 初始化选中后的页面展示
    _renderSelectBar() {
        return (
            <View style={{width: '100%'}}>

                {this.isShowSource('html') ? this._renderHtmlSource() : null}
                {this.isShowSource('text') ? this._renderTextSource() : null}
                {this.isShowSource('video') ? this._renderVideoSource() : null}
                {(this.isShowSource('pic') || this.isShowSource('gif')) ? this._renderGifOrPicSource() : null}

                {this.state.currentShowSource == '' ? this._renderSBTitle() : null}
                {this.state.isPro ? this._renderSBBtn() : null}
            </View>
        )
    }

    // 选中后展示的title、语音信息等
    _renderSBTitle() {
        let title = this.state.selectData.name;
        let enTitle = this.state.selectData.code;
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: size(90),
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
            }}>
                <Text style={[styles.dbTitleStyle, {marginLeft: size(20)}]}>{title}</Text>
                <MyTouchableOpacity
                    onPress={() => {
                        this.fayin(title + "。" + enTitle)
                    }}
                    style={{flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: "center"}}>
                    <Image
                        style={{width: size(30), height: size(30), marginRight: size(10)}}
                        source={require('../../img/unity/laba.png')}/>
                    <Text style={{color: "#bababa",}}>{enTitle}</Text>
                </MyTouchableOpacity>
                <MyTouchableOpacity style={{marginRight: size(20), alignItems: 'center'}} onPress={() => {
                    this.commentAction()
                }}>
                    <Image
                        source={require('../../img/unity/yijian.png')}
                        style={{width: size(30), height: size(30)}}/>
                    <Text style={{fontSize: size(18), color: "#FFF"}}>评论</Text>
                </MyTouchableOpacity>
            </View>
        )
    }

    // 选中后的底部功能按钮
    _renderSBBtn() {
        let arr = [];
        arr.push(
            <TouchableOpacity style={styles.btnStyle} onPress={() => {
                this.clickBack()
            }}>
                <Image style={styles.btnImgStyle} source={require('../../img/unity/fanhuiyuan.png')}/>
                <Text style={styles.btnTextStyle}>返回</Text>
            </TouchableOpacity>
        )
        this.state.sourceData.forEach((item, index) => {
            let icon = item.res_fy_icon_url;
            let selectIcon = item.select_icon_url;
            let img = this.state.currentShowSource.rw_id == item.rw_id ? selectIcon : icon;
            let color = this.state.currentShowSource.rw_id == item.rw_id ? '#60ccff' : '#fff';
            let data =
                arr.push(
                    <MyTouchableOpacity style={styles.btnStyle} onPress={() => {
                        this.handleActionSource(item)
                    }} key={index}>
                        <Image style={styles.btnImgStyle} source={{uri: img}}/>
                        <Text style={[styles.btnTextStyle, {color: color}]}>{item.secondFyName}</Text>
                    </MyTouchableOpacity>
                )
        })
        return (
            <View style={{
                flexDirection: 'row',
                height: size(90),
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
            }}>
                {arr}
            </View>
        )
    }

    // 处理渲染哪种类型的资源    /*{*******以下为不同类型的资源展示****}*/
    handleActionSource(source) {
        // alert(111);
        //类型:html:网页,text:文字,video:视频,gif:动态图,pic:其他类型图片,JG:结构 ,BZ:标志(内容为结构名词),内容都在content
        // alert(JSON.stringify(source));
        if (this.state.currentShowSource == source) {
            this.setState({
                currentShowSource: ''
            })
        } else {
            this.setState({
                currentShowSource: source
            })
        }
    }

    // 关闭资源视图
    closeSourceView() {
        if (this.state.currentShowSource.type == 'video') {
            Orientation.lockToPortrait();
            this.setState({
                isPro: true
            })
        }
        this.setState({
            currentShowSource: ''
        })
    }

    // 渲染html类型资源
    _renderHtmlSource() {
        return (
            <View style={styles.htmlSourceStyle}>
                <View style={{
                    height: size(60),
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <MyTouchableOpacity onPress={() => {
                        this.closeSourceView()
                    }}>
                        <Image source={require('../../img/unity/close.png')} style={{
                            width: size(36),
                            height: size(36),
                            marginRight: size(20),
                            resizeMode: 'contain'
                        }}/>
                    </MyTouchableOpacity>
                </View>
                <WebView
                    injectedJavaScript={BaseScript}
                    onMessage={this.onMessage.bind(this)}
                    automaticallyAdjustContentInsets
                    domStorageEnabled
                    javaScriptEnabled
                    decelerationRate='normal'
                    scalesPageToFit={Platform.OS === 'ios' ? true : false}
                    source={{uri: this.state.currentShowSource.content}}
                    startInLoadingState={true}
                    style={{width: '100%', height: this.state.height}}
                    renderError={() => {
                        return <View style={styles.loadWeb}><Text
                            style={{
                                color: "#FFF",
                                alignSelf: "center"
                            }}>
                            资源加载失败!请检查网络设置...
                        </Text></View>

                    }}
                />
            </View>
        )
    }

    // 渲染text类型资源
    _renderTextSource() {
        return (
            <View style={styles.textSourceStyle}>
                <MyTouchableOpacity onPress={() => this.closeSourceView()}>
                    <View style={{
                        width: '100%',
                        height: size(40),
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Image style={{width: size(24), height: size(24), resizeMode: 'contain'}}
                               source={require('../../img/acuUnity/acu_detail_down.png')}/>
                    </View>
                </MyTouchableOpacity>
                <View style={{width: '100%', paddingLeft: size(20),paddingRight:size(20)}}>
                    <Text style={{
                        width: '100%',
                        flexWrap: 'wrap',
                        color: '#fff',
                        fontSize: size(26),
                        backgroundColor: 'rgba(0,0,0,0)'
                    }}>
                        {this.state.currentShowSource.content}
                    </Text>
                </View>

            </View>
        )
    }

    // 渲染video类型资源
    _renderVideoSource() {
        let title = this.state.selectData.name;
        return (
            <View style={styles.videoSourceStyle}>
                <View style={{
                    height: size(60),
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <MyTouchableOpacity onPress={() => {
                        this.closeSourceView()
                    }}>
                        <Image source={require('../../img/unity/close.png')} style={{
                            width: size(36),
                            height: size(36),
                            marginRight: size(20),
                            resizeMode: 'contain'
                        }}/>
                    </MyTouchableOpacity>
                </View>
                <Text style={{marginLeft: size(20), fontSize: size(28), color: 'white', fontWeight: 'bold'}}>{title}</Text>
                <View>
                    <Video
                      rotateToFullScreen
                      lockPortraitOnFsExit
                      scrollBounce
                      url={this.state.currentShowSource.content}
                      ref={(ref) => {
                          this.video = ref
                      }}
                      onError={(msg) => {
                          this.playVideoError(msg)
                      }}
                      onFullScreen={(status) => {
                          status ? this.sendMsgToUnity('landscape', '', '') : this.sendMsgToUnity('portrait', '', '');
                          this.setState({
                              isPro: !status
                          })
                      }}
                    />
                </View>

            </View>
        )
    }

    playVideoError(msg) {
        Alert.alert('', '该视频暂未开放, 敬请期待.', [{ text: '我知道了' }])
        this.setState({
            currentShowSource: ''
        })
    }

    // 渲染gif/pic类型资源
    _renderGifOrPicSource() {
        let sourceURL = this.state.currentShowSource.content;
        return (
          <View style={styles.picOrGifSourceStyle}>
              <View style={{
                  height: size(60),
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
              }}>
                  <MyTouchableOpacity onPress={() => {
                      this.closeSourceView()
                  }}>
                      <Image source={require('../../img/unity/close.png')} style={{
                          width: size(36),
                          height: size(36),
                          marginRight: size(20),
                          resizeMode: 'contain'
                      }}/>
                  </MyTouchableOpacity>
              </View>
              <Image style={{resizeMode: 'contain', width: size(740), height: size(740)}} source={{uri: sourceURL}}/>
          </View>
        )
    }

    // 渲染评论页面
    _renderCommentView() {
        return (
            <View style={{height: '100%', position: 'absolute', bottom: size(0.00001), left: 0, right: 0}}>
                <Comment
                    hideWin={() => {
                        this.setState({showComment: !this.state.showComment})
                    }}
                    navigation={this.props.navigation}
                    currModel={this.state.selectData}
                    info={this.state.info}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)'}}>

                <UnityView
                    ref={(ref) => this.unity = ref}
                    onUnityMessage={this.onUnityMessage.bind(this)}
                    style={{
                        position: 'absolute',
                        height: this.state.unityHeight,
                        width: this.state.unityWidth,
                        top: 0,
                        bottom: size(0.01),
                        left: 0,
                        right: 0,

                    }}
                />
                <View style={{
                    backgroundColor: "#525252", width: '100%', height: size(0.0001),
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                }}>
                </View>


                {this.state.unityReady ?
                    <View style={[styles.rnView, {left: this.state.showRnView ? 0 : -deviceWidth*0.99}]}>
                        {/****  选中骨骼后的底部条 || 默认展示的底部条  *****/}
                        {this.state.showSelectBar && !this.state.branshIsOpen ? this._renderSelectBar() : this._renderDefaultBar()}
                    </View>
                    : <View style={{
                        width: size(10),
                        position: 'absolute',
                        bottom: 0,
                        height: size(10),
                        backgroundColor: "#FFF",
                        left: 0,
                    }}/>}

                {/****  评论  *****/}
                {this.state.showComment && !this.state.branshIsOpen ? this._renderCommentView() : null}

                {/****  搜索窗口  *****/}
                {this.state.isShowSearch ?
                    <SearchModel
                        sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)}
                        searchArea={this.state.info.struct_name}
                        closeSearch={() => this.closeSearch()}
                        clickItem={() => this.clickItem()}
                    />
                    : null}


                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    title={"将截屏分享到"}
                    options={["取消", "微信好友", "微信朋友圈"]}
                    cancelButtonIndex={0}
                    // destructiveButtonIndex={2}
                    onPress={this.sharePress}
                />

                {this.state.showTip ?
                  <View style={{position: 'absolute', bottom: 0,left: 0, right: 0, top: 0,
                      backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'}}>
                      <View style={{backgroundColor: 'white', borderRadius: size(20), width: '70%', alignItems: 'center'}}>
                          <Text style={{height: size(60), lineHeight: size(60)}}>是否要退出到维萨里骨科平台?</Text>
                          <MyTouchableOpacity style={[styles.shareBtnStyle, {marginTop: size(20)}]} onPress={() => {this.handleBack(1)}}>
                              <Text style={styles.shareTextStyle}>
                                  确定
                              </Text>
                          </MyTouchableOpacity>
                          <MyTouchableOpacity
                              style={{width:'100%',height: size(60), marginTop: size(10), marginBottom: size(10), alignItems: 'center'}}
                              onPress={() => {
                                  this.handleBack(0)
                              }}>
                              <Text style={{height: size(60), lineHeight: size(60), flex:1}}>取消</Text>
                          </MyTouchableOpacity>
                      </View>
                  </View> : null
                }

                {
                    this.state.showGuide ?
                      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                          backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 9999}}>
                          <UnityGuideView
                            closeAction={() => {this.setState({showGuide: false})}}
                            btnAction={() => {this.setState({showVideo: true})}}
                            navigation={this.props.navigation}/>
                      </View>
                      :
                      null
                }

              {
                this.state.showVideo ?
                  <Video
                    style={{width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, zIndex : 99998}}
                    autoPlay
                    lockPortraitOnFsExit
                    scrollBounce
                    inlineOnly={true}
                    url={'http://filetest1.vesal.site/jiepao/help/video/instructions.mp4'}
                    onError={(msg) => {
                      this.playVideoError(msg)
                    }}
                  />
                  :
                  null
              }

              {
                this.state.showVideo
                  ?
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({showVideo: false})
                    }}
                    style={{
                      position: 'absolute',
                      right: size(20),
                      top: size(20),
                      width: size(88),
                      height: size(88),
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 99999
                    }}>
                    <Image source={require('../../img/unity/close.png')}
                           style={{width: size(48), height: size(48)}}/>
                  </TouchableOpacity>
                  :
                  null
              }

                <Toast ref="toast" opacity={0.5} position='top' positionValue={100} fadeInDuration={0}
                       fadeOutDuration={200}/>
            </View>

        );
    }


}

/**
 * styles
 */
const styles = StyleSheet.create({

    container: {
        backgroundColor: '#60ccff',
    },
    rnView: {
        width: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        bottom: size(-0.01),
        left: 0,
    },
    defaultBarStyle: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
        height: size(90),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dbLeftStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    dbRightStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%'
    },
    btnStyle: {
        width: size(90),
        height: size(90),
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnImgStyle: {
        width: size(35),
        height: size(35),
        resizeMode: 'contain',
    },
    btnTextStyle: {
        textAlign: "center",
        fontSize: size(16),
        color: "#FFF",
        marginTop: size(8),
        alignSelf: "center",
    },
    dbTitleStyle: {
        fontSize: size(28),
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    selectBarStyle: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
    },
    htmlSourceStyle: {
        width: '100%',
        height: size(800),
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden'
    },
    videoSourceStyle: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
        flex: 1
    },
    textSourceStyle: {
        width: '100%',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
        flex: 1
    },
    picOrGifSourceStyle: {
        width: '100%',
        height: size(800),
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtnStyle: {
        backgroundColor: '#60ccff',
        width: '80%',
        height: size(80),
        alignItems: 'center',
        borderRadius: size(20)
    },
    shareTextStyle: {
        color: 'white',
        height: size(80),
        lineHeight: size(80),
        fontSize: size(26),

    }
});



