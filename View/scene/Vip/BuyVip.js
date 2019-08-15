import React, { Component } from 'react';
import {
    Platform, StyleSheet, Text, View,
    Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter, ScrollView
} from 'react-native';
import { screen, system } from "../../common";
import { size } from '../../common/ScreenUtil';
import api from "../../api";
import { NavigationActions, StackActions } from "react-navigation";
import { storage } from "../../common/storage";

export default class BuyVip extends Component {
    static navigationOptions = {
        header: null,
    }
    state = {
        Data: '',
        PayData:'',
        currentIndex: 0,
    }
    componentWillMount() {
        this.getComboInfo()
    }
    async getComboInfo() {
        let tokens = await storage.get("userTokens");
        let url = api.base_uri + "/v1/app/orthope/combo/getComboInfo?token=" + tokens.token + "&app_version=1.0.0&plat=android&business=orthope&comboCode=GKHY";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json())
            .then(result => {
                this.setState({
                    Data: result.comboPrices
                })
            })
    }
    async newAddOrder(priceId, comboId) {
        let tokens = await storage.get("userTokens");
        let body = {
            "priceId": priceId,
            "comboId": comboId,
            "ordRes": "android",
            "remark": "测试",
            "business": "orthope"
        }
        let url = api.base_uri +"/v1/app/orthope/order/newAddOrder?token="+tokens.token
        await fetch(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(resp => resp.json())
            .then(result => {
                this.setState({
                    PayData: result
                })
                alert(JSON.stringify(result))
            })
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    {this.renderBuyBody()}
                </View>
            </View>
        )
    }
    renderBuyBody() {
        let arr = [], isStyle;
        for (let i = 0; i < this.state.Data.length; i++) {
            if (i == this.state.currentIndex) {
                isStyle = { backgroundColor: '#DDEBF7' }
            } else {
                isStyle = {}
            };
            arr.push(
                <TouchableOpacity style={[styles.buyBody, isStyle]} key={i} onPress={() => this.choiceVip(i, this.state.Data[i].priceId, this.state.Data[i].comboId)}>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{this.state.Data[i].labelA}</Text>
                        <Text style={{ marginTop: 10, textDecorationLine: 'line-through' }}>原价：{this.state.Data[i].oldPrice}</Text>
                        <Text style={{ fontSize: 15, color: '#EF8131' }}>RMB<Text style={{ fontSize: 18, color: '#EF8131' }}>{this.state.Data[i].sellPrice}</Text></Text>
                    </View>
                </TouchableOpacity>
            )
        }
        return arr
    }
    choiceVip(i, priceId, comboId) {
        this.setState({
            currentIndex: i
        })
        this.newAddOrder(priceId, comboId)
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
        flex: 1
    },
    body: {
        width: screen.width,
        padding: screen.width * 0.03,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    buyBody: {
        width: '32%',
        padding: 10,
        backgroundColor: '#F7F7F7',
        borderColor: '#ECECEC',
        borderWidth: 1,
        borderRadius: 5
    }
})