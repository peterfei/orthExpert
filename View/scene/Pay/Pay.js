import React from "react";
import {
    Image,
    NativeModules,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    DeviceEventEmitter,
    Alert
} from "react-native";
import { BaseComponent, ContainerView, HttpTool, NavBar, NetInterface, Line } from '../../common';
import * as FuncUtils from '../../common/Tool/FuncUtils'
import { size } from "../../common/Tool/ScreenUtil";
import { storage } from "../../common/storage";
import api from "../../api";

let Wxpay = NativeModules.Wxpay;
let InAppUtils = NativeModules.InAppUtils;

export default class Pay extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            combo: this.props.navigation.state.params.combo,
            newPayList: [],
            OrderNo: ""
        }

    }


    async componentWillMount() {

    }


    componentDidMount() {
        this.getPayMethod();
    }

    getPayMethod() {

        const url = NetInterface.config + "?key=pay_method_" + Platform.OS+"_orthope";
        this.mainView._showLoading('加载中');

        HttpTool.GET_JP(url)
            .then(result => {
                this.mainView._closeLoading();
                if (result.code == 0) {
                    let list = result.config.split(',');
                    let arr = [];
                    if (list.indexOf('weChatPay') != -1) {
                        let obj = {
                            value: 'weChatPay',
                            title: '微信支付',
                            subTitle: '微信钱包支付',
                            icon: require('../../img/payment/weixin_02.png')
                        }
                        arr.push(obj)
                    }

                    // if (list.indexOf('alipay') != -1) {
                    //     let obj = {
                    //         value: 'alipay',
                    //         title: '支付宝支付',
                    //         subTitle: '支付宝钱包支付',
                    //         icon: require('../../img/payment/alipay_02.png')
                    //     }
                    //     arr.push(obj)
                    // }

                    if (list.indexOf('applyPay') != -1) {
                        let obj = {
                            value: 'applyPay',
                            title: '苹果支付',
                            subTitle: 'Apply钱包支付',
                            icon: require('../../img/payment/ios.png')
                        }
                        arr.push(obj)
                    }

                    this.setState({
                        newPayList: arr,
                        currentPayIndex: 0
                    })
                }
            })
            .catch(error => {
                this.mainView._closeLoading();
                this.mainView._toast(JSON.stringify(error));
            })

    }


    checkPay() {
        //TODO 检测手机号是否绑定
        let currentPay = this.state.newPayList[this.state.currentPayIndex];
        // alert(JSON.stringify(currentPay));
        if (currentPay.value == 'weChatPay') {
            Wxpay.registerApp(api.APPID);
            this.wxPay();
            return;
        }

        if (currentPay.value == 'applyPay') {
            // alert(JSON.stringify(this.state.combo));
            let productId = this.state.combo.productId;
            this.applePay(productId);
            return;
        }
    }


    async wxGetPreyId() {
        const url = NetInterface.wxGetPreyId + "?ordNo=" + this.state.OrderNo + "&business=orthope";


        let result = await HttpTool.GET_JP(url)
            .then(result => {


                return new Promise((resolve, reject) => {

                    if (result && result.result) {
                        resolve && resolve(result.result);
                    } else {
                        reject && reject(new Error("data parse error"));
                    }
                });

            })
            .catch(error => {
                this.mainView._closeLoading();
                this.mainView._toast(JSON.stringify(error));
            })

        return result;
    }

    async wxPay() {

        let isSupported = await Wxpay.isSupported();
        console.log(`**************是否支持微信${isSupported}*********`)
        // 判断是否支持微信支付
        if (!isSupported) {
            this.mainView._toast("找不到微信应用，请安装最新版微信");
            return;
        }

        //this.mainView._showLoading('支付中');

        // 生成OrderId
        await this.getOrderId();

        //获取预付单
        const data = await this.wxGetPreyId();

        console.log("data:" + JSON.stringify(data))
        //调用微信SDK支付
        let result = await Wxpay.pay(data);


        if (result.errCode === 0) {
            this.mainView._closeLoading();
            this.mainView._toast("支付成功");
            //TODO 处理支付成功逻辑
            DeviceEventEmitter.emit("updatePermission");
            this.props.navigation.goBack(this.props.navigation.state.params.goOutPay_key, { payState: true });//返回支付前一界面
            if (this.props.navigation.state.params.title !== null) {
                DeviceEventEmitter.emit("goNext", { title: this.props.navigation.state.params.title })

            }

        } else {
            this.mainView._toast("支付失败,请重新支付");
        }
    }

    async applePay(productId) {
        this.mainView._showLoading('正在支付...');
        console.info("---------开始苹果支付--------");
        await this.getOrderId();

        let productsArr = [];
        productsArr.push(productId);
        InAppUtils.canMakePayments(async canMakePayments => {
            if (!canMakePayments) {
                Alert.alert("提醒", "您的设备暂时不支持内购");
                this.mainView._closeLoading();
            } else {
                InAppUtils.loadProducts(productsArr, async (error, products) => {
                    console.log(`products${JSON.stringify(products)}`);
                    let productIdentifier = products[0].identifier;
                    InAppUtils.purchaseProduct(productIdentifier, async (error, response) => {
                          if (error) {
                              this.mainView._closeLoading();
                              console.log("error" + JSON.stringify(error));
                              console.log(`支付失败或者取消支付`);
                          } else {
                              console.log(JSON.stringify(response));
                              if (response && response.productIdentifier) {
                                  let params = {
                                      ordNo: this.state.OrderNo,
                                      transactionReceipt: response.transactionReceipt
                                  }
                                  HttpTool.POST_JP(NetInterface.validateApplePayNotify, params)
                                    .then(result => {
                                        this.mainView._closeLoading();
                                        // alert(JSON.stringify(result));
                                        console.log('+_+_+_+_+_+_+_+');
                                        console.log(JSON.stringify(result));
                                        console.log('+_+_+_+_+_+_+_+');
                                        if (result.code == 0) {
                                            this.mainView._toast("支付成功");
                                            DeviceEventEmitter.emit("updatePermission");
                                            this.props.navigation.goBack(this.props.navigation.state.params.goOutPay_key, { payState: true });//返回支付前一界面
                                            if (this.props.navigation.state.params.title !== null) {
                                                DeviceEventEmitter.emit("goNext", { title: this.props.navigation.state.params.title })
                                            }
                                        } else {
                                            this.mainView._toast(JSON.stringify(result.msg))
                                        }
                                    })
                                    .catch(err => {
                                        console.log(`支付失败${err}`);
                                        this.mainView._closeLoading();
                                    })
                              } else {
                                  console.log(`支付失败`);
                                  this.mainView._closeLoading();
                              }
                          }
                      }
                    );
                });
            }
        });
    }


    getOrderId = async () => {
        let tokens = await storage.get("userTokens");
        let body = {
            "priceId": this.state.combo.priceId,
            "comboId": this.state.combo.comboId,
            "ordRes": "android",
            "remark": "测试",
            "business": "orthope"
        }
        let url = api.base_uri + "/v1/app/orthope/order/newAddOrder?token=" + tokens.token
        await fetch(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(resp => resp.json())
            .then(result => {
                this.setState({
                    OrderNo: result.order.ordNo
                })
            })

            // const url = NetInterface.addOrder;

            // let params = {
            //     comboId: this.state.combo.comboId,
            //     ordRes: Platform.OS,
            //     lang: "ch",
            //     business: 'kfxl',
            //     priceId: this.state.combo.priceId
            // };

            // await HttpTool.POST(url, params)
            //     .then(result => {

            //         if (result.code == 0) {
            //             this.setState({
            //                 OrderNo: result.order.ordNo
            //             });
            //         }

            //     })
            .catch(error => {
                this.mainView._closeLoading();
                this.mainView._toast(JSON.stringify(error));
            })


    };

    renderPayment() {
        let arr = [];
        this.state.newPayList.forEach((payment, index) => {
            arr.push(
                <TouchableOpacity onPress={() => {
                    this.setState({ currentPayIndex: index })
                }}>
                    <View style={{
                        marginRight: size(25),
                        marginLeft: size(25),
                        flexDirection: 'row',
                        marginTop: size(30),
                        justifyContent: 'space-between',
                    }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={payment.icon}
                                style={{ height: size(70), width: size(70) }} />
                            <View style={{ flexDirection: 'column', paddingLeft: size(32) }}>
                                <Text style={{ fontSize: size(24), color: '#343434' }}>{payment.title}</Text>
                                <Text style={{ fontSize: size(24), color: '#343434' }}>{payment.subTitle}</Text>
                            </View>
                        </View>
                        <View style={{ marginRight: size(25), justifyContent: 'center' }}>
                            <Image
                                source={this.state.currentPayIndex == index ? require('../../img/payment/select.png') : require('../../img/payment/noSelect.png')}
                                style={{ height: size(28), width: size(28) }} />
                        </View>

                    </View>
                </TouchableOpacity>
            )
        })

        return (
            <View>
                <View style={{
                    height: size(82), justifyContent: 'center', borderBottomWidth: size(1),
                    borderBottomColor: '#F0F0F0',
                }}>
                    <Text style={{ color: '#343434', paddingLeft: size(25), fontSize: size(24) }}>选择支付方式</Text>
                </View>
                {arr}
                <View style={{ height: size(105) }} />
            </View>
        );
    }

    renderFooter() {
        return (
            <TouchableOpacity style={{
                width: '100%',
                height: size(90),
                backgroundColor: '#4FA5F4',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                bottom: 0,
                left: 0
            }} onPress={() => {
                this.checkPay()
            }}>
                <Text style={{ color: '#ffffff', fontSize: size(32) }}>立即支付</Text>

            </TouchableOpacity>

        );
    }

    render() {
        return (
            <ContainerView ref={r => this.mainView = r}>
                <NavBar title='确认支付' hideback={false} navigation={this.props.navigation} />
                {/*<View><Text>{JSON.stringify(this.state.combo)}</Text></View>*/}
                <View style={{ flexDirection: 'row' }}>
                    <ImageBackground source={require('../../img/payment/huiyuan.png')}
                        style={{
                            height: size(180), width: size(330), marginLeft: size(25),
                            marginTop: size(30), marginBottom: size(30), alignItems: 'center'
                        }}>
                        <Image source={require('../../img/payment/zuanshi.png')} style={{ width: size(76), height: size(72), marginTop: size(25) }} />
                        <Text style={{ color: '#FFFFFF', fontSize: size(32), fontWeight: '600', marginTop: size(15) }}>骨科专家VIP会员</Text>

                    </ImageBackground>
                    <View style={{ marginTop: size(56), marginBottom: size(57), marginLeft: size(50) }}>
                        <Text style={{ color: '#262626', fontSize: size(34), fontWeight: '400' }}>VIP会员{FuncUtils.getBuyTime(this.state.combo.deadline)}</Text>
                        <Text style={{ color: '#EF8131', fontSize: size(34), fontWeight: '500', marginTop: size(60) }}>¥{this.state.combo.sellPrice}</Text>
                    </View>

                </View>
                <Line height={size(14)} />
                <View style={styles.priceContent}>
                    <Text style={styles.buyText}>购买后可用时长</Text>
                    <Text style={styles.buyTime}>
                        {FuncUtils.getBuyTime(this.state.combo.deadline)}
                    </Text>
                </View>
                <View style={styles.priceContent}>
                    <Text style={styles.buyText}>订单金额</Text>
                    <Text style={styles.buyTime}>
                        ¥{this.state.combo.sellPrice}
                    </Text>
                </View>
                <Line height={size(14)} />
                {this.renderPayment()}
                {this.renderFooter()}
            </ContainerView>
        )
    }


}
const styles = StyleSheet.create({
    headerImage: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: size(146),
        marginBottom: size(128)
    },
    avatar: {
        width: size(68),
        height: size(68),
        marginTop: 10,
        marginLeft: 7
    },
    priceContent: {
        height: size(82),
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: size(1),
        borderBottomColor: '#F0F0F0',
    },
    buyTime: {
        fontSize: size(24),
        color: '#EF8131',
        fontWeight: '400',
        width: '50%',
        textAlign: 'right',
        paddingRight: size(25)
    },
    buyText: {
        fontSize: size(24), color: '#343434', fontWeight: '400', width: '50%', paddingLeft: size(25)
    },
});
