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
import SearchComponent from "./search";
import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
import { size } from '../../common/ScreenUtil';
import { VoiceUtils } from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import { NavigationActions, StackActions } from "react-navigation";
import { groupBy, changeArr } from "../../common/fun";
import { queryHistoryAll, insertHistory, deleteHistories, queryRecentlyUse } from "../../realm/RealmManager";
import { values, set } from 'mobx';
import Loading from "../../common/Loading";
import Toast from "react-native-easy-toast";
import api from "../../api";
import historyData from "./History.json";
import Video, { Container } from 'react-native-af-video-player';
import styles from './styles';
let unity = UnityView;
let index = 0;

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
        getData: '',
        bottomIcon: [
            { img: require('../../img/unity/fanhuiyuan.png'), title: '返回' },
            { img: require('../../img/home/tab1.png'), title: '成因' },
            { img: require('../../img/home/tab2.png'), title: '治疗' },
            { img: require('../../img/home/tab3.png'), title: '3D模型' },
            { img: require('../../img/home/tab4.png'), title: '康复' }
        ]
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
        )]

    };

    componentDidMount() {
    }
    componentWillUnmount() {
        _.each(this.listeners, listener => {
            listener[0].remove();
            listener[1].remove();
        });
        this.timer && clearInterval(this.timer);
    }
    render() {
        return (
            <View style={{ position: 'absolute', bottom: 0, width: screen.width }}>
                {this.state.details && !this.state.search ? this.details() : null}
            </View>

        )
    }
    details() {
        return (
            <View >
                {this.renderVideo()}
                {/* {this.state.video && this.state.getData.menus !== null ? this.renderVideo() : null} */}
                {this.state.reason && this.state.getData.menus !== null ? this.renderReason() : null}
                <View>
                    <View style={styles.detailsRow}>
                        <View style={{ marginTop: 5 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', paddingLeft: 15 }}>{this.state.getData.pat_name}</Text>
                        </View>
                        <MyTouchableOpacity
                            onPress={() => {
                                this.fayin(this.state.getData.pat_name + "。" + this.state.getData.pat_name)
                            }}
                            style={{ marginTop: 5, position: 'absolute', left: '50%', transform: [{ translateX: -40 }], alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Image
                                style={{ width: size(30), height: size(30), marginRight: size(10) }}
                                source={require('../../img/unity/laba.png')} />
                            <Text style={{ color: "white", }}>{this.state.getData.pat_name}</Text>
                        </MyTouchableOpacity>
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
                    <TouchableHighlight style={{ width: 20, height: 20, right: 5, top: 5 }}
                        onPress={() => this.closeImg()}>
                        <Image style={{ width: 20, height: 20, }}
                            source={require('../../img/unity/close.png')}
                        />
                    </TouchableHighlight>
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
                    <MyTouchableOpacity onPress={() => this.setState({ video: false })}>
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
                    style={{zIndex: 9999999999}}        
                    url="http://res.vesal.site/chuzheng/CZSP036.mp4"
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
    renderBottomIcon() {
        let Arr = [];
        let data = this.state.bottomIcon
        for (let i = 0; i < data.length; i++) {
            Arr.push(
                <TouchableOpacity style={styles.btnStyle} key={i} onPress={() => {
                    this.clickBack(data[i].title)
                }}>
                    <Image style={styles.btnImgStyle} source={data[i].img} />
                    <Text style={styles.btnTextStyle}>{data[i].title}</Text>
                </TouchableOpacity>
            )
        }
        return Arr
    }
    clickBack(title) {
        let msg = {
            "struct_version": "4",
            "app_type": "medical",
            "app_version": "4",
            "ab_path": "http://fileprod.vesal.site/upload/unity3D/android/zip/medical/v330/RA0801011.zip",
            "youke_use": "disabled",
            "cate_id": 27,
            "platform": "android,ios,pc",
            "first_icon_url": "http://fileprod.vesal.site/upload/unity3D/android/img/medical/v240/v2/RA0801011.png",
            "visible_identity": "",
            "is_charge": "yes",
            "ab_list": "",
            "struct_id": 465,
            "struct_name": "足与踝部",
            "struct_sort": "3",
            "noun_id": "",
            "struct_code": "RA0801011",
            "app_id": "RA0801011",
            "showModelList": "RAMYKNWZU_XiaoZhiDongQuJi,RAMYKNWZU_XiaoZhiZhanJi,RAMYKNWZU_YinZhuangJi"
        }
        if (title == "成因" && !this.state.video) {
            this.setState({
                reason: true
            })
        }
        if (title == "返回") {
            this.setState({
                details: false
            })
        }
        if (title == "康复") {
            alert(title)
        }
        if (title == "治疗" && !this.state.reason) {
            this.setState({
                video: true
            })
        }
        if (title == "3D模型") {
            this.props.sendMsgToUnity("app", msg, 'json')
            DeviceEventEmitter.emit("closeBigImg", { closeBigImg: true });
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