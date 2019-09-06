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
import DeviceInfo from "react-native-device-info";
import {getDate} from "../Unity/LCE"
type
Props = {};
export default class ReplyScreen extends Component<Props> {
    /*11*/
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            content: "",
            relyList: [],
            refreshstate: RefreshState.Idle,
            _timer: false,
        };
    }

    async componentDidMount() {
        this.getMessageOfReply();
    }


    async getMessageOfReply() {
        this.setState({
            refreshstate: RefreshState.HeaderRefreshing
        });
        let tokens = await storage.get("userTokens");
        let url =
            NetInterface.gk_getMessageOfApp+ "?version=" + DeviceInfo.getVersion()+'&business=orthope';
        let response = HttpTool.GET_JP(url)
            .then(result => {
                if (result.code == 0 && result.msg == 'success') {
                    this.setState({
                        relyList: result.reply ,
                        refreshstate: RefreshState.Idle,
                    })
                }
            })
            .catch(error => {
                this.setState({
                    refreshstate: RefreshState.Failure
                });
            });
    }

    replyPage = ({item}) => {
        let replyContent = null
        if (item.reply_content != null) {
            replyContent = "系统回复 "
        }
        return (
            <TouchableOpacity onPress={() => {
            }}>
                <View style={styles.messageTotalView}>{/**单条消息整个可循环的View层 */}
                    <View style={styles.titleViewSty}>
                        <Image
                            source={require("../../img/my/icon_userreview_defaultavatar.png")}
                            style={styles.imgSty}
                        />
                        <View
                            style={{
                                marginLeft: size(15),
                                marginTop: size(8),
                                width: screen.width * 0.69,
                                //height: screen.width / 9.5,
                                justifyContent: "center"
                            }}
                        >
                            <Text style={{
                                fontWeight: "bold",
                                color: "#434549",
                                fontSize: size(30)
                            }}>
                                {item.content}
                            </Text>
                            <Text style={{
                                marginTop: size(5),
                                color: "gray",
                                fontSize: size(20)
                            }}>
                                {getDate(item.add_time)}
                            </Text>
                        </View>
                    </View>
                    <View style={{
                        width: screen.width * 0.69,
                        marginTop: size(15),
                        marginBottom: size(15)
                    }}>

                        <Text style={styles.messageTxtSty}>
                            <Text style={{color: "#FF7F24"}}>{replyContent}</Text>{item.reply_content}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        if (this.state.relyList.length == 0) {

            let whetherloadingornodata = (
                <View style={{height:screen.height*0.7,width: screen.width, justifyContent:'center',alignItems: "center"}}>
                    <Text>暂无回复任何消息哟</Text>
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
                            data={this.state.relyList}
                            renderItem={this.replyPage}
                            refreshState={this.state.refreshstate}
                            onRefresh={this.getMessageOfReply}
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
        // backgroundColor:'yellow'
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
    },
});


