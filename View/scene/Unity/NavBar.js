import React, {Component} from "react";
import {
    ScrollView,
    Animated,
    StyleSheet,
    Text,
    View,
    Button,
    Easing,
    TouchableOpacity,
    Alert,
    TextInput,
    WebView,
    Image,
    Platform,BackAndroid
} from "react-native";
import {size} from "../../common/ScreenUtil";
import Toast from "react-native-easy-toast";

export default class NavBar extends Component {

    static navigationOptions = {
        header: null
    };




    constructor(props) {
        super(props);
        this.state = {
            info: this.props.navigation.state.params.info
        };
    }

    componentWillMount() {

    }


    back(){
        this.props.onPress("back",{});
        this.props.navigation.goBack();
    }


    render() {


        return (
            <View style={{flexDirection: 'row', backgroundColor: "#323232", height: size(128) ,
                position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,zIndex:999999
            }}>
                <TouchableOpacity
                    onPress={() => this.back()}
                    style={{flex: 2,marginTop:size(45)}}
                >
                    <Image source={require('../../img/common/back.png')}
                           style={{width: size(50), height: size(50), marginLeft: size(30),}}/>
                </TouchableOpacity>

                <Text style={{
                    flex: 4,
                    marginTop: size(40),
                    lineHeight: size(88),
                    color: "#FFF",
                    textAlign: 'center',
                    fontSize: size(27)
                }}>
                 {/*   {this.state.info.struct_name}*/}   {this.state.info.sm_name}
                </Text>

                <TouchableOpacity
                    style={{flex: 1, marginTop: size(40), justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../../img/unity/fenxiang.png')}
                           style={{width: size(32), height: size(38),}}/>
                    <Text style={{fontSize: size(18), color: "#FFF"}}>分享</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1, marginTop: size(40), justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../../img/unity/shouchang.png')}
                           style={{width: size(36), height: size(38), }}/>
                    <Text style={{fontSize: size(18), color: "#FFF"}}>收藏</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({

});
