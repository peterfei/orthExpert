import React, {PureComponent} from 'react'
import {PixelRatio, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {NavigationActions,StackActions} from "react-navigation";
import {color} from "../../widget";
export default class Cell extends PureComponent {
    getState(state) {
        return state.replace("finished", "交易成功").replace("waitPayment", "等待付款").replace("canceled", "已取消").replace("waitComment", "交易成功")
    }

    constructor(props) {
        super(props)

    }

    toDetail(info) {

        // this.props.navigation.navigate("OrderDetail");
        this.props.navigation.navigate('OrderDetail', {info: info})
    }


    render() {

        console.log('render cell')

        let {info} = this.props

        return (
            <TouchableOpacity style={styles.container} onPress={() => {
                this.toDetail(info)
            }}>
                <View style={styles.rightContainer}>

                    <View style={styles.item1}>

                        <View style={styles.f1}>
                            <Text style={styles.h1}>{info.combo_name}</Text>
                        </View>
                        <View style={styles.f3}>
                            <Text style={styles.ordState}>{this.getState(info.ord_state)}</Text>
                        </View>

                    </View>

                    <View style={styles.item1}>

                        <View style={styles.f1}>
                            <Text></Text>
                        </View>
                    </View>

                    <View style={styles.item1}>
                        <View style={styles.f1}>
                            <Text style={styles.createTime}>{info.create_time}</Text>
                        </View>
                        <View style={styles.f3}>
                            <Text style={styles.payPrice}>{info.pay_price}元</Text>
                        </View>
                    </View>


                </View>

            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    item1: {
        flexDirection: 'row'
    },

    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1 / PixelRatio.get(),
        borderColor: "#e0e0e0",
        backgroundColor: 'white',
    },
    icon: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    rightContainer: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 10, marginTop: 5
    },
    price: {
        color: "#515151"
    },
    h1: {
        fontSize: 15,
        fontWeight: 'bold',
        color: "#4D4D4D"
    },
    p: {
        fontSize: 13,
        color: '#777777',
    }, f1: {

        fontSize: 16
    }, f2: {
        flex: 2,
        fontSize: 16
    }, f3: {
        flex: 4,
        fontSize: 16
    }, createTime: {
        textAlign: "left"
    }, payPrice: {
        textAlign: "right", color: "#ff5000", fontWeight: "bold"
    }, ordState: {
        textAlign: "right",
        color: color.main
    }
})

