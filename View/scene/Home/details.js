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
    Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter, ScrollView
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
        title:true,
        getData: '',
        EnterNowScreen: "isMainScreen",
        lastImgState:false,
        bottomIcon: [
            { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
            { img: require('../../img/home/tab1.png'), title: '成因' },
            { img: require('../../img/home/tab2.png'), title: '治疗' },
            { img: require('../../img/home/tab3.png'), title: '3D模型' },
            { img: require('../../img/home/tab4.png'), title: '康复' }
        ],
        showLoading:false
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
        ]

    };

    componentDidMount() {
    }
    componentWillUnmount() {
        _.each(this.listeners, listener => {
            listener[0].remove();
            listener[1].remove();
            listener[2].remove();
        });
        this.timer && clearInterval(this.timer);
    }
    render() {
        return (
            <View style={{ position: 'absolute', bottom: 0, width: screen.width }}>
                {this.state.details && !this.state.search ? this.details() : <View style={styles.place}></View>}
                <LoadingView showLoading={ this.state.showLoading } />
            </View>

        )
    }
    details() {
        return (
            <View style={styles.details}>
                {this.state.video && this.state.getData.menus !== null ? this.renderVideo() : null}
                {this.state.reason && this.state.getData.menus !== null ? this.renderReason() : null}
                <View style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View style={styles.detailsRow}>
                       {this.state.title? <View style={{ alignItems: 'center', width: "100%", position:'absolute',bottom:screen.height*0.75 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold',fontSize:30 }}>{this.state.getData.pat_name}</Text>
                        </View>
                        :null
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
                    </View>
                    <View style={styles.detailsRow}>
                        {this.renderBottomIcon()}
                    </View>
                </View>
            </View>
        )
    }
    renderReason() {
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
                    <Text style={{ color: 'white', paddingBottom: 20 }}>{JSON.parse(this.state.getData.menus)[0].content}</Text>
                </ScrollView>
            </View>
        )
    }
    closeImg() {
        this.setState({
            reason: false
        })
    }
    renderVideo() {
        return (
            <View style={styles.videoSourceStyle}>
                <View style={{
                    height: size(60),
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <MyTouchableOpacity onPress={() => this.setState({ video: false,title:true })}>
                        <Image source={require('../../img/unity/close.png')} style={{
                            width: size(36),
                            height: size(36),
                            marginRight: size(20),
                            resizeMode: 'contain'
                        }} />
                    </MyTouchableOpacity>
                </View>
                <Video
                    rotateToFullScreen
                    lockPortraitOnFsExit
                    scrollBounce
                    autoPlay
                    style={{ zIndex: 9999999999 }}
                    url={JSON.parse(this.state.getData.menus)[0].content}
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
            </View>
        )
    }
    playVideoError(msg) {
        Alert.alert('', '该视频暂未开放, 敬请期待.', [{ text: '我知道了' }])
    }
    renderBottomIcon() {
        let Arr = [];
        let data = this.state.bottomIcon
        let getData = ''
        this.state.getData !== "" ? JSON.parse(this.state.getData.menus)!=null? getData = JSON.parse(this.state.getData.menus)[0].type:getData='' : null
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
            if (data[i].title == "成因" && (getData == 'video'||getData == '')) {
                Arr.pop()
            }
            if (data[i].title == "治疗" && (getData == 'text'||getData == '')) {
                Arr.pop()
            }
        }
        return Arr
    }
    clickBack(title) {
        let msg = {
            "struct_version": "1",
            "app_type": "medical",
            "app_version": "1",
            "ab_path": "http://fileprod.vesal.site/upload/unity3D/android/zip/medical/v330/RA0801014.zip",
            "youke_use": "disabled",
            "cate_id": 42,
            "platform": "android,ios",
            "first_icon_url": "http://fileprod.vesal.site/upload/unity3D/android/img/medical/v240/v2/RA0801014.png",
            "visible_identity": null,
            "is_charge": "yes",
            "ab_list": null,
            "struct_id": 606,
            "struct_name": "颈部",
            "struct_sort": null,
            "noun_id": null,
            "struct_code": "RA0801014",
            "app_id": "RA0801014",
            "showModelList": "RAMYKNWJB_ZhenGu,RAMYKNWJB_XiaHeGu,RAMYKNWJB_ShuZhui,RAMYKNWJB_SheGu"
        }
        if (title == "成因") {
            if (!this.state.video) {
                this.setState({
                    reason: true,
                    title:false
                })
            } else {
                alert('请关闭治疗')
            }
        }
        if (title == "返回") {
            if (this.state.EnterNowScreen == 'isMainScreen') {
                this.setState({
                    details: false,
                    title:true
                })
                DeviceEventEmitter.emit("closeBigImg", { closeBigImg: true });
                DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
            }else{
                this.props.sendMsgToUnity('back', '', '')
                if(this.state.lastImgState){
                    DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "showAllsearch" });
                    DeviceEventEmitter.emit("closeBigImg", { closeBigImg: false });
                }else{
                    DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
                    DeviceEventEmitter.emit("closeBigImg", { closeBigImg: true });
                }
                this.setState({
                    EnterNowScreen: "isMainScreen",
                    title:true
                })
                this.props.setScreen("isMainScreen")
            }
            this.setState({
                video: false,
                reason: false,
            })
        }
        if (title == "康复") {
            this.props.navigation.navigate('Recovery');
        }
        if (title == "治疗") {
            if (!this.state.reason) {
                this.setState({
                    video: true,
                    title:false
                })
            } else {
                alert('请关闭成因')
            }
        }
        if (title == "3D模型") {
            if (this.state.EnterNowScreen == 'isMainScreen') {

                this.props.sendMsgToUnity("app", msg, 'json')
                DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
                DeviceEventEmitter.emit("closeBigImg", { onlyCloseBigImg: true });
                this.setState({
                    EnterNowScreen: "isNotMainScreen",
                    video:false,
                    reason: false,
                    title:false,
                    details:false,
                    showLoading:true,
                    lastImgState:this.props.img
                })
                this.props.setScreen("isNotMainScreen")
            } else {
                alert('您已处于3D模型')
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