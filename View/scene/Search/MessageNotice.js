import React, { Component, PureComponent } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Platform,
    NetInfo,
    Linking,
    DeviceEventEmitter,
    AppState,
    ActivityIndicator,
    InteractionManager,StatusBar
} from "react-native";
import { size } from "../../common/ScreenUtil";
import ScrollableTabView, {
    DefaultTabBar,
    ScrollableTabBar
} from "react-native-scrollable-tab-view";
import { screen, system } from "../../common";

import { NavigationActions } from "react-navigation";
import { storage } from "../../common/storage";
import api from "../../api";
import ReplyScreen from "../../scene/Search/ReplyScreen"
import SystemScreen from "../../scene/Search/SystemScreen";

export default class MessageNotice extends PureComponent {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    async componentDidMount() {


    }
    _onJump() {
        this.props.navigation.goBack();
    }
    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    hidden={false}
                />
                <View style={styles.titleBar}>
                    <TouchableOpacity style={{ flex: 2, justifyContent: 'center', alignItems: 'center', height: size(40), }}
                        onPress={this._onJump.bind(this)}>
                        <Image source={require('../../img/search/backjt.png')} style={{ width: size(40), height: size(40) }}></Image>
                    </TouchableOpacity>
                    <View style={{ flex: 11, alignItems: 'flex-start', justifyContent: 'center', height: size(30), }}>
                        <Text style={{ fontSize: size(34), color: '#fff', fontWeight: 'bold' }}>消息通知</Text>
                    </View>
                </View >
                <ScrollableTabView
                    tabBarActiveTextColor={"#696969"}
                    tabBarInactiveTextColor={"#A6A6A6"}
                    tabBarTextStyle={{
                        fontWeight: "bold",
                    }}
                    scrollWithoutAnimation={true}
                    tabBarBackgroundColor={"#fff"}
                    tabBarUnderlineStyle={{
                        width: screen.width / 2,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        height: size(3),

                    }}
                    renderTabBar={() => (
                        <DefaultTabBar
                            style={{ borderWidth: 0, elevation: 0 }}
                        />
                    )}
                >
                    <SystemScreen tabLabel='系统通知'{...this.props} style={{ backgroundColor: "#f0f2f6" }}>
                        {/*  */}

                    </SystemScreen>
                    {/* </ScrollView> */}

                    <ReplyScreen tabLabel='回复'{...this.props} style={{ backgroundColor: "#f0f2f6" }}>

                    </ReplyScreen>
                </ScrollableTabView>
            </View>

        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f0f2f6",
        flex: 1
    },
    titleBar: {
        height: size(130),
        paddingTop: size(70),
        flexDirection: "row",
        backgroundColor: "#0094e5",
        width: '100%',

    },
    messageTotalView: {
        backgroundColor: '#fff',
        marginTop: size(8),
        alignItems: "center"
    },
    titleViewSty: {
        flexDirection: "row",
        width: screen.width * 0.93,
        //backgroundColor:'yellow'
    },
    imgSty: {
        width: screen.width / 9.5,
        height: screen.width / 9.5,
    },
    messageTxtSty: {
        color: "#434549",
        fontSize: size(27)
    }
});


