import React, {Component} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
    ImageBackground,
    DeviceEventEmitter,
    Alert
} from "react-native";

import {screen, ContainerView, BaseComponent, NavBar, AppDef, HttpTool, NetInterface, FuncUtils} from '../../common';
import {size} from '../../common/Tool/ScreenUtil';
import DateUtil from "../../common/DateUtils";
import Loading from "../../common/Loading";
import {storage} from "../../common/storage";
import memberBackground from '../../img/vip/memberBackground.png'
import member_center_details from '../../img/vip/member_center_details.png'
import DeviceInfo from "react-native-device-info";
import {NativeModules} from 'react-native'

const Wxpay = NativeModules.Wxpay;
const InAppUtils = NativeModules.InAppUtils;
import Toast, {DURATION} from "react-native-easy-toast";


export default class BuyVip extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {
            color: null,
            packageDetail: [],
            packageSelected: 0,
            packageList: [],
            memberInfo: {mbName: null},
            memberCenterDetailsHeight: 10,
            isUse: false, // 是否是会员
            PayData: '',
            priceId: "",
            comboId: "",
            productID: "",
            OrderNo: "",
            memberComboEndTime: '',
            comboInfo: {},
            combo: {},
            reviewStatus: false
        }
    }

    async componentDidMount() {


        let memberInfo = await storage.get("memberInfo");
        FuncUtils.checkKfPerm()
            .then(res => {
                if (res.code == 0 && res.result == 'yes') {
                    this.setState({
                        memberInfo: memberInfo,
                        isUse: false,
                    })
                } else {
                    this.setState({
                        memberInfo: memberInfo,
                        isUse: true,
                        combo: res.memberCombo
                    })
                }
            })
            .catch(err => {
                this.mainView._toast(JSON.stringify(err))
            })
        this.checkReviewStatus();
        this.init()
    }

    checkReviewStatus() {
        FuncUtils.checkReviewStatus()
          .then(result => {
              // alert(result);
              this.setState({
                  reviewStatus: result
              })
          })
          .catch(err => {
              console.log(JSON.stringify(err));
              this.setState({
                  reviewStatus: false
              })
          })
    }

    async init() {
        const currVersion = DeviceInfo.getVersion();
        // this.Loading.show()
        // let isUse = await FuncUtils.checkPerm('yes', 'GKHY')//检查是否有权限
        let tokens = await storage.get("userTokens");
        let url = NetInterface.gk_getComboInfo + "?app_version=" + currVersion + "&plat=" + Platform.OS+"&business=orthope&comboCode=ORTHOPE_VIP";
        // debugger

        let memberInfo = await storage.get("memberInfo");
        let combo = await FuncUtils.getComboByCode(AppDef.ORTHOPE_VIP)
        let isUse = await FuncUtils.checkComboisExpire(AppDef.ORTHOPE_VIP)

        HttpTool.GET_JP(url)
            .then(result => {
                this.setState({
                    packageDetail: result.comboPrices,
                    memberInfo: memberInfo,
                    comboInfo: result.combo,
                    isUse: isUse,
                })
            })
    }

    async getOrderId() {
        let product = this.state.packageDetail[this.state.packageSelected];
        let body = {
            "priceId": product.priceId,
            "comboId": product.comboId,
            "ordRes": Platform.OS,
            "remark": "",
            "business": "orthope"
        }
        let url = NetInterface.gk_newAddOrder;
        HttpTool.POST_JP(url, body)
            .then(result => {
                // alert(`result${result}`);
                if (result && result.order) {
                    this.setState({
                        OrderNo: result.order.ordNo
                    })
                } else {
                    this.setState({
                        OrderNo: ''
                    })
                }
            })
          .catch(err => {
              // alert(`err${err}`);
              console.log(JSON.stringify(err));
              this.setState({
                  OrderNo: ''
              })
          })
    }

    changeSelect(index) {
        console.log(index)
        this.setState({
            packageSelected: index
        })
    }

    gotoPay() {

        if (Platform.OS == 'ios' && this.state.reviewStatus) {
            let product = this.state.packageDetail[this.state.packageSelected];
            // alert(JSON.stringify(this.state.packageDetail));
            this.applePay(product.productId);

        } else {
            let title = this.props.navigation.state.params !== undefined ? this.props.navigation.state.params.title : null
            this.props.navigation.navigate("Pay", {
                combo: this.state.packageDetail[this.state.packageSelected],
                goOutPay_key: this.props.navigation.state.key,
                title: title
            });
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
                                                this.props.navigation.goBack();
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

    renderPackageDetail() {
        let packageList = []
        // debugger
        if (this.state.packageDetail != undefined) {
            if (this.state.packageDetail.length > 0) {
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
            }
        }


        return (
            <View style={styles.packageDetail}>
                {packageList}
            </View>
        )
    }

    render() {
        let userIcon = this.state.memberInfo.mbHeadUrl ? {uri: this.state.memberInfo.mbHeadUrl} : require('../../img/kf_mine/defalutHead.png');
        return (
            <ContainerView ref={r => this.mainView = r}>
                <NavBar title='我的VIP会员' hideback={false} navigation={this.props.navigation}/>
                <ScrollView
                    overScrollMode='never'
                >
                    <View style={styles.container}>
                        <View style={styles.top}>
                            <ImageBackground source={memberBackground} style={styles.memberInfo}>
                                <View style={styles.memberImageTop}>
                                    <View style={styles.memberImage}>
                                        <Image style={{width: 48, height: 48, borderRadius: 24}}
                                               source={userIcon}/>
                                    </View>
                                    <View style={styles.memberInfoDetail}>
                                        <View style={styles.memberInfoDetailTop}>
                                            <Text style={{
                                                fontSize: size(28),
                                                color: '#262626',
                                            }}>{this.state.memberInfo.mbName}</Text>
                                            {
                                                this.state.isUse ? (
                                                    <Image style={{width: 15, height: 15, marginLeft: 15}}
                                                           source={require('../../img/vip/member_vip.png')}/>
                                                ) : null
                                            }
                                        </View>
                                        <View style={styles.memberInfoDetailBot}>
                                            <Text
                                                style={styles.memberInfoDetailBotText}>{this.state.isUse ? '恭喜你，你已经是我们的专属会员' : '开通专属会员'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.memberImageBot}>
                                    <View style={styles.memberImageBotRight}>
                                        <Text style={styles.memberImageBotRightText}>{this.state.comboInfo.comboName}</Text>
                                    </View>
                                    {
                                        this.state.isUse ? (
                                            <View style={styles.memberImageBotLeft}>
                                                <Text style={styles.memberImageBotLeftText}>{this.state.combo.endTime.substring(0, 10)}到期</Text>
                                            </View>
                                        ) : null
                                    }

                                </View>
                            </ImageBackground>
                            <View style={styles.packageName}>
                                <Text style={styles.packageNameText}>会员套餐</Text>
                            </View>
                            {this.renderPackageDetail()}
                            <View style={styles.joinMember}>
                                <TouchableOpacity style={styles.joinMemberBtn} onPress={() => this.gotoPay()}>
                                    <Text style={styles.joinMemberBtnText}>立即开通</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.mid}/>
                        <ImageBackground source={member_center_details} style={styles.bot}>

                        </ImageBackground>
                    </View>
                </ScrollView>
                <Loading ref={r => {
                    this.Loading = r
                }} hide={true}/>
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
        height: size(156),
        width: size(231),
        borderWidth: 1,
        borderColor: '#E2E2E2',
        margin: 2.5,
        backgroundColor: '#DDEBF8',
        borderRadius: 5,
    },

    packageDetailItem: {
        height: size(156),
        width: size(231),
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
