import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Button,
    DeviceEventEmitter,
    Platform, TouchableHighlight
} from "react-native";
import { color } from "../../widget";
import { screen, system } from "../../common";
import { size } from "../../common/ScreenUtil";
import { storage } from "../../common/storage";
import StarRating from "react-native-star-rating";

export default class RecoveryItem extends Component {
    state = {
        data: [
            {
                title: '腰间盘突出方案',
                content: '根据您腰部的症状智能定制适合您的康复方案',
                starCount: 3,
                describe: '12组动作',
            },
            {
                title: '腰间盘突出方案',
                content: '根据您腰部的症状智能定制适合您的康复方案',
                starCount: 3,
                describe: '12组动作'
            },
            {
                title: '腰间盘突出方案',
                content: '根据您腰部的症状智能定制适合您的康复方案',
                starCount: 3,
                describe: '12组动作'
            }
        ]
    }
    render() {
        return (
            <View style={styles.container}>
                {this.props.orderState=='firstScreen'?
                <View style={{width:'100%',height:"100%",alignItems:'center',backgroundColor:'yellow'}}>
                {this.renderCell()}
                </View>
                :
                <View style={{width:'100%',height:"100%",alignItems:'center',backgroundColor:'blue'}}>
                {this.renderCell()}
                </View>
                }
            </View>
        )
    }
    renderCell() {
        let arr = []
        for (let i = 0; i < this.state.data.length; i++) {
            arr.push(
                <View style={styles.cell}>
                    <Image style={styles.bg}
                        source={require('../../img/recovery/bg.png')} />
                    <View style={styles.body}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                            {this.state.data[i].title}
                        </Text>
                        <Text>
                            {this.state.data[i].content}
                        </Text>
                        <View style={{width:125}}>
                        <StarRating
                            disabled={false}
                            maxStars={5}
                            emptyStar={"ios-star-outline"}
                            fullStar={"ios-star"}
                            halfStar={"ios-star-half"}
                            iconSet={"Ionicons"}
                            rating={this.state.data[i].starCount}
                            fullStarColor={"white"}
                            starSize={20}
                            selectedStar={rating => this.onStarRatingPress(rating)}
                        />
                        </View>
                        <Text>
                            {this.state.data[i].describe}
                        </Text>
                    </View>
                </View>
            )
        }
        return arr
    }
    onStarRatingPress(rating) {
        this.setState({
            starCount: rating
        });
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
    cell: {
        width: '90%',
        margin: 8,
    },
    body: {
        width: '60%',
        padding: 15,
        height: 150,
        justifyContent: 'space-between',
    },
    bg: {
        position: "absolute",
        width: "100%",
        height: 150,
        borderRadius: 10
    }
})