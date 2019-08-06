import React, { Component } from "react";
import { StyleSheet, View, DeviceEventEmitter } from "react-native";
import { screen } from "../../common";
import { color } from "../../widget";
import ScrollableTabView, {
    DefaultTabBar
} from "react-native-scrollable-tab-view";

import { RefreshState } from "react-native-refresh-list-view";
import OrderItem from "./OrderItem";
import { storage } from "../../common/storage";
import TitleBar from '../../scene/Home/TitleBar';
import { size } from "../../common/ScreenUtil";


export default class MyOrder extends Component {
    static navigationOptions = {
        header: null
    };




    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            refreshState: RefreshState.Idle,
            title:'我的订单'
        };
    }
    componentWillMount() {

    }

    render() {
        return (
            <View style={{ height: '100%' }}>

                <TitleBar title={this.state.title} navigate={this.props.navigation} />

                <View
                    style={{
                           height:'100%'

                    }}>
                    <ScrollableTabView
                        style={styles.container}
                        renderTabBar={() => <DefaultTabBar />}
                        tabBarUnderlineStyle={styles.lineStyle}
                        tabBarActiveTextColor={color.main}>

                        <View style={styles.textStyle} tabLabel="全部订单">
                            <OrderItem orderState="" navigation={this.props.navigation} />
                        </View>

                        <View style={styles.textStyle} tabLabel="已完成">
                            <OrderItem orderState="finished" navigation={this.props.navigation} />
                        </View>

                        <View style={styles.textStyle} tabLabel="待支付">
                            <OrderItem orderState="waitPayment" navigation={this.props.navigation} />
                        </View>
                        <View style={styles.textStyle} tabLabel="已取消">
                            <OrderItem orderState="canceled" navigation={this.props.navigation} />
                        </View>

                    </ScrollableTabView>
                    <View style={{height:size(148)}}></View>
                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    lineStyle: {
        width: screen.width / 4,
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
});
