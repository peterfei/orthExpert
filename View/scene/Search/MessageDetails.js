import React, { Component } from 'react';
import api from "../../api";
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    WebView

} from 'react-native';
import { size } from "../../common/ScreenUtil";
import { screen, system } from "../../common";
import { storage } from "../../common/storage";
import TitleBar from '../../scene/Home/TitleBar';


type Props = {};
export default class MessageDetails extends Component<Props> {
    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            SinggleContent: "",

            content: this.props.navigation.state.params.obj.content,
            title: this.props.navigation.state.params.obj.title,
        };
    }

    async componentDidMount() {
        this.getMessageSingleDetail(this.props.navigation.state.params.obj.messageId);

    }

    getMessageSingleDetail = async (messageId) => {
        let tokens = await storage.get("userTokens");
        let url =
            api.base_uri + "v1/app/msg/getMessageSingleDetail?token=" + tokens.token + "&messageId=" + messageId
        debugger
        // alert(url)
        let response = await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(result => {

                this.setState({
                    SinggleContent: result.detail.content,

                })

            })

    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#f0f2f6' }}>
                <TitleBar title={this.state.title} navigate={this.props.navigation} />

                <WebView
                    originWhitelist={['*']}
                    source={{ html: this.state.SinggleContent, baseUrl: '' }}
                />
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

});


