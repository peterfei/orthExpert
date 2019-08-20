import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Button, Alert,
    DeviceEventEmitter,
    Platform, TouchableHighlight,ScrollView
} from "react-native";
import { color } from "../../widget";
import { screen, system } from "../../common";
import { size } from "../../common/ScreenUtil";
import { storage } from "../../common/storage";
import StarRating from "react-native-star-rating";
import api from "../../api";
import CardCell from './CardCell';

export default class RecoveryItem extends Component {
    state = {
        CardCellData: '',
    }
    componentDidMount() {
        this.getSchemesByPatNo()
    }
    async getSchemesByPatNo() {
        let url = "http://114.115.210.145:8085/vesal-sport-test/app/kfxl/v1/scheme/getSchemesByPatNo?patNo=" + this.props.patNo + "&page=1&limit=10&planType=sysTpl";
        // alert(url)
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(resp => resp.json())
            .then(result => {
                alert(JSON.stringify(result))
                this.setState({
                    CardCellData: result.page.list
                })
            })
    }
    render() {
        return (
            <View style={styles.container}>
                {this.props.orderState == 'firstScreen' ?
                    <ScrollView style={{width:'100%'}}>
                        {this.showKeyList()}
                        <View style={{height: size(30),width:'100%'}}></View>
                    </ScrollView>
                    :
                    <View style={{ width: '100%', height: "100%", alignItems: 'center' }}>
                        <Image style={{ width: '100%', height: screen.height - 100 - size(130), resizeMode: 'stretch' }}
                            source={require('../../img/recovery/customization.png')} />
                        <Text style={styles.buttonStyle} onPress={() => this.button()}>立即定制</Text>
                    </View>
                }
            </View>
        )
    }
    showKeyList() {
        let arr = [];
        if(this.state.CardCellData!==''){
            this.state.CardCellData.forEach((item, value) => {
                arr.push(
                    <CardCell cellRow={item} selectCard={(row) => {
                        this.selectCard(row)
                    }}/>
                )
            });
        }
        return arr;
    }
    selectCard(data) {
        this.props.navigation.navigate('kfPlanDetail', { 'planId': data.planId })
        alert(data.planId)
    }
    button() {
        Alert.alert(
            '立即下载运动康复训练APP', '定制计划',
            [
                { text: "稍后再说" },
                {
                    text: "立即下载"
                    //,
                    // onPress: function () {
                    //     const downloadUrl = item.url;
                    //     NativeModules.DownloadApk.downloading(
                    //         downloadUrl,
                    //         "vesal.apk"
                    //     );
                    // }
                }
            ]
        );
    }
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        flex: 1,
        zIndex: 999,
    },
    buttonStyle: {
        color: 'white',
        backgroundColor: '#44B4E9',
        height: 50,
        fontSize: 18,
        fontWeight: 'bold',
        width: screen.width,
        lineHeight: 45,
        textAlign: 'center'
    }
})