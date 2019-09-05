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
    TouchableOpacity, Alert
} from "react-native";
import {screen, ScreenUtil} from "../../common/index";
import Toast from "react-native-easy-toast";
import UnityView from 'react-native-unity-view';
import {size, deviceWidth, deviceHeight} from "../../common/ScreenUtil";
import ActionSheet from "react-native-actionsheet";
import UShare from "../../share/share";
import SharePlatform from "../../share/SharePlatform";
import {checkConnect, hexToStr, addConnect} from "./LCE";
import Comment from "./Comment";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import {VoiceUtils} from "../../common/VoiceUtils";
import {queryRelationBySmName, queryMarkNailByNoun} from '../../realm/RealmManager';
import Orientation from 'react-native-orientation';
import Video, {Container} from 'react-native-af-video-player';
import SearchTrigger from "./SearchTrigger";
import {bzgdTree} from "./acuSearchJson";
import UnityGuideView from './UnityGuideView';
import {allTriggerList} from './TriggerData';
import {isUndefinedVal} from '../../common/fun';
import HtmlUSView from './Components/HtmlUSView';
import TextUSView from './Components/TextUSView';
import VideoUSView from './Components/VideoUSView';
import PhotoUSView from './Components/PhotoUSView';


let index = 0;

export default class TriggerScene extends Component {

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
            isShowSearch: this.props.navigation.state.params.info.signModelName != undefined ? false : true,
            isConnect: false,
            branshIsOpen: false, // 当前是否打开画笔
            selectData: '',   // unity选中后传过来的数据
            showSelectBar: false,
            sourceData: [],  // 所有资源数据数组
            currentShowSource: '', // 当前需要展示的资源数据
            height: 0,
            showComment: false,  //显示评论窗口
            triggerList: [],
            showTip: false,
            showGuide: false,
            showVideo: false,
            showRnView: true,
            otherData: [],
            showArea: false,
            isZZ: false,
            zzTitle: '',
            isPro: true
        }
    }


    /**
     * ui渲染完后的操作
     */
    async componentDidMount() {
        let info = this.state.info;
        this.sendMsgToUnity("app", info, 'json');//发消息给unity
        // alert(JSON.stringify(info));
        // console.log(JSON.stringify(info));

        let isConnect = await checkConnect(info.struct_id);
        let triggerList = this.findTrigger(info.app_id);
        this.setState({
            isConnect: isConnect,
            triggerList: triggerList
        })

        if (info.isZZ) {
            this.setState({
                isZZ: true,
                zzTitle: info.zzTitle,
                otherData: info.otherData,
                showArea: true
            })
        }
    }

    // 遍历解析Json
    findTrigger(appId) {
        let arr = []
        // 循环所有键
        let jsonObj = allTriggerList;
        let info = this.state.info;
        if (info.signModelName != undefined) {
            let listData = this.state.info.signModelName.split(',');
            for (let key in jsonObj) {
                //如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
                let element = jsonObj[key];
                let listHasVal = listData.find((val) => {
                    return val == element.trigger_no;
                })
                if (element.noun_no == appId && listHasVal != undefined) {
                    element.trigger_no = element.trigger_no.replace("_L", "").replace("_R", "") + '_L';
                    element.ch_name = element.ch_name.replace(//g, "足拇");
                    arr.push(element)
                }
            }
        } else {
            for (let key in jsonObj) {
                //如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
                let element = jsonObj[key];
                if (element.noun_no == appId) {
                    element.trigger_no = element.trigger_no.replace("_L", "").replace("_R", "") + '_L';
                    element.ch_name = element.ch_name.replace(//g, "足拇");
                    arr.push(element)
                }
            }
        }
        return arr;
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.androidBackAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.androidBackAction);
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

    androidBackAction = () => {
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
        } else {
            this.clickBack();
            return true;
        }
    }

    // 从realm中读取详细信息
    async initialSelectData(data) {
        // data为unity发送过来的消息  通过data.ModelName去realm数据库中查询详细信息
        // alert(JSON.stringify(data));

        let newData = hexToStr(data.CFDMessage);
        newData = JSON.parse(newData);


        let triggerNO = newData.trigger_no.replace("_L", "");
        let realmData = await queryRelationBySmName(triggerNO);
        let listData = [];
        if (realmData != undefined) {
            realmData.forEach(item => {
                listData.push(item);
            })
        }
        // alert(JSON.stringify(listData));
        listData.sort((a, b) => {
            return a.secondSort - b.secondSort;
        })

        // 选择模型后, 重置所有ui显示需要的属性
        this.setState({
            sourceData: listData,
            showSelectBar: true,
            selectData: newData,
            currentShowSource: '',
        })

    }


    /**
     * 接收unity消息
     * @param event
     */
    async onUnityMessage(event) {
        //alert(JSON.stringify(event))
        if (event.name == 'title') { // 模型已加载完毕
            this.setState({
                unityReady: true
            })
        } else if (event.name == 'exit') {
            this.props.navigation.goBack();
        } else if (event.name == 'back') {//返回
            this.back()
        } else if (event.name == 'cfd') {//点击模型  选中骨骼
            // alert(event);
            this.initialSelectData(event.data);
        } else if (event.name == 'model') {
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
        } else if (event.name == "clickSearch") {//点击搜索
            //this.refs.toast.show("请稍等...");
            this.setState({
                isShowSearch: true
            });
        } else if (event.name == 'reset') { // 重置

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

    // shouldComponentUpdate(nextProps, nextState) {
    //     alert(JSON.stringify(nextState));
    // }

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
                currentShowSource: ''
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
        name = name.replace("_L", "").replace("_R", "").replace("_左", "").replace("_右", "").replace("TP_", "").replace("_", " ").replace(//g, "足拇");
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
        if (isUndefinedVal(this.state.currentShowSource.type)) {
            return false;
        }
        return this.state.currentShowSource.type == type;
    }

    // 初始化视图
    _renderDefaultBar() { // 初始化底部默认显示的收藏、评论等
        // alert(111)
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
        // alert(2222)
        return (
            <View style={{width: '100%'}}>

                {this.isShowSource('html') ? this._renderHtmlSource() : null}
                {this.isShowSource('text') ? this._renderTextSource() : null}
                {(this.isShowSource('pic') || this.isShowSource('gif')) ? this._renderGifOrPicSource() : null}
                {this.isShowSource('video') ? this._renderVideoSource() : null}

                {
                    isUndefinedVal(this.state.currentShowSource.type)
                      ?
                      null
                      :
                      <View style={{width: '100%', height: size(2), backgroundColor: 'rgba(34,34,34,1)'}}/>
                }
                {this.state.currentShowSource == '' ? this._renderSBTitle() : null}
                {this.state.isPro ? this._renderSBBtn() : null}
            </View>
        )
    }

    // 选中骨骼后展示的title、语音信息等
    _renderSBTitle() {
        let title = (this.state.selectData.ch_name + "").replace(//g, "足拇");
        let enTitle = this.state.selectData.en_name;
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: size(60),
                alignItems: 'center',
            }}>
                <Text style={[styles.dbTitleStyle, {marginLeft: size(20), color: "#02BAE6"}]}>{title}</Text>
                <MyTouchableOpacity
                    onPress={() => {
                        this.fayin(title + "。" + enTitle)
                    }}
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: size(30),
                        marginRight: size(30)
                    }}>
                    <Image
                        style={{width: size(30), height: size(30), marginRight: size(5)}}
                        source={require('../../img/unity/laba.png')}/>
                    <Text numberOfLines={1} style={{color: "#bababa", width: size(200)}}>{enTitle}</Text>
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

    // 选中骨骼后的底部功能按钮
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
            let rwId = this.state.currentShowSource.rw_id == undefined ? '' : this.state.currentShowSource.rw_id;
            let color = rwId == item.rw_id ? '#60ccff' : '#fff';
            let data =
                arr.push(
                    <MyTouchableOpacity style={styles.btnStyle} onPress={() => {
                        this.handleActionSource(item)
                    }} key={index}>
                        <Image style={[styles.btnImgStyle, {tintColor: color}]} source={{uri: icon}}/>
                        <Text style={[styles.btnTextStyle, {color: color}]}>{item.secondFyName}</Text>
                    </MyTouchableOpacity>
                )
        })
        return (
            <View style={{
                flexDirection: 'row',
                height: size(90),
                alignItems: 'center',
            }}>
                {arr}
            </View>
        )
    }

    // 处理渲染哪种类型的资源    /*{*******以下为不同类型的资源展示****}*/
    handleActionSource(source) {
        // alert(111);
        //类型:html:网页,text:文字,video:视频,gif:动态图,pic:其他类型图片,JG:结构 ,BZ:标志(内容为结构名词),内容都在content
        if (this.state.currentShowSource == source) {
            this.setState({
                currentShowSource: '',
                showArea: false,
                isZZ: this.state.otherData && this.state.otherData.length > 0 ? true : false
            })
        } else {
            this.setState({
                currentShowSource: source,
                showArea: false,
                isZZ: false
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
            currentShowSource: '',
            isZZ: this.state.otherData && this.state.otherData.length > 0 ? true : false,
        })
    }

    // 渲染html类型资源
    _renderHtmlSource() {
        return (
          <HtmlUSView source={this.state.currentShowSource} onClose={() => {this.closeSourceView()}}/>
        )
    }

    // 渲染text类型资源
    _renderTextSource() {
        return (
          <TextUSView source={this.state.currentShowSource} onClose={() => {this.closeSourceView()}}/>
        )
    }

    // 渲染video类型资源
    _renderVideoSource() {
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
                    status ?this.sendMsgToUnity('landscape', '', '') : this.sendMsgToUnity('portrait', '', '');
                    this.setState({
                        isPro: !status
                    })
                }}
              />
          </View>
        )
    }

    playVideoError(msg) {
        Alert.alert('', '该视频暂未开放, 敬请期待.', [{text: '我知道了'}])
        this.setState({
            currentShowSource: ''
        })
    }

    // 渲染gif/pic类型资源
    _renderGifOrPicSource() {
        return (
          <PhotoUSView source={this.state.currentShowSource} onClose={() => {this.closeSourceView()}}/>
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

    showChooseArea() {
        this.setState({
            showArea: !this.state.showArea
        })
    }

    selectTrigger(item) {
        let trigger_no = item.trigger_no.replace("_L", "").replace("_R", "") + "_L";
        this.sendMsgToUnity("search", trigger_no, "");
    }

    _renderAreaTriggerList() {
        let arr = [];
        this.state.otherData.forEach((item, index) => {
            let canReplace = this.state.selectData != undefined ? true : false;
            let selectNO = '';
            if (canReplace) {
                // alert(JSON.stringify(this.state.selectData));
                selectNO = (this.state.selectData.ch_name + "");
            }
            // alert(`${JSON.stringify(item.ch_name)} + ${selectNO}`);

            let currentNO = item.ch_name;
            let color = selectNO == currentNO ? '#02BAE6' : 'white';
            let text = (item.ch_name + "").replace(//g, "足拇");
            arr.push(
                <TouchableOpacity
                    style={{width: '100%', height: size(66), justifyContent: 'center', alignItems: 'center'}}
                    onPress={() => {
                        this.selectTrigger(item)
                    }}>
                    <Text style={{
                        color: color,
                        height: size(66),
                        lineHeight: size(66),
                        fontSize: size(24),
                    }}>{text}</Text>
                    <View style={{
                        width: '100%',
                        height: size(0.3),
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(42,42,42,1)'
                    }}/>
                </TouchableOpacity>
            )
        })
        return arr;
    }

    _renderListArea() {
        return (
            <View style={{width: '100%', height: size(300)}}>
                <ScrollView style={{width: '100%', height: '100%'}}>
                    {this._renderAreaTriggerList()}
                </ScrollView>
            </View>
        )
    }

    _renderAreaBar() {
        let img = !this.state.showArea ? require('../../img/unity/arrow_up.png') : require('../../img/unity/arrow_down.png');
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                // backgroundColor: 'rgba(0,0,0,0.8)',
                borderTopRightRadius: size(20),
                borderTopLeftRadius: size(20),
                marginBottom: size(-3)
            }}>
                <TouchableOpacity
                    style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: size(90)}}
                    onPress={() => {
                        this.showChooseArea()
                    }}>
                    <Text style={{
                        color: 'white',
                        fontSize: size(28),
                        fontWeight: '500',
                        marginRight: size(20)
                    }}>{this.state.zzTitle}触发点列表</Text>
                    <Image style={styles.btnImgStyle} source={img}/>
                </TouchableOpacity>
            </View>
        )
    }

    render() {

        let sourceType = this.state.currentShowSource.type;

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
                    backgroundColor: "black", width: '100%', height: size(0.0001),
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                }}>
                </View>

                {this.state.unityReady ?
                    <View style={[
                            styles.rnView,
                            {left: this.state.showRnView ? 0 : -deviceWidth*0.99},
                            {borderTopLeftRadius: isUndefinedVal(sourceType) ? 0 : size(20),
                            borderTopRightRadius: isUndefinedVal(sourceType) ? 0 : size(20)}
                        ]}>
                        {this.state.isZZ ? this._renderAreaBar() : null}
                        {this.state.showArea ? this._renderListArea() : null}
                        {
                            isUndefinedVal(sourceType)
                              ?
                              <View style={{width: '100%', height: size(2), backgroundColor: 'rgba(34,34,34,1)'}}/>
                              :
                              null
                        }
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
                {this.state.isShowSearch && this.state.unityReady ?
                    <SearchTrigger
                        sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)}
                        searchArea={this.state.info.struct_name}
                        app_id={this.state.info.app_id}
                        triggerList={this.state.triggerList}
                        closeSearch={() => this.closeSearch()}
                        clickItem={() => this.clickItem()}
                        filterData={this.state.info}
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
                    <View style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            borderRadius: size(20),
                            width: '70%',
                            alignItems: 'center'
                        }}>
                            <Text style={{height: size(60), lineHeight: size(60)}}>是否要退出到维萨里骨科平台?</Text>
                            <MyTouchableOpacity style={[styles.shareBtnStyle, {marginTop: size(20)}]} onPress={() => {
                                this.handleBack(1)
                            }}>
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
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            top: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999
                        }}>
                            <UnityGuideView
                                closeAction={() => {
                                    this.setState({showGuide: false})
                                }}
                                btnAction={() => {
                                    this.setState({showVideo: true})
                                }}
                                navigation={this.props.navigation}/>
                        </View>
                        :
                        null
                }

                {
                    this.state.showVideo ?
                        <Video
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                zIndex: 99998
                            }}
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

                <Toast ref="toast" opacity={0.5} position='top' positionValue={100} fadeInDuration={750}
                       fadeOutDuration={1000}/>
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
        bottom: size(-0.01),
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    defaultBarStyle: {
        // backgroundColor: 'rgba(0,0,0,0.8)',
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
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnImgStyle: {
        width: size(28),
        height: size(28),
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
        // backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
    },
    JGSourceStyle: {
        width: '100%',
        height: size(260),
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden'
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



