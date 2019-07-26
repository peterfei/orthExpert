
/**
 * 调用说明：
 * <Loading ref={r=>{this.Loading = r}} hide = {true} /> //放在布局的最后即可
 * 在需要显示的地方调用this.Loading.show();
 * 在需要隐藏的地方调用this.Loading.close();
 */

import React, { Component } from 'react';
import {
    Platform,
    View,
    ActivityIndicator,
    Modal,Text
} from 'react-native';

import PropTypes from 'prop-types'

export default class Loading extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            title:"请求中"
        }
    }

    close() {
        if (Platform.OS === 'android') {
          /*  setTimeout(()=>{
                this.setState({modalVisible: false});
            },1000)*/
            this.setState({modalVisible: false});
        }else {
            this.setState({modalVisible: false});
        }
    }

    show(title) {
        this.setState({modalVisible: true,title:title});
    }

    render() {
        if (!this.state.modalVisible) {
            return null
        }
        let title = this.props.title
        return (
            <Modal
                animationType={"none"}
                transparent={true}
                visible={this.state.modalVisible}
                onRequestClose={() => {
                    this.close();
                }}
            >
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 100, height: 100, alignItems: 'center'}}>
                        <ActivityIndicator
                            animating={true}
                            color='white'
                            style={{
                                marginTop: 10,
                                width: 60,
                                height: 60,
                            }}
                            size="large" />
                        <Text style={{color:"#fff"}}>{this.state.title}</Text>
                    </View>
                </View>

            </Modal>
        );
    }
}

Loading.PropTypes = {
    hide: PropTypes.bool.isRequired,
};