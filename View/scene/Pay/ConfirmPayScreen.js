import React, {PureComponent, Component} from "react";
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    AsyncStorage,
    DeviceEventEmitter,
    Alert,
    Platform
} from "react-native";
import ScrollableTabView, {
    DefaultTabBar
} from "react-native-scrollable-tab-view";
import {Heading2, Heading3} from "../../widget/Text";
import {screen, system} from "../../common";
import Loading from "../../common/Loading";

import {color, NavigationItem, Separator, SpacingView} from "../../widget";
import {
    View,
    Text,
    Button,
    Typography,
    ActionBar,
    Colors
} from "react-native-ui-lib";
import Icon from "react-native-vector-icons/FontAwesome";
import IconMoney from "react-native-vector-icons/MaterialCommunityIcons";

// import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import {RadioGroup, RadioButton} from "react-native-flexi-radio-button";

import api, {encryptionWithStr} from "../../api";

// import {insertUser, queryUser, deleteUser} from '../../realm/RealmManager';
import TitleBar from '../../scene/Home/TitleBar';
import xml2js from "react-native-xml2js/lib/parser";
import {Wxpay} from "../../common";
import Toast, {DURATION} from "react-native-easy-toast";
import {storage} from "../../common/storage";
import _ from "lodash";
import {NavigationActions,StackActions} from "react-navigation";
import {NativeModules} from "react-native";
import {size} from "../../common/ScreenUtil";
// import { Alipay } from "../../common/alipay";
import {getNeedPay} from "../../common/fun";

const {InAppUtils, Alipay} = NativeModules;

/**
 * 取得本机ip地址
 */
//import { NetworkInfo } from 'react-native-network-info';

export default class ConfirmPayScreen extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            datas: {},
            infos: {},
            cartId: "",
            remark: "",
            OrderNo: "",
            currentIP: "",
            //   type_id: "",
            payMethod: "",
            weixinState: false,
            applyState: false,
            alipayState: false,
            selectedIndex: null
        };
        this.onSelect = this.onSelect.bind(this);
    }

    async componentWillMount() {
        //获取订单号
        let ordNo = this.props.navigation.state.params.ordNo;
        // alert(ordNo)
        this.setState({
            OrderNo: ordNo
        });
        await  this.getPayMethod();
    }

    getPayMethod = async () => {
        const url =
            api.base_uri + "/v1/app/msg/config?key=pay_method_" + Platform.OS;
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(resp => resp.json())
            .then(result => {
                console.log("---接口获取支持的支付方式---");
                console.log(result);
                let wx = result.config.indexOf("weChatPay") != -1;
                let ios = result.config.indexOf("applyPay") != -1;
                let alipay = result.config.indexOf("alipay") != -1;
                if (alipay) {
                    this.setState({
                        alipayState: true,
                        selectedIndex: 0,
                        payMethod: "aliPay"
                    });
                }
                // debugger;
                if (wx) {
                    this.setState({
                        weixinState: true,
                        selectedIndex: 0,
                        payMethod: "weChatPay"
                    });
                } else {
                    this.setState({
                        selectedIndex: 1,
                        payMethod: "applyPay"
                    });
                }

                if (ios) {
                    this.setState({
                        applyState: true
                    });
                }
            });
    };

    // this.props.navigation.state.params.obj
    componentDidMount() {
        // this.setState({datas: this.props.navigation.state.params.obj});
        this.setState({
            infos: this.props.navigation.state.params.infos
            //   type_id: this.props.navigation.state.params.type_id
        });
        //获取CartId
        console.log("---------------");
        // debugger
        Wxpay.registerApp(api.APPID);

        // this.requestCartData();

        //NetworkInfo.getIPV4Address(ip => {
        //  console.log("===当前IP为==="+ip);
        //  this.setState({
        //    currentIP:ip
        //  })
        //});
    }

    // requestCartData = async () => {

    // };
    async payment() {
        try {
            this.Loading.show("正在支付...");

            setTimeout(() => {
                this.Loading && this.Loading.close()
            }, 5000);
            let isSupported = await Wxpay.isSupported();
            console.log("---------------if support wechat--------" + isSupported);

            // 生成OrderId
            await this.getOrderId();
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
            console.log("-----ret-----" + ret);
            // alert(ret.errCode)
            if (ret.errCode === 0) {
                this.refs.toast.show("支付成功");
                this.Loading.close();
                // let fy_id = await storage.get(
                //     "tabTypeId" + this.state.type_id,
                //     this.state.type_id
                // );
                // let _data = {
                //     functionType: this.state.type_id,
                //     fyId: fy_id
                // };
                // const paramArr = [];
                // if (Object.keys(_data).length !== 0) {
                //     for (const key in _data) {
                //         paramArr.push(`${key}=${_data[key]}`);
                //     }
                // }
                // console.log(`\n ====\n paramArr is ${paramArr.join("&")}`);
                storage.clearMapForKey("versionByInitMyStruct");
                storage.clearMapForKey("mystructList");
                DeviceEventEmitter.emit("RefreshEmitter");
                // DeviceEventEmitter.emit("HomeListener");
                this.reloadLince()
                // setTimeout(
                //   function() {
                //       const resetAction = StackActions.reset({
                //           index: 0,
                //           actions: [NavigationActions.navigate({ routeName: "Tab" })]
                //       });
                //       // this.props.navigation.pop() && this.props.navigation.pop();
                //       this.props.navigation.dispatch(resetAction);
                //   }.bind(this),
                //   1000
                // );
            } else {
                // alert("支付失败");
                this.Loading.close();
                console.log("=====支付失败=====" + JSON.stringify(ret));
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
        const url = api.base_uri + "/v1/app/pay/wxGetPreyId?ordNo=" + orderNo;
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

    getOrderId = async () => {
        //如果没有订单号就获取订单号  (继续支付会有订单号 点击了一次立即支付也会有订单号)
        if (
            this.state.OrderNo == null ||
            this.state.OrderNo == "" ||
            this.state.OrderNo == undefined
        ) {
            console.log(`================\n 进入getOrderId`);
            let tokens = await storage.get("userTokens");
            console.log(`================\n tokens is ${tokens}`);
            const url = api.base_uri + "/v1/app/order/addOrder";
            console.log(`================\n url is ${url}`);
            // debugger;
            let responseData = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                },
                body: JSON.stringify({
                    comboId: this.state.infos.combo_id,
                    ordRes: Platform.OS,
                    lang: "ch",
                    remark: this.state.remark
                })
            })
                .then(resp => resp.json())
                .then(result => {
                    return new Promise((resolve, reject) => {
                        // debugger;
                        if (result && result.order) {
                            console.log(`=====\n生成的订单号为:${JSON.stringify(result)}`);
                            //storage.save('containsStructCombo', id, result.page);

                            resolve && resolve(result.order);
                        } else {
                            reject && reject(new Error("data parse error"));
                        }
                    });
                });
            this.setState({
                OrderNo: responseData.ordNo
            });
        }
    };

    async aliPay() {
        try {
            this.Loading.show("正在支付...");
            setTimeout(() => {
                this.Loading.close()
            }, 5000)
            // 生成OrderId
            await this.getOrderId();
            const orderNo = this.state.OrderNo;
            let tokens = await storage.get("userTokens");
            const url =
                api.base_uri +
                "/v1/app/pay/alipayGetPreyId?ordNo=" +
                orderNo +
                "&business=anatomy";
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
                    // debugger;
                    return new Promise((resolve, reject) => {
                        // debugger;
                        if (result && result.msg) {
                            //storage.save('containsStructCombo', id, result.page);

                            resolve && resolve(result.msg);
                        } else {
                            reject && reject(new Error("data parse error"));
                        }
                    });
                });

            let ali = await Alipay.pay(responseData);
            // debugger;
            // alert(ret.errCode)
            if (ali.resultStatus === "9000") {
                this.refs.toast.show("支付成功");
                this.Loading.close();
                storage.clearMapForKey("versionByInitMyStruct");
                storage.clearMapForKey("mystructList");
                DeviceEventEmitter.emit("RefreshEmitter");

                this.reloadLince()
                // setTimeout(
                //     function () {
                //         const resetAction = StackActions.reset({
                //             index: 0,
                //             actions: [NavigationActions.navigate({routeName: "Tab"})]
                //         });
                //         // this.props.navigation.pop() && this.props.navigation.pop();
                //         this.props.navigation.dispatch(resetAction);
                //     }.bind(this),
                //     1000
                // );
            } else {
                // alert("支付失败");
                this.Loading.close();
                console.log("=====支付失败=====" + JSON.stringify(ret));
                this.refs.toast.show("支付失败,请重新支付");
                // await AsyncStorage.setItem("wx_data", JSON.stringify(data));
            }
        } catch (error) {
            this.Loading.close();
            console.log("------error payment-------" + error);
        }
    }

    toPay() {
        storage.saveNoExpires("isRefreshCache", "", "yes");
        if (this.state.payMethod == "applyPay") {
            this.in_app_pay();
        } else if (this.state.payMethod == "weChatPay") {
            this.payment();
        } else if (this.state.payMethod == "aliPay") {
            this.aliPay();
        } else {
            Alert.alert("请选择支付方式");
        }
    }

    renderFooter() {
        console.log(`Platform is \n ${Platform.OS}`);
        // debugger
        return (
            <ActionBar
                centered
                backgroundColor={"#0094e1"}
                actions={[
                    {
                        label: "立即支付",
                        labelStyle: {
                            fontSize: size(28),
                            color: Colors.white,
                            ...Typography.text60,
                            fontWeight: "400",
                            width: screen.width,
                            textAlign: "center"
                        },
                        onPress: () => this.toPay()
                    }
                ]}
            />
        );
    }

    renderSubHeader() {
        return (
            <View
                style={{
                    flexDirection: "row",
                    marginLeft: 10,
                    marginTop: 10,
                    marginBottom: 10
                }}>
                {this.state.infos.combo_icon != null ? (
                    <Image
                        source={{
                            uri: this.state.infos.combo_icon
                        }}
                        style={styles.icon}
                    />
                ) : null}
                <View
                    style={{
                        marginLeft: 10,
                        flexDirection: "column",
                        justifyContent: "center",
                        width: screen.width * 0.8 - 20
                    }}>
                    <View style={{flexDirection: "row", borderTopColor: "red"}}>
                        <View style={{flex: 1}}>
                            <Text style={[styles.title, {fontSize: size(30)}]}>{this.state.infos.combo_name}</Text>
                        </View>
                        <View style={{flex: 1, textAlign: "left", marginRight: 10}}>
                            <Text style={[styles.buyCount, {fontSize: size(24)}]}>
                                {this.state.infos.sell_amount}
                                人订购
                            </Text>
                        </View>
                    </View>
                    <View style={{marginTop: 8}}>
                        <Text style={{color: "#1d1d1d", paddingRight: 40, fontSize: size(26)}}>
                            {this.state.infos.label_a}
                        </Text>
                    </View>
                    <View style={{marginTop: 8}}>
                        <Text style={{color: "#b3b3b3", fontSize: size(24), paddingRight: 40}}>
                            {this.state.infos.label_b}
                        </Text>
                    </View>

                    <View style={{flexDirection: "row", borderTopColor: "red"}}>
                        <View style={{flex: 2}}>
                            <Text
                                style={{
                                    color: "#8b8b8b"
                                }}>
                                <Text
                                    style={{
                                        textDecorationLine: "line-through",
                                        textDecorationStyle: "solid",
                                        fontSize: size(26)
                                    }}>
                                    ￥{this.state.infos.old_price}/
                                    {this.getTime(this.state.infos.time_value)}
                                </Text>

                                <Text style={[styles.buyCount, styles.sell, {fontSize: size(26)}]}>
                                    {getNeedPay(this.state.infos)}/
                                    {this.getTime(this.state.infos.time_value)}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    getTime(time_value) {
        if (time_value >= 365) {
            return parseInt(time_value / 365) + "年";
        } else {
            return time_value + "天";
        }
    }

    renderPriceContent() {
        return (
            <View height={100} style={styles.priceContainer}>
                <View>
                    <Text text60 black10 margin-10 style={{fontSize: size(28)}}>
                        购买后可用时长
                    </Text>
                </View>
                <View>
                    <Text
                        text60
                        black10
                        margin-10
                        style={{color: "#ff5000", fontWeight: "bold", fontSize: size(28)}}>
                        {this.getTime(this.state.infos.time_value)}
                    </Text>
                </View>
                <Separator/>
                <View>
                    <Text text60 black10 margin-10 style={{fontSize: size(28)}}>
                        订单支付金额
                    </Text>
                </View>
                <View>
                    <Text
                        text60
                        black10
                        margin-10
                        style={{color: "#ff5000", fontWeight: "bold", fontSize: size(28)}}>
                        {getNeedPay(this.state.infos).replace("只需支付", "")}
                    </Text>
                </View>
            </View>
        );
    }

    renderComment() {
        return (
            <View containerStyle={styles.commentStyle}>
                <TextInput
                    placeholder="选填:给平台留言(45字以内)"
                    multiline={true}
                    height={90}
                    underlineColorAndroid="transparent"
                    onChangeText={text => this.setState({remark: text})}
                />
            </View>
        );
    }

    onSelect(index, value) {
        this.setState({
            payMethod: value
        });
    }

    in_app_pay = async () => {
        this.Loading.show("正在支付...");
        console.log("in_app_pay");
        console.info("-----------------");
        let products = ["com.Vesal.Vesal3DAnatomy1"];
        // 生成OrderId
        console.log(`gointo getOrderId`);
        await this.getOrderId();
        console.log(`end getOrderId`);
        console.log(`****getOrderId****\n${this.state.OrderNo}`);
        InAppUtils.canMakePayments(async canMakePayments => {
            if (!canMakePayments) {
                Alert.alert("提醒", "您的设备暂时不支持内购");
                this.Loading.close();
            } else {
                InAppUtils.loadProducts(products, async (error, products) => {
                    console.log("products" + JSON.stringify(products));
                    var productIdentifier = "com.Vesal.Vesal3DAnatomy1";
                    InAppUtils.purchaseProduct(
                        productIdentifier,
                        async (error, response) => {
                            console.log("error" + error);
                            console.log("response" + JSON.stringify(response));
                            // NOTE for v3.0: User can cancel the payment which will be available as error object here.
                            if (response && response.productIdentifier) {
                                let tokens = await storage.get("userTokens");
                                const url = api.base_uri + "/v1/app/pay/applyPayNotify";
                                let responseData = await fetch(url, {
                                    method: "POST",
                                    body: JSON.stringify({
                                        ordNo: this.state.OrderNo,
                                        transactionReceipt: response.transactionReceipt
                                    }),
                                    headers: {
                                        "Content-Type": "application/json",
                                        token: tokens.token
                                    }
                                })
                                    .then(resp => resp.json())
                                    .then(result => {


                                        this.reloadLince()

                                        // debugger
                                        return new Promise((resolve, reject) => {
                                            if (result && result.result) {
                                                //storage.save('containsStructCombo', id, result.page);
                                                // this.Loading.close();
                                                resolve && resolve(result.result);
                                            } else {
                                                this.Loading.close();
                                                reject && reject(new Error("data parse error"));
                                            }
                                        });
                                    });
                                if (responseData) {
                                    console.log(
                                        `=====\napplyPayNotify  is ${JSON.stringify(responseData)}`
                                    );
                                    this.refs.toast.show("您已成功支付,正在跳转,请稍候...");
                                    this.Loading.close();
                                    //   let fy_id = await storage.get(
                                    //     "tabTypeId" + this.state.type_id,
                                    //     this.state.type_id
                                    //   );
                                    //   let _data = {
                                    //     functionType: this.state.type_id,
                                    //     fyId: fy_id
                                    //   };
                                    //   const paramArr = [];
                                    //   if (Object.keys(_data).length !== 0) {
                                    //     for (const key in _data) {
                                    //       paramArr.push(`${key}=${_data[key]}`);
                                    //     }
                                    //   }
                                    //   console.log(`\n ====\n paramArr is ${paramArr.join("&")}`);
                                    storage.clearMapForKey("versionByInitMyStruct");
                                    storage.clearMapForKey("mystructList");
                                    // DeviceEventEmitter.emit("HomeListener");
                                    setTimeout(
                                        function () {
                                            const resetAction = StackActions.reset({
                                                index: 0,
                                                actions: [
                                                    NavigationActions.navigate({routeName: "HomeScreen"})
                                                ]
                                            });
                                            // this.props.navigation.pop() && this.props.navigation.pop();
                                            this.props.navigation.dispatch(resetAction);
                                        }.bind(this),
                                        1000
                                    );
                                }

                                //unlock store here.
                            } else {
                                console.log(`支付失败`);
                                this.Loading.close();
                            }
                        }
                    );
                });
            }
        });
    };

    renderPayment() {
        return (
            <View style={{marginBottom: screen.height * 0.2}}>
                <Text left text60 black10 margin-10 style={{fontSize: size(26)}}>
                    选择支付方式
                </Text>
                <Separator/>
                <View style={{flexDirection: "row"}}>
                    <View style={{width: screen.width / 2}}>
                        <View
                            style={styles.paymentContainer}
                            style={this.state.weixinState ? styles.show : styles.hide}>
                            <View margin-5>
                                <Image
                                    style={styles.avatar}
                                    source={require("../../img/payment/weixin.png")}
                                />
                            </View>
                            <View flex marginL-10>
                                <View>
                                    <Text text60 black10 style={{fontSize: size(28)}}>
                                        微信支付
                                    </Text>
                                </View>
                                <View text40 black10 margin-2>
                                    <Text style={{fontSize: size(26)}}>微信钱包支付</Text>
                                </View>
                            </View>
                        </View>
                        <View
                            style={styles.paymentContainer}
                            style={this.state.alipayState ? styles.show : styles.hide}>
                            <View margin-5>
                                <Image
                                    style={styles.avatar}
                                    source={require("../../img/payment/alipay.png")}
                                />
                            </View>
                            <View flex marginL-10>
                                <View>
                                    <Text style={{fontSize: size(28)}} text60 black10>
                                        支付宝支付
                                    </Text>
                                </View>
                                <View text40 black10 margin-2>
                                    <Text style={{fontSize: size(26)}}>支付宝钱包支付</Text>
                                </View>
                            </View>
                        </View>
                        <View
                            style={styles.paymentContainer}
                            style={this.state.applyState ? styles.show : styles.hide}>
                            <View margin-5>
                                <Image
                                    style={styles.avatar}
                                    source={require("../../img/payment/ios.png")}
                                />
                            </View>
                            <View flex marginL-10>
                                <View>
                                    <Text style={{fontSize: size(28)}} text60 black10>
                                        ApplyPay
                                    </Text>
                                </View>
                                <View text40 black10 margin-2>
                                    <Text style={{fontSize: size(26)}}>苹果商店支付</Text>
                                </View>
                            </View>
                        </View>

                        <Separator/>
                        <View style={styles.paymentContainer}/>
                    </View>
                    <View style={{width: screen.width / 2}} marginL-100 marginT-10>
                        <RadioGroup
                            onSelect={(index, value) => this.onSelect(index, value)}
                            selectedIndex={this.state.selectedIndex}>
                            <RadioButton
                                value={"weChatPay"}
                                style={{marginTop: 5}}
                                style={this.state.weixinState ? styles.show : styles.hide}
                            />
                            <RadioButton
                                value={"aliPay"}
                                style={{marginTop: 5}}
                                style={this.state.alipayState ? styles.show : styles.hide}
                            />
                            <RadioButton
                                value={"applyPay"}
                                style={{marginTop: 5}}
                                style={this.state.applyState ? styles.show : styles.hide}
                            />
                        </RadioGroup>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        let head = null;

        if (!_.isEmpty(this.state.infos)) {
            head = <View flex style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.renderSubHeader()}
                    <SpacingView/>
                    {this.renderPriceContent()}
                    <SpacingView/>
                    <KeyboardAvoidingView behavior="padding">
                        {this.renderComment()}
                    </KeyboardAvoidingView>
                    <SpacingView/>
                    {this.renderPayment()}
                </ScrollView>
                {this.renderFooter()}
                <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />
            </View>;

        }
        return (
            <View style={{height: '100%', width: '100%'}}>
                <TitleBar title='支付订单' navigate={this.props.navigation}/>
                {head}
            </View>
        );
    }

    reloadLince() {
        if (this.props.navigation.state.params.goKey) {
            this.props.navigation.goBack(this.props.navigation.state.params.goKey);
        }
        else {
            this.props.navigation.goBack(this.props.navigation.state.params.goWeike_key);
        }

        DeviceEventEmitter.emit("loadHomeData");//人体构造数据
        DeviceEventEmitter.emit("RefreshWkDetail");//课程数据
        DeviceEventEmitter.emit("queryStructRefresh");//搜索查询产品数据
        DeviceEventEmitter.emit("loadCyHomeData");///测验练习数据
    }
}

const styles = StyleSheet.create({
    time: {
        fontWeight: "bold",
        color: "#242424",
        textAlign: "right"
    },
    title: {
        fontWeight: "bold",
        color: "#2f2f2f",
        fontSize: 17
    },
    buyCount: {
        textAlign: "right",
        marginRight: 20
    },
    container: {
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#F4F4F4"
    },
    itemContainer: {
        flexDirection: "row"
    },
    contentContainer: {
        flexDirection: "row",
        borderBottomWidth: screen.onePixel,
        marginBottom: 15,
        borderColor: color.border,
        padding: 5,
        flexWrap: "wrap"
    },
    oldPrice: {
        textDecorationLine: "line-through",
        textDecorationStyle: "solid",
        color: "#8b8b8b"
    },
    icon: {
        width: screen.width - screen.width * 0.8,
        height: (screen.width - screen.width * 0.8) * 1.2,
        resizeMode: "stretch",
        marginTop: 5,
        marginBottom: 5
    },
    titleContainer: {
        margin: 10,
        justifyContent: "space-between"
        // alignSelf: "center",
    },
    searchBar: {
        //width: screen.width * 0.65,
        //height: 30,
        //borderRadius: 19,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        lineHeight: 30,
        marginRight: 20
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    sellPrice: {
        color: "#2f2f2f",
        fontWeight: "bold"
    },
    sell: {
        color: "#ff5000",
        fontWeight: "bold"
    },
    sortIcon: {
        height: 32 / 2,
        width: 68 / 2,
        marginTop: 2,
        marginRight: 10
    },
    dixian: {
        fontSize: 14,
        color: "#a3a3a3",
        textAlign: "center"
    },
    container: {
        backgroundColor: "white",
        padding: 15
    },
    actionbarContainer: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        width: screen.width,
        zIndex: 1
    },
    absoluteContainer: {
        position: "absolute",
        bottom: 0
        // left: 0,
        // right: 0,
    },
    containerHeader: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        height: 150
    },
    containerContent: {
        flex: 1
    },

    priceContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
    commentStyle: {
        height: 90
    },
    paymentContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        width: screen.width / 2
    },
    iconAli: {
        width: 46,
        height: 46
    },
    avatar: {
        width: 46,
        height: 46
    },
    show: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center"
    },
    hide: {
        display: "none"
    },
    oldPrice: {
        textDecorationLine: "line-through",
        textDecorationStyle: "solid",
        color: "#8b8b8b"
    },
    sellPrice: {
        color: "#2f2f2f"
    }
});
