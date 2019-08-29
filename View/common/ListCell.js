/**
 * Created by xzh on 14:09 2019-08-02
 *
 * @Description:
 */


import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { AppDef, Line, HttpTool, FuncUtils } from './index';
import { size } from './Tool/ScreenUtil';
import { NavigationActions, StackActions } from "react-navigation";
import { storage } from "./storage";
import DeviceInfo from "react-native-device-info";
import NetInterface from "./NetInterface";
import { NativeModules } from "react-native";

export default class ListCell extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
    }


    async checkVersion() {
        const currVersion = DeviceInfo.getVersion();
        const netInterface = NetInterface.getAppVersion + "?version=" + currVersion + "&plat=" + Platform.OS;

        HttpTool.GET(netInterface)
            .then(res => {
                // alert(JSON.stringify(res))
                if (res.List.length > 0) {
                    let item = res.List[0];
                    let serverVersion = item.version;
                    let localVersion = new Number(DeviceInfo.getVersion().replace(/\./g, ""));
                    if (serverVersion > localVersion) {
                        FuncUtils.CheckAppVersion(item)
                    } else {
                        Alert.alert(
                            "",
                            "您已是最新版本" + DeviceInfo.getVersion() + ",无需更新!"
                        );
                    }
                } else {
                    Alert.alert(
                        "",
                        "您已是最新版本" + DeviceInfo.getVersion() + ",无需更新!"
                    );
                }
            })
            .catch(error => {
                console.log("error:" + JSON.stringify(error))
            })
    }

    async handleSelection() {
        if (this.props.route && this.props.route.length > 0) {
            if (this.props.route == 'contactUs') {
                Linking.openURL("tel:02968579950");
            } else if (this.props.route == 'version') {
                await this.checkVersion();
            } else if (this.props.route == 'MyOrder' || this.props.route == 'ActivationCode') {
                let memberInfo = await storage.get("memberInfo")
                if (memberInfo.isYouke == "yes"){
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
                    });
                    this.props.navigation.dispatch(resetAction);
                }else {
                this.props.navigation.navigate(this.props.route);
            }
            } else {

                this.props.navigation.navigate(this.props.route);
            }
        }

    }

    render() {
        const { title, imgPath } = this.props;
        let leftIcon = imgPath && (
            <Image style={styles.icon} source={imgPath} />
        );
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
                this.handleSelection()
            }}>
                <View style={styles.back}>
                    <View style={styles.container}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {leftIcon}
                            <Text style={{ fontSize: AppDef.ContentSize, color: AppDef.Black }} allowFontScaling={false}>
                                {title}
                            </Text>
                        </View>
                        <Image source={require('../img/kf_mine/mine_arrow.png')}
                            style={{ width: size(14), height: size(24), marginRight: size(57) }} />
                    </View>
                    <Line color='rgba(231,231,231,1)' left={size(78)} />
                </View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    back: {
        width: '100%',
        height: size(92),
    },
    container: {
        width: '100%',
        height: size(91.5),
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    icon: {
        width: size(34),
        height: size(34),
        marginLeft: size(25),
        marginRight: size(18),
        marginTop: size(29),
        marginBottom: size(29),

    }
})
