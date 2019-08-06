import React, {Component} from "react";
import {
    Alert,
    BackAndroid,
    StatusBar,
    Platform,
    StyleSheet,
    View,
    AppState,
    Text,
    Image,
    TouchableOpacity
} from "react-native";
import {storage} from "../../common/storage";
import {ScreenUtil} from "../../common/index";
import Toast from "react-native-easy-toast";
import UnityView from 'react-native-unity-view';
import Menus from "./Menus";
import {getRelationByName, getStructByIds, getVideoByIds, getWebByIds} from "../../realm/RealmManager"
import {size} from "../../common/ScreenUtil";
import {NavigationActions} from "react-navigation";
import ETTLightStatus from "../../common/ETTLightStatus";
import UnityGuideView from './UnityGuideView';

let unity = UnityView;
import ActionSheet from "react-native-actionsheet";
import UShare from "../../share/share";
import SharePlatform from "../../share/SharePlatform";
import api from "../../api";
import {ifnull} from "./LCE";
import Orientation from 'react-native-orientation';
import Video, {Container} from 'react-native-af-video-player';

let isJunmp = "return";

const groupBy = (targetList, field, sort) => {
    const names = findNames(targetList, field);
    return names.map(name => {

        const value = targetList.filter(target => target[field] === name)
        return {
            firstSort: value[0].firstSort == undefined ? "" : value[0].firstSort,
            secondSort: value[0].secondSort == undefined ? "" : value[0].secondSort,
            key: name,
            "icon_url": value[0].firstIconUrl == undefined ? "" : value[0].firstIconUrl,
            value
        }
    })
}

function findNames(targetList, field) {
    const names = []
    targetList.forEach(target => {
        if (!names.includes(target[field])) {
            names.push(target[field])
        }
    })
    return names
}

function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

let stack = []

export default class ModelScene extends Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            relation: [],
            info: this.props.navigation.state.params.info,
            dataList: [],
            unityWidth: '100%',
            unityHeight: '99%',
            titleShow: false,
            currSelectList: [],
            currSelectKey: [],
            isShow: false,//显示win弹框
            currModel: {},//当前模型
            isReturn: false,//是否返回
            licenList: [],//证书列表
            sharePath: null,//分享路径
            isConnect: false,//是否收藏
            showComment: false,  //显示评论窗口
            multiOpen: false,//是否打开多选
            showGuide: false,
            showVideo: false
        }
    }


    componentWillUnmount() {
        let info = this.state.info;
        this.sendMsgToUnity('portrait', {});//竖屏
        if (info.app_type =='microlesson'){
            Orientation.lockToPortrait();
        }
    }


    /**
     * ui渲染完后的操作
     */
    componentDidMount() {

        let info = this.state.info;
        if (info.app_type =='microlesson'){
            Orientation.lockToLandscape();
        }
        this.sendMsgToUnity("app", info);//发消息给unity


    }


    /**
     * 根据类型获取资源
     * @param type
     * @returns {Promise<void>}
     */
    async getResource(type) {
        let basic   = {
            "key": "简介",
            "icon_url": "http://fileprod.vesal.site/menu/v1/xinxi.png",
            "value": [{
                "res_type": "web",
                "icon_url": "",
                "firstIconUrl": "http://fileprod.vesal.site/menu/v1/xinxi.png",
                "firstFyId": 1,
                "rw_id": 1,
                "firstSort": 1,
                "secondSort": 1,
                "type": "text",
                "title": "中文: " + this.state.currModel.chName + "  英文:  " + this.state.currModel.enName,
                "firstFyName": "简介",
                "secondFyName": "基础信息",
                "content": +this.state.currModel.note == undefined ? "" : this.state.currModel.note,
                "secondFyId": 8
            }]
        };
        let relation = this.state.relation;
        let dataList = [];
        if (type == 'app_id') {

            let temp = [
                {
                    "key": "返回",
                    "icon_url": "http://fileprod.vesal.site/menu/v1/fanhui_v1.png",
                    "value": []
                }

            ]

            dataList = dataList.concat(temp);
        }

        if (relation.length > 0) {


            let webs = await getWebByIds(relation[0].rw_ids);

            let videos = await getVideoByIds(relation[0].rv_ids);
            let structIds = await getStructByIds(relation[0].rs_ids);


            var arr = [].concat(this.changeArr(webs)).concat(this.changeArr(videos)).concat(this.changeArr(structIds));

            let tempData = groupBy(arr, 'firstFyName').sort(compare("firstSort"));
            dataList = dataList.concat(tempData);
          /*  alert("dataList:"+JSON.stringify(dataList))*/

        } else {

            if (this.state.currModel && this.state.currModel.chName != undefined && this.state.currModel != '-1') {
                dataList.push(basic)
            }

        }

        if (dataList.length==0 &&type == 'sm_name'){
            dataList.push(basic)
        }


        this.setState({
            dataList: dataList
        })

    }


    changeArr(arr) {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            newArr.push(arr[i])
        }
        return newArr;
    }

    async componentWillMount() {



        //监听状态改变事件
        AppState.addEventListener("change", this.appStateChange);


    }

    appStateChange() {
        /*    this.props.navigation.goBack()
            alert("当前状态：" + AppState.currentState);*/

    }


    /**
     * 获取默认的显示
     * @param info
     * @returns {Promise<void>}
     */
    async getDefault(info) {
        let relation = await getRelationByName(info, "app_id");

        this.setState({
            relation: relation
        })
        this.getResource("app_id");
    }

    /**
     * 返回逻辑处理
     * @returns {Promise<void>}
     */

    async back() {

        //    this.props.navigation.goBack();
        if (isJunmp == 'return') {
            if (stack.length > 0) {
                let temp = stack[stack.length - 1];
                let mode = Object.assign({}, temp.lastInfo);
                mode['JumpState'] = "return";
                mode['signModelName'] = ""
                mode['tissueModelName'] = ""
                //alert(JSON.stringify(mode))
                //  alert(JSON.stringify(temp.lastCurrModel))
                this.sendMsgToUnity("app", mode);

                await this.setState({
                    dataList: temp.lastDataList,
                    currSelectList: temp.lastCurrSelectList,
                    currSelectKey: temp.lastSelectKey,
                    isShow: true,
                    info: temp.lastInfo,
                    titleShow: false,
                    currModel: temp.lastCurrModel,
                    isReturn: true
                })

                //出栈
                stack.pop();
            } else {
                this.props.navigation.goBack();
            }
        }


    }

    /**
     * 檢查是否已收藏
     * @param struct_id
     * @returns {Promise<void>}
     */
    async checkConnect(struct_id) {

        let member = await storage.get("memberInfo");
        let tokens = await storage.get("userTokens");

        //isConnect 未收藏
        const url = api.base_uri + "/v1/app/member/isMemberCollection?mbId=" + member.mbId + "&structId=" + struct_id;
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token

            }
        }).then(resp => resp.json()).then(result => {

            if (result.code == 0) {

                if (result.isMemberCollection) {
                    this.setState({
                        isConnect: true
                    })
                } else {
                    this.setState({
                        isConnect: false
                    })
                }
            }

        });


    }

    /**
     * 接收unity消息
     * @param event
     */
    async onUnityMessage(event) {
     //   alert(JSON.stringify(event))
        if (event.name == 'exit') {
            this.props.navigation.goBack();
        } else if (event.name == 'back') {
            this.back()
        } else if (event.name == 'title') {

            //是返回操作
            //
            if (this.state.isReturn) {
                //可以显示标题了
                await this.setState({
                    titleShow: true,
                    isReturn: false,
                    isShow: true
                })
            } else {

                //可以显示标题了
                await this.setState({
                    titleShow: true,
                    currModel: {},
                    isReturn: false,
                    isShow: false
                })

                this.getDefault(this.state.info.app_id);
            }


            //  this.refs.toast.show("模型加载成功");

            //检查是否收藏
            this.checkConnect(this.state.info.struct_id);

        } else if (event.name == 'model' && !this.state.isShow) {//点击模型

            let currModel = {
                ModelName: event.data.ModelName,
                chName: this.hexToStr(event.data.Chinese),
                note: this.hexToStr(event.data.Note),
                enName: event.data.English,
                smName: event.data.ModelName
            }


            this.setState({
                isShow: false,
                titleShow: true,
                currModel: currModel
            })

            this.getRelation(currModel.smName, "sm_name");

        } else if (event.name == 'ClickBlank') {//点击空白

            this.setState({

                currModel: {},
                isShow: false,
                showComment: false,
                multiOpen: false

            })


            this.getDefault(this.state.info.app_id);
        } else if (event.name == 'MultiSelectionClose' && !this.state.isShow) {//打开多选

            this.setState({

                currModel: {},
                showComment: false,
                multiOpen: false

            })
            this.getDefault(this.state.info.app_id);
        }
        else if (event.name == 'openBrush') {//打开画笔
            this.setState({
                titleShow: false,
            })
        } else if (event.name == 'closeBrush') {//关闭画笔
            this.setState({
                titleShow: true,
            })
        } else if (event.name == 'share') {//分享
            let path = event.data.PicturePath + "?V=" + new Date();
            this.setState({
                sharePath: Platform.OS == 'ios' ? path : "file:///" + path,
            })
            this.ActionSheet.show();
        } else if (event.name == "MultiSelectionOpen" && !this.state.isShow) {//打开多选

            this.setState({
                multiOpen: true,
                currModel: {},
                isShow: false
            })
            this.getDefault(this.state.info.app_id);

        } else if (event.name == 'help') {
            this.setState({
                showGuide: true
            })
        }
        else {
            // alert("接收到unity消息, 但无逻辑处理," + JSON.stringify(event))
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
     * 获取某个子模型的所有关系
     * @param name
     * @param type
     * @returns {Promise<void>}
     */
    async getRelation(name, type) {


        let relation = await getRelationByName(name, type);

        this.setState({
            relation: relation
        })
        this.getResource(type);


    }


    /**
     * 发送消息给unity
     * @param name
     * @param info
     */
    sendMsgToUnity(name, info) {

        let temp = Object.assign({}, info);

        if (name == 'back') {
            isJunmp = "return"
        } else if (name == "app") {
            isJunmp = "jump"
            if (info.app_type == 'microlesson' || info.app_type == 'exam') {
                isJunmp = "return"
                this.setState({
                    unityHeight: '100%'
                })
            }
        }


        if (this.unity) {
            // alert("to unity:"+JSON.stringify(temp))
            this.unity.postMessageToUnityManager({
                name: name,
                data: JSON.stringify(temp),
                callBack: (data) => {
                    Alert.alert('Tip', JSON.stringify(data))
                }
            });


        }
    }

    /**
     * 16进制转字符
     * */
    hexToStr(str) {
        var val = "";
        var arr = str.split("_");
        for (var i = 0; i < arr.length; i++) {
            val += String.fromCharCode(parseInt(arr[i], 16));
        }
        return val;

    }

    async gotoScene(name, info, dataList, currSelectList, currSelectKey, lastInfo, lastCurrModel) {

        //stack  info 为要去的产品, lastInfo为当前产品
        let temp = {
            lastInfo: lastInfo,
            lastSelectKey: currSelectKey,
            lastDataList: dataList,
            lastCurrSelectList: currSelectList,
            lastCurrModel: lastCurrModel
        }

        //压栈
        stack.push(temp);


        this.setState({
            dataList: [],
            info: info

        })
        this.sendMsgToUnity(name, info);
    }

    playVideoError(msg) {
        Alert.alert('', '该视频暂未开放, 敬请期待.', [{text: '我知道了'}])
    }

    render() {


        return (
            <View style={{
                width: '100%',
                height: '100%',
                backgroundColor: "rgba(12,12,12,0.8)"
            }}>
                <StatusBar
                    hidden={true}
                />


                {/*323232,0094e1*/}

                <UnityView
                    ref={(ref) => this.unity = ref}

                    onUnityMessage={this.onUnityMessage.bind(this)}

                    /*  style={{
                          position: 'absolute',
                          height:size(1300),
                          width: size(500),
                          top: 0,
                          bottom: size(0.01),
                          left: 0,
                          right: 0,

                      }}*/
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

                {/*
                   <NavBar onPress={(name, info) => this.sendMsgToUnity(name, info)} navigation={this.props.navigation}/>*/}

                <View style={{
                    backgroundColor: "#525252", width: '100%', height: size(0.0001),
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                }}>
                </View>

                <Menus

                    changeHeight={(value) => this.setState({
                        unityWidth: value,
                        isShow: true,
                        titleShow: true,
                    })}

                    isConnect={this.state.isConnect}

                    showComment={this.state.showComment}

                    titleShow={this.state.titleShow}

                    currSelectList={this.state.currSelectList}

                    currSelectKey={this.state.currSelectKey}

                    info={this.state.info}

                    isShow={this.state.isShow}


                    onPress={(name, info, dataList, currSelectList, currSelectKey, lastInfo, lastCurrModel) =>
                        this.gotoScene(name, info, dataList, currSelectList, currSelectKey, lastInfo, lastCurrModel)
                    }

                    navigation={this.props.navigation}

                    dataList={this.state.dataList}

                    currModel={this.state.currModel}

                    sendMsgToUnity={(name, info) =>
                        this.sendMsgToUnity(name, info)
                    }

                    multiOpen={this.state.multiOpen}
                />


                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    title={"将截屏分享到"}
                    options={["取消", "微信好友", "微信朋友圈"]}
                    cancelButtonIndex={0}
                    // destructiveButtonIndex={2}
                    onPress={this.sharePress}
                />

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
    }
});
