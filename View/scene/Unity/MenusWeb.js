import React from "react";
import {Button,ScrollView, DeviceEventEmitter,Image,WebView, TouchableOpacity, Text, View, StyleSheet} from "react-native";
import {size} from "../../common/ScreenUtil";


export default class MenusWeb extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            info:this.props.navigation.state.params.web
        };

    }

    componentWillMount() {

    }


    render() {

        let head = <View style={{backgroundColor: "#323232", height: size(120),}}>
            <TouchableOpacity
                onPress={() => this.props.navigation.goBack()}
                style={{
                    width: size(45),
                    height: size(45),
                    position: 'absolute',
                    left: size(30),
                    top: size(60)
                }}>
                <Image source={require('../../img/common/back.png')}
                       style={{width: size(50), height: size(50)}}/>
            </TouchableOpacity>
            <Text
                style={{
                    color: "#FFF",
                    fontSize: size(29),
                    fontWeight: "bold",
                    lineHeight: size(120),
                    marginTop: size(25),
                    alignSelf: "center"
                }}>
                {this.state.info.title}
            </Text>
        </View>;
                let h =this.state.info.content
        return (
            <WebView
                source={{uri:"http://fileprod.vesal.site/htmlfile/v1/sanjiaoji.html"}}
                style={{width:'100%',height:'100%'}}
            />


        );
    }
}
const styles = StyleSheet.create({});
