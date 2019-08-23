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
import RecoveryItem from "./RecoveryItem"
import { screen, system } from "../../common";
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
                          orderState="firstScreen" 
                          navigation={this.props.navigation} />
                    </View>

                    <View style={styles.textStyle} tabLabel="我的方案">
                        <RecoveryItem 
                        orderState="secondScreen" 
                        navigation={this.props.navigation} />
                    </View>

                </ScrollableTabView>
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
                    <TouchableHighlight style={{
                        position: 'absolute',
                        right: 10,
                        width: size(40),
                        height: size(40)
                    }}
                        onPress={() => {this.props.navigation.navigate('kfSickPlanList', {'sick': this.props.navigation.state.params.sick})}}>
                        <Image style={styles.backImg}
                            source={require('../../img/kf_main/kf_plan_add.png')} />
                    </TouchableHighlight>
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
        width: size(25),
        height: size(25)
    },
    backImg: {
        height: '100%',
        width: '100%'
    },
    lineStyle: {
        width: screen.width / 2,
        height: 2,
        backgroundColor: color.main
    },
    textStyle: {
        flex: 1,
        // fontSize: 20,
        marginTop: 1,
        height: 20
        // textAlign: "center"
    }
})