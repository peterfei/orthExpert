import React from "react";
import {
    Button,
    DeviceEventEmitter,
    ScrollView,
    Image,
    TextInput,
    TouchableOpacity,
    Text,
    View,
    Alert,
    RefreshControl,
    StyleSheet, Platform, Keyboard, StatusBar, KeyboardAvoidingView
} from "react-native";
import {size} from "../../common/ScreenUtil";
import {storage} from "../../common/storage";
import ETTLightStatus from "../../common/ETTLightStatus";
import api from "../../api";
import DeviceInfo from "react-native-device-info";
import {saveWebList} from "../../realm/RealmManager";
import Loading from "../../common/Loading";
import {groupBy, changeArr} from "../../common/fun";
import {screen} from "../../common";
import FadeInView from "../Unity/FadeInView";
import Toast from "react-native-easy-toast";
import {
    queryHistoryAll,
    insertHistory, insertRecentlyUse,
    deleteHistories
} from "../../realm/RealmManager";
import {ifnull, getLinceList, checkIsUse, checkGotoUnity, useStart} from "../Unity/LCE";
import {NavigationActions} from "react-navigation";

//排序

function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

export default class Find extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            currKeyName: "",
            currKeyId: "",
            key: "",
            hotData: [],
            keyData: [],
            structData: [],
            historyData: [],
            showHot: true,
            showKey: false,
            showStruct: false,
            btnTitle: "搜索",
            keyboardHeight: size(40),
            linceList: [],
            isRefreshing: false,

        };
    }

    componentWillMount() {
        //获取热词
        this.getHotKey();
        this.getHistory();
        this.refreshDetail()
        this.emitter = DeviceEventEmitter.addListener('queryStructRefresh',
            () => {
                this.refreshDetail();
                this.refs.toast.show("刷新成功");
            }
        )
    }

    componentWillUnmount() {
        if (this.emitter) {
            this.emitter.remove()
        }
    }

    // async getLince() {
    //     let lince = await getLinceList();
    //     this.setState({
    //         linceList: lince
    //     })
    // }


    async getHistory() {
        let arr = await queryHistoryAll();
        this.setState({
            historyData: changeArr(arr)
        })
    }

    async getHotKey() {

        //获取热门搜索数据

        let tokens = await storage.get("userTokens");
        if (tokens != -1 && tokens) {
            let url = api.base_uri + "v1/app/struct/selectHotProduct?token=1";
            await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                }
            }).then(resp => resp.json())
                .then(result => {

                    this.setState({
                        hotData: result.hotList
                    })

                })
        } else {
            Alert.alert("会话过期,请重新登录");
            setTimeout(
                function () {
                    const resetAction = NavigationActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({routeName: "Login"})]
                    });
                    this.props.navigation.dispatch(resetAction);
                }.bind(this), 1000
            );
        }

    }

    /**
     * 点击搜索
     * */
    clickSS() {
        if (this.state.btnTitle == '取消') {
            if (this.state.currKeyId && this.state.currKeyId != '') {
                this.setState({
                    showHot: false,
                    showKey: false,
                    showStruct: true,
                })
            } else {
                this.props.navigation.goBack()
            }
        } else {
            if (this.state.key == '' || this.state == undefined) {
                this.refs.toast.show("请输入搜索内容");
            } else {

                let data = {
                    "keyName": this.state.currKeyName,
                    "keyId": this.state.currKeyId
                }

                if (this.state.currKeyId && this.state.currKeyId != '') {
                    this.queryStruct(data, "key");
                } else {
                    this.queryStruct(data, "not_key");
                }

            }
        }


    }

    saveHistory(data, type) {
        if ("key" == type) {
            let temp = {
                keyName: data.keyName,
                keyId: data.keyId + "",
                type: type,
                addTime: new Date().getTime()
            }
            insertHistory(temp)
        }
    }

    async queryStruct(data, type) {

        this.Loading.show("查询中...");
        this.refs.textInput.blur();
        let tokens = await storage.get("userTokens");
        let url = api.base_uri + "v1/app/struct/getStructByKeyWord";


        this.saveHistory(data, type);

        let params = {

            "keyName": data.keyName,
            "keyId": data.keyId,
            "type": type,
            "plat": Platform.OS,
            "appVersion": DeviceInfo.getVersion()

        }

        await fetch(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            },
            body: JSON.stringify(params)
        }).then(resp => resp.json())
            .then(result => {
                this.Loading.close();
                if (result.code == 0) {
                    let currkey = "";
                    let currKeyId = "";
                    if (data.keyId != '' && data.keyId != undefined) {
                        currkey = data.keyName;
                        currKeyId = data.keyId;
                    }
                    if (result.keyId && result.keyId != '') {
                        currkey = data.keyName;
                    }

                    this.setState({
                        structData: groupBy(result.result, "parent_name").sort(compare("parent_sort")),
                        showStruct: true,
                        showKey: false,
                        showHot: false,
                        key: this.getKeyName(data.keyName),
                        currKeyName: currkey,
                        currKeyId: currKeyId,
                        btnTitle: "搜索"
                    })
                }
            })

    }


    async queryKey(value) {
        try {
            if (value != '') {
                this.setState({
                    key: value,
                    currKeyName: value,
                    btnTitle: "搜索"
                })
                let tokens = await storage.get("userTokens");
                let url = api.base_uri + "v1/app/struct/getLenovoKeyWord?key=" + value;

                await fetch(url, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                        token: tokens.token
                    }
                }).then(resp => resp.json())
                    .then(result => {

                        if (result.result) {
                            this.setState({
                                key: value,
                                currKeyName: value,
                                currKeyId: "",
                                keyData: result.result,
                                showHot: false,
                                showKey: true,
                                showStruct: false,
                                btnTitle: "搜索"
                            })
                        }


                    })


            } else {
                this.setState({
                    showHot: true,
                    showKey: true,
                    showStruct: false,
                    keyData: [],
                    btnTitle: "取消"
                })
            }
        } catch (e) {

        }
    }

    deleteHistory() {
        this.setState({
            historyData: []
        })
        deleteHistories()
    }


    getLeihanStyle(struct) {
        if (struct.search_key_name != '' && struct.search_key_name != struct.struct_name && struct.search_key_name.indexOf("#") == -1) {
            return (
                <Text style={{fontSize: size(20), color: "#7c7c7c"}}>
                    内有
                    <Text style={{fontSize: size(20), color: "#ff4227"}}>
                        {struct.search_key_name}
                    </Text>
                </Text>

            )

        } else {
            return "";
        }
    }


    getKeyName(keyName) {
        if (keyName != '' && keyName != undefined) {
            return keyName.replace('#', '');
        } else {
            return "";
        }
    }

    onRefresh() {
        DeviceEventEmitter.emit("queryStructRefresh");
        this.refreshDetail();
        this.refs.toast.show("刷新成功");
    }

    async refreshDetail() {
        let that = this;
            let linceList = await getLinceList();
            that.setState({
                linceList: linceList
            });
    }
    render() {
        let head = <View style={{
            height: size(138),
            paddingTop: size(70),
            flexDirection: "row",
            backgroundColor: "#0094e5",
            width: '100%',
        }}>

            <TouchableOpacity onPress={() => {
                this.props.navigation.goBack()
            }} style={{flex: 1, alignItems: "center", justifyContent: 'center', height: size(60),}}>
                <Image source={require('../../img/search/backjt.png')}
                       style={{marginLeft: size(30), width: size(40), height: size(40)}}></Image>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBar}
                              onPress={() => {

                              }}
            >
                <TextInput ref="textInput"
                           onChangeText={(value) => this.queryKey(value)}
                           selectionColor={'#FFF'}
                           enablesReturnKeyAutomatically={true}
                           underlineColorAndroid="transparent"
                           placeholderTextColor={"#cbcbcb"}
                           placeholder="请输入关键字"
                           maxLength={25}
                           autoFocus={true}
                           defaultValue={this.state.key}
                           style={{color: '#ffffff', width: '100%', height: size(80)}}/>

            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                this.clickSS();
            }} style={{flex: 2, alignItems: "center", justifyContent: 'center', height: size(60),}}>

                <Text style={{color: "#FFF"}}>{this.state.btnTitle}</Text>

            </TouchableOpacity>

        </View>

        let hotAndHistory = null;
        if (this.state.showHot) {

            let history = null;
            if (this.state.historyData && this.state.historyData.length > 0) {
                history = <View>
                    {/*历史*/}
                    <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                        <View style={{flex: 7, marginTop: size(30)}}>
                            <Text style={{color: "#000", fontSize: size(24)}}>搜索历史</Text>
                        </View>
                        <View style={{flex: 1, marginTop: size(30)}}>
                            <TouchableOpacity onPress={() => {
                                Alert.alert('是否刪除所有历史纪录?', '', [
                                    {text: '取消'},
                                    {
                                        text: '删除',
                                        onPress: async () => {
                                            this.deleteHistory()
                                        }
                                    }
                                ])
                            }}>
                                <Image source={require("../../img/search/delete.png")}
                                       style={{width: size(30), height: size(30),}}></Image>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", flexWrap: 'wrap'}}>
                        {this.state.historyData.map((data, index) => {

                            return (
                                <TouchableOpacity style={styles.hotKey}
                                                  onPress={() => {
                                                      this.queryStruct(data, "key");
                                                  }}>
                                    <Text style={{
                                        color: "#696969",
                                        fontSize: size(24),
                                        paddingLeft: size(20),
                                        paddingRight: size(20)
                                    }}>{this.getKeyName(data.keyName)}</Text>
                                </TouchableOpacity>
                            )

                        })}

                    </View>
                </View>

            }
            let hotView = null
            if (this.state.hotData && this.state.hotData.length > 0) {
                hotView = <View>
                    <View style={{marginTop: size(30)}}>
                        <Text style={{color: "#000", fontSize: size(24)}}>热门搜索</Text>
                    </View>
                    <View style={{flexDirection: "row", flexWrap: 'wrap'}}>
                        {this.state.hotData.map((data, index) => {

                            return (
                                <TouchableOpacity style={styles.hotKey}
                                                  onPress={() => {
                                                      this.queryStruct(data, "key");
                                                  }}

                                >
                                    <Text style={{
                                        color: "#696969",
                                        fontSize: size(24),
                                        paddingLeft: size(20),
                                        paddingRight: size(20)
                                    }}>{this.getKeyName(data.keyName)}</Text>
                                </TouchableOpacity>
                            )

                        })}

                    </View>
                </View>
            }
            hotAndHistory = <ScrollView
                keyboardShouldPersistTaps={true}
                contentContainerStyle={{
                    marginLeft: size(30),
                }}>


                <View>
                    {history}
                    {/*热门*/}
                    {hotView}
                </View>
            </ScrollView>

        }

        let keyList = null;
        if (this.state.showKey) {

            keyList = <ScrollView
                keyboardShouldPersistTaps={true}

                contentContainerStyle={{
                    marginLeft: size(30)
                }}>
                <View>
                    <View>
                        {this.state.keyData.map((data, index) => {


                            return (
                                <TouchableOpacity style={styles.keys}
                                                  onPress={() => {
                                                      this.queryStruct(data, "key");
                                                  }}>
                                    <Text style={{
                                        color: "#414141",
                                        fontSize: size(24)
                                    }}>{this.getKeyName(data.keyName)}</Text>
                                </TouchableOpacity>
                            )

                        })}


                    </View>
                </View>


            </ScrollView>
        }
        let structList = null;
        if (this.state.showStruct) {

            if (this.state.structData.length == 0) {

                structList = <View>
                    <Text style={{textAlign: "center", color: "#575757", marginTop: size(30)}}>没有找到相关结果,
                        换个关键字试试哟~</Text>
                </View>
            } else {
                structList = <ScrollView
                    keyboardShouldPersistTaps={true}
                    keyboardDismissMode={'interactive'}
                    refreshControl={
                        //设置下拉刷新组件
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.onRefresh.bind(this)} //(()=>this.onRefresh)或者通过bind来绑定this引用来调用方法
                            tintColor="red"
                            title={this.state.isRefreshing ? "刷新中...." : "下拉刷新"}
                        />
                    }>
                    <View>
                        {/*for*/}
                        <View style={{}}>
                            {/*for*/}
                            {this.state.structData.map((data, index) => {
                                let childs = data.value;

                                return (
                                    <View>

                                        <View style={{
                                            width: "100%",
                                            backgroundColor: "#f4F4F4",
                                            height: size(50),
                                            marginTop: size(30),
                                            justifyContent: "center"
                                        }}>
                                            <Text style={{
                                                color: "#444444",
                                                fontSize: size(24),
                                                marginLeft: size(30)
                                            }}>{data.key}</Text>
                                        </View>

                                        <View>

                                            <View style={{}}>
                                                {/*for*/}

                                                {childs.map((struct, ind) => {

                                                    let lince = checkIsUse(struct, this.state.linceList);
                                                    struct['lince'] = lince
                                                    let lh = this.getLeihanStyle(struct);


                                                    return (

                                                        <View style={{width: '98%'}}>
                                                            <TouchableOpacity style={{
                                                                width: '99%',
                                                                flex: 1,
                                                                borderBottomWidth: size(1),
                                                                borderBottomColor: '#f1f1f1',
                                                                flexDirection: 'row',
                                                                justifyContent: "center",
                                                                marginBottom: size(10)


                                                            }} onPress={() => {
                                                                useStart(struct, struct.search_key_name, this)
                                                            }}>
                                                                <View style={{
                                                                    flex: 1,
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Image
                                                                        source={{uri: struct.first_icon_url}}
                                                                        style={styles.icon}
                                                                    />
                                                                </View>
                                                                <View style={{flex: 5, flexDirection: 'column'}}>
                                                                    <View style={{flex: 1}}>

                                                                        <Text
                                                                            style={{
                                                                                color: "#423f3f",
                                                                                fontWeight: "bold",
                                                                                fontSize: size(27),
                                                                                marginTop: size(8),
                                                                                flexWrap: "wrap"
                                                                            }}>
                                                                            {struct.struct_name}

                                                                            <Text style={{
                                                                                color: "#EE4000",
                                                                                fontWeight: "bold",
                                                                                fontSize: size(27),
                                                                                lineHeight: size(50),
                                                                                marginTop: size(8), marginLeft: size(10)
                                                                            }}>
                                                                                &nbsp;&nbsp;{lh}
                                                                            </Text>

                                                                        </Text>
                                                                    </View>

                                                                    <View style={{flex: 2, flexWrap: 'wrap',}}>
                                                                        <Text
                                                                            style={{
                                                                                color: "423f3f",
                                                                                fontSize: size(25),
                                                                                marginTop: size(8)
                                                                            }}>
                                                                            {struct.description}
                                                                        </Text>
                                                                    </View>
                                                                    <View style={{
                                                                        flex: 1,
                                                                        justifyContent: "center",
                                                                        flexDirection: "row"
                                                                    }}>

                                                                        <View style={{flex: 2.5}}>
                                                                            <Text
                                                                                style={{
                                                                                    textAlign: "left",
                                                                                    fontSize: size(20),
                                                                                    color: "#868686",
                                                                                    marginBottom: size(10)
                                                                                }}>
                                                                                {struct.lable_syrq == '' ? '' : "适用人群:" + struct.label_syrq}
                                                                            </Text>
                                                                        </View>

                                                                        <View style={{flex: 1}}>
                                                                            <Text
                                                                                style={{
                                                                                    textAlign: "right",
                                                                                    fontSize: size(22),
                                                                                    color: "#7c7c7c",
                                                                                    marginBottom: size(10)
                                                                                }}>
                                                                                {struct.lince}
                                                                            </Text>
                                                                        </View>

                                                                    </View>


                                                                </View>


                                                            </TouchableOpacity>

                                                        </View>

                                                    )
                                                })}

                                            </View>

                                        </View>


                                    </View>
                                )

                            })}


                        </View>
                    </View>

                </ScrollView>
            }


        }


        return (
            <View style={styles.parent}>

                <ETTLightStatus color={'#0094e5'}/>
                {/*头部*/}
                {head}
                {/*热门和历史*/}
                {hotAndHistory}
                {/*展示自动补全*/}
                {keyList}
                {/*展示产品*/}
                {structList}
                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />
                <Toast style={{backgroundColor: '#343434'}} ref="toast" opacity={1} position='top'
                       positionValue={size(100)} fadeInDuration={750} textStyle={{color: '#FFF'}}
                       fadeOutDuration={1000}/>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1,
        backgroundColor: "#FFF"
    },

    searchBar: {
        flex: 7,
        height: size(60),
        borderRadius: size(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18a2eb',
        marginLeft: size(10)
    },
    searchIcon: {
        width: size(50),
        height: size(50),
    },

    hotKey: {
        height: size(60), justifyContent: "center",
        backgroundColor: "#f9f9f9", marginRight: size(20), marginTop: size(10),
        borderRadius: size(30), paddingLeft: size(5), paddingRight: size(5)
    },
    keys: {
        height: size(80),
        justifyContent: "center",
        marginRight: size(20),
        paddingLeft: size(5),
        paddingRight: size(5),
        borderBottomWidth: size(1),
        borderBottomColor: "#f4f4f4"
    },

    structIem: {
        width: size(230),
        height: size(300),
        borderWidth: size(1),
        borderColor: "#dedede",
        backgroundColor: "#FFF",
        marginTop: size(20),
        alignSelf: "center",
        borderRadius: size(1)
    }, icon: {
        width: size(150),
        height: size(100),
        marginTop: size(5),
        resizeMode: "contain",
        alignSelf: "center",
    }
});
