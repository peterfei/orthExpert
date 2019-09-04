import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Button,
    DeviceEventEmitter,
    Platform, TouchableHighlight,StatusBar
} from "react-native";

import { color } from "../../widget";
import ScrollableTabView, {
    DefaultTabBar
} from "react-native-scrollable-tab-view";
import RecoveryItem from "./RecoveryItem";
import MyRecoveryItem from './MyRecoveryItem';
import {AppDef, deviceHeight, deviceWidth, screen, system} from "../../common";
import { size } from "../../common/ScreenUtil";
import { storage } from "../../common/storage";

export default class Recovery extends Component {
    static navigationOptions = {
        header: null,
    }
    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    hidden={false}
                />
                {this.renderHeader()}
                <ScrollableTabView
                    style={styles.containert}
                    renderTabBar={() => <DefaultTabBar />}
                    tabBarUnderlineStyle={styles.lineStyle}
                    tabBarActiveTextColor={color.main}>

                    <View style={styles.textStyle} tabLabel="推荐训练">
                        <RecoveryItem
                         patNo={this.props.navigation.state.params.patNo}
                         navigation={this.props.navigation} />
                    </View>

                    <View style={styles.textStyle} tabLabel="我的方案">
                        <MyRecoveryItem
                          patNo={this.props.navigation.state.params.patNo}
                          navigation={this.props.navigation} />
                    </View>

                </ScrollableTabView>

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: AppDef.Blue,
                    width: deviceWidth,
                    height: size(100),
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => {
                      this.props.navigation.navigate('kfSickPlanList', {'sick': this.props.navigation.state.params.sick, 'currArea': this.props.navigation.state.params.currArea})
                  }}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/kf_main/createplanadd.png')} style={{width: size(28), height: size(28)}}/>
                        <Text style={{fontSize: size(32), color: 'white', marginLeft: size(20)}}>创建方案</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    renderHeader() {
        return (
            <View style={styles.backGround}>
                <View style={styles.topTitle}>
                    <TouchableHighlight style={styles.back}
                        onPress={() => this.props.navigation.goBack()}>
                        <Image style={styles.backImg}
                            source={require('../../img/public/left.png')} />
                    </TouchableHighlight>
                    <Text style={styles.title}>康复方案</Text>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        flex: 1,
        zIndex: 999,
    },
    containert: {
        flex: 1,
        backgroundColor: "#fff"
    },
    backGround: {
        paddingTop: 20,
        width: '100%',
        height: size(130),
        backgroundColor: 'rgb(2, 178, 236)'
    },
    topTitle: {
        width: '100%',
        position: 'absolute',
        top: 30,
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: size(33),
        fontWeight: "bold",
        color: "#ffffff"
    },
    back: {
        position: 'absolute',
        left: 10,
        width: size(40),
        height: size(40)
    },
    backImg: {
        height: '100%',
        width: '100%'
    },
    lineStyle: {
        width: screen.width / 4,
        height: size(3),
        backgroundColor: color.main,
        marginLeft:screen.width/4/2
    },
    textStyle: {
        flex: 1,
        // fontSize: 20,
        marginTop: 1,
        height: 20
        // textAlign: "center"
    }
})