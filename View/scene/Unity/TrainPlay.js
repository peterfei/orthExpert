import React from "react";
import {
    Alert,
    BackAndroid,
    BackHandler,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {isIPhoneXPaddTop, size} from "../../common/Tool/ScreenUtil";
import UnityView from "react-native-unity-view"
import {groupBy, s_to_hs,hexToStr} from "./common";
import Sound from 'react-native-sound'
import Loading from "../../common/Loading";
import Video, {Container} from 'react-native-af-video-player'
import SharePlan from "../Exercise/ExerciseDetail/SharePlan";
import MyTouchableOpacity from "../../common/components/MyTouchableOpacity";


let that = null;
let whoosh = null;
let background = null;
let amIndex = 0;//当前播放到第几个了
import Toast from "react-native-easy-toast"
import api from "../../api";
import {storage} from "../../common/storage";

const theme = {
    title: '#FFF',
    more: '#FFF',
    center: '#418dfd',
    fullscreen: '#FFF',
    volume: '#FFF',
    scrubberThumb: '#FFF',
    scrubberBar: '#FFF',
    seconds: '#FFF',
    duration: '#FFF',
    progress: '#418dfd',
    loading: '#418dfd'
}
let jjAudioList = [];
export default class TrainPlay extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            playing: true,//当前动画播放状态
            totalTime: 0,//训练计时
            countDown: 3,//开始时的倒计时
            currModel:{},
            // 3 2  1
            startWin: false,//初始开始接口
            restWin: false,//休息窗口状态
            restSecond: '',
            backWin: false,//返回蒙版
            endWin: false,//训练结束窗口
            amDetailWin: false,//动作介绍窗口
            amList: [],//动画列表
            playAmList: [],//播放动画列表
            unityReady: false,
            planNo: props.navigation.state.params.plan.plan_no,
            planName: props.navigation.state.params.plan.plan_name,
            planId: props.navigation.state.params.plan.plan_id,
            downList: props.navigation.state.params.downList,
            currAm: {}
            , showShare: false,
            videoShow:false
        };
        this.playTimer = null;

        that = this;
        // alert(JSON.stringify(props.navigation.state.params.downList))
    }

    async componentWillMount() {
        Sound.setCategory('Playback');
        if (Platform.OS === 'android') {
            BackHandler.addEventListener("hardwareBackPress", this.goBack);
        }
    }

    componentWillUnmount() {

        this.release();

    }

    release() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener("hardwareBackPress", this.goBack);
        }
        background && background.release();
        background && background.stop();
        whoosh && whoosh.release();
        whoosh && whoosh.stop();
    }

    closeShare() {
        this.setState({
            showShare: false
        })
    }

    /**
     * ui渲染完后的操作
     */
    async componentDidMount() {
        //下载ab包
        this.downloadAb()


    }

    async unityReady() {

        //开始计时
        this.timeCount(true)
        let arr = this.loadAudio()
        await this.setState({
            amList: arr,
            planAmList: this.state.downList
        })
        amIndex = 0;
        let obj = this.state.amList[amIndex];


        this.setState({
            currAm: obj,
            unityReady: true
        })


        this.sendMsgToUnity('animation', obj, 'json');//开始播放动作
    }

    downloadAb() {

        let downList = this.state.downList;
        let amList = this.repeat(this.state.downList.amList);
        downList["amList"] = amList;
        this.sendMsgToUnity('downloadAb', downList, 'json');

    }

    repeat(amList) {
        let result = [];
        let obj = {};
        for (let i = 0; i < amList.length; i++) {
            if (!obj[amList[i].am_no]) {
                result.push(amList[i]);
                obj[amList[i].am_no] = true;
            }
        }
        return result;

    }

    error() {
        Alert.alert(
            "加载音频失败! 请检查网络设置",
            "是否重新加载?",
            [
                {
                    text: "取消",
                    onPress: () => function () {
                        this.setState({
                            playing: false
                        })
                        this.play()
                    }
                },
                {
                    text: "确定",
                    onPress: () => function () {
                        this.setState({
                            playing: false
                        })
                        this.play()
                    }
                }
            ],
            {cancelable: true}
        )
    }

    async initData(obj) {
        //调整好呼吸 训练即将开始
        whoosh = new Sound(require('../../sounds/tts_tzhhxxljjks.mp3'), (error) => {
            if (error) {
                this.error()

            } else {
                whoosh.stop(() => {

                    whoosh.play((success) => {
                        if (success) {
                            //第一个动作
                            this.setState({
                                startWin: false
                            })
                            whoosh && whoosh.release();
                            whoosh = new Sound(require('../../sounds/tts_one_am.mp3'), (error) => {
                                if (!error) {
                                    this.bofang(obj);
                                }
                            })

                        } else {
                            this.error()
                        }
                    });
                });

            }
        });
    }

    checkIsPlay(jj_audio) {

        if (jj_audio && jjAudioList.indexOf(jj_audio) != -1) {
            return true
        } else {
            return false;
        }
    }

    bofang = (obj) => {
        if (!obj) return;
        whoosh.stop(() => {
            whoosh.play((success => {
                if (success) {
                    whoosh.release();

                    whoosh = new Sound(obj.bofang, null, (error) => {
                        if (!error) {
                            whoosh.play((success) => {
                                if (success) {
                                    whoosh.release();
                                    let checkIsPlay = this.checkIsPlay(obj.jj_audio);
                                    if (obj.jj_audio != '' && !checkIsPlay) {


                                        whoosh = new Sound(obj.jj_audio, null, (error) => {
                                            whoosh.play((success) => {
                                                if (success) {

                                                    jjAudioList.push(obj.jj_audio);
                                                    whoosh.release();

                                                    whoosh = new Sound(obj.groupAudio, null, (error) => {
                                                        whoosh.play((success) => {
                                                            if (success) {
                                                                this.startPlay()
                                                            } else {
                                                                this.error()
                                                            }
                                                        })
                                                    })


                                                } else {
                                                    this.error()
                                                }
                                            })
                                        })
                                    } else {

                                        this.startPlay()
                                    }


                                }
                            });
                        } else {
                            this.error()
                        }
                    })
                }
            }))
        });

    }

    /**
     * 播放下一个动作
     * @param obj
     */
    next(obj) {

        let playing = this.state.playing;
        if (!playing) {
            this.setState({
                playing: true
            })
        }

        if (obj) {
            //下一个动作先暂停
            this.sendMsgToUnity('animation', obj, 'json');
            this.sendMsgToUnity('animationPause', "", '');

            whoosh.release();
            whoosh = new Sound(require('../../sounds/tts_next_am.mp3'), (error) => {
                if (!error) {
                    this.bofang(obj)
                }
            });


        }


    }


    last(obj) {
        let playing = this.state.playing;
        if (!playing) {
            this.setState({
                playing: true
            })
        }

        if (obj) {
            //下一个动作先暂停
            this.sendMsgToUnity('animation', obj, 'json');
            this.sendMsgToUnity('animationPause', "", '');

            whoosh && whoosh.release();
            whoosh = new Sound(require('../../sounds/last_am.mp3'), (error) => {
                if (!error) {
                    this.bofang(obj)
                }
            });


        }
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
                temp.bofang = "";
                temp.groupAudio = "";
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
     * 计算休息时间
     */
    rest(obj) {
        let _this = this;
        let rest = parseInt(obj.rest);
        if (rest != 0) {
            that.setState({
                restWin: true,
                amDetailWin: false,
                restSecond: rest
            })
            whoosh && whoosh.release();
            whoosh = new Sound(require('../../sounds/rest.mp3'), (error) => {
                if (!error) {
                    whoosh.play((success) => {
                        /* if (success && obj.am_no == 'HA1800037') {
                             whoosh.release();
                             whoosh = new Sound(require('../../sounds/ywzt_Desc.mp3'), (error) => {
                                 if (!error) {
                                     whoosh.play();
                                 }
                             })
                         }*/
                    });
                }
            });

            this.restTimer && clearInterval(this.restTimer);
            this.restTimer = setInterval(function () {
                let restSecond = _this.state.restSecond;

                restSecond--;
                restSecond == restSecond <= 0 ? 0 : restSecond;
                _this.setState({
                    restSecond: restSecond,
                })
                if (restSecond == 0) {

                    whoosh && whoosh.release();
                    whoosh = new Sound(require('../../sounds/restend.mp3'), (error) => {
                        if (!error) {
                            whoosh.play(success => {
                                if (success) {
                                    _this.setState({
                                        restWin: false
                                    })
                                    _this.next(obj);
                                    clearInterval(this.restTimer);
                                }

                            });
                        }
                    });


                }
            }, 1000);
        } else {
            _this.next(obj);
        }


    }

    showDetail() {
        whoosh.stop();
        this.setState({
            videoShow:true
        })

        this.sendMsgToUnity('animationPause', "", '');
        // this.setState({
        //     amDetailWin: true
        // })

    }

    /**
     * 不休息继续
     */
    keepon() {
        this.setState({
            restWin: false
        })
        this.getLastObj();
        let obj = this.getNextObj();
        this.next(obj);
        clearInterval(this.restTimer);
    }

    /**
     * 取消返回的继续
     */
    backKeep() {
        this.setState({
            backWin: false,
            playing: true
        })
        //告诉unity可以开始了
        this.sendMsgToUnity('animationContinue', "", '');
    }

    /**
     * 接收unity消息
     */
    async onUnityMessage(event) {

        //alert(JSON.stringify(event))

        if (event.name == 'playOver') {

            setTimeout(
                function () {
                    let obj = this.getNextObj();
                    obj ? this.rest(obj) : null;
                }.bind(this),
                1000
            );


        } else if (event.name == 'animationReady') {
            if (amIndex == 0) {
                this.Loading.close();
                await this.initData(this.getNextObj());
            }

        } else if (event.name == 'DownReady') {
            await this.unityReady();
            //测试
            await this.initData(this.getNextObj());
        } else if (event.name == 'model') {
            //点击模型
            let currModel = {
                chName: hexToStr(event.data.chName),
                note: hexToStr(event.data.description),
                enName: event.data.enName
            }
            this.setState({
                currModel: currModel
            });

            this.refs.toast.show(hexToStr(event.data.chName));

        }
    }

    /**
     * 点击播放按钮
     */
    play() {

        let that = this;
        let state = this.state.playing ? false : true;
        this.setState({playing: state, backWin: false})
        if (state) {

            whoosh && whoosh.release();

            whoosh = new Sound(require('../../sounds/tts_jixu.mp3'), (error) => {
                if (!error) {
                    whoosh.play((success) => {
                        if (success) {
                            that.startPlay();
                        } else {
                            alert('播放错误!');
                        }
                    })
                }
            })


        } else {
            this.showBack();
            this.playTimer && clearInterval(this.playTimer);
            whoosh && whoosh.release();
            whoosh = new Sound(require('../../sounds/tts_stop.mp3'), (error) => {
                if (!error) {
                    whoosh.stop(() => {
                        whoosh.play();
                        this.sendMsgToUnity('animationPause', "", '');
                    });

                }
            })

        }

    }

    componentWillUnmount() {
        clearInterval(this.playTimer);

        whoosh && whoosh.release();
        //暂停一下
        this.sendMsgToUnity('animationPause', "", '');
    }

    startPlay = () => {

        this.setState({
            startWin: false

        })
        //启动或关闭计时器
        this.timeCount(true)
        //告诉unity可以开始了
        this.sendMsgToUnity('animationContinue', "", '');
    }

    timeCount(state) {

        let that = this;
        if (state) {
            clearInterval(this.playTimer);
            this.playTimer = setInterval(function () {

                let totalTime = that.state.totalTime;
                totalTime++;
                that.setState({
                    totalTime: totalTime
                })
            }, 1000);
        } else {
            clearInterval(this.playTimer);
        }
    }

    render() {

        return (
            <View style={styles.parent}>
                <UnityView
                    ref={ref => (this.unity = ref)}
                    onUnityMessage={this.onUnityMessage.bind(this)}
                    style={{
                        position: "absolute",
                        height: '100%',
                        width: '100%',
                        top: size(0.01),
                        bottom: 0,
                    }}
                />
                <View style={{
                    position: 'absolute',
                    top: size(120),
                    left: 0,
                    right: 0,
                    width: '50%',
                    height: size(200),

                }}>
                    <View style={{
                        flexDirection: 'row',
                        width: size(260),
                        justifyContent: "center",
                    }}>
                        <View style={{flex: 1, alignItems: "flex-end", justifyContent: "center",}}>
                            <Image style={{width: size(50), height: size(50)}}
                                   source={require('../.././img/unity/time.png')}/>
                        </View>

                        <Text style={{
                            flex: 2.3,
                            fontWeight: 'bold',
                            fontSize: size(50),
                            marginLeft: size(30),
                            alignItems: "flex-start",
                            color: "#FFF"
                        }}>{s_to_hs(this.state.totalTime)}</Text>
                    </View>

                </View>

                {/*动作详情按钮*/}
                {this.state.unityReady ? this.render_am_detail() : null}
                {/*返回 播放 介绍那一排按钮*/}
                {this.state.unityReady ? this.render_desc() : null}

                {/*动作详情窗口*/}
                {this.state.amDetailWin ? this.render_detail_win() : null}
                {/*准备开始蒙版*/}
                {this.state.startWin ? this.render_start() : null}

                {/*休息蒙版*/}
                {this.state.restWin ? this.render_rest() : null}

                {/*返回确认框*/}
                {this.state.backWin ? this.render_back() : null}

                {/*训练完成框this.state.endWin*/}
                {this.state.endWin ? this.render_end_win() : null}

                {/*分享弹框*/}
                <SharePlan planId={this.state.planId} planName={this.state.planName}
                           closeShare={() => this.closeShare()} showShare={this.state.showShare}
                           navigation={this.props.navigation}/>

                {/*演示视频播放窗口*/}
                {this.state.videoShow?this.render_am_video():null}
                <Toast
                    ref="toast"
                    opacity={0.5}
                    position="top"
                    positionValue={200}
                    fadeInDuration={750}
                    fadeOutDuration={1000}
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


    getNextObj = () => {

        if (amIndex < this.state.amList.length) {
            let obj = this.state.amList[amIndex];
            amIndex++;
            this.setState({
                currAm: obj
            })
            return obj;
        } else {
            //今天目标完成

            whoosh && whoosh.release();
            whoosh = new Sound(require('../../sounds/tts_todayok.mp3'), (error) => {
                if (!error) {
                    whoosh.play();
                }
            })
            this.setState({
                playing: false,
                endWin: true,
                amDetailWin: false
            })
            this.sendMsgToUnity('animationPause', "", '');
            //更新进度
            this.updateJindu();
            return false;
        }

    }
    getLastObj = () => {
        amIndex = amIndex - 2;
        let obj = this.state.amList[amIndex];
        amIndex++;
        this.setState({
            currAm: obj
        })
        return obj;

    }

    loadAudio() {
        // let arr = this.state.params.list;
        let arr = this.state.downList.amList;

        if (arr[0].am_no == null) {
            alert("该计划暂无动画文件, 请更换其他计划");
            this.props.navigation.goBack();
        }
        for (let i = 0; i < arr.length; i++) {

            let item = arr[i];

            //卡点位置
            let remind_index = item['scene_name'];
            item['remind_index'] = remind_index;
            //动画语音名称
            item['bofang'] = "http://res.vesal.site/audio/amChName/v1/" + item.am_no + ".mp3";


            item['am_process'] = (i + 1) + " / " + arr.length;
            if (item.ta_type == '次') {
                item['groupAudio'] = "http://res.vesal.site/audio/count/count" + item.repetitions + ".mp3";
            } else if (item.ta_type == '秒') {
                item['groupAudio'] = "http://res.vesal.site/audio/time/time" + item.ta_time + ".mp3";
            } else if (item.ta_type == '次秒') {
                item['groupAudio'] = "http://res.vesal.site/audio/count/count" + item.repetitions + ".mp3";
            }
            if (item.camera_params == '0,0,0,0,0,0') {
                item['camera_params'] = "{\"camera_pos\":{\"x\":-13.4857979,\"y\":4.58553553,\"z\":17.63562},\"camera_parent_rot\":{\"x\":349.399628,\"y\":322.500031,\"z\":0.0},\"camera_parent_pos\":{\"x\":0.0,\"y\":0.9,\"z\":0.0}}";
            }

        }
        this.Loading.close();

        return arr;
    }

    render_start() {
        return <View style={{
            position: 'absolute',
            bottom: size(500),
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRadius: size(50)
        }}>

            <TouchableOpacity
                onPress={() => {
                    this.setState({
                        startWin: false
                    })
                }}
                style={{width: size(500), height: size(50), alignItems: "center",}}>
                <Text style={{color: "#FFF", fontSize: size(35),}}></Text>
                <Text style={{color: "#FFF", fontSize: size(40), marginTop: size(10)}}> 训练即将开始</Text>
            </TouchableOpacity>
        </View>
    }

    render_rest() {
        return <View style={{
            position: 'absolute',
            bottom: size(500),
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRadius: size(50)
        }}>
            <View
                style={{
                    width: '80%',
                    background: "rgba(0,0,0,0.9)",
                    alignItems: "center"
                }}>
                <Text style={{
                    color: "#FFF",
                    textAlign: "center",
                    lineHeight: size(80),
                    width: '80%',
                    borderBottomColor: "#9c9c9c",
                    borderBottomWidth: size(1),
                    fontSize: size(30),
                    fontWeight: 'bold'
                }}>提示</Text>
                <Text style={{color: "#FFF", fontSize: size(28), marginTop: size(20)}}>休息一下吧 ,
                    ,剩余倒计时 {this.state.restSecond == -1 ? 0 : this.state.restSecond} 秒</Text>

                <TouchableOpacity style={{
                    marginTop: size(50),
                    alignItems: "center",
                    width: size(350),
                    height: size(80),
                    borderRadius: size(20),
                    backgroundColor: "#5EB4F1"
                }}
                                  onPress={() => {
                                      this.keepon()

                                  }}
                >
                    <Text style={{
                        fontSize: size(30),
                        color: "#fff",
                        lineHeight: size(80)
                    }}>继&nbsp;续&nbsp;训&nbsp;练</Text>
                </TouchableOpacity>
            </View>
        </View>;
    }

    render_back() {
        return <View style={{
            position: 'absolute',
            bottom: size(500),
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRadius: size(50)
        }}>
            <View
                style={{
                    width: '80%',
                    background: "rgba(0,0,0,0.9)",
                    alignItems: "center"
                }}>
                <Text style={{
                    color: "#FFF",
                    textAlign: "center",
                    lineHeight: size(80),
                    width: '80%',
                    borderBottomColor: "#9c9c9c",
                    borderBottomWidth: size(1),
                    fontSize: size(30),
                    fontWeight: 'bold'
                }}>提示</Text>
                <Text style={{
                    color: "#FFF",
                    fontSize: size(30),
                    marginTop: size(20)
                }}>{this.state.totalTime == 0 ? "你还没开始训练呢" : `你已经训练了${s_to_hs(this.state.totalTime).replace(":", "分")}秒了`},是否结束训练?</Text>
                <View style={{flexDirection: 'row'}}>
                    <MyTouchableOpacity style={{
                        flex: 1,
                        marginTop: size(50),
                        alignItems: "center",
                        width: size(200),
                        height: size(70),
                        borderRadius: size(50),
                        backgroundColor: "#b6b6b6"
                    }}
                                        onPress={() => {
                                            this.release();
                                            this.props.navigation.goBack();
                                        }}
                    >
                        <Text style={{
                            fontSize: size(30),
                            color: "#343434",
                            lineHeight: size(70)
                        }}>结束训练</Text>
                    </MyTouchableOpacity>

                    <View style={{flex: 1}}></View>

                    <TouchableOpacity style={{
                        flex: 1,
                        marginTop: size(50),
                        alignItems: "center",
                        width: size(200),
                        height: size(70),
                        borderRadius: size(50),
                        backgroundColor: "#dedede",
                    }}
                                      onPress={() => {
                                          this.play()
                                      }}
                    >
                        <Text style={{
                            fontSize: size(30),
                            color: "#343434",
                            lineHeight: size(70)
                        }}>继续训练</Text>
                    </TouchableOpacity>

                </View>
            </View>


        </View>;
    }

    render_end_win() {
        return <View style={{
            position: 'absolute',
            bottom: size(500),
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRadius: size(50)
        }}>
            <View
                style={{
                    width: '80%',
                    background: "rgba(0,0,0,0.9)",
                    alignItems: "center"
                }}>

                <Text style={{
                    color: "#FFF",
                    textAlign: "center",
                    lineHeight: size(80),
                    width: '80%',
                    borderBottomColor: "#9c9c9c",
                    borderBottomWidth: size(1),
                    fontSize: size(30),
                    fontWeight: 'bold'
                }}>提示</Text>

                <Text style={{
                    color: "#FFF",

                    fontSize: size(35),
                    marginTop: size(20)
                }}>恭喜你完成训练!</Text>
                <Image
                    source={require('../.././img/unity/jiangzhang.png')}
                    style={{width: size(150), height: size(150), marginTop: size(20)}}/>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1, alignItems: "center"}}>
                        <TouchableOpacity style={{
                            marginTop: size(50),
                            alignItems: "center",
                            width: size(200),
                            height: size(70),
                            borderRadius: size(20),
                            backgroundColor: "#fff",
                        }}
                                          onPress={() => {
                                              this.planFinish()
                                          }}
                        >
                            <Text style={{
                                fontSize: size(30),
                                color: "#525252",
                                lineHeight: size(70)
                            }}>返回列表</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 1, alignItems: "center"}}>
                        <TouchableOpacity style={{
                            marginTop: size(50),
                            alignItems: "center",
                            width: size(200),
                            height: size(70),
                            borderRadius: size(20),
                            backgroundColor: "#5EB4F1",
                        }}
                                          onPress={() => {
                                              this.setState({
                                                  showShare: true
                                              })

                                          }}
                        >
                            <Text style={{
                                fontSize: size(30),
                                color: "#ffffff",
                                lineHeight: size(70)
                            }}>分享</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>


        </View>;
    }

    render_desc() {
        return <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: size(150),
            backgroundColor: "#000"
        }}>
            <View style={{flexDirection: 'row', height: size(150),}}>
                <TouchableOpacity

                    onPress={() => {

                        if (amIndex > 1) {
                            let obj = this.getLastObj()
                            this.last(obj);
                        } else {
                            this.refs.toast.show("已经是第一个动作了");
                        }
                    }}
                    style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={require('../../img/unity/left_yes.png')}
                        style={{
                            width: size(60),
                            height: size(60)
                        }}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    this.play()
                }} style={{flex: 4, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={this.state.playing ? require('../../img/unity/play.png') : require('../../img/unity/stop.png')}
                        style={{
                            width: size(100),
                            height: size(100),
                        }}/>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        let obj = this.getNextObj();
                        this.next(obj)
                    }}
                    style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Image
                        source={require('../../img/unity/right_yes.png')}
                        style={{
                            width: size(60),
                            height: size(60)
                        }}/>
                </TouchableOpacity>
            </View>
        </View>;
    }


    showBack = () => {
        this.sendMsgToUnity('animationPause', "", '');
        this.setState({
            backWin: true
        })
        return true;
    }
    goBack = () => {
        /**
         *   startWin: true,//初始开始接口
         restWin: false,//休息窗口状态
         backWin: false,//返回蒙版
         endWin: false,//训练结束窗口
         amDetailWin: false,//动作介绍窗口
         * */
        let state = this.state.startWin || this.state.restWin || this.state.backWin || this.state.endWin;
         if (state) {
            return true;
        } else if (this.state.amDetailWin||this.state.videoShow) {
            this.sendMsgToUnity('animationContinue', "", '');
            this.setState({
                amDetailWin: false,
                videoShow:false
            })
            return true;
        } else if (this.state.totalTime <= 1) {
            this.props.navigation.goBack();
            this.release();
            return true;
        } else {
            this.sendMsgToUnity('animationPause', "", '');
            this.setState({
                backWin: true
            })
            return true;
        }
    }


    render_am_detail() {
        return <View style={{
            position: 'absolute',
            bottom: size(200),
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
                        this.showDetail()
                    }}
                    style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={styles.detailBtn}>动作介绍</Text>
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

    render_detail_win() {
        return <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '40%',
            backgroundColor: "#0b0b0b",
        }}>
            <View style={{}}>
                <View style={{alignItems: "center", justifyContent: "center"}}>
                    <TouchableOpacity
                        onPress={() => {

                            this.sendMsgToUnity('animationContinue', "", '');
                            this.setState({
                                amDetailWin: false
                            })
                        }}
                    >
                        <Image
                            source={require('../.././img/unity/arrow_down.png')}
                            style={{width: size(60), height: size(60)}}/>
                    </TouchableOpacity>
                </View>
                {!(this.state.currAm.desc_video_url && this.state.currAm.desc_video_url != '') ?
                    <ScrollView>
                        {/*说明*/}
                        <View>
                            <View style={{justifyContent: "center", height: size(90),}}>
                                <Text style={styles.tag}>
                                    开始姿势
                                </Text>
                            </View>
                            <View>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.kaishi}
                                </Text>
                            </View>
                            <View style={{justifyContent: "center", height: size(90),}}>
                                <Text style={styles.tag}>
                                    过程阶段
                                </Text>
                            </View>
                            <View>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.guocheng1}
                                </Text>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.guocheng2}
                                </Text>
                            </View>
                        </View>
                        {/*错误*/}
                        <View>
                            <View style={{justifyContent: "center", height: size(90),}}>
                                <Text style={styles.tag}>
                                    错误动作
                                </Text>
                            </View>
                            <View>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.cuowu}
                                </Text>
                            </View>
                            <View style={{justifyContent: "center", height: size(90),}}>
                                <Text style={styles.tag}>
                                    注意事项
                                </Text>
                            </View>
                            <View>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.zhuyi}
                                </Text>

                            </View>
                        </View>
                        {/*肌肉*/}
                        <View>
                            <View style={{justifyContent: "center", height: size(90),}}>
                                <Text style={styles.tag}>
                                    锻炼肌肉
                                </Text>
                            </View>
                            <View>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(26),
                                    marginLeft: size(40),
                                    marginRight: size(40),
                                    lineHeight: size(50)
                                }}>
                                    {this.state.currAm.jirou}
                                </Text>
                            </View>
                        </View>
                        <View style={{height: size(90)}}></View>
                    </ScrollView> : <View style={{width: '100%', height: size(450), marginTop: size(50)}}>
                        <Video
                            inlineOnly
                            volume={0.8}
                            scrollBounce
                            url={this.state.currAm.desc_video_url}
                            theme={theme}

                            onEnd={() => {
                                //  this.nextVideo()
                            }}

                            ref={(ref) => {
                                this.video = ref
                            }}
                        />
                    </View>
                }

            </View>
        </View>;
    }

    async planFinish() {
        //关闭计时器
        this.timeCount(false)
        this.release();
        this.props.navigation.goBack();
    }

    async updateJindu() {
        //更新下进度
        let url = api.base_uri + 'v1/app/planprogress/update';
        let tokens = await storage.get("userTokens");

        try {
            this.Loading.show('上传进度中...')
            await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token,
                    accept: "*/*"
                },
                body: JSON.stringify({
                    planId: this.state.planId
                })
            })
                .then(resp => resp.json())
                .then(result => {
                    this.Loading.close()
                    /* alert(JSON.stringify(result))*/
                });
        } catch (error) {
            this.Loading.close()
        }
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1, backgroundColor: "#323232"
    },
    detailBtn: {
        color: "#FFF",
    }, tag: {
        color: "#FFF", fontWeight: 'bold', fontSize: size(30), marginLeft: size(40), marginRight: size(40)
    },   btnHead: {
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
