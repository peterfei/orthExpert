import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground} from "react-native";
import {size} from "../../../common/Tool/ScreenUtil";
import {ContainerView, BaseComponent, NavBar, AppDef, HttpTool, NetInterface, FuncUtils} from '../../../common';
import memberBackground from '../../../img/mine/memberBackground.png'
import member_center_details from '../../../img/mine/member_center_details.png'
import {storage} from "../../../common/storage";
import DateUtil from "../../../common/Tool/DateUtils";
import Loading from "../../../common/components/Loading";
import CardCell from "../../../common/components/CardCell";

export default class Member extends BaseComponent {

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
        }
    }

    componentWillUpdate() {
        this.Loading.close()
    }

    async componentDidMount() {
        this.init()
    }

    async init() {
        this.Loading.show()
        let memberInfo = await storage.get("memberInfo")
        let isUse = await FuncUtils.checkPerm('yes', AppDef.KFXL_VIP)
        const netInterface = NetInterface.vipInfo + `?version=1.0.0&plat=android&business=kfxl&comboCode=KFXL_VIP`
        HttpTool.GET(netInterface)
            .then(res => {
                if (res.code === 0) {
                    this.setState({
                        packageDetail: res.comboPrices,
                        isUse: isUse,
                        memberInfo: memberInfo
                    });
                } else {
                    console.log(res.msg)
                }
            })
            .catch(err => console.log(JSON.stringify(err)))
    }

    changeSelect(index) {
        console.log(index)
        this.setState({
            packageSelected: index
        })
    }
    gotoPay(){


        this.props.navigation.navigate("kfPay", {
            combo: this.state.packageDetail[this.state.packageSelected]
        });
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
                    <Text style={styles.packageDetailItemTime}>{DateUtil.getMonthOrYearByDays(item.timeValue)}</Text>
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
                                               source={require('../../../img/kf_mine/defalutHead.jpg')}></Image>
                                    </View>
                                    <View style={styles.memberInfoDetail}>
                                        <View style={styles.memberInfoDetailTop}>
                                            <Text style={{fontSize: size(28), color: '#262626',}}>{this.state.memberInfo.mbName}</Text>
                                            {
                                                this.state.isUse ? (
                                                    <Image style={{width: 15, height: 15, marginLeft: 15}}
                                                           source={require('../../../img/mine/member_vip.png')}></Image>
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
                        <View style={styles.mid}/>
                        <ImageBackground source={member_center_details} style={styles.bot}>

                        </ImageBackground>
                    </View>
                </ScrollView>
                <Loading ref={r => {
                    this.Loading = r
                }} hide={true}/>
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
        height: size(600),

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