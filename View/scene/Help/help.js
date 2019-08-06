import React, {Component} from 'react';
import api from "../../api";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from 'react-native';
import {size} from "../../common/ScreenUtil";
import {screen, system} from "../../common";
import {storage} from "../../common/storage";
import Loading from "../../common/Loading";
import Toast from "react-native-easy-toast";

import {color, NavigationItem, SpacingView, DetailCell} from "../../widget";
import TitleBar from '../../scene/Home/TitleBar';

type Props = {};
export default class help extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            questionLists: [],
            title: '帮助中心',
            isRefreshing: false,
        };
    }

    async componentDidMount() {
        this.getHelpList();
    }

    onRefresh(){
        this.getHelpList();
        this.refs.toast.show("刷新成功");
    }
    getHelpList = async () => {
        this.Loading.show("查询中...");
        let tokens = await storage.get("userTokens");
        let url = api.base_uri + "v2/app/help/getHelpList?appVersion=3.3.0";
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
                // alert(JSON.stringify(result));
                if (result.code == 0) {
                  this.setState({
                    questionLists: result.helpList
                  })
                }
            })
    };

    showQuestionList() {
        if (this.state.questionLists.length > 0) {
            return (
                this.state.questionLists.map((data, index) => {
                    return (
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('problemDetails',
                                {
                                    obj: {
                                        content: data.content,
                                    }
                                }
                            )}>
                            <View style={styles.problemViewSty}>
                                <Text style={{
                                    color: "#6B6B6B",
                                    paddingBottom: size(10),
                                    fontSize: size(30),
                                    lineHeight: size(50),
                                }}>{index + 1}. {data.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })
            )
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <TitleBar title={this.state.title} navigate={this.props.navigation}/>
                <View style={styles.problemTitleStyle}>
                    <Text style={{
                        color: "#393939",
                        paddingBottom: size(10),
                        fontSize: size(30),
                        fontWeight: 'bold',
                    }}>常见问题列表</Text>

                </View>
                <ScrollView showsVerticalScrollIndicator={false} refreshControl={
                    //设置下拉刷新组件
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.onRefresh.bind(this)}
                        tintColor="red"
                        title={this.state.isRefreshing ? "刷新中...." : "下拉刷新"}
                    />
                }>
                    {this.showQuestionList()}
                </ScrollView>
                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />
                <Toast
                    ref="toast"
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                    opacity={0.8}
                />
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#ffffff',
    },
    problemTitleStyle: {
        marginTop: size(25),
        marginBottom: size(20),
        borderBottomWidth: size(1),
        borderBottomColor: "#f4f4f4",
        width: screen.width * 0.92,
    },
    problemViewSty: {
        width: screen.width * 0.92,
        marginTop: size(10),
        marginBottom: size(10),

    }
});


