
/*
 *  父组件使用方法如下: 先导入import 点击输入框即可获取焦点
 *  validateCode 为输入完验证码后 验证完毕的回调 验证成功后请根据业务手动关闭弹框
 *  <GraphicValidate ref={r => {this.GraphicValidate = r}} validateCode={(result) => {alert(`验证结果${JSON.stringify(result)}`)}}/>
 *  在父组件调用此方法进行显示 如: this.GraphicValidate.show();
 *  在父组件调用此方法进行隐藏 如: this.GraphicValidate.hide();
 */


import React, {Component} from "react";
import {TouchableOpacity, View, Text, TextInput, StyleSheet, Image} from "react-native";
import {deviceWidth, size} from '../Tool/ScreenUtil';
import api from "../../api";

var that = null;
export default class GraphicValidate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            value: '',
            imgURL: '',
            uuid: '',
        };
        that = this;
    }

    componentDidMount() {

    }

    getImage() {
        let guid = this.getUUID();
        const url = api.base_uri + '/appCaptcha?uuid='+ guid;
        this.setState({
            imgURL: url,
            uuid: guid
        })
    }

    getUUID() {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
        }
        return guid;
    }

    // 在父组件调用此方法进行显示 如: this.GraphicValidate.show();
    show() {
        this.getImage();
        this.setState({
            isShow: true
        }, () => {
            this.inputView.focus();
        })
    }

    // 在父组件调用此方法进行隐藏 如: this.GraphicValidate.hide();
    hide() {
        this.setState({
            isShow: false,
            value: '',
            imgURL: '',
            uuid: '',
        })
    }

    _onChange(event) {
        // alert(JSON.stringify(event.nativeEvent.text));
        let values = this.state.value;
        let text = event.nativeEvent.text;
        this.setState({
            value: text
        })
        if (text.length == 5) {
            that.props.validateCode(text, this.state.uuid);
            this.inputView.blur();
        }
    }

    // async _validate(code) {
    //     // this.props.validateCode(text);
    //     let url = 'http://api.vesal.cn:8000/vesal-jiepao-prod/checkAppCaptcha?uuid='+this.state.uuid + '&captchaCode='+ code + '&token=1';
    //     await fetch(url, {
    //         method: "get",
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //       })
    //       .then(resp => resp.json())
    //       .then(result => {
    //           that.props.validateCode(result);
    //       })
    //       .catch(error => {
    //          console.log(JSON.stringify(error))
    //       });
    // }

    _renderTexts() {
        let codeArr = this.state.value.split('');
        let arr = [];
        for (let i = 0; i < 5; i++) {
            let code = codeArr.length >= i ? codeArr[i] : '';
            arr.push(
                <TouchableOpacity activeOpacity={1} onPress={() => {this.inputView.focus()}}>
                    <View style={{
                        width: size(79),
                        height: size(79),
                        borderRadius: size(10),
                        borderColor: 'rgba(216,216,216, 0.7)',
                        borderWidth: size(0.5),
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        margin: size(15)}}>
                        <Text style={{fontSize: size(48), fontWeight: 'bold'}}>
                            {code}
                        </Text>
                    </View>
                </TouchableOpacity>

            )
        }
        return arr;
    }

    render() {
        let width = 5 * size(110);
        return (
            <View style={[styles.container, {right: this.state.isShow ? 0 : 2 * deviceWidth, ZIndex: this.state.isShow ? 9999 : -1}]}>
                <View style={{backgroundColor: 'white', width: width, borderRadius: size(20), overflow: 'hidden'}}>
                    <View style={{width: width, height: size(80),justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: size(36), fontWeight: 'bold'}}>
                            请输入下图中验证码
                        </Text>
                    </View>
                    <View style={{width: '100%', height: size(0.5), color: 'rgba(180, 180, 180, 0.6)'}}/>
                    <TouchableOpacity onPress={() => {this.getImage()}} activeOpacity={1}>
                        <Image resizeMode='contain' source={{uri: this.state.imgURL}} style={{width: width, height: size(120), marginBottom: size(20)}}/>
                    </TouchableOpacity>
                    <View style={{marginBottom: size(70), flexDirection: 'row', width: '100%', height: size(90)}}>
                        {this._renderTexts()}
                    </View>
                    <TextInput
                        ref={(view) => {this.inputView = view}}
                        // keyboardType='numeric'
                        maxLength={5}
                        onChange={(event) => {this._onChange(event)}}
                        value = {this.state.value}
                        style={{width: size(1), height: size(1), fontSize: size(1), position: 'absolute', top: 0, left: 0}}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: deviceWidth,
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },

})
