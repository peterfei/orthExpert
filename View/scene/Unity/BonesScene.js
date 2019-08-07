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
    Modal,
    ImageBackground,
    TouchableOpacity,
    Alert, DeviceEventEmitter
} from "react-native";
import {screen, ScreenUtil} from "../../common/index";
import UnityLoading from './Components/UnityLoading';
import Toast from "react-native-easy-toast";
import UnityView from 'react-native-unity-view';
import {size, deviceWidth, deviceHeight} from "../../common/ScreenUtil";
import ActionSheet from "react-native-actionsheet";
import UShare from "../../share/share";
import SharePlatform from "../../share/SharePlatform";
import {hexToStr, checkConnect, addConnect} from "./LCE";
import Comment from "./Comment";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import SearchBone from './SearchBone';
import {VoiceUtils} from "../../common/VoiceUtils";
import {queryRelationBySmName, queryMarkNailByNoun} from '../../realm/RealmManager';
import MyScrollView from './MyScrollView';
import Orientation from 'react-native-orientation';
import Video, {Container} from 'react-native-af-video-player';
import {boneData} from "./BoneData"
import {storage} from "../../common/storage";
import {NavigationActions} from "react-navigation";
import UnityGuideView from './UnityGuideView';
import {isAvailableString, ConvertString, analysis, getChildNode} from '../../common/fun'
import SpeechRecognizer from "../../common/SpeechUtils"


let index = 0;
let unity = UnityView;

const BaseScript =
    `
    (function () {
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
            height = document.body.scrollHeight;
            document.body.style.backgroundColor = "black";
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

const gifArr = [
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0001.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0002.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0003.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0004.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0005.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0006.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0007.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0008.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0009.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0010.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0011.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0012.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0013.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0014.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0015.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0016.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0017.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0018.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0019.jpg'),
  require('../../img/unity/yuyin_dynamic/yuyin_dynamic-0020.jpg'),
]

export default class BonesScene extends Component {

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
            searchData: [],
            unityReady: false,
            isSelectAcu: false,  //是否选中穴位
            selectVal: '',      //当前选中的按钮
            isShowDetailText: false, //显示的文字详情
            isShowSearch: false,//是否显示搜索弹框
            currAcu: {},
            isConnect: false,

            branshIsOpen: false, // 当前是否打开画笔


            selectData: '',   // unity选中后传过来的数据
            showSelectBar: false,
            sourceData: [],  // 所有资源数据数组
            currentShowSource: '', // 当前需要展示的资源数据
            showJGList: false, // 是否展示结构中的列表下拉框, 默认为false
            scrollPage: 0,    // 结构数据数组中, 当前展示的部分,

            height: 0,
            showComment: false,  //显示评论窗口
            showTip: false,
            licenList: [],

            showGuide: false,
            showVideo: false,
            showRnView: true,
            isPro: true,

            result: '', // 语音识别
            speechIng: false, // 识别中
            asrText: '按下说话',

            arTipMsg: '该设备暂不支持 AR 体验',
            arTipShow: false,
            displayDialogShow: false, // 语音输入按钮
            currYuyinPic: '01',
            currYuyinNum: 1,
            currPic: ''
        }
    }


    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.androidBackAction);

        // 语音识别关闭
        SpeechRecognizer.end()
    }

    changeInfo(info) {

        let selModel = info.signModelName == undefined ? "" : info.signModelName;
        let showModel = analysis(boneData, info.app_id, selModel).toString();

        let signModelName = {
            showModel: showModel,
            selModel: selModel
        }

        if (selModel == '') {
            info['signModelName'] = "";
        } else {
            info['signModelName'] = JSON.stringify(signModelName);
        }


        return info;
    }

    /**
     * ui渲染完后的操作
     */
    async componentDidMount() {

        let info = this.state.info;

        let changeInfo = this.changeInfo(info)

        this.sendMsgToUnity("app", changeInfo, 'json');//发消息给unity

        let isConnect = await checkConnect(info.struct_id);
        this.setState({
            isConnect: isConnect
        })

        try {
            let lincen = await storage.get("licenList");
            if (lincen == -1 || lincen == -2) {
                lincen = []
            }
            this.setState({
                licenList: lincen
            });
        } catch (e) {
        }
    }

    chImg() {
        let curr = this.state.currYuyinNum
        this.setState({
            currYuyinPic: curr < 10 ? '0'+curr : curr,
            currYuyinNum: curr++
        })
        let uri = gifArr[curr];
        let suffix = 'yuyin_dynamic-'
        this.setState({
            currPic: (suffix + this.state.currYuyinPic + '.jpg').toString()
        })
        if (curr >= 62) {
            this.setState({
                currYuyinNum: 1
            })
        }
        setTimeout(() => null, 200)

        // this.chImg()
    }


    componentWillMount() {
        // 语音识别初始化
        SpeechRecognizer.init(result => {
            this.setState({result}, () => {
                this._renderASRActionBtn()
            })

        })

        BackHandler.addEventListener('hardwareBackPress', this.androidBackAction)
    }

    // 语音识别开始、结束功能
    startP(){
        this.setState({
            asrText: '松开 结束',
            speechIng: true
        })
        this.chImg()
        SpeechRecognizer.start('zh')
    }

    stopP(){
        this.setState({
            asrText: '按下 说话',
            speechIng: false
        })
        SpeechRecognizer.finish()
        this.state.result = ''
    }

    checkSearch() {

        let rs = boneData.find((element) => (element.key == this.state.info.app_id));
        if (rs == undefined) {
            this.sendMsgToUnity("hideSearch", "", '');
        } else {
            this.setState({
                searchData: rs.val
            })
        }

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
        let realmData = await queryRelationBySmName(data.ModelName);
        let listData = [];
        if (realmData != undefined) {
            realmData.forEach(item => {
                listData.push(item);
            })
        }
        // alert(JSON.stringify(listData));
        console.log('||||||||||||||||||');
        console.log(JSON.stringify(listData));
        console.log('||||||||||||||||||');
        let isHaveJJ = listData.findIndex(item => {
            return item.secondFyName == '简介';
        })
        if (isHaveJJ == -1 || listData.length <= 0) { // 没有简介
            let text = data.Note != undefined ? data.Note : '';
            let jjObj = {
                secondFyName: '简介',
                secondSort: 0,
                content: hexToStr(text),
                icon_url: '',
                res_fy_icon_url: 'http://res.vesal.site/icon/xinxi.png',
                select_icon_url: '',
                rw_id: '-1',
                type: 'text'
            }
            listData.splice(0, 0, jjObj);
        }
        listData.sort((a, b) => {
            return a.secondSort - b.secondSort;
        })

        listData.forEach(item => {
            if (item.type == 'JG') {
                let jgData = queryMarkNailByNoun(item.content);
                let JGSourceData = [];
                jgData.forEach(subItem => {
                    JGSourceData.push(subItem);
                })
                item.JGSourceData = JGSourceData;
            }
        })
        // alert(JSON.stringify(listData));

        // 选择模型后, 重置所有ui显示需要的属性
        this.setState({
            sourceData: listData,
            showSelectBar: true,
            selectData: data,
            currentShowSource: '',
            scrollPage: 0
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
            });
            this.checkSearch();
        } else if (event.name == 'exit') {
            this.props.navigation.goBack();
        } else if (event.name == 'back') {//返回
            this.back()
        } else if (event.name == 'model') {//点击模型  选中骨骼
            let name = hexToStr(event.data.Chinese);
            // this.refs.toast.show(name);
            this.initialSelectData(event.data);
        } else if (event.name == 'boneLoadSuccess') {
            this.UnityLoading.close();
        } else if (event.name == 'ClickBlank') {//点击空白
            if (this.state.currentShowSource.type != 'JG') {
                this.setState({
                    showSelectBar: false
                })
            }
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
            if (Platform.OS == 'ios') {
                path = event.data.PicturePath;
            }
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
            this.setState({
                unityReady: true,
                showComment: false,  //显示评论窗口
                isShowSearch: false,
                branshIsOpen: false
            })
        } else if (event.name == 'help') {
            this.setState({
                showGuide: true
            })
        } else if (event.name == 'hideUI' || event.name == 'OpenMark') {
            this.setState({
                showRnView: false
            })
        } else if (event.name == 'showUI' || event.name == 'CloseMark') {
            this.setState({
                showRnView: true
            })
        } else if(event.name == 'arErrorMessage') {
            this.setState({
                arTipShow: true
            })
            setTimeout(() => {
                this.setState({
                    arTipShow: false
                })
            }, 1500)
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

    // 打开语音对话框界面
    displayDialog() {
        let curr = this.state.displayDialogShow
        this.setState({
            displayDialogShow: !curr
        })
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
            if (this.state.currentShowSource.type == 'JG') {
                this.sendMsgToUnity('markBack', '', '');
                this.setState({
                    showJGList: false
                })
            }
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
        name = name.replace("_L", "").replace("_R", "").replace("_左", "").replace("_右", "");
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

    cundang() {
        this.sendMsgToUnity("save_bookmark", '', '');
    }

    setFrist() {
        this.refs.toast.show("成功将当前状态设置为首次进入");
        this.sendMsgToUnity("save_first_bookmark", '', '');
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
                    {/*<MyTouchableOpacity style={styles.btnStyle} onPress={() => {*/}
                    {/*// this.clickBack()*/}
                    {/*}}>*/}
                    {/*<Image style={styles.btnImgStyle} source={require('../../img/unity/tmxz.png')}/>*/}
                    {/*<Text style={styles.btnTextStyle}>推荐</Text>*/}
                    {/*</MyTouchableOpacity>*/}
                </View>
                <View style={styles.dbRightStyle}>


                    <TouchableOpacity style={styles.btnStyle} onPress={() => {
                        this.displayDialog()
                    }}>
                        <Image style={styles.btnImgAsrStyle} source={this.state.displayDialogShow ? require('../../img/unity/yuyin_hold.png') : require('../../img/unity/yuyin_release.png')}/>
                    </TouchableOpacity>

                    {this.state.displayDialogShow ?
                      <TouchableOpacity activeOpacity={0.7} style={styles.btnAsrStyle}
                                        onPressIn={()=> this.startP()}
                                        onPressOut={()=> {
                                            this.stopP()
                                        }}
                      >
                          <Text style={styles.btnTextAsrStyle}>{this.state.asrText}</Text>
                      </TouchableOpacity> :
                      <Text style={styles.dbTitleStyle}>{this.state.info.struct_name}</Text>
                    }




                    {/*  <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.collectAction()
                    }}>
                        <Image style={styles.btnImgStyle}
                               source={this.state.isConnect ? require('../../img/acuUnity/acu_collect_select.png') : require('../../img/acuUnity/acu_collect.png')}/>
                        <Text style={styles.btnTextStyle}>
                            {this.state.isConnect ? "已收藏" : "收藏"}
                        </Text>
                    </MyTouchableOpacity>*/}
                    <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.commentAction()
                    }}>
                        <Image style={styles.btnImgStyle} source={require('../../img/unity/yijian.png')}/>
                        <Text style={styles.btnTextStyle}>评论</Text>
                    </MyTouchableOpacity>
                    <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.cundang()
                    }}>
                        <Image style={styles.btnImgStyle} source={require('../../img/unity/cundang.png')}/>
                        <Text style={styles.btnTextStyle}>存档</Text>
                    </MyTouchableOpacity>
                    <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                        this.setFrist()
                    }}>
                        <Image style={styles.btnImgStyle} source={require('../../img/unity/frist-set.png')}/>
                        <Text style={styles.btnTextStyle}>设为首页</Text>
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
                {(this.isShowSource('pic') || this.isShowSource('gif')) ? this._renderGifOrPicSource() : null}
                {this.isShowSource('video') ? this._renderVideoSource() : null}
                {(this.isShowSource('JG') && this.state.showJGList) ? this._renderJGSourceDropdown() : null}
                {this.isShowSource('JG') ? this._renderJGSource() : null}

                {this.state.currentShowSource == '' ? this._renderSBActionBtn() : null}
                {this.state.currentShowSource == '' ? this._renderSBTitle() : null}
                {this.state.isPro ? this._renderSBBtn() : null}
            </View>
        )
    }

    // 语音识别发送相关指令给unity
    _renderASRActionBtn() {
        let result = this.state.result
        let info = this.state.info
        let order = [{key: 'selectModels', val: '选中'}, {key: 'selectModels', val: '选择'}, {key: 'modelList', val: '显示'}, {key: 'hideModels', val: '隐藏'}, {key: 'autoRot', val: '旋转'}]
        let filterResult = order.filter(item => result.indexOf(item.val) !== -1)
        if (filterResult.length !== 0) {
            if (result.length > 2) {
                let showModel = getChildNode(boneData, info.app_id, result.substring(2)).toString()
                if (showModel.length === 0) {
                    let arr = []
                    arr.push(result.substring(2))
                    arr.push('_左')
                    showModel = getChildNode(boneData, info.app_id, arr.join('')).toString()
                }
                if (showModel.length !== 0) {
                    this.sendMsgToUnity(filterResult[0].key, showModel, null)
                }
            } else {
                this.sendMsgToUnity(filterResult[0].key, null, 'json')
            }
        }
    }

    // 选中骨骼后操作unity的功能按钮
    _renderSBActionBtn() {
        // alert(111);
        let arr = [];
        let btnTitles = ['隐藏选择', '透明选择', '透明其他', '隐藏其他', '单独显示'];
        let unityMessages = ['hideSel', 'alphaSel', 'alphaOther', 'hideOther', 'singleShow'];
        btnTitles.forEach((item, index) => {
            arr.push(
                <MyTouchableOpacity
                    onPress={() => {
                        this.sendMsgToUnity(unityMessages[index], '', '');
                    }}
                    key={index}
                    style={{
                        backgroundColor: "rgba(12,12,12,0.8)",
                        marginLeft: size(10),
                        marginRight: size(10),
                        height: size(45),
                        flex: 1,
                        alignItems: 'center'
                    }}>
                    <Text style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: size(16),
                        height: size(45),
                        lineHeight: size(45)
                    }}>{item}</Text>
                </MyTouchableOpacity>
            )
        })

        return (
            <View
                style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: size(60)}}>
                {arr}
            </View>
        );
    }

    // 选中骨骼后展示的title、语音信息等
    _renderSBTitle() {
        // alert(222);

        let title = hexToStr(this.state.selectData.Chinese);
        let enTitle = this.state.selectData.English;
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: size(90),
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)',
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
                <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                    this.cundang()
                }}>
                    <Image style={styles.btnImgStyle} source={require('../../img/unity/cundang.png')}/>
                    <Text style={styles.btnTextStyle}>存档</Text>
                </MyTouchableOpacity>
                <MyTouchableOpacity activeOpacity={0.7} style={styles.btnStyle} onPress={() => {
                    this.setFrist()
                }}>
                    <Image style={styles.btnImgStyle} source={require('../../img/unity/frist-set.png')}/>
                    <Text style={styles.btnTextStyle}>设为首页</Text>
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
                backgroundColor: 'rgba(0,0,0,0.8)',
            }}>
                {arr}
            </View>
        )
    }

    // 处理渲染哪种类型的资源    /*{*******以下为不同类型的资源展示****}*/
    handleActionSource(source) {
        //类型:html:网页,text:文字,video:视频,gif:动态图,pic:其他类型图片,JG:结构 ,BZ:标志(内容为结构名词),内容都在content
        // alert(JSON.stringify(source));

        let flag = this.checkIsBuySystem(source, this.state.licenList);
        if (flag) {
            if (this.state.currentShowSource == source) {
                this.setState({
                    currentShowSource: '',
                    showJGList: false
                })
                if (this.state.currentShowSource.type == 'JG') {
                    this.sendMsgToUnity('markBack', '', '')
                }
            } else {
                let obj = {};
                if (source.type == 'JG') {
                    let data = source.JGSourceData;
                    obj = {
                        mark_noun_no: source.content,
                        nail_no: data[0].nail_no,
                        nail_camera_params: data[0].camera_params
                    }
                    // alert(JSON.stringify(obj));
                    this.sendMsgToUnity('initMark', obj, 'json');
                    this.UnityLoading.show('加载中...');
                } else {
                    // 如果选择了其他, 并且当前已选择的为结构, 那么发送markBack
                    if (this.state.currentShowSource.type == 'JG') {
                        this.sendMsgToUnity('markBack', '', '');
                    }
                }

                this.setState({
                    currentShowSource: source
                })
            }
        } else {
            Alert.alert("该功能需要付费 ,已为您推荐套餐", "请选择套餐");
            if (Platform.OS == 'ios') {
                const resetAction = NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({
                            routeName: "Tab",
                            action: NavigationActions.navigate({
                                routeName: 'Shop',
                                params: {
                                    struct_id: "115"
                                },

                            }),
                        })
                    ]
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                this.props.navigation.navigate("Shop", {
                    struct_id: "115"
                });
            }
        }
    }

    checkIsBuySystem(item, licenList) {
        // alert(JSON.stringify(item))
        let flag = true;
        let url = item.res_fy_icon_url + "";
        if (url.search("charge") != -1) {
            if (licenList && licenList.length > 0) {
                for (let i = 0; i < licenList.length; i++) {
                    let id = licenList[i].struct_id;
                    let str = [322, 265, 272, 320, 263, 270, 318, 261, 268, 257, 325, 275, 259, 323, 266, 273, 321, 264, 271, 319, 262, 269, 258, 260, 256, 324, 267, 274, 129, 127, 115, 132, 130, 128, 126, 133, 235, 131, 358];
                    if (str.indexOf(id) != -1) {
                        flag = true;
                        break;
                    } else {
                        flag = false;
                    }
                }
            } else {
                flag = false;
            }
        }
        return flag;
    }

    // 关闭资源视图
    closeSourceView() {
        if (this.state.currentShowSource.type == 'JG') {
            this.sendMsgToUnity('markBack', '', '');
            this.setState({
                showJGList: false
            })
        }

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
                    marginBottom: -1,
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
        let title = this.state.currentShowSource.content;
        return (
            <View style={styles.textSourceStyle}>
                <View style={{
                    height: size(60),
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.8)'
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
                <View style={{width: '100%', height: size(140)}}>
                    <ScrollView style={{
                        height: size(140),
                        paddingLeft: size(20),
                        paddingRight: size(20),
                        backgroundColor: 'rgba(0,0,0,0.8)'
                    }}>
                        <Text style={{
                            width: '100%',
                            flexWrap: 'wrap',
                            color: '#fff',
                            fontSize: size(26),
                            lineHeight: size(28),
                            backgroundColor: 'rgba(0,0,0,0)'
                        }}>
                            {title}
                        </Text>
                    </ScrollView>
                </View>

            </View>
        )
    }

    // 渲染video类型资源
    _renderVideoSource() {
        return (
            <View style={[styles.videoSourceStyle]}>
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
                        status ? this.sendMsgToUnity('landscape', '', '') : this.sendMsgToUnity('portrait', '', '');
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
                <Image style={{resizeMode: 'contain', width: size(200), height: size(200)}} source={{uri: sourceURL}}/>
            </View>
        )
    }

    // 渲染基础结构类型资源 --- 下拉视图列表
    _renderJSSourceSubList() {
        let arr = [];
        let sourceData = this.state.currentShowSource.JGSourceData;
        let sourceObj = sourceData[this.state.scrollPage];
        sourceData.forEach((item, index) => {
            arr.push(
                <MyTouchableOpacity onPress={() => {
                    this.selectPage(index)
                }}>
                    <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center',}}>
                        <Text style={{
                            fontSize: size(24),
                            color: '#fff',
                            height: size(66),
                            lineHeight: size(66)
                        }}>{item.nail_name}</Text>
                    </View>
                </MyTouchableOpacity>
            )
        })
        return arr;
    }

    // 渲染基础结构类型资源 --- 下拉视图背景
    _renderJGSourceDropdown() {
        return (
            <View style={{justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: size(-16)}}>
                <View style={{
                    flex: 1,
                    zIndex: 9999,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0)'
                }}>
                    <View style={{
                        padding: 10,
                        backgroundColor: 'rgba(0,0,0, 0.5)',
                        borderRadius: 8,
                        height: size(300),
                        width: size(300)
                    }}>
                        <ScrollView style={{width: '100%', height: '100%'}}>
                            {this._renderJSSourceSubList()}
                        </ScrollView>
                    </View>
                    <View style={{
                        width: 0,
                        height: 0,
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderStyle: 'solid',
                        borderLeftWidth: size(20),
                        borderRightWidth: size(20),
                        borderBottomWidth: size(16),
                        borderTopWidth: size(16),
                        borderLeftColor: 'rgba(0,0,0,0)',
                        borderRightColor: 'rgba(0,0,0,0)',
                        borderTopColor: 'rgba(0,0,0,0.5)',
                        borderBottomColor: 'rgba(0,0,0,0)',
                    }}>
                    </View>
                </View>
            </View>

        )
    }

    // 渲染基础结构类型资源 --- 滚动视图
    _renderJGSource() {
        let btnW = size(60);
        let sourceData = this.state.currentShowSource.JGSourceData;
        let sourceObj = sourceData[this.state.scrollPage];
        let nail_name = sourceObj == undefined ? '' : sourceObj.nail_name;
        let selectArrow = require('../../img/home/arrow_jg_up.png');
        let defaultArrow = require('../../img/home/arrow_sort_down.png');
        return (
            <View style={styles.JGSourceStyle}>

                <View style={{
                    width: '100%',
                    height: size(60),
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                }}>

                    <MyTouchableOpacity activeOpacity={1} onPress={() => {
                        this.setState({showJGList: !this.state.showJGList})
                    }}>
                        <View style={{
                            height: size(60),
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{color: '#fff', fontSize: size(24)}}>
                                {nail_name}
                            </Text>
                            <Image style={{width: size(30), height: size(30)}}
                                   source={this.state.showJGList ? selectArrow : defaultArrow}/>
                        </View>
                    </MyTouchableOpacity>
                    <MyTouchableOpacity style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,
                        height: size(60),
                        width: size(60),
                        justifyContent: 'center'
                    }} onPress={() => {
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


                <MyScrollView ref="MyScrollView" sourceData={this.state.currentShowSource.JGSourceData}
                              setPage={(page) => {
                                  this.setPage(page)
                              }}/>

            </View>
        )
    }

    // 基础结构类型资源的交互
    setPage(page) {

        let data = this.state.currentShowSource.JGSourceData;
        let item = data[page];
        let obj = {
            nail_no: item.nail_no,
            nail_camera_params: item.camera_params
        }
        // alert(JSON.stringify(obj));
        console.log('------------------');
        console.log(JSON.stringify(obj));
        this.sendMsgToUnity('singleNail', obj, 'json')

        this.setState({
            scrollPage: page,
            showJGList: false
        })
    }

    // 用户滚动或选择了子钉子
    selectPage(index) {
        this.refs.MyScrollView.scrollToPage(index)
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
            <View style={{width: '100%', height: '100%',}}>


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

                {
                    // ar 提示
                    this.state.speechIng ?
                      <View style={{position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, justifyContent: 'center', alignItems: 'center'}}>
                          <View style={{borderRadius: size(10), overflow: 'hidden', justifyContent: 'center', alignItems: 'center'}}>
                              <ImageBackground
                                source={require('../../img/unity/yuyin_dynamic.gif')}
                                style={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    borderRadius: size(10),
                                    width: screen.width * 0.7,
                                    height: size(300),
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                  <View style={{alignItems: 'center'}}>
                                      <Text style={{width: '100%', color: 'white', fontWeight: 'bold', fontSize: size(28), marginTop: size(10)}}>
                                          请说出以下命令
                                      </Text>
                                      <Text style={{width: '100%', color: 'white', fontSize: size(20), marginTop: size(10), marginBottom: size(10)}}>
                                          支持命令:旋转、([选中、选择、显示、隐藏]+结构名称)
                                      </Text>
                                  </View>

                                  <Text style={{height: size(60), color: 'white', lineHeight: size(60), marginBottom: size(10)}}>
                                      识别结果：{this.state.result}
                                  </Text>
                                  {/*<Image style={{height: size(200), width: screen.width * 0.6}} source={require('../../img/unity/yuyin_dynamic.gif')} />*/}
                              </ImageBackground>
                          </View>
                      </View> : null
                }

                {
                    // ar 提示
                    this.state.arTipShow ?
                      <View
                        style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center'
                        }}
                      >
                          <View style={{
                              backgroundColor: 'rgba(0,0,0,0.8)',
                              borderRadius: size(20),
                              width: '70%',
                              alignItems: 'center'
                          }}>
                              <Text style={{height: size(60), color: 'white', lineHeight: size(60)}}>{this.state.arTipMsg}</Text>
                          </View>
                      </View> : null
                }

                {this.state.unityReady ?
                    <View style={[styles.rnView, {left: this.state.showRnView ? 0 : deviceWidth * 0.99}]}>
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
                    <SearchBone
                        sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)}
                        searchArea={this.state.info.struct_name}
                        app_id={this.state.info.app_id}
                        searchData={this.state.searchData}
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
                            <Text style={{height: size(60), lineHeight: size(60)}}>是否要退出到维萨里平台?</Text>
                            <MyTouchableOpacity style={[styles.shareBtnStyle, {marginTop: size(20)}]} onPress={() => {
                                this.handleBack(1)
                            }}>
                                <Text style={styles.shareTextStyle}>
                                    确定
                                </Text>
                            </MyTouchableOpacity>
                            <MyTouchableOpacity
                                style={{
                                    width: '100%',
                                    height: size(60),
                                    marginTop: size(10),
                                    marginBottom: size(10),
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    this.handleBack(0)
                                }}>
                                <Text style={{height: size(60), lineHeight: size(60), flex: 1}}>取消</Text>
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

                <UnityLoading ref={r => {
                    this.UnityLoading = r
                }}/>

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
        backgroundColor: '#0094E1',
    },
    rnView: {
        width: '100%',
        position: 'absolute',
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
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnAsrStyle: {
        width: size(300),
        height: '70%',
        marginRight: size(5),
        marginLeft: size(5),
        // backgroundColor: '#4D4D4D',
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 0.5,
        justifyContent: 'space-between',
        borderRadius: 4,
    },
    btnTextAsrStyle: {
        fontSize: size(24),
        textAlign: "center",
        color: "#FFF",
        lineHeight: size(60)
    },
    btnImgAsrStyle: {
        width: size(45),
        height: size(45),
        resizeMode: 'contain',
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
    },
    htmlSourceStyle: {
        width: '100%',
        height: size(800),
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden',
        marginBottom: -1
    },
    JGSourceStyle: {
        width: '100%',
        height: size(260),
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden'
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
        height: size(200),
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        overflow: 'hidden'
    },
    shareBtnStyle: {
        backgroundColor: '#0094E1',
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



