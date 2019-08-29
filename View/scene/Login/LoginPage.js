import React, {Component} from "react";
import {
    View,
    StyleSheet,
    ScrollView
} from "react-native";
import LoginForm from "./LoginPageForm";
import {NavigationActions,StackActions} from "react-navigation";
import {storage} from "../../common/storage";
import ETTLightStatus from "../../common/ETTLightStatus";
import Orientation from 'react-native-orientation';
import SplashScreen from "react-native-splash-screen";

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


   async componentWillMount() {
        SplashScreen.hide();
        let tokens = await storage.get("userTokens", "");

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
                    <LoginForm navigation={this.props.navigation}/>
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
