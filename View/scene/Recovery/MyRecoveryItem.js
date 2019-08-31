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

export default class MyRecoveryItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CardCellData: '',
        }
    }

    componentDidMount() {
        this.getData();

        this.listener = DeviceEventEmitter.addListener('UpdateMyCustom', () => {
            this.getData();
        })
    }

    componentWillUnmount() {
        this.listener.remove();
    }

    async getData() {
        let tokens = await storage.get('userTokens');
        let url = api.base_uri+"v1/app/orthope/scheme/myCreateSchemes?token=" + tokens.token + "&patNo=" + this.props.patNo + "&page=1&limit=100&business=orthope";
        // alert(url)
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(resp => resp.json())
            .then(result => {
                // alert(JSON.stringify(result))
                this.setState({
                    CardCellData: result.page.list
                })
            })
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.CardCellData.length > 0 ?
                    <ScrollView style={{width:'100%'}}>
                        {this.showKeyList()}
                        <View style={{height: size(30),width:'100%'}}></View>
                    </ScrollView>
                    :
                    <View style={{ width: '100%', height: "100%", alignItems: 'center' }}>
                        <Image style={{ width: '100%', height: screen.height - 100 - size(130), resizeMode: 'stretch' }}
                            source={require('../../img/recovery/customization.png')} />
                    </View>
                }
            </View>
        )
    }

    showKeyList() {
        let arr = [];
        if(this.state.CardCellData !==''&&this.state.CardCellData !==[]){
            if(this.state.CardCellData ==''||this.state.CardCellData ==[]){
                return <View style={{width:'100%',height:500,justifyContent:'center',alignItems:'center'}}><Text>暂无数据</Text></View>
            }else{

                this.state.CardCellData.forEach((item, value) => {
                    arr.push(
                        <CardCell cellRow={item} selectCard={(row) => {
                            this.selectCard(row)
                        }}/>
                    )
                });
                return arr;
            }
        }
    }

    selectCard(data) {
        this.props.navigation.navigate('kfPlanDetail', { 'planId': data.planId })
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