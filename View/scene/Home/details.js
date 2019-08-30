/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, StyleSheet, Text, View,
    Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter, ScrollView, Alert
} from 'react-native';
import { screen, system } from "../../common";
import { size } from '../../common/ScreenUtil';
import { VoiceUtils } from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import Video from 'react-native-af-video-player';
import styles from './styles';
import _ from "lodash";
let index = 0;
import LoadingView from '../../common/LoadingView.js'
import api from "../../api";
import { storage } from "../../common/storage";
export default class Details extends Component {
    static navigationOptions = {
        header: null,
    }
    state = {
        rightMenu: false,
        video: false,
        reason: false,
        details: false,
        search: false,
        title: true,
        getData: '',
        EnterNowScreen: "isMainScreen",
        lastImgState: false,
        text: 'no',//简介
        textOpen: false,//底部unity-ui
        intro: false,//简介
        towScreenName: '',//第二界面骨名
        openVideoDetail: false,
        videoNum: '',
        paused:false,
        isCheckPerm: null,
        bottomIcon: [
            { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
            { img: require('../../img/home/xinxi.png'), title: '简介' },
            { img: require('../../img/home/tab1.png'), title: '成因' },
            { img: require('../../img/home/tab2.png'), title: '治疗' },
            { img: require('../../img/home/tab3.png'), title: '3D模型' },
            { img: require('../../img/home/tab4.png'), title: '康复' }
        ],
        bottomIconNo: [
            { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
            { img: require('../../img/home/xinxi.png'), title: '简介' },
            { img: require('../../img/home/tab1.png'), title: '成因' },
            { img: require('../../img/home/tab2.png'), title: '治疗' },
            { img: require('../../img/home/tab3.png'), title: '3D模型' },
            { img: require('../../img/home/tab4.png'), title: '康复' }
        ],
        bottomIconTab2: [
            { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
            { img: require('../../img/home/xinxi.png'), title: '简介' },
            { img: require('../../img/home/tab1.png'), title: '成因' },
            { img: require('../../img/home/okTab2.png'), title: '治疗' },
            { img: require('../../img/home/tab3.png'), title: '3D模型' },
            { img: require('../../img/home/tab4.png'), title: '康复' }
        ],
        showLoading: false
    }
    listeners = {
        update: [DeviceEventEmitter.addListener("DetailsWinEmitter",
            ({ ...passedArgs }) => {
                let details = passedArgs.details
                let search = passedArgs.search
                if (details == false) {
                    this.setState({
                        details: false
                    })
                }
                if (details == true) {
                    this.setState({
                        details: true
                    })
                }
                if (search == false) {
                    this.setState({
                        search: false
                    })
                }
                if (search == true) {
                    this.setState({
                        search: true
                    })
                }
            }),
        DeviceEventEmitter.addListener("getData",
            ({ ...passedArgs }) => {
                let getData = passedArgs.getData
                if (getData !== null) {
                    this.setState({
                        getData: getData
                    })
                }
            }
        ),
        DeviceEventEmitter.addListener("textData",
            ({ ...passedArgs }) => {
                let text = passedArgs.text
                if (text !== null && text !== 'no') {
                    this.setState({
                        text: text,
                        textOpen: true
                    })
                } else if (text == 'no') {
                    this.setState({
                        textOpen: false
                    })
                }
            }
        ),
        DeviceEventEmitter.addListener("hideLoading",
            ({ ...passedArgs }) => {
                let ifHide = passedArgs.hide
                if (ifHide) {
                    this.setState({
                        showLoading: false
                    })

                }
            }
        ),
        DeviceEventEmitter.addListener("towScreenName",
            ({ ...passedArgs }) => {
                let towScreenName = passedArgs.towScreenName
                if (towScreenName !== null) {
                    this.setState({
                        towScreenName: towScreenName
                    })

                }
            }
        ),
        ]

    };

    componentDidMount() {
    }
    componentWillUnmount() {
        _.each(this.listeners, listener => {
            listener[0].remove();
            listener[1].remove();
            listener[2].remove();
            listener[3].remove();
            listener[4].remove();
        });
        this.timer && clearInterval(this.timer);
    }
    render() {
        return (
            <View style={{ position: 'absolute', bottom: 0, width: screen.width }}>
                {this.state.details && !this.state.search ? this.details() : <View style={styles.place}></View>}
                <LoadingView showLoading={this.state.showLoading} />
            </View>

        )
    }
    details() {
        return (
            <View style={styles.details}>
                {/* 简介 */}
                {this.state.intro && this.state.text !== 'no' ? this.rendertextOpen() : null}
                {/* 视频 */}
                {this.state.video && this.state.getData.menus !== null ? this.renderVideo() : null}
                {/* 成因 */}
                {this.state.reason && this.state.getData.menus !== null ? this.renderReason() : null}
                {/* unity底部菜单 */}
                {this.state.textOpen && !this.state.intro && this.state.text !== 'no' ? this._renderSBActionBtn() : null}
                {/* rn菜单 */}
                <View style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View style={styles.detailsRow}>
                        {this.state.title ? <View style={{ alignItems: 'center', width: "100%", position: 'absolute', bottom: screen.height * 0.81 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{this.state.getData.pat_name}</Text>
                        </View>
                            : null
                        }
                        {/* <MyTouchableOpacity
                            onPress={() => {
                                this.fayin(this.state.getData.pat_name + "。" + this.state.getData.pat_name)
                            }}
                            style={{ marginTop: 5, position: 'absolute', left: '50%', transform: [{ translateX: -40 }], alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: size(30), height: size(30), marginRight: size(10) }}
                                source={require('../../img/unity/laba.png')} />
                            <Text style={{ color: "white", }}>{this.state.getData.pat_name}</Text>
                        </MyTouchableOpacity> */}
                        {this.state.text !== 'no' && this.state.EnterNowScreen == "isNotMainScreen" ?
                            <View style={{ alignItems: 'center', width: "100%" }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>{this.state.towScreenName}</Text>
                            </View>
                            :

                            this.state.EnterNowScreen == "isNotMainScreen" ?
                                <View style={{ alignItems: 'center', width: "100%" }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>&nbsp;</Text>
                                </View>
                                : null
                        }
                    </View>
                    <View style={styles.detailsRow}>
                        {this.renderBottomIcon()}
                    </View>
                </View>
            </View>
        )
    }
    renderReason() {
        if (JSON.parse(this.state.getData.menus)[0].type == 'text') {
            return (
                <View style={styles.reasonStyle}>
                    <View style={styles.closeButton}>
                        <TouchableOpacity style={{ width: 20, height: 20, right: 5, top: 5 }}
                            onPress={() => this.closeImg()}>
                            <Image style={{ width: 20, height: 20, }}
                                source={require('../../img/unity/close.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.information}>
                        <Text style={{ color: 'white', paddingBottom: 20, lineHeight: 25 }}>{JSON.parse(this.state.getData.menus)[0].content}</Text>
                    </ScrollView>
                </View>
            )
        }
        if (JSON.parse(this.state.getData.menus)[0].type == 'video') {
            return (
                <ScrollView
                    //horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    style={{ width: screen.width, height: screen.height * 2, paddingTop: screen.height + 50 }}>
                    {this.renderVideoBody()}
                </ScrollView>
            )
        }
    }
    rendertextOpen() {
        return (
            <View style={styles.reasonStyle}>
                <View style={styles.closeButton}>
                    <TouchableOpacity style={{ width: 20, height: 20, right: 5, top: 5 }}
                        onPress={() => this.closeText()}>
                        <Image style={{ width: 20, height: 20, }}
                            source={require('../../img/unity/close.png')}
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.information}>
                    <Text style={{ color: 'white', paddingBottom: 20, lineHeight: 25 }}>{this.state.text}</Text>
                </ScrollView>
            </View>
        )
    }
    closeText() {
        this.setState({
            intro: false
        })
    }
    closeImg() {
        this.setState({
            reason: false
        })
    }

    checkPage(page) {
        // alert(JSON.stringify(page))
        let videoData = JSON.parse(JSON.parse(JSON.stringify(JSON.parse(this.state.getData.menus)[1].content)))
        videoData.forEach((data, index) => {
            if (page == index) {
                this.setState({
                    paused: false,
                })
            } else {
                this.setState({
                    paused: true
                })
            }
        })
    }

    _onScrollEnd(e) {
        let width = screen.width;
        let currentOffsetX = e.nativeEvent.contentOffset.x;
        let page = parseInt(currentOffsetX / width);
        this.scrollPage = page;
        this.checkPage(page)
        // alert("滚动时，页数为"+page)
        // select new dropdown item
    }


    renderVideo() {
        return (
            <ScrollView
                showsHorizontalScrollIndicator={false}
                //horizontal={true}
                style={{ backgroundColor: 'black', width: screen.width, height: screen.height, paddingTop: 50 }}>
                <View style={{ width: screen.width, margin: screen.width * 0.023, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {this.state.openVideoDetail ? this.renderVideoBody( this.state.videoNum) : this.renderVideoAll()}
                </View>
            </ScrollView>
        )
    }
    renderVideoAll() {
        let arr = []
        let videoData = JSON.parse(JSON.parse(JSON.stringify(JSON.parse(this.state.getData.menus)[1].content)))
        arr.push(
            <View style={{ height: 20, width: screen.width }}></View>
        )
        for (let i = 0; i < videoData.length; i++) {
            let url = videoData[i].url
            let name = videoData[i].name
            arr.push(
                <TouchableOpacity style={{
                    width: screen.width * 0.43,
                    height: screen.width * 0.43 * 140 / 245,
                    margin: screen.width * 0.023,
                    marginTop: 30,
                }}
                    onPress={() => this.openVideoDetail(i)} >
                    <Image style={{ width: '100%', height: '100%' }}
                        source={{ uri: 'http://res.vesal.site/pathology/img/T_JBGK001.jpg' }} />
                    <Text style={{ color: 'white', fontSize: size(23) }}>{name}</Text>
                </TouchableOpacity>
            )
        }
        arr.push(
            <View style={{ height: 80, width: screen.width }}></View>
        )
        return arr
    }
    openVideoDetail(i) {
        this.setState({
            openVideoDetail: true,
            videoNum: i
        })
        DeviceEventEmitter.emit("closeHomeModule", { closeUnity: true });
    }
    renderVideoBody(i) {
        let arr = []
        let url = ''
        try {
            let videoData = JSON.parse(JSON.parse(JSON.stringify(JSON.parse(this.state.getData.menus)[1].content)))
            if (i !== undefined&&i!==''&&i!==null) {
                url = videoData[i].url
            }else {
                url = JSON.parse(this.state.getData.menus)[0].content
            }
            arr.push(
                <View style={{ width: screen.width, height: screen.height - 50, justifyContent: 'center', alignItems: 'center' }}>
                    <Video
                        //autoPlay
                        autoPlay={this.state.paused}
                        scrollBounce
                        volume={0.8}
                        inlineOnly
                        style={{ width: '100%', height: '100%' }}
                        url={url}
                        ref={(ref) => {
                            this.video = ref
                        }}
                        onError={(msg) => {
                            this.playVideoError(msg)
                        }}
                        onFullScreen={(status) => {
                            status ? this.props.sendMsgToUnity('landscape', '', '') : this.props.sendMsgToUnity('portrait', '', '');
                        }}
                    />
                    <MyTouchableOpacity style={{
                        position: 'absolute',
                        height: size(60),
                        width: size(60),
                        left: 10,
                        top: 27,
                        flexDirection: 'row',
                        alignItems: 'center',
                        zIndex: 9999999999,
                    }} onPress={() => {
                        this.setState({
                            paused: false
                        })
                        this.closeVideo(i)
                    }}>
                        <Image source={require('../../img/unity/close.png')} style={{
                            width: 25,
                            height: 25,
                            resizeMode: 'contain'
                        }} />
                    </MyTouchableOpacity>
                </View>
            )
        } catch (e) {
            Alert.alert('', '该视频暂未开放, 敬请期待.', [{ text: '我知道了' }])
            this.clickBack('返回')
        }

        return arr
    }
    closeVideo(i) {
        if (this.state.EnterNowScreen == "isMainScreen") {
            {
                i !== undefined&&i!==''&&i!==null ?
                    this.setState({ openVideoDetail: false })
                    :
                    this.setState({ reason: false, title: true })
            }
        } else {
            {
                i !== undefined&&i!==''&&i!==null ?
                    this.setState({  openVideoDetail: false})
                    :
                    this.setState({ reason: false, })
            }
        }
        DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
    }
    playVideoError(msg) {
        Alert.alert('', '该视频暂未开放, 敬请期待.', [{ text: '我知道了' }])
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
                        this.props.sendMsgToUnity(unityMessages[index], '', '');
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
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: size(60) }}>
                {arr}
            </View>
        );
    }
    renderBottomIcon() {
        let Arr = [];
        let data = this.state.bottomIcon
        let getData0 = ''//成因
        let getData1 = ''//治疗
        this.state.getData !== "" ? JSON.parse(this.state.getData.menus) != null && JSON.parse(this.state.getData.menus)[1] != null ? getData1 = JSON.parse(this.state.getData.menus)[1].type : getData1 = '' : null
        this.state.getData !== "" ? JSON.parse(this.state.getData.menus) != null && JSON.parse(this.state.getData.menus)[0] != null ? getData0 = JSON.parse(this.state.getData.menus)[0].type : getData0 = '' : null
        for (let i = 0; i < data.length; i++) {
            Arr.push(
                <TouchableOpacity style={styles.btnStyle} key={i} onPress={() => {
                    this.clickBack(data[i].title)
                }}>
                    <Image style={styles.btnImgStyle} source={data[i].img} />
                    <Text style={styles.btnTextStyle}>{data[i].title}</Text>
                </TouchableOpacity>
            )
            if (this.state.EnterNowScreen == "isNotMainScreen" && data[i].title == "3D模型") {
                Arr.pop()
            }
            if (data[i].title == "成因" && (getData0 == '' || (getData0 !== 'text' && getData0 !== 'video'))) {
                Arr.pop()
            }
            if (data[i].title == "治疗" && (getData1 == '' || getData1 !== 'zhiliao')) {
                Arr.pop()
            }
            if (data[i].title == "简介" && (this.state.text == 'no' || this.state.text == null)) {
                Arr.pop()
            }
        }
        return Arr
    }

    async checkPerm(){
        let isUse = false;
        let url = api.base_uri + "/v1/app/orthope/combo/checkComboisExpire?comboCode=ORTHOPE_VIP";
        let tokens = await storage.get("userTokens");
       await fetch(url,{
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        }).then(resp => resp.json())
            .then(result =>{
                if(result.code == 0 && result.result == 'yes'){
                    isUse = true;
                }
            })
        return isUse;

    }

    clickBack(title) {
        //alert(this.props.load_app_id)
        //alert(this.state.getData.open_model)
        let msg = {
            "struct_version": "1",
            "app_type": "medical",
            "app_version": "1",
            "ab_path": "http://fileprod.vesal.site/upload/unity3D/android/zip/medical/v330/RA0801014.zip",
            "youke_use": "disabled",
            // "cate_id": 42,
            "platform": "android",
            "first_icon_url": "http://fileprod.vesal.site/upload/unity3D/android/img/medical/v240/v2/RA0801014.png",
            "visible_identity": null,
            "is_charge": "yes",
            "ab_list": null,
            "struct_id": 606,
            // "struct_name": "颈部",
            "struct_sort": null,
            "noun_id": null,
            "struct_code": this.props.load_app_id,
            "app_id": `${this.props.load_app_id}_GK`,
            "showModelList": this.state.getData.open_model
        }


        if (title == "成因") {
            let isUse = this.checkPerm();
            if(isUse){
                Alert.alert("提醒", "请先购买套餐后使用~");
                this.props.navigation.navigate('BuyVip')
            }else {
                if (JSON.parse(this.state.getData.menus)[0].type == 'video') {
                    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: true });
                }
                if (JSON.parse(this.state.getData.menus)[0].type == 'text') {
                    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
                }
                this.setState({
                    reason: true,
                    //title: false,
                    video: false,
                    intro: false,
                    bottomIcon: this.state.bottomIconNo,
                })
            }


        }
        if (title == "简介") {
            let isUse = this.checkPerm();
            if(isUse){
                Alert.alert("提醒", "请先购买套餐后使用~");
                this.props.navigation.navigate('BuyVip')
            }else {
                this.setState({
                    intro: true,
                    title: false,
                    reason: false,
                    video: false,
                    textOpen: false,
                    bottomIcon: this.state.bottomIconNo,
                })
                DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
            }

        }
        if (title == "返回") {
            if (this.state.EnterNowScreen == 'isMainScreen') {
                if (this.state.video || this.state.reason || this.state.intro) {
                    this.setState({
                        video: false,
                        reason: false,
                        title: true,
                        bottomIcon: this.state.bottomIconNo,
                    })
                    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
                    return
                }
                this.setState({
                    details: false,
                    title: true,
                    bottomIcon: this.state.bottomIconNo,
                })
                DeviceEventEmitter.emit("closeHomeModule", { closeBigImg: true });
                DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
            } else {
                if (this.state.video || this.state.reason || this.state.intro) {
                    this.setState({
                        video: false,
                        reason: false,
                        intro: false,
                        bottomIcon: this.state.bottomIconNo,
                    })
                    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
                    return
                }
                this.props.sendMsgToUnity('back', '', '')
                if (this.state.lastImgState) {
                    DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
                    DeviceEventEmitter.emit("closeHomeModule", { closeBigImg: false });
                    //alert('关闭搜索，打开图片')
                    this.props.setImg()
                } else {
                    DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
                    DeviceEventEmitter.emit("closeHomeModule", { closeBigImg: true });
                    //alert('关闭搜索，打开图片')
                }
                this.setState({
                    EnterNowScreen: "isMainScreen",
                    title: true,
                    text: 'no'
                })
                this.props.setScreen("isMainScreen")
            }
        }
        if (title == "康复") {

            // alert(JSON.stringify(this.state.getData));
            let isUse = this.checkPerm();
            if(isUse){
                Alert.alert("提醒", "请先购买套餐后使用~");
                this.props.navigation.navigate('BuyVip')
            }else {
                this.props.navigation.navigate('Recovery', { patNo: this.props.patNo, sick: this.state.getData });
                this.setState({
                    video: false,
                    title: false,
                    reason: false,
                    intro: false,
                    bottomIcon: this.state.bottomIconNo,
                })
                DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
            }

        }
        if (title == "治疗") {
            let isUse = this.checkPerm();
            if(isUse){
                Alert.alert("提醒", "请先购买套餐后使用~");
                this.props.navigation.navigate('BuyVip')
            }else {
                this.setState({
                    video: true,
                    title: false,
                    reason: false,
                    intro: false,
                    bottomIcon: this.state.bottomIconTab2,
                })
                DeviceEventEmitter.emit("closeHomeModule", { closeUnity: true });
            }

        }
        if (title == "3D模型") {
            let isUse = this.checkPerm();
            if(isUse){
                Alert.alert("提醒", "请先购买套餐后使用~");
                this.props.navigation.navigate('BuyVip')
            }else {
                if (this.state.EnterNowScreen == 'isMainScreen') {

                    this.props.sendMsgToUnity("app", msg, 'json')
                    DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
                    DeviceEventEmitter.emit("closeHomeModule", { onlyCloseBigImg: true });
                    this.setState({
                        EnterNowScreen: "isNotMainScreen",
                        video: false,
                        reason: false,
                        title: false,
                        details: false,
                        //showLoading:true,
                        lastImgState: this.props.img,
                        bottomIcon: this.state.bottomIconNo,
                    })
                    DeviceEventEmitter.emit("closeHomeModule", { closeUnity: false });
                    this.props.setScreen("isNotMainScreen")
                } else {
                    alert('您已处于3D模型')
                }
            }

        }
    }
    showDetails() {
        this.setState({
            details: true,
        })
    }
    fayin(name) {
        name = name.replace("_L", "").replace("_R", "").replace("_左", "").replace("_右", "");
        if (Platform.OS != "ios") {
            this.initVoice();
        }
        VoiceUtils.speak(name);
    }
    initVoice() {
        if (index == 0) {
            VoiceUtils.init(0);
            index++
        }
    }
}