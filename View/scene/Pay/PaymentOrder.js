import React, {PureComponent, Component} from "react";
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    DeviceEventEmitter,
    Alert,
    Platform,
    View,
    Text
} from "react-native";
import {screen, system,HttpTool,NetInterface,AppDef} from "../../common";
import Loading from "../../common/Loading";

import {color, NavigationItem, Separator, SpacingView} from "../../widget";


import {Wxpay} from "../../common";
import Toast, {DURATION} from "react-native-easy-toast";
import {storage} from "../../common/storage";
import _ from "lodash";
import {NavigationActions,StackActions} from "react-navigation";
import {NativeModules} from "react-native";
import {size, setSpText} from "../../common/ScreenUtil";
//import ShopSingleShow from '../Shop/ShopSingleShow';
import NavBar from "../../common/components/NavBar"

const {InAppUtils, Alipay} = NativeModules;

export default class PaymentOrder extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            datas: {},
            infos: props.navigation.state.params.infos,
            cartId: "",
            remark: "",
            OrderNo: props.navigation.state.params.ordNo,
            currentIP: "",
            payMethod: "",
            weixinState: false,
            applyState: false,
            alipayState: false,
            selectedIndex: null,
            prices: props.navigation.state.params.prices,
            couponList: [],
            newPayList: [],
            currentPayIndex: 0,
            couponIds: '',
            selectResult: []
        };
        // this.onSelect = this.onSelect.bind(this);


    }

    componentWillReceiveProps(nextProps, nextContext) {

        this.setState({
            OrderNo: nextProps.navigation.state.params.ordNo,
            prices: nextProps.navigation.state.params.prices,
            infos: nextProps.navigation.state.params.infos,
        })
    }

    componentDidMount() {

        this.setState({
            infos: this.props.navigation.state.params.infos,
            prices: this.props.navigation.state.params.prices
        });
        console.log("---------------");
        Wxpay.registerApp(AppDef.WXEntryAppID);
        this.requestCouponList();
        this.getPayMethod();
        this.couponListener = DeviceEventEmitter.addListener('AcceptSelectedCoupons', (obj) => {

            this.setState({
                couponIds: obj.couponIds,
                selectResult: obj.couponList
            })
        })
    }

    componentWillUnmount() {
        this.couponListener.remove();
    }

    async requestCouponList() {
        let type = this.props.navigation.state.params.infos.comboSource;
        const url = NetInterface.gk_myCombocouponList + "?state=usable&couponType=" + type;
        // this.Loading.show('加载中...');
        try {
            aHttpTool.GET_JP(url)
                .then(result => {
                    this.Loading.close();
                    if (result.code == 0 && result.msg == 'success') {
                        let list = result.page.list;
                        list.forEach((item, index) => {
                            item['isSelect'] = false;
                        })
                        this.setState({
                            couponList: list
                        })
                    } else {
                        this.refs.toast.show(JSON.stringify(result.msg));
                    }
                });
        } catch (error) {
            this.refs.toast.show(JSON.stringify(error));
        }
    }

    async getPayMethod() {
        const url =
            NetInterface.gk_config + "?key=pay_method_" + Platform.OS;
            HttpTool.GET_JP(url)
            .then(result => {
                console.log(result);
                let list = result.config.split(',');
                let arr = [];
                if (list.indexOf('weChatPay') != -1) {
                    let obj = {
                        title: '微信支付',
                        subTitle: '微信钱包支付',
                    }
                    arr.push(obj)
                }

                if (list.indexOf('weChatPay') != -1) {
                    let obj = {
                        title: '支付宝支付',
                        subTitle: '支付宝钱包支付',
                    }
                    arr.push(obj)
                }

                this.setState({
                    newPayList: arr,
                    currentPayIndex: 0
                })
            });
    };

    //判断用户是否绑定手机号
    async isBindTellNumber() {
        let tokens = await storage.get("userTokens");
        let url = NetInterface.gk_isBoundTellNumber + "?path=paymentOrder";
        HttpTool.GET_JP(url)
            .then(result => {
                if (result.result == "no") {
                    this.refs.toast.show("您未绑定手机号，请先绑定手机号~");
                    this.timer = setTimeout(() => {
                        this.props.navigation.navigate('BindPhone',{callBackData:this.toPay.bind(this)})
                    }, 1000);
                }
                else {
                    this.toPay();
                }
            })
    }


    toPay() {
        storage.saveNoExpires("isRefreshCache", "", "yes");
        let obj = this.state.newPayList[this.state.currentPayIndex];
        if (obj.title == '微信支付') {
            this.wxPay();
        } else {
            this.aliPay();
        }
    }

    async getOrderId() {
        //如果没有订单号就获取订单号  (继续支付会有订单号 点击了一次立即支付也会有订单号)
        let tokens = await storage.get("userTokens");
        const url = NetInterface.newAddOrder + "/v1/app/order/newAddOrder";

        // alert(JSON.stringify({
        //     comboId: this.state.prices.comboId || this.state.prices[0].comboId,
        //     priceId: this.state.prices.priceId || this.state.prices[0].priceId,
        //     ordRes: Platform.OS,
        //     lang: "ch",
        //     remark: this.state.remark,
        //     business: "anatomy",
        //     couponIds: this.state.couponIds
        // }))
        let body={
            comboId: this.state.prices.comboId || this.state.prices[0].comboId,
            priceId: this.state.prices.priceId || this.state.prices[0].priceId,
            ordRes: Platform.OS,
            lang: "ch",
            remark: this.state.remark,
            business: "anatomy",
            couponIds: this.state.couponIds
        }
        let responseData =HttpTool.POST_JP(url,body)
            .then(result => {


                if (result.code==500){
                    this.refs.toast.show(result.msg);
                }
                return new Promise((resolve, reject) => {
                    if (result && result.order) {
                        resolve && resolve(result.order);
                    } else {
                        reject && reject(new Error("data parse error"));
                    }
                });
            });


        this.setState({
            OrderNo: responseData.ordNo
        });
    };

    async wxPay() {
        try {
            this.Loading.show("正在支付...");
            setTimeout(() => {
                this.Loading && this.Loading.close()
            }, 5000);
            let isSupported = await Wxpay.isSupported();

            // 生成OrderId
            await this.getOrderId();
            // 取微信支付配置
            const data = await this.wxPayConfig();
            if (!isSupported) {
                // 判断是否支持微信支付
                this.Loading.close();
                this.refs.toast.show("找不到微信应用，请安装最新版微信");
                return;
            }
            let ret = await Wxpay.pay(data);
            if (ret.errCode === 0) {
                this.refs.toast.show("支付成功");
                this.Loading.close();
                storage.clearMapForKey("versionByInitMyStruct");
                storage.clearMapForKey("mystructList");
                DeviceEventEmitter.emit("RefreshEmitter");
                // DeviceEventEmitter.emit("HomeListener");
                this.reloadLince()
            } else {
                this.Loading.close();
                this.refs.toast.show("支付失败,请重新支付");
            }
        } catch (error) {
            this.Loading.close();
        }

    }

    async wxPayConfig() {
        const orderNo = this.state.OrderNo;
        let tokens = await storage.get("userTokens");
        const url = NetInterface.gk_wxGetPreyId + "?ordNo=" + orderNo;
        let responseData = HttpTool.GET_JP(url)
            .then(result => {
                return new Promise((resolve, reject) => {
                    if (result && result.result) {
                        resolve && resolve(result.result);
                    } else {
                        reject && reject(new Error("data parse error"));
                    }
                });
            });
        return responseData;
    }



    async aliPay() {
        try {
            this.Loading.show("正在支付...");
            setTimeout(() => {
                this.Loading && this.Loading.close()
            }, 5000)
            // 生成OrderId
            await this.getOrderId();
            const orderNo = this.state.OrderNo;
            let tokens = await storage.get("userTokens");
            const url =
                NetInterface.gk_alipayGetPreyId +
                "?ordNo=" +
                orderNo +
                "&business=anatomy";
            let responseData = HttpTool.GET_JP(url)
                .then(result => {
                    return new Promise((resolve, reject) => {
                        if (result && result.msg) {
                            resolve && resolve(result.msg);
                        } else {
                            reject && reject(new Error("data parse error"));
                        }
                    });
                });

            let ali = await Alipay.pay(responseData);
            if (ali.resultStatus === "9000") {
                this.refs.toast.show("支付成功");
                this.Loading.close();
                storage.clearMapForKey("versionByInitMyStruct");
                storage.clearMapForKey("mystructList");
                DeviceEventEmitter.emit("RefreshEmitter");
                this.reloadLince()
            } else {
                this.Loading.close();
                this.refs.toast.show("支付失败,请重新支付");
            }
        } catch (error) {
            this.Loading.close();
        }
    }

    async in_app_pay() {
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
                                const url = NetInterface.gk_applyPayNotify
                                let responseData = HttpTool.POST_JP(url,{ordNo: this.state.OrderNo,transactionReceipt: response.transactionReceipt})
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
                                                    NavigationActions.navigate({routeName: "Tab"})
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

    getNeedPay(data) {
        let price = " ￥" + (data.sellPrice || data[0].sellPrice);
        if (data.needPay != undefined && data.needPay != '') {
            price = "只需支付￥" + data.needPay;
        }
        return price;
    }

    getTime(time_value) {

        if (time_value >= 365) {
            if (parseInt(time_value / 365)>50){
                return  "永久使用";
            } else{
                return parseInt(time_value / 365) + "年";
            }

        } else {
            return time_value + "天";
        }
    }

    renderSubHeader() {
        return (
            <ShopSingleShow navigate={this.props.navigation} comboList={this.state.infos} showPrice={false}/>
        );
    }

    renderPriceContent() {
        let title = '';
        if (this.state.selectResult.length <= 0) { // 还没选择
            title = this.state.couponList.length <= 0 ? '暂无可用优惠券' : this.state.couponList.length + '张';
        } else {
            let couponMoney = 0;
            this.state.selectResult.forEach((coupon, index) => {
                couponMoney += coupon.couponPrice;
            })
            title = '已选优惠券, 可抵扣' + couponMoney + '元';
        }
        return (
            <View>
                <View style={styles.priceContent}>
                    <Text style={styles.buyText}>购买后可用时长</Text>
                    <Text style={styles.buyTime}>
                        {this.getTime(this.state.prices.deadline || this.state.prices[0].deadline)}
                        {/* {this.props.combo.lableA}} */}
                    </Text>
                </View>

                <View style={styles.priceContent}>
                    <Text style={styles.buyText}>订单金额</Text>
                    <Text style={styles.buyTime}>{this.getNeedPay(this.state.prices).replace("只需支付", "")}</Text>
                </View>
                <TouchableOpacity onPress={() => {

                    this.props.navigation.navigate('CouponList', {
                        couponList: this.state.couponList,
                        couponLimit: this.state.prices.couponLimit
                    })
                }}>
                    <View style={styles.priceContent}>
                        <Text style={styles.buyText}>优惠券</Text>
                        <Text style={styles.buyTime}>{title} ></Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    allTotal() {
      // 原价
      let data = this.state.prices;
      let price = data.sellPrice || data[0].sellPrice;
      if (data.needPay != undefined && data.needPay != '') {
        price = data.needPay
      }
      // 优惠券的钱
      let couponMoney = 0;
      this.state.selectResult.forEach((coupon, index) => {
        couponMoney += coupon.couponPrice;
      })
      let result = price-couponMoney <= this.state.prices.bottomPrice ? this.state.prices.bottomPrice : price-couponMoney;
      return (
        <View style={{width: '100%', height: size(83), flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
          <Text style={{color: '#343434', fontSize: size(24), marginRight: size(30)}}>实际支付:</Text>
          <Text style={{color: '#EF8131', fontSize: size(34), fontWeight: 'bold', marginRight: size(25)}}>¥{result.toFixed(2)}</Text>
        </View>
      )
    }

    renderComment() {
        return (
            <View containerStyle={styles.commentStyle}>
                <TextInput
                    placeholder="选填:给平台留言(45字以内)"
                    multiline={true}
                    style={{height: 90, paddingLeft: size(25)}}
                    underlineColorAndroid="transparent"
                    onChangeText={text => this.setState({remark: text})}
                />
            </View>
        );
    }

    renderPayment() {
        let arr = [];
        this.state.newPayList.forEach((payment, index) => {
            let icon = payment.title == '微信支付' ? require('../../img/payment/weixin_02.png') : require('../../img/payment/alipay_02.png');

            arr.push(
                <TouchableOpacity onPress={() => {
                    this.setState({currentPayIndex: index})
                }}>
                    <View style={{
                        marginRight: size(25),
                        marginLeft: size(25),
                        flexDirection: 'row',
                        marginTop: size(30),
                        justifyContent: 'space-between',
                    }}>
                        <View style={{flexDirection: 'row'}}>
                            <Image source={icon}
                                   style={{height: size(70), width: size(70)}}/>
                            <View style={{flexDirection: 'column', paddingLeft: size(32)}}>
                                <Text style={{fontSize: setSpText(24), color: '#343434'}}>{payment.title}</Text>
                                <Text style={{fontSize: setSpText(24), color: '#343434'}}>{payment.subTitle}</Text>
                            </View>
                        </View>
                        <View style={{marginRight: size(25), justifyContent: 'center'}}>
                            <Image
                                source={this.state.currentPayIndex == index ? require('../../img/payment/select.png') : require('../../img/payment/noSelect.png')}
                                style={{height: size(28), width: size(28)}}/>
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
                    <Text style={{color: '#343434', paddingLeft: size(25), fontSize: setSpText(24)}}>选择支付方式</Text>
                </View>
                {arr}
                <View style={{height: size(105)}}/>
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
                this.isBindTellNumber()
            }}>
                <Text style={{color: '#ffffff', fontSize: setSpText(32)}}>立即支付</Text>

            </TouchableOpacity>

        );
    }

    render() {
        let head = null;
        if (!_.isEmpty(this.state.infos)) {
            head =
                <View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{width: '100%', height: screen.height - size(148)}}>
                        {/* {this.renderSubHeader()} */}
                        <SpacingView/>
                        {this.renderPriceContent()}
                        <SpacingView/>
                        {this.allTotal()}
                        <SpacingView/>
                        <KeyboardAvoidingView behavior="padding">
                            {this.renderComment()}
                        </KeyboardAvoidingView>
                        <SpacingView/>
                        {this.renderPayment()}
                    </ScrollView>
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
            <View style={{height: '100%', width: '100%', backgroundColor: '#FFFFFF'}}>

                <NavBar title='支付订单' navigation={this.props.navigation}/>
                {head}
                {this.renderFooter()}
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
    },
    searchBar: {
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
        flexDirection: "row",
        justifyContent: "space-between",
        width: screen.width,
        zIndex: 1
    },
    absoluteContainer: {
        position: "absolute",
        bottom: 0
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
    priceContent: {
        height: size(82),
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: size(1),
        borderBottomColor: '#F0F0F0',
    },
    buyText: {
        fontSize: setSpText(24), color: '#343434', fontWeight: '400', width: '50%', paddingLeft: size(25)
    },
    buyTime: {
        fontSize: setSpText(24),
        color: '#EF8131',
        fontWeight: '400',
        width: '50%',
        textAlign: 'right',
        paddingRight: size(25)
    }
});