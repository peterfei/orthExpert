import React, {Component} from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    ImageBackground,
    ScrollView
} from "react-native";
import LoginPageForm from "./LoginPageForm";
import NetInfoDecorator from "../../common/NetInfoDecorator";
import {screen, system} from "../../common";
import {NavigationActions,StackActions} from "react-navigation";
import {storage} from "../../common/storage";
import SelectIdentity from "../Register/SelectIdentity";
import {size} from "../../common/ScreenUtil";
import ETTLightStatus from "../../common/ETTLightStatus";
import {groupBy, changeArr, getRelationData} from "../../common/fun";
import Orientation from 'react-native-orientation';
// import console = require("console");

Orientation.lockToPortrait();//强制竖屏

export default class LoginPage extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: '登录'
        }
    }


    async componentDidMount() {
        // debugger
        console.log("======================================");
        let tokens = await storage.get("userTokens", "");
        // debugger
        if (!(tokens == -1 || tokens == -2)) {
            if (tokens.member.isYouke == "yes") {
                return false;
            }
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({routeName: "HomeScreen"})]
            });
            this.props.navigation.dispatch(resetAction);
        }
    }

    onUnityMessage(event) {

    }

    render() {
        return (
            <View style={styles.container}>
                <ETTLightStatus color={'#ffffff'} barColor={'dark-content'}/>

                <ScrollView keyboardShouldPersistTaps={"always"}
                            showsVerticalScrollIndicator={false}>
                    <LoginPageForm navigation={this.props.navigation}/>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#ffffff'
    },
});
