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
        reason: true,
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
                {this.state.details && !this.state.search ? this.details() : <View style={styles.place}></View>}
            </View>

        )
    }
    details() {
        return (
            <View style={styles.details}>
                {/* {this.state.video ? this.renderVideo() : null} */}
                {this.state.reason ? this.renderReason() : null}
                <View style={[styles.detailsRow, { marginTop: 5 }]}>
                    <View>
                        <Text style={{ color: 'white', fontWeight: 'bold', paddingLeft: 15 }}>{this.state.getData.pat_name}</Text>
                    </View>
                    <MyTouchableOpacity
                        onPress={() => {
                            this.fayin(this.state.getData.pat_name + "。" + this.state.getData.pat_name)
                        }}
                        style={{ position: 'absolute', left: '50%', transform: [{ translateX: -40 }], alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
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
        )
    }
    renderReason() {
        return ( //{this.state.getData.pat_name}
            <View style={styles.reasonStyle}>
                <TouchableHighlight style={{ width: 20, height: 20, position: 'absolute', right: 5, top: 5 }}
                    onPress={() => this.closeImg()}>
                    <Image style={{ width: 20, height: 20, }}
                        source={require('../../img/unity/cclose.png')}
                    />
                </TouchableHighlight>
                <ScrollView>
                    <Text style={{ color: 'white' }}>xxxxxxxxxxxxxxx</Text>
                </ScrollView>
            </View>
        )
    }
    renderVideo() {
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
                        alert('关闭')
                    }}>
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
    renderBottomIcon() {
        let Arr = [];
        let data = this.state.bottomIcon
        for (let i = 0; i < data.length; i++) {
            Arr.push(
                <TouchableOpacity style={styles.btnStyle} key={i} onPress={() => {
                    this.clickBack()
                }}>
                    <Image style={styles.btnImgStyle} source={data[i].img} />
                    <Text style={styles.btnTextStyle}>{data[i].title}</Text>
                </TouchableOpacity>
            )
        }
        return Arr
        //   let arr = [];
        //   arr.push(
        //     <TouchableOpacity style={styles.btnStyle} onPress={() => {
        //         this.clickBack()
        //     }}>
        //         <Image style={styles.btnImgStyle} source={require('../../img/unity/fanhuiyuan.png')}/>
        //         <Text style={styles.btnTextStyle}>返回</Text>
        //     </TouchableOpacity>
        // )
        // this.state.sourceData.forEach((item, index) => {
        //     let icon = item.res_fy_icon_url;
        //     let rwId = this.state.currentShowSource.rw_id == undefined ? '' : this.state.currentShowSource.rw_id;
        //     let color = rwId == item.rw_id ? '#60ccff' : '#fff';
        //     let data =
        //         arr.push(
        //             <MyTouchableOpacity style={styles.btnStyle} onPress={() => {
        //                 this.handleActionSource(item)
        //             }} key={index}>
        //                 <Image style={[styles.btnImgStyle, {tintColor: color}]} source={{uri: icon}}/>
        //                 <Text style={[styles.btnTextStyle, {color: color}]}>{item.secondFyName}</Text>
        //             </MyTouchableOpacity>
        //         )
        // })
        // return (
        //     <View style={{
        //         flexDirection: 'row',
        //         height: size(90),
        //         alignItems: 'center',
        //         backgroundColor: 'rgba(0,0,0,0.8)',
        //     }}>
        //         {arr}
        //     </View>
        // )
    }
    clickBack() {
        // this.setState({

        // })
        alert('返回')
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