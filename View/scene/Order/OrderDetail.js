import React, {Component} from "react";
import Loading from "../../common/Loading";
import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    Button,
    TouchableOpacity,
    Alert,DeviceEventEmitter,
    Platform
} from "react-native";
import {screen} from "../../common";
import {color} from "../../widget";
import ScrollableTabView, {
    DefaultTabBar
} from "react-native-scrollable-tab-view";

import {RefreshState} from "react-native-refresh-list-view";
import {NavigationActions} from "react-navigation";
import {storage} from "../../common/storage";
import {RadioGroup, RadioButton} from "react-native-flexi-radio-button";
import Toast, {DURATION} from "react-native-easy-toast";
import api from "../../api";
//import Icon from "react-native-vector-icons/FontAwesome";
import TitleBar from '../../scene/Home/TitleBar';
export default class OrderDetail extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            List: [],
            combo: {},
            ordNo: ""
        };
    }

    getOrdState(info) {
        return info.ord_state
            .replace("finished", "交易成功")
            .replace("waitPayment", "等待付款")
            .replace("canceled", "已取消")
            .replace("waitComment", "交易成功");
    }

    async componentWillMount() {
        let {info} = this.props.navigation.state.params;
        let tokens = await storage.get("userTokens");
        this.Loading.show("查询中...");
        const url = api.base_uri + "/v1/app/order/orderDetail?ordId=" + info.ord_id;
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
                this.Loading.close();
                this.setState({
                    List: result.List.detailList,
                    combo: result.List.combo,
                    ordNo: info.ord_no
                });

            });
    }

    userCanceled() {
        return;
    }

    deleteOrder() {
        Alert.alert(
            "温馨提示",
            "确定要删除该订单吗?",
            [
                {
                    text: "取消",
                    onPress: () => this.userCanceled()
                },
                {
                    text: "确定",
                    onPress: () => this.toDelete()
                }
            ],
            {cancelable: true}
        );
    }

    async toDelete() {
        let _this = this;
        let {info} = this.props.navigation.state.params;
        let tokens = await storage.get("userTokens");
        const url =
            api.base_uri + "/v1/app/order/deleteMemberOrder?ordId=" + info.ord_id;
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
                if (result.code == 0) {
                    this.refs.toast.show("删除成功");
                    setTimeout(
                        function () {
                            _this.props.navigation.goBack();
                            DeviceEventEmitter.emit("reloadOrder",{});
                        }.bind(this),
                        2000
                    );
                    this.props.navigation.navigate("MyOrder");
                } else {
                    this.refs.toast.show("删除失败");
                }
            });
    }

    async cancelOrder() {
        Alert.alert(
            "温馨提示",
            "确定要取消?",
            [
                {
                    text: "取消",
                    onPress: () => this.userCanceled()
                },
                {
                    text: "确定",
                    onPress: () => this.toCancel()
                }
            ],
            {cancelable: true}
        );
    }

    async toCancel() {
        let _this = this;
        let {info} = this.props.navigation.state.params;
        let tokens = await storage.get("userTokens");
        const url = api.base_uri + "/v1/app/order/cancelOrder?ordId=" + info.ord_id;
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
                if (result.code == 0) {

                    this.refs.toast.show("取消成功");
                    setTimeout(
                        function () {
                            _this.props.navigation.goBack();
                            DeviceEventEmitter.emit("reloadOrder",{});
                        }.bind(this),
                        2000
                    );
                    //返回并刷新



                } else {
                    this.refs.toast.show("取消失败");
                }
            });
    }

    async payOrder() {
        this.props.navigation.navigate("PaymentOrder", {
            infos: this.state.combo,
            ordNo: this.state.ordNo
        });
    }

    getTime(time) {
        if (time == null) {
            return "--";
        }
        if (time >= 365) {
            return parseInt(time / 365) + "年";
        } else {
            return time + "天";
        }
    }

    render() {
        let {info} = this.props.navigation.state.params;
        let payMethod = "";
        if (info.ord_state == "finished" || info.ord_state == "waitComment") {
            let method = info.pay_method == null ? "" : info.pay_method;
            payMethod = method
                .replace("applyPay", "ApplyPay")
                .replace("weChatPay", "微信支付")
                .replace("alipay", "支付宝");
        } else {
            payMethod = "未付款";
        }
        let menus = "";
        if (
            info.ord_state == "finished" ||
            info.ord_state == "waitComment" ||
            info.ord_state == "canceled"
        ) {
            menus = (
                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.f1}
                        onPress={this.deleteOrder.bind(this)}>
                        <Text style={styles.del}>删除订单</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if (info.ord_state == "waitPayment") {
            menus = (
                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.f2}
                        onPress={this.cancelOrder.bind(this)}>
                        <Text style={styles.cancel}>取消订单</Text>
                    </TouchableOpacity>
                  {Platform.OS == 'ios' ?
                    null
                    :
                    <TouchableOpacity
                      style={styles.f3}
                      onPress={this.payOrder.bind(this)}>
                      <Text style={styles.pay}> 继续支付</Text>
                    </TouchableOpacity>
                  }

                </View>
            );
        }

        return (
            <View style={styles.container}>
                <TitleBar title={'订单详情'} navigate={this.props.navigation} />
                <ScrollView>
                    <View style={styles.head}>
                        <Text style={styles.headTitle}>订单信息</Text>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>订单编号</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={styles.text}> {info.ord_no}</Text>
                        </View>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>购买信息</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={[styles.text, styles.comboName]}>
                                {info.combo_name}{" "}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>购买时长</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={[styles.text, styles.comboName]}>
                                {this.getTime(info.combo_time_value)}{" "}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>下单时间</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={styles.text}>{info.create_time} </Text>
                        </View>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>订单状态</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={[styles.text, styles.ordState]}>
                                {this.getOrdState(info)}{" "}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>订单金额</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={[styles.text, styles.price]}>
                                {info.pay_price}元{" "}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.input}>
                        <View style={styles.inputTitle}>
                            <Text style={styles.title}>支付方式</Text>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={[styles.text, styles.method]}>{payMethod}</Text>
                        </View>
                    </View>

                    <View style={styles.head}>
                        <Text style={styles.headTitle}>订单详情</Text>

                    </View>
                    <View style={{marginBottom: 100}}>
                        {(this.state.List==null||this.state.List==''||this.state.List.length == 0 )? (
                            <Text style={{textAlign: "center"}}>--暂无信息--</Text>
                        ) : (
                            this.state.List.map(item => (

                                <View style={styles.input}>
                                    <View style={styles.img}>
                                        <Text>
                                            <Image
                                                source={{
                                                    uri: item==null?"":item.first_icon_url
                                                }}
                                                style={styles.icon}
                                            />
                                        </Text>
                                    </View>
                                    <View style={styles.struct}>
                                        <Text style={styles.structName}>
                                            {" "}
                                            {item==null?"":item.struct_name}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
                {menus}
                <Toast
                    ref="toast"
                    position="bottom"
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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    head: {
        backgroundColor: "#F4F4F4",
        height: 40
    },
    headTitle: {
        lineHeight: 40,
        paddingLeft: 10
    },
    container: {
        flex: 1,
        height: screen.width - 200,
        backgroundColor: "#fff",
    },
    edit: {
        height: 50,
        fontSize: 20,
        marginLeft: 10, //左右留出一定的空间
        marginRight: 10
    },
    text: {
        height: 50,
        fontSize: 16,
        marginLeft: 10, //左右留出一定的空间
        marginRight: 10,
        lineHeight: 50
    },
    img: {
        flex: 1
    },
    struct: {
        flex: 3
    },
    input: {
        width: screen.width,
        backgroundColor: "#fff",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#F4F4F4",
        borderStyle: "dotted",
        marginLeft: 10
    },
    inputTitle: {
        flex: 2
    },
    inputView: {
        flex: 5
    },
    title: {
        textAlign: "right",
        lineHeight: 50,
        fontSize: 16,
        color: "#4c4c4c"
    }, //登录按钮View样式
    textLoginViewStyle: {
        width: screen.width - 40,
        height: 50,
        backgroundColor: color.main,
        borderRadius: 20,
        marginTop: 30,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    //登录Text文本样式
    textLoginStyle: {
        fontSize: 18,
        color: "white"
    },
    price: {
        textAlign: "left",
        color: "#FF7F24",
        fontWeight: "bold"
    },
    ordState: {
        textAlign: "left",
        color: color.main
    },
    comboName: {
        color: "#2a2a2a",
        fontWeight: "bold"
    },
    method: {
        color: "#62b900"
    },
    icon: {
        width: screen.width / 3,
        height: screen.width / 3,
        resizeMode: "stretch"
    },
    structName: {
        fontSize: 18,
        color: "#464646",
        textAlign: "left",
        marginTop: 2
    },
    menu: {
        flexDirection: "row",
        borderTopWidth: 0,
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 40,
        borderColor: "#e2e2e2",
        borderStyle: "dotted",
        right: 0,
        width: screen.width,
        backgroundColor: "#F4F4F4"
    },
    f1: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5
    },
    f2: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5
    },
    f3: {
        flex: 2,
        marginLeft: 5,
        marginRight: 5
    },
    del: {
        color: color.main,
        fontWeight: "bold",
        lineHeight: 40,
        textAlign: "center"
    },
    cancel: {
        color: color.main,
        lineHeight: 40,
        textAlign: "center",
        fontWeight: "bold"
    },
    pay: {
        color: "#fff",
        lineHeight: 40,
        textAlign: "center",
        borderRadius: 5,
        backgroundColor: color.main
    }
});
