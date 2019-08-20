import React from "react";
import {Button, DeviceEventEmitter, Image, TouchableOpacity, Text, View, StyleSheet} from "react-native";
import UnityView from "react-native-unity-view"

import Toast from "react-native-easy-toast"
import RenTiBottomTab from "./RenTiBottomTab";
import {isIPhoneXPaddTop, size} from "../../common/Tool/ScreenUtil";

let unity = UnityView
import {groupBy, hexToStr, getAmList, compare} from "./common"
import Loading from "../../common/Loading";
import Video from "react-native-af-video-player";

let initModel = {
    smName: "",
    chName: "请点击模型",
    note: "",
    enName: "Click on the model"

}
export default class RenTi extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            animationListWin: true,
            amDescWin: false,
            unityWidth: '100%',
            unityHeight: '100%',
            currModel: initModel,
            currAmList: [],
            equipList:this.props.navigation.state.params.equipList,
            searchWin: false,
            currAnimation: {},
            ysTitle:"动作演示",
            videoShow:false,
            from: 2//进来的入扣口[1,直接点击动画进来的,2:点击人体]

        };
    }

    /**
     * ui渲染完后的操作
     /**
     *判断外部是否有传值
     *
     * @memberof RenTi
     */
    componentDidMount() {


        //下载ab包
        this.downloadAb()



    }

    unityReady(){


        let obj   = Object.assign({}, this.props.navigation.state.params.animation);

        obj['ta_type']="";

        this.sendMsgToUnity('animation',obj, 'json');
        this.sendMsgToUnity('animationContinue', "", '');
        this.setState({
            currModel: {
                chName: obj.am_ch_name,
                enName: obj.am_en_name,
            },
            currAnimation: obj,
            amDescWin: true,
            animationListWin: false,
            from: 1
        })

    }


    downloadAb(){

        let downList  = {
            equipList:this.state.equipList
        };
        let amList = [this.props.navigation.state.params.animation];

        downList["amList"] = amList;



        this.sendMsgToUnity('downloadAb', downList, 'json');

    }


    componentWillMount() {

    }

    componentWillUnmount() {
        //暂停一下
        this.sendMsgToUnity('animationPause', "", '');
    }

    /**
     * 打开动作演示
     */
    amDetail(){

        this.setState({
            videoShow:true
        })




    }
    /**
     * 發消息给unity
     * @param name
     * @param info
     * @param type
     */
    sendMsgToUnity(name, info, type) {

        if (this.unity) {
            if (type == 'json') {

                let temp = Object.assign({}, info)
                this.unity.postMessageToUnityManager({
                    name: name,
                    data: JSON.stringify(temp)
                })

            } else {
                this.unity.postMessageToUnityManager({
                    name: name,
                    data: info
                })

            }

        }
    }

    /**
     * 接收unity消息
     */
    async onUnityMessage(event) {
         // alert(JSON.stringify(event))

        if (event.name == "model") {

            //点击模型
            let currModel = {
                chName: hexToStr(event.data.chName),
                note: hexToStr(event.data.description),
                enName: event.data.enName,
                smName: "--"
            }
            this.setState({
                currModel: currModel,
            });
            this.refs.toast.show(hexToStr(event.data.chName));
            //
            // // alert(`event.data.ModelName${event.data.ModelName}`)
            // //去查找动画 沒有分过组的动画列表
            // let amList = getAmList(event.data.ModelName);
            // if (amList.length == 0) {
            //     this.refs.toast.show("该肌肉暂无相关动作");
            // }
            // let tempData = groupBy(amList, "lashen_donzuo").sort(compare("parent_sort"));
            // this.setState({
            //     currAmList: tempData,
            //     difficultyWin: false,
            //     animationListWin: true,
            //     amDescWin: false,
            //     searchWin: false
            // });


        } else if (event.name == "animationBack") {//返回

            this.props.navigation.goBack();

        } else if (event.name == "clickSearch") {//点击搜索

            this.setState({
                searchWin: true
            });

        }else if (event.name == 'DownReady'){
            await this.unityReady();

        }


    }


    render_am_detail() {
        return <View style={{
            position: 'absolute',
            bottom: size(500),
            right: 0,
            width: '20%',
            height: size(60),
            backgroundColor: "#212121",
            borderBottomLeftRadius: size(50),
            borderTopLeftRadius: size(50),
        }}>
            <View style={{
                flexDirection: 'row',
                height: size(60),
            }}>
                <TouchableOpacity
                    onPress={() => {
                        this.amDetail()
                    }}
                    style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={styles.detailBtn}>{this.state.ysTitle}</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }
    render_am_video(){
        return <View style={{
            position: 'absolute',
            top:0,
            right: 0,
            bottom:0,
            height: '100%',
            width: '100%',
            backgroundColor:"#000",
            flex: 1,
            justifyContent: 'center'

        }}>

            <Video
                inlineOnly
                volume={0.8}
                scrollBounce
                url={"http://fileprod.vesal.site/animation/test/yanshi/KF0022.mp4"}

                autoPlay={true}
                onEnd={() => {
                    this.refs.toast.show("播放结束");
                    this.setState({
                        videoShow:false
                    })
                }}

                ref={(ref) => {
                    this.video = ref
                }}
            />
            <View style={styles.btnHead}>
                <TouchableOpacity

                    onPress={() => {
                      this.setState({
                          videoShow:false
                      })
                    }}>
                    <Image
                        source={require('../../img/login/close_video.png')}
                        style={styles.imgSty}>
                    </Image>
                </TouchableOpacity>
            </View>
        </View>;
    }

    render() {

        return (
            <View style={styles.parent}>

                <UnityView
                    ref={ref => (this.unity = ref)}
                    onUnityMessage={this.onUnityMessage.bind(this)}
                    style={{
                        position: "absolute",
                        height: this.state.unityHeight,
                        width: this.state.unityWidth,
                        bottom: 0,
                    }}
                />

                <View style={{
                    backgroundColor: "#525252", width: '100%', height: size(0.0001),
                    position: 'relative',
                    top: 0,
                    left: 0,
                    right: 0
                }}>
                </View>
                {/*动作详情按钮*/}
                {this.render_am_detail()}

                <RenTiBottomTab
                    videoShow={this.state.videoShow}
                    navigation={this.props.navigation}
                    animationListWin={this.state.animationListWin}
                    amDescWin={this.state.amDescWin}
                    difficultyWin={this.state.difficultyWin}
                    searchWin={this.state.searchWin}
                    currModel={this.state.currModel}
                    currAmList={this.state.currAmList}
                    from={this.state.from}
                    currAnimation={this.state.currAnimation}
                    sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)}
                    changeHeight={(width, height) =>
                        this.setState({
                            unityWidth: width,
                            unityHeight: height,
                            animationListWin: false,
                            amDescWin: true
                        })
                    }
                    closeVideo={() =>
                        this.setState({
                            videoShow:false
                        })
                    }
                />
                {/*演示视频播放窗口*/}
                {this.state.videoShow?this.render_am_video():null}

                <Loading
                    ref={r => {
                        this.Loading = r;
                    }}
                    hudHidden={false}
                />

                <Toast
                    ref="toast"
                    opacity={0.5}
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
                />


            </View>
        );
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1,
        backgroundColor: "rgba(52,52,52,1)"
    },
    detailBtn: {
        color: "#FFF",
    }, tag: {
        color: "#FFF", fontWeight: 'bold', fontSize: size(30), marginLeft: size(40), marginRight: size(40)
    },
    btnHead: {
        position: 'absolute',
        zIndex: 999,
        flexDirection: 'row',
        width: '95%',
        height: '10%',
        left: size(50),
        top:    0,
        marginTop: isIPhoneXPaddTop ? 44 : 0,
    },

    imgSty: {
        width: size(50),
        height: size(50)
    },
});
//http://fileprod.vesal.site/animation/test/yanshi/KF0022.mp4