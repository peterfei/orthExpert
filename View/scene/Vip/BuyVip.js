import React, { Component } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground } from "react-native";

import { screen, ContainerView, BaseComponent, NavBar, AppDef, HttpTool, NetInterface, FuncUtils } from '../../common';
import { size } from '../../common/Tool/ScreenUtil';
import DateUtil from "../../common/DateUtils";
import Loading from "../../common/Loading";
import { storage } from "../../common/storage";
import memberBackground from '../../img/vip/memberBackground.png'
import member_center_details from '../../img/vip/member_center_details.png'
import api from "../../api";
import {Wxpay} from "../../common";
import Toast, { DURATION } from "react-native-easy-toast";


export default class BuyVip extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {
            color: null,
            packageDetail: [],
            packageSelected: 0,
            packageList: [],
            memberInfo: { mbName: null },
            memberCenterDetailsHeight: 10,
            isUse: false, // 是否是会员
            PayData:'',
            priceId: this.props.comboList.length > 0 ? this.props.comboList[0].price_id : "",
            comboId: this.props.comboList.length > 0 ? this.props.comboList[0].combo_id : "",
            productID: this.props.comboList.length > 0 ? this.props.comboList[0].product_id : "",
            OrderNo: "",
        }
    }

    componentWillUpdate() {
        this.Loading.close()
    }

    async componentDidMount() {
        this.init()
    }

    async init() {

        // this.Loading.show()
        let memberInfo = await storage.get("memberInfo")
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
                    packageDetail: result.comboPrices,
                    memberInfo: memberInfo,
                    //isUse: isUse,
                })
            })
    }
    async getOrderId(priceId, comboId) {
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
                return new Promise((resolve, reject) => {
                    // alert(`result is ${JSON.stringify(result)}`)
                    // debugger;
                    if (result && result.order) {
                        // alert(`=====\n生成的订单号为:${JSON.stringify(result)}`);
                        //storage.save('containsStructCombo', id, result.page);

                        resolve && resolve(result.order);
                    } else {
                        reject && reject(new Error("data parse error"));
                    }
                });
            })
            this.setState({
                OrderNo: responseData.ordNo
            });
    }

    async payment(priceId,comboId) {
        try {
            this.Loading.show("正在支付...");
            let isSupported = await Wxpay.isSupported();
            // alert(`isSupported is ${isSupported}`)
            console.log("---------------if support wechat--------" + isSupported);

            // 生成OrderId
            await this.getOrderId(priceId,comboId);
            console.log("****getOrderId****");
            // 取微信支付配置
            const data = await this.tenPay();
            // debugger
            console.log(
                "-------**data from wechat pay response is **------" +
                JSON.stringify(data)
            );
            if (!isSupported) {
                // 判断是否支持微信支付
                this.Loading.close();
                this.refs.toast.show("找不到微信应用，请安装最新版微信");
                return;
            }
            console.log("++++++++++++++++++++++++++++++");
            /*
                             *{"Ry_result":"88888","Data":[{"appid":"wx6c7109324ebb9409","partnerid":"1480276662","prepayid":"wx0415254561686926b8cfdcec1274015844","package":"Sign=WXPay","noncestr":"E7FKHAE3M2NO7LEVK29O","timestamp":"1525418746","sign":"6299ADC68A23F4DC0F364245FC2997A3"}]}
                             */
            let ret = await Wxpay.pay(data);
            console.log("==========================" + JSON.stringify(ret));
            // debugger
            // alert("-----ret-----" + JSON.stringify(ret) );
            // alert(ret.errCode)
            if (ret.errCode === 0) {
                this.refs.toast.show("支付成功");

                this.Loading.close();
                //微课刷新列表方法
                // DeviceEventEmitter.emit("courseHeaderRefresh")
                // DeviceEventEmitter.emit("HomeRefresh")


                // setTimeout(
                //     function () {
                //         const resetAction = NavigationActions.reset({
                //             index: 0,
                //             actions: [NavigationActions.navigate({routeName: "Tab"})]
                //         });
                //         // initLicence();
                //         // this.props.navigation.pop() && this.props.navigation.pop();
                //         this.props.navigation.dispatch(resetAction);
                //     }.bind(this),
                //     1000
                // );
            } else {
                alert("支付失败");
                this.Loading.close();
                // console.log("=====支付失败=====" + JSON.stringify(ret));
                this.refs.toast.show("支付失败,请重新支付");
                // await AsyncStorage.setItem("wx_data", JSON.stringify(data));
            }
        } catch (error) {
            this.Loading.close();
            console.log("------error payment-------" + error);
        }
    }

    async tenPay() {
        // debugger
        const orderNo = this.state.OrderNo;
        let tokens = await storage.get("userTokens");
        const url = api.base_uri + "/v1/app/pay/wxGetPreyId?ordNo=" + orderNo + "&business=sport";
        // debugger;
        let responseData = await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
                // debugger
                return new Promise((resolve, reject) => {
                    // debugger;
                    if (result && result.result) {
                        //storage.save('containsStructCombo', id, result.page);

                        resolve && resolve(result.result);
                    } else {
                        reject && reject(new Error("data parse error"));
                    }
                });
            });
        // debugger
        return responseData;
    }

    // getOrderId = async () => {
    //     //如果没有订单号就获取订单号  (继续支付会有订单号 点击了一次立即支付也会有订单号)
    //     if (
    //         this.state.OrderNo == null ||
    //         this.state.OrderNo == "" ||
    //         this.state.OrderNo == undefined
    //     ) {
    //         // alert(`================\n 进入getOrderId`);
    //         let tokens = await storage.get("userTokens");
    //         // alert(`================\n tokens is ${JSON.stringify(tokens)}`);
    //         const url = api.base_uri + "/v1/app/order/addOrder";
    //         // alert(`================\n url is ${url}`);
    //         // debugger;
    //         let responseData = await fetch(url, {
    //             method: "post",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 token: tokens.token
    //             },
    //             body: JSON.stringify({
    //                 comboId: this.state.comboId,  //FIXME
    //                 ordRes: "android",
    //                 lang: "ch",
    //                 remark: 'guke',
    //                 priceId: this.state.priceId   //FIXME
    //             })
    //         })
    //             .then(resp => resp.json())
    //             .then(result => {
    //                 return new Promise((resolve, reject) => {
    //                     // alert(`result is ${JSON.stringify(result)}`)
    //                     // debugger;
    //                     if (result && result.order) {
    //                         // alert(`=====\n生成的订单号为:${JSON.stringify(result)}`);
    //                         //storage.save('containsStructCombo', id, result.page);

    //                         resolve && resolve(result.order);
    //                     } else {
    //                         reject && reject(new Error("data parse error"));
    //                     }
    //                 });
    //             });
    //         this.setState({
    //             OrderNo: responseData.ordNo
    //         });
    //     }
    // };
    changeSelect(index) {
        console.log(index)
        this.setState({
            packageSelected: index
        })
    }
    gotoPay() {
        Wxpay.registerApp(api.APPID);
                                // this.payment()
        // this.props.navigation.navigate("PaymentOrder", {
        //     combo: this.state.packageDetail[this.state.packageSelected]
        // });
        this.payment(this.state.packageDetail[this.state.packageSelected].priceId,this.state.packageDetail[this.state.packageSelected].comboId)
    }

    renderPackageDetail() {
        let packageList = []
        this.state.packageDetail.forEach((item, index) => {
            let packageItem = (
                <TouchableOpacity
                    style={this.state.packageSelected === index ? styles.packageDetailItemChoose : styles.packageDetailItem}
                    onPress={() => {
                        this.changeSelect(index)
                    }}>
                    {/* {DateUtil.getMonthOrYearByDays(item.timeValue)} */}
                    <Text style={styles.packageDetailItemTime}>{item.labelA}</Text>
                    <Text style={styles.packageDetailItemOldPrice}>原价： {item.oldPrice.toFixed(2)} </Text>
                    <Text style={styles.packageDetailItemPrice}>
                        <Text
                            style={styles.packageDetailItemPriceRMB}>RMB </Text>
                        {item.sellPrice.toFixed(2)}
                    </Text>
                </TouchableOpacity>
            )
            packageList.push(packageItem)
        })

        return (
            <View style={styles.packageDetail}>
                {packageList}
            </View>
        )
    }

    render() {
        return (
            <ContainerView>
                <NavBar title='我的VIP会员' hideback={false} navigation={this.props.navigation} />
                <ScrollView
                    overScrollMode='never'
                >
                    <View style={styles.container}>
                        <View style={styles.top}>
                            <ImageBackground source={memberBackground} style={styles.memberInfo}>
                                <View style={styles.memberImageTop}>
                                    <View style={styles.memberImage}>
                                        <Image style={{ width: 48, height: 48, borderRadius: 24 }}
                                            source={require('../../img/my/icon_userreview_defaultavatar.png')}></Image>
                                    </View>
                                    <View style={styles.memberInfoDetail}>
                                        <View style={styles.memberInfoDetailTop}>
                                            <Text style={{ fontSize: size(28), color: '#262626', }}>{this.state.memberInfo.mbName}</Text>
                                            {
                                                this.state.isUse ? (
                                                    <Image style={{ width: 15, height: 15, marginLeft: 15 }}
                                                        source={require('../../img/vip/member_vip.png')}></Image>
                                                ) : null
                                            }
                                        </View>
                                        <View style={styles.memberInfoDetailBot}>
                                            <Text style={styles.memberInfoDetailBotText}>{this.state.isUse ? '恭喜你，你已经是我们的专属会员' : '开通专属会员'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.memberImageBot}>
                                    <View style={styles.memberImageBotRight}>
                                        <Text style={styles.memberImageBotRightText}>VIP专属会员</Text>
                                    </View>
                                    {
                                        this.state.isUse ? (
                                            <View style={styles.memberImageBotLeft}>
                                                <Text style={styles.memberImageBotLeftText}>2019.08.26到期</Text>
                                            </View>
                                        ) : null
                                    }

                                </View>
                            </ImageBackground>
                            <View style={styles.packageName}>
                                <Text style={styles.packageNameText}>VIP会员套餐</Text>
                            </View>
                            {this.renderPackageDetail()}
                            <View style={styles.joinMember}>
                                <TouchableOpacity style={styles.joinMemberBtn} onPress={() => this.gotoPay()}>
                                    <Text style={styles.joinMemberBtnText}>立即开通</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.mid} />
                        <ImageBackground source={member_center_details} style={styles.bot}>

                        </ImageBackground>
                    </View>
                </ScrollView>
                <Loading ref={r => {
                    this.Loading = r
                }} hide={true} />
                <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
            </ContainerView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },

    top: {
        height: size(693),
    },

    mid: {
        height: 6,
        backgroundColor: '#ECECEC',
    },

    bot: {
        height: size(700),

    },

    memberImage: {
        // width: 80,
        // left: 10,
    },
    memberImageTop: {
        flex: 0.59,
        marginLeft: 12,
        marginRight: 10,
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    memberImageBot: {
        flex: 0.41,
        top: size(25),
        flexDirection: 'row',
        justifyContent: 'space-around'
    },

    memberImageBotRight: {
        // left: size(86)
    },

    memberImageBotRightText: {
        fontSize: size(35),
        color: 'rgba(244,214,164,1)',
        fontWeight: '600',
        lineHeight: size(71)
    },

    memberImageBotLeft: {
        // left: size(180)
    },

    memberImageBotLeftText: {
        fontSize: size(26),
        color: 'rgba(255,255,255,1)',
        fontWeight: '400',
        lineHeight: size(65)
    },

    memberInfoDetail: {
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
        marginLeft: 20,
    },

    memberInfoDetailTop: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        top: -7,

    },

    memberInfoDetailBot: {
        bottom: 4,
    },

    memberInfoDetailBotText: {
        fontSize: 12,
        color: '#6D6D6D',
    },

    memberInfo: {
        flex: 0.39,
        height: size(272),
        flexDirection: 'column',
    },

    packageName: {
        flex: 0.18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    packageNameText: {
        flex: 1,
        fontSize: 16,
        color: '#262626',
        top: 7,
        fontWeight: '400',
        left: 10,
    },

    packageDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 0.26,
        marginLeft: 7.5,
        marginRight: 7.5,
    },

    joinMember: {
        flex: 0.17,
        marginLeft: 10,
        marginRight: 10,
        // marginBottom: 15,
        marginTop: 26,
    },

    joinMemberBtn: {
        overflow: 'hidden',
        borderRadius: 5,
        height: 38,
        backgroundColor: '#42B5EA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    joinMemberBtnText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    packageDetailItemChoose: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        margin: 2.5,
        backgroundColor: '#DDEBF8',
        borderRadius: 5,
    },

    packageDetailItem: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        margin: 2.5,
        backgroundColor: '#F7F7F7',
        borderRadius: 5,
    },

    packageDetailItemTime: {
        flex: 27,
        fontSize: 18,
        color: '#262626',
        fontWeight: '500',
        marginTop: 7,
        left: 10,
    },

    packageDetailItemPrice: {
        flex: 17,
        fontSize: 17,
        color: '#EF832F',
        fontWeight: '500',
        left: 10,
        marginBottom: 5,
    },

    packageDetailItemPriceRMB: {
        fontWeight: '400',
        fontSize: 14,
    },

    packageDetailItemOldPrice: {
        flex: 10,
        fontSize: 10,
        color: '#262626',
        left: 10,
        textDecorationLine: 'line-through'
    },

})