import React, { Component } from "react";
import {
    ScrollView,
    StyleSheet,
    RefreshControl,
    View,
    Text,
    Image,
    Platform,
    TouchableOpacity,
    Alert,
} from "react-native";
import { size } from "../../common/ScreenUtil";
export default class titleBar extends Component {

    static navigationOptions = {
        header: null
    };

    render() {
        return (
            <View style={styles.titleBar}>
                <TouchableOpacity style={{ flex: 2, justifyContent: 'center', alignItems: 'center', height: size(40), }}
                    onPress={() => { this.props.navigate.goBack()}}>
                    <Image source={require('../../img/public/left.png')} style={{ width: size(25), height: size(25) }}></Image>
                </TouchableOpacity>
                <View style={{ flex: 11, alignItems: 'flex-start', justifyContent: 'center', height: size(30), }}>
                    <Text style={{ fontSize: size(34), color: '#fff', fontWeight: 'bold' }}>{this.props.title}</Text>
                </View>
            </View >
        )
    }
}
const styles = StyleSheet.create({
    titleBar: {
        height: size(130),
        paddingTop: size(70),
        flexDirection: "row",
        backgroundColor: "#0094e5",
        width: '100%',

    },
})
