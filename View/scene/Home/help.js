import React, { Component } from 'react';
import {
    Platform, StyleSheet, Text, View, BackHandler,
    StatusBar,
    Animated,
    TouchableHighlight, Image, TouchableOpacity, DeviceEventEmitter, ScrollView,

} from 'react-native';
import { screen, system } from "../../common";

import { size } from '../../common/ScreenUtil';

export default class HomeScreen extends Component {
    state={
        video:false
    }
    render() {
        return (
            <View style={{ position: 'absolute', height: screen.height, width: screen.width,justifyContent:'center',alignItems:'center' }}>
                <View style={styles.container}>
                    <View style={styles.top}>
                        <Text style={{ fontWeight: 'bold', color: "white", fontSize: 18 }}>操作指示</Text>
                        <TouchableOpacity style={styles.close} onPress={()=>alert('关闭')}>
                            <Image style={{ width: "100%", height: "100%" }}
                                source={require('../../img/unity/close.png')} />
                        </TouchableOpacity>
                    </View>
                    <Image style={styles.imgStyle}
                        source={require('../../img/unity/unity_yd.png')} />
                    <View style={styles.bottom}>
                        <Text style={styles.helpText} onPress={()=>alert(1111)}>视频引导</Text>
                        <View style={{flexDirection:'row'}}><Text>更多帮助，请前往：个人中心--帮助中心</Text><Text style={styles.changText}>去查看&nbsp;>></Text></View>
                    </View>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 450*0.8,
        height: 390*0.8,
        backgroundColor:'#0094E1',
        borderRadius:10
    },
    top: {
        justifyContent:'center',
        alignItems: 'center',
        height: 45*0.8,
        width: "100%"
    },
    imgStyle: {
        height: 241*0.8,
        width: '100%'
    },
    close: {
        position: 'absolute',
        right: 7,
        top: 7,
        width: 28*0.8,
        height: 28*0.8
    },
    bottom: {
        height: 104*0.8,
        width: '100%',
        alignItems:'center',
        justifyContent:'space-around',
        backgroundColor:'white',
        borderBottomRightRadius:10,
        borderBottomLeftRadius:10
    },
    helpText: {
        fontWeight: 'bold',
        color: "white",
        fontSize: 15,
        padding:10,
        paddingLeft:20,
        paddingRight:20,
        backgroundColor:'#0094E1',
        borderRadius:5
    },
    changText:{
        color:'#0094E1',
        paddingLeft:10
    }
})