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
import {AppDef, deviceWidth, HttpTool, NetInterface, screen, system} from "../../common";
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

    getData() {

        const url = NetInterface.myCreatePlanList+ "?patNo=" + this.props.patNo + "&page=1&limit=100&business=kfxl";
        console.log(JSON.stringify(url));
        HttpTool.GET_JP(url)
          .then(result => {
            //   alert(JSON.stringify(result));
              this.setState({
                  CardCellData: result.page.list == null ? [] : result.page.list
              })
          })
          .catch(err => {
            //   alert(JSON.stringify(err));
              console.log(JSON.stringify(err))
          })
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={{width:'100%'}}>
                    {this.showKeyList()}
                    <View style={{height: size(30),width:'100%'}}></View>
                </ScrollView>
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