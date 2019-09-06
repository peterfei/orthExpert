import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    Alert,
    WebView
} from 'react-native';
import {size} from "../../common/ScreenUtil";
import TitleBar from '../../scene/Home/TitleBar';

type Props = {};
export default class problemDetails extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: '免责声明',
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <TitleBar title={this.state.title} navigate={this.props.navigation}/>
                <View style={{flex: 1}}>
                    <WebView

                        style={styles.WebViewStyle}
                        startInLoadingState={true}
                        source={{uri: 'http://vesal.site//mianzeshengming/orthopaedicsDisclaimer.html'}}
                    />
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    WebViewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -9999,
    },

});


