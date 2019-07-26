/**
 * @author daijiangping
 */
import React, {Component, PropTypes} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    Image,
    Modal,ImageBackground,
    TextInput,
    InteractionManager
} from 'react-native';
import {size} from "./ScreenUtil";
import {screen, system} from "../common";

export default class Dialog extends Component {
    constructor(props) {
        super(props)
        this.state = {visible: false, title: ''};
    }

    close = () => {
        this.setState({visible: false});
    }

    show(title: string) {
        this.setState({title: title, visible: true});

    }

//选择
    okBtn() {
        this.close();
        this.props.navigation.navigate("ShareSoftware");
    }

    renderContent = () => {
        return (
            <ImageBackground
               style={{backgroundColor: "#0094e1"}}
                resizeMode="cover"
                style={{height:size(611),width:size(555)}}
                source={require("../img/home/fenxiang.png")}>
                <TouchableOpacity     activeOpacity={0.8}     style={{height:size(611),width:size(555)}}
                                  onPress={this.okBtn.bind(this)}>

                </TouchableOpacity>
                {/* <View style={[styles.background, {width: screen.width * 0.8, height: size(300)}]}>
                    <TouchableOpacity activeOpacity={0.5}>
                        <Text style={{fontSize: size(30), color: 'black', margin: size(30)}}>{this.state.title}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8} style={{backgroundColor: "#0094e1"}}
                                      onPress={this.okBtn.bind(this)}>
                        <Text style={{fontSize: size(30), color: '#fff', margin: size(10)}}>查看套餐详情</Text>
                    </TouchableOpacity>
                </View>*/}
            </ImageBackground>
        )
    }

    render() {
        return (
            <Modal
                animationType='fade'//进场动画 fade
                onRequestClose={() => this.close()}
                visible={this.state.visible}//是否可见
                transparent={true} //背景透明
                onRequestClose={this.close}
            >
                <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={this.close}//点击灰色区域消失
                >
                    <View style={styles.container}>
                        {this.renderContent()}
                    </View>
                </TouchableOpacity>
            </Modal>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    background: {
        borderRadius: size(5),
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center'
    }
})
