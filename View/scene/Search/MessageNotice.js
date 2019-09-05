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
    InteractionManager, StatusBar
} from "react-native";
import { size } from "../../common/ScreenUtil";
import ScrollableTabView, {
    DefaultTabBar,
    ScrollableTabBar
} from "react-native-scrollable-tab-view";
import { screen, system } from "../../common";

import { NavigationActions, StackActions } from "react-navigation";
import { storage } from "../../common/storage";
import ReplyScreen from "../../scene/Search/ReplyScreen"
import SystemScreen from "../../scene/Search/SystemScreen";
import TitleBar from '../../scene/Home/TitleBar'
export default class MessageNotice extends PureComponent {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: '消息通知'
        }
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
                {/*消息标题栏*/}
                <TitleBar navigate={this.props.navigation} title={this.state.title} />
                {/*消息内容 - 系统通知 - 回复*/}
                <ScrollableTabView
                    tabBarActiveTextColor={"#0094e1"}
                    scrollWithoutAnimation={true}
                    tabBarBackgroundColor={"#fff"}
                    tabBarUnderlineStyle={{
                        width: screen.width / 4,
                        height: size(3),
                        backgroundColor: '#0094e1',
                        marginLeft: screen.width / 4 / 2
                    }}
                    renderTabBar={() => (
                        <DefaultTabBar
                           // style={{ borderWidth: 0, elevation: 0 }}
                        />
                    )}
                >

                    <SystemScreen tabLabel='系统通知'{...this.props} style={{ backgroundColor: "#f0f2f6" }} />

                    <ReplyScreen tabLabel='回复'{...this.props} style={{ backgroundColor: "#f0f2f6" }} />

                </ScrollableTabView>

            </View>

        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    titleBar: {
        height: size(148),
        paddingTop: size(70),
        flexDirection: "row",
        backgroundColor: "#0094e5",
        width: '100%',

    },
});


