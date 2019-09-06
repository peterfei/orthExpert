import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    WebView, ScrollView

} from 'react-native';
import {size} from "../../common/ScreenUtil";
import {screen, system,NetInterface, HttpTool} from "../../common";
import {storage} from "../../common/storage";
import RefreshListView, {RefreshState} from "react-native-refresh-list-view";
import {
    querySystemInformData,
    insertSystemInformData,
    insertTabVersion,
    deleteAllMsg,
    getTabVersionByName
} from "../../realm/RealmManager";
import {set} from '../../../node_modules/mobx';
import DeviceInfo from "react-native-device-info";
import {getDate} from "../Unity/LCE"
type Props = {};
export default class SystemScreen extends Component<Props> {
    /*11*/
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            content: "",
            systemMessage: [],
            refreshstate: RefreshState.Idle,
            querySystemInfroms: [],
            resultsMessageId: [],
            _timer: false,
        };
    }

    //对象转换为数组方法
    changeArr(arr) {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            newArr.push(arr[i])
        }
        return newArr;
    }

    async componentWillMount() {


        await this.getMessageOfSystem()


    }

    async getMsg(result) {
        if (result) {
            let results = this.changeArr(await querySystemInformData());

            this.setState({
                querySystemInfroms: results,
                refreshstate: RefreshState.Idle,
            })
        }
    }


    async saveMsg(result) {
        try {
            if (result.system && result.system.length > 0) {
                await  deleteAllMsg();
                 result.system.map((data, index) => {

                    insertSystemInformData(data)
                })
                let temp = {
                    name: "systemMsg",
                    version: result.version
                }
                await  insertTabVersion(temp);
            }

            this.getMsg(result);

        } catch (e) {
        }
    }

    getMessageOfSystem = async () => {
        try {
            this.setState({
                refreshstate: RefreshState.HeaderRefreshing
            });

            let localVersion = await getTabVersionByName("systemMsg");

            let version = localVersion && localVersion.length > 0 ? localVersion[0].version : -1;

            let tokens = await storage.get("userTokens");
            let url = NetInterface.gk_getMessageOfApp + "?version=" + version;
            HttpTool.GET_JP(url)
                .then(result => {
                  //  alert("请求url:" + url + ",返回结果:" + JSON.stringify(result.system))

                    if (result.system) {
                        this.saveMsg(result)
                    }

                })
        } catch (e) {
        }

    }


    render() {
        if (this.state.querySystemInfroms.length == 0) {

            let whetherloadingornodata = (
                <View style={{height:screen.height*0.7,width: screen.width, justifyContent:'center',alignItems: "center"}}>
                    <Text>暂无任何系统消息哟</Text>
                </View>
            )
            setTimeout(function () {
                this.setState({
                    _timer: true
                })
            }.bind(this), 2500);
            return (
                <View>
                    {this.state._timer ? whetherloadingornodata : (
                        <Image
                            style={styles.loadIcon}
                            source={require("../../img/tabbar/loadbg.gif")}
                        />
                    )}
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <ScrollView>
                        <RefreshListView
                            style={{flex: 1}}
                            data={this.state.querySystemInfroms}
                            renderItem={({item}) => (
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate('MessageDetails', {
                                        obj: {
                                            messageId: item.message_id,
                                            title: item.title
                                        }
                                    })
                                }}>
                                    <View style={styles.messageTotalView}>{/**单条消息整个可循环的View层 */}
                                        <View style={styles.titleViewSty}>

                                            <Image
                                                source={require("../../img/my/icon_userreview_defaultavatar.png")}
                                                style={styles.imgSty}
                                            />
                                            {/* <Image style={{position:'absolute',width:size(50),height:size(50),marginTop:size(-12)}} source={require('../../img/search/newMessage.png')}></Image> */}

                                            <View
                                                style={{
                                                    marginLeft: size(15),
                                                    height: screen.width / 9.5,
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <Text style={{
                                                    fontWeight: "bold",
                                                    color: "#434549",
                                                    fontSize: size(30)
                                                }}>
                                                    {item.title}
                                                </Text>
                                                <Text style={{
                                                    marginTop: size(5),
                                                    color: "gray",
                                                    fontSize: size(20)
                                                }}>
                                                    {getDate(item.release_time)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{
                                            width: screen.width * 0.69,
                                            marginTop: size(15),
                                            marginBottom: size(15)
                                        }}>
                                            <Text style={styles.messageTxtSty}>
                                                {item.summary}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>)}
                            refreshState={this.state.refreshstate}

                            onHeaderRefresh={this.getMessageOfSystem}
                        />
                    </ScrollView>
                </View>
            );
        }
    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f0f2f6",
        flex: 1
    },
    messageTotalView: {
        backgroundColor: '#fff',
        marginTop: size(8),
        width: screen.width,
        alignItems: "center"
    },
    titleViewSty: {
        flexDirection: "row",
        width: screen.width * 0.93,
        paddingTop:size(20)
        //backgroundColor:'yellow'
    },
    imgSty: {
        width: screen.width / 9.5,
        height: screen.width / 9.5,
    },
    messageTxtSty: {
        color: "#434549",
        fontSize: size(27),
        marginBottom: size(10)
    },
    loadIcon: {
        width: screen.width * 0.5,
        height: screen.width * 0.5,
        resizeMode: "stretch",
        marginTop: size(100),
        marginBottom: 5,
        alignSelf: "center"
    }
});


