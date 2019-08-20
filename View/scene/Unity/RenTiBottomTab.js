import React from "react";
import {BackAndroid, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {isIPhoneXFooter, size} from "../../common/Tool/ScreenUtil";
import Video from 'react-native-af-video-player'
import {VoiceUtils} from "../../common/module/VoiceUtils"
import {compare, getDiffLevel, getSelectDifficulty, getWebList, groupWeb} from "./common"
import SearchModel from "./SearchModel";
import {checkPerm} from "./LCE";

let index = 0;
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
const BaseScript =
    `
    (function () {
        var height = null;
        function changeHeight() {
          if (document.body.scrollHeight != height) {
            height = document.body.scrollHeight;
            if (window.postMessage) {
              window.postMessage(JSON.stringify({
                type: 'setHeight',
                height: height,
              }))
            }
          }
        }
        setTimeout(changeHeight, 100);
    } ())
    `


export default class RenTiBottomTab extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        // alert(`currAnimation is ${this.props.currAnimation}`)
        this.state = {
            currBottom: this.props.currAmList && this.props.currAmList.length > 0 ? this.props.currAmList[0].key : "力量",
            currText: "",
            moreWin: false,
            animationListWin: this.props.animationListWin,//底部动画列表窗口
            amDescWin: this.props.amDescWin,
            searchWin: this.props.searchWin,
            currModel: this.props.currModel,
            from: this.props.from,
            currAnimation: this.props.currAnimation,
            currVideoUrl: "",
            currAmList: this.props.currAmList,
            descWin: false,
            webHeight: 0,
            difficultyWin: this.props.difficultyWin,
            currDiffLevel: [],
            isShowDetail: true,
            jirouDetail: false

        };
    }


    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener("back", this.goBack);
        }
    }

    goBack = () => {
        if (!this.state.isShowDetail){
            this.setState({
                isShowDetail: true
            })
        }
        else if (this.state.videoShow){

            this.props.closeVideo()

        } else if (this.state.descWin) {
            this.setState({
                descWin: false
            })
        } else if (this.state.searchWin) {
            this.setState({
                searchWin: false
            })
        } else if (this.state.amDescWin && this.state.from != 1) {

            this.setState({
                amDescWin: false,
                animationListWin: true
            })
            this.props.sendMsgToUnity('animationBack', "", '');

        } else if (this.state.moreWin) {
            this.setState({
                moreWin: false
            })
        } else {
            //this.props.changeHeight('0.01%', '0.01%');
            this.props.navigation.goBack();

        }


        return true;
    };

    /**
     * web端发送过来的交互消息
     */
    onMessage(event) {
        try {
            const action = JSON.parse(event.nativeEvent.data)
            if (action.type === 'setHeight') {
                this.setState({webHeight: action.height + size(100)})
            }
        } catch (error) {
            // pass
        }
    }


    getWeb(currModel) {
        let webList = getWebList(currModel.smName, "sm_name");
        let tempData = groupWeb(webList, 'firstFyName').sort(compare("firstSort"));

        if (tempData.length == 0) {

            tempData = [
                {
                    "firstSort": 1,
                    "key": "简介",
                    "icon_url": "http://res.vesal.site/icon/xinxi.png",
                    "value": [
                        {
                            "type": "text",
                            "content": "中文:" + currModel.chName + "\n英文:" + currModel.enName + "\n解释:" + currModel.note
                        }
                    ]
                }
            ]
        }

        return tempData;
    }

    componentWillMount() {
        this.initVoice()
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener("back", this.goBack);
        }
    }


    componentWillReceiveProps(nextProps) {
        // alert(`nextProps.currAnimation is ${JSON.stringify(nextProps.currAnimation)}`)

        this.setState({
            animationListWin: nextProps.animationListWin,
            amDescWin: nextProps.amDescWin,
            currModel: nextProps.currModel,
            currAmList: nextProps.currAmList,
            currAnimation: nextProps.currAnimation,
            searchWin: nextProps.searchWin,
            difficultyWin: nextProps.difficultyWin,
            from: nextProps.from,
            videoShow: nextProps.videoShow,
            currBottom: nextProps.currAmList && nextProps.currAmList.length > 0 ? nextProps.currAmList[0].key : "力量"
        });
    }


    changeTab(data) {
        if (this.state.currBottom != data) {
            this.setState({
                currBottom: data,
            })
        }

    }

    /**
     * 打开显示更多
     * */
    showMore() {
        this.setState({
            moreWin: true
        })
    }

    /**
     * 打开介绍说明
     */
    openDesc(text, url) {
        this.setState({
            descWin: true,
            currText: text,
            currVideoUrl: url
        })
        //     this.props.changeHeight('0.01%', '0.01%');//隐藏unity


    }

    /**
     * 点击动画
     * @param animation
     */
    async clickAnimation(animation) {
        //发消息给unity

        let isUse = await  checkPerm(animation.is_charge, animation.combo_code);
        if (isUse) {

            let obj = {
                "am_no": animation.am_no,
                "camera_params": animation.camera_params,
                "equip_no_list": animation.equip_no_list
            }

            obj['repetitions'] = '';
            obj['ta_time'] = '';
            obj['ta_type'] = '';
            obj['remind_index'] = '';
            obj['remind_audio'] = '';
            obj['am_process'] = '';


            this.props.sendMsgToUnity('animation', obj, 'json');
            this.props.sendMsgToUnity('animationContinue', "", '');
            //显示动画介绍
            this.setState({
                animationListWin: false,
                amDescWin: true,
                currAnimation: animation,
                isShowDetail: true,
                jirouDetail: false
            })
        } else {
            //跳转商城
            this.props.navigation.navigate("CourseMall", {
                comboCode: animation.combo_code
            });
        }


    }

    async initVoice() {
        if (index == 0) {
            VoiceUtils.init(0);
            index++
        }
    }

    fayin(name) {
        let currModel = this.state.currModel

        this.setState({
            jirouDetail: !this.state.jirouDetail
        })

        let str = name + "。" + this.state.currModel.enName;
        str = str.replace("_L", "").replace("_R", "").replace("_左", "").replace("_右", "");
        VoiceUtils.speak(str);
    }

    /**
     * 点击难度
     */
    clickDifficulty() {
        if (this.state.currAmList && this.state.currAmList.length > 0) {
            let currDiffLevel = getDiffLevel(this.state.currAmList, this.state.currBottom)
            //获取难度
            this.setState({
                difficultyWin: this.state.difficultyWin ? false : true,
                currDiffLevel: currDiffLevel
            })
        }


    }

    /**
     * 隐藏说明弹框
     */
    hideDescDetail() {
        this.setState({
            descWin: false,
            currVideoUrl: ""
        });
        //  this.props.changeHeight('100%', '100%');
    }

    onFullScreen(status) {
        alert(status)
    }

    /**
     * 切换错误 说明
     * @returns {*}
     */
    async changeText(text, url) {
        // alert("url:"+url)
        this.setState({
            currText: text,
            currVideoUrl: url
        })
        try {
            if (url != '' && url != undefined && url != null) {

                this.video.seekTo(0.001)
            }
        } catch (e) {
            //alert(":XX:X:X:"+e)
        }

    }

    onMorePress() {
        /*  Alert.alert(
              'Boom',
              'This is an action call!',
              [{ text: 'Aw yeah!' }]
          )*/
    }


    /**
     * 切换下一个视频
     */
    nextVideo() {
        if (this.state.currText == '说明') {
            this.setState({
                currText: "错误",
                currVideoUrl: this.state.currAnimation.cuowu_url
            })
        } else if (this.state.currText == '错误') {
            this.setState({
                currText: "肌肉",
                currVideoUrl: this.state.currAnimation.jirou_url
            })
        } else if (this.state.currText == '肌肉') {
            this.setState({
                currText: "呼吸",
                currVideoUrl: this.state.currAnimation.huxi_url
            })
        } else if (this.state.currText == '呼吸') {

        }
    }

    //点击难度
    clickLevel(item, index) {
        this.state.currDiffLevel[index].check = item.check ? false : true
        //过滤结果
        getSelectDifficulty(this.state.currAmList, this.state.currBottom, this.state.currDiffLevel);
        //强制渲染
        this.setState({})

    }

    closeSearch() {

        this.setState({
            searchWin: false
        })
    }

    clearAnimation() {
        this.setState({
            currAmList: [],
            currModel: {

                chName: "请点击模型",
                note: "",
                enName: "Click on the model",
                smName: ""
            }
        })
    }
        getAm(){
                return (<View style={{
                    position: 'absolute',
                    bottom: size(10),
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    right: 0
                }}></View>)
        }
    render() {
        let moreWin = null;//更多窗口
        let animationList = null;//底部动画列表
        let amDescList = this.getAm();//底部动画说明列表
        let descWin = null;

        let currShuoming = this.state.currText == '说明';
        let currCuowu = this.state.currText == '错误';
        let currHuxi = this.state.currText == '呼吸';
        let currJirou = this.state.currText == '肌肉';
        let isVideo = this.state.currVideoUrl != '' ? true : false;

        let searchWin = null;
        if (this.state.searchWin) {
            searchWin = <SearchModel

                closeSearch={() =>
                    this.closeSearch()
                }

                clearAnimation={() =>
                    this.clearAnimation()
                }

                sendMsgToUnity={(name, info, type) => this.props.sendMsgToUnity(name, info, type)}

            />
        }
        if (this.state.moreWin) {
            /*关闭更多*/
            let close =
                <View style={{flexDirection: 'row', marginTop: size(40)}}>
                    <View
                        style={{flex: 4}}>
                        <Text style={{
                            color: "#FFF",
                            fontSize: size(24),
                            marginLeft: size(40)
                        }}>{this.state.currModel.chName}</Text>
                        <Text style={{
                            color: "#FFF",
                            fontSize: size(20),
                            marginLeft: size(40)
                        }}> {this.state.currModel.enName}</Text>
                    </View>
                    <TouchableOpacity
                        style={{flex: 1}}
                        onPress={() => {
                            this.setState({
                                moreWin: false
                            })
                        }}
                    >
                        <Image
                            source={require('../../img/unity/close.png')}
                            style={{
                                width: size(36),
                                height: size(36),
                                alignSelf: 'flex-end',
                                marginRight: size(30),
                                marginTop: size(30)
                            }}/>
                    </TouchableOpacity>
                </View>
            ;

            moreWin = <View style={{
                position: 'absolute',
                bottom: size(0.00001),
                top: 0,
                backgroundColor: "rgba(12,12,12,0.8)",
                left: 0,
                right: 0
            }}>

                {close}

            </View>;
        }

        // alert(`animationListWin is ${this.state.animationListWin}`)
        if (this.state.animationListWin) {
            //难度窗口
            let difficultyWin = null;
            if (this.state.difficultyWin) {
                difficultyWin = <View style={[styles.difficulty, {
                    height: size(100),
                }]}>

                    {this.state.currDiffLevel.map((item, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    this.clickLevel(item, index)
                                }}
                                style={{
                                    width: size(70),
                                    marginLeft: size(10),
                                    marginRight: size(10),
                                    justifyContent: "center"
                                }}>
                                <Text style={styles.diffText}>{item.check ? '○' : '●'}{item.difficulty}</Text>
                            </TouchableOpacity>
                        )
                    })}


                </View>;
            }
            animationList = <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0
            }}>
                {/*选择难度*/}
                {difficultyWin}

                {/*信息栏*/}
                <View style={{flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.8)', height: size(80)}}>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.navigation.goBack()
                        }}
                        style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
                        <Image
                            source={require('../.././img/unity/fanhui.png')}
                            style={{width: size(36), height: size(36)}}/>
                        <Text style={{color: "#FFF", fontSize: size(18)}}>返回</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            this.fayin(this.state.currModel.chName)
                        }}
                        style={{flex: 4, justifyContent: 'center', alignItems: "center"}}
                    >
                        <View style={{flexDirection: "row",}}>
                            {this.state.currModel.smName != '' ?
                                <View style={{flex: 1, justifyContent: "center", alignItems: "flex-end"}}>
                                    <Image
                                        source={require('../../img/unity/xiangqing.png')}
                                        style={{width: size(34), height: size(34)}}/>
                                </View> : null}
                            <View style={{flex: 1, justifyContent: "center", alignItems: "flex-end"}}>
                                <Image
                                    source={require('../../img/unity/laba.png')}
                                    style={{width: size(34), height: size(34)}}/>
                            </View>
                            <View style={{flex: 4}}>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(22),
                                    fontWeight: 'bold'
                                }}>&nbsp;{this.state.currModel.chName}</Text>
                                <Text style={{
                                    color: "#FFF",
                                    fontSize: size(18)
                                }}>&nbsp;{this.state.currModel.enName}</Text>
                            </View>

                        </View>
                    </TouchableOpacity>
                    {/**
                     *暂时屏蔽更多栏
                     */}
                    <TouchableOpacity
                        onPress={() => {
                            //this.showMore()
                            this.clickDifficulty()
                        }}
                        style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
                        <Image
                            source={this.state.difficultyWin ? require('../.././img/unity/nandu-yes.png') : require('../.././img/unity/nandu-no.png')}
                            style={{width: size(36), height: size(36)}}/>
                        <Text style={{color: "#b3b6b6", fontSize: size(16)}}>难度</Text>
                    </TouchableOpacity>
                </View>

                {/*动作列表*/}
                <View style={{backgroundColor: "rgba(0,0,0,0.8)",}}>

                    {this.state.currAmList.map((item, index) => {
                        return (
                            <ScrollView
                                ref={component => this._scrollView = component}
                                style={{height: this.state.currBottom == item.key ? null : 0}} horizontal
                                showsHorizontalScrollIndicator={false}>

                                {item.value.map((item1, index1) => {
                                    // alert(JSON.stringify(item1))
                                    if (item1.hide) {
                                        return null;
                                    } else {
                                        return (
                                            <TouchableOpacity

                                                onPress={() => {
                                                    this.clickAnimation(item1)
                                                }}

                                                style={{
                                                    marginLeft: size(20),
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                <Image
                                                    source={{uri: item1.icon_url}}
                                                    style={{
                                                        width: size(128),
                                                        height: size(128),
                                                        borderRadius: size(5)
                                                    }}/>
                                                <Text style={{
                                                    fontSize: size(20),
                                                    color: "#d6d6d6", marginTop: size(10),
                                                    height: size(25), width: size(128),
                                                    textAlign: "center",
                                                    marginBottom: size(10),
                                                }}>{item1.am_ch_name}</Text>
                                                <Text style={{
                                                    fontSize: size(18),
                                                    color: "#bdbdbd", marginTop: size(1),
                                                    height: size(25), width: size(128),
                                                    textAlign: "center",
                                                    marginBottom: size(10),
                                                }}>{item1.difficulty}</Text>
                                            </TouchableOpacity>
                                        )
                                    }

                                })}


                            </ScrollView>
                        )
                    })}

                </View>


                {/*底部动作与拉伸*/}
                <View style={{flexDirection: 'row'}}>

                    {this.state.currAmList.map((item, index) => {
                        return (
                            <TouchableOpacity
                                onPress={() => this.changeTab(item.key)}
                                style={[styles.btn, {backgroundColor: this.state.currBottom == item.key ? 'rgba(52,52,52,1)' : 'rgba(0,0,0,1)'}]}>
                                <Text style={{color: "#FFF"}}>{item.key}</Text>
                            </TouchableOpacity>
                        )
                    })}

                </View>
            </View>;
        }

        if (this.state.amDescWin&&this.state.currAnimation.am_ch_name!='请点击模型') {//底部说明
            amDescList = <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                right: 0,
                paddingBottom: isIPhoneXFooter(0)
            }}>

                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                        onPress={() => {
                            this.goBack()
                        }}
                        style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
                        <Image
                            source={require('../.././img/unity/fanhui.png')}
                            style={{width: size(36), height: size(36)}}/>
                        <Text style={{color: "#FFF", fontSize: size(18)}}>返回</Text>

                    </TouchableOpacity>
                    <TouchableOpacity style={{flex: 4, justifyContent: 'center', paddingLeft: size(40)}}>
                        <Text style={{
                            color: "#FFF",
                            fontSize: size(22),
                            fontWeight: 'bold'
                        }}>{this.state.currAnimation.am_ch_name}</Text>
                        <Text style={{color: "#FFF", fontSize: size(18)}}>{this.state.currAnimation.am_en_name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({
                                isShowDetail: !this.state.isShowDetail
                            })
                        }}
                        style={{flex: 1, justifyContent: 'center', alignItems: "center"}}>
                        <Image
                            source={this.state.isShowDetail ? require('../.././img/unity/arrow_up.png') : require('../.././img/unity/arrow_down.png')}
                            style={{width: size(36), height: size(36)}}/>
                        {this.state.isShowDetail ?
                            <Text style={{color: "#FFF", fontSize: size(18)}}>
                                动作介绍
                            </Text>
                            :
                            <Text style={{color: "#FFF", fontSize: size(18)}}>
                                收起
                            </Text>}


                    </TouchableOpacity>
                </View>

                {/*底部四个按钮*/}

                {!this.state.isShowDetail
                    ? this.state.currAnimation.desc_video_url && this.state.currAnimation.desc_video_url != '' ?
                        <View style={{width: '100%', height: size(450), marginTop: size(50)}}>
                            <Video
                                inlineOnly
                                volume={0.8}
                                scrollBounce
                                url={this.state.currAnimation.desc_video_url}
                                theme={theme}

                                onEnd={() => {
                                    //  this.nextVideo()
                                }}

                                ref={(ref) => {
                                    this.video = ref
                                }}
                            />
                        </View> :
                        <View
                            style={{width: '100%', flexDirection: 'row', height: size(500)}} horizontal
                            showsHorizontalScrollIndicator>

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
                                            {this.state.currAnimation.kaishi}
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
                                            {this.state.currAnimation.guocheng1}
                                        </Text>
                                        <Text style={{
                                            color: "#FFF",
                                            fontSize: size(26),
                                            marginLeft: size(40),
                                            marginRight: size(40),
                                            lineHeight: size(50)
                                        }}>
                                            {this.state.currAnimation.guocheng2}
                                        </Text>
                                    </View>
                                </View>
                                {/*错误*/}
                                <View>

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
                                            {this.state.currAnimation.zhuyi}
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
                                            {this.state.currAnimation.jirou}
                                        </Text>
                                    </View>
                                </View>
                                {/*呼吸*/}
                                {/*                            <View>
                                <View style={{justifyContent: "center", height: size(90),}}>
                                    <Text style={styles.tag}>
                                        呼吸
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
                                        {this.state.currAnimation.huxi}
                                    </Text>
                                </View>
                            </View>*/}
                            </ScrollView>

                            {/*  第一版 四个按钮
                    <TouchableOpacity
                        onPress={() => this.openDesc('说明', this.state.currAnimation.shuoming_url)}
                        style={styles.amMenu}>
                        <Image

                            source={require('../../img/unity/shuoming-hui.png')}

                            style={styles.amMenuIcon}/>
                        <Text style={[styles.menuText]}>说明</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.openDesc('错误', this.state.currAnimation.cuowu_url)}
                        style={styles.amMenu}>
                        <Image
                            source={require('../../img/unity/cuowu-hui.png')}
                            style={styles.amMenuIcon}/>
                        <Text style={[styles.menuText]}>错误</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.openDesc('肌肉', this.state.currAnimation.jirou_url)}
                        style={styles.amMenu}>
                        <Image

                            source={require('../../img/unity/jirou-hui.png')}

                            style={styles.amMenuIcon}/>
                        <Text style={[styles.menuText,]}>肌肉</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.openDesc('呼吸', this.state.currAnimation.huxi_url)}
                        style={styles.amMenu}>
                        <Image
                            source={require('../../img/unity/huxi-hui.png')}

                            style={styles.amMenuIcon}/>
                        <Text style={[styles.menuText,]}>呼吸</Text>
                    </TouchableOpacity>
                    */}
                        </View>
                    : null}

            </View>;
        }

        if (this.state.descWin) {
            /*关闭说明*/
            let closeDesc = <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                        style={{flex: 1, justifyContent: "flex-end"}}
                        onPress={() => {
                            this.hideDescDetail()
                        }}
                    >
                        <Image
                            source={require('../../img/unity/close.png')}
                            style={{
                                width: size(36),
                                height: size(36),
                                alignSelf: 'flex-end',
                                marginRight: size(30),
                                marginTop: size(30)
                            }}/>
                    </TouchableOpacity>
                    <View
                        style={{flex: 4, marginLeft: size(40), height: size(100), justifyContent: "flex-end"}}>
                        <Text style={{color: "#FFF", fontSize: size(24),}}>{this.state.currAnimation.am_ch_name}</Text>
                        <Text style={{color: "#FFF", fontSize: size(20)}}> {this.state.currAnimation.am_en_name}</Text>
                    </View>
                </View>
            ;
            //视频播放组件


            descWin = <View style={{
                position: 'absolute',
                bottom: size(0.00001),
                top: 0,
                backgroundColor: "rgba(12,12,12,1)",
                left: 0,
                right: 0
            }}>

                {closeDesc}

                <View style={{marginTop: size(50)}}>

                    <Video
                        autoPlay
                        rotateToFullScreen
                        lockPortraitOnFsExit
                        scrollBounce
                        onMorePress={() => this.onMorePress()}
                        style={{height: isVideo ? null : 0}}
                        url={this.state.currVideoUrl}

                        onFullScreen={status => this.onFullScreen(status)}
                        onEnd={() => {
                            //  this.nextVideo()
                        }}

                        ref={(ref) => {
                            this.video = ref
                        }}
                    />


                </View>


                <View>
                    <View

                        style={{width: '100%', flexDirection: 'row', height: size(100)}} horizontal
                        showsHorizontalScrollIndicator>

                        <TouchableOpacity
                            onPress={() => {
                                this.changeText('说明', this.state.currAnimation.shuoming_url)
                            }}
                            style={styles.amMenu}>
                            <Image

                                source={currShuoming ?
                                    require('../../img/unity/shuoming-bai.png') :
                                    require('../../img/unity/shuoming-hui.png')}

                                style={styles.amMenuIcon}/>
                            <Text style={[styles.menuText, {fontWeight: currShuoming ? 'bold' : null}]}>说明</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                this.changeText('错误', this.state.currAnimation.cuowu_url)
                            }}
                            style={styles.amMenu}>
                            <Image
                                source={currCuowu ?
                                    require('../../img/unity/cuowu-bai.png') :
                                    require('../../img/unity/cuowu-hui.png')}
                                style={styles.amMenuIcon}/>
                            <Text style={[styles.menuText, {fontWeight: currCuowu ? 'bold' : null}]}>错误</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                this.changeText('肌肉', this.state.currAnimation.jirou_url)
                            }}
                            style={styles.amMenu}>
                            <Image

                                source={currJirou ?
                                    require('../../img/unity/jirou-bai.png') :
                                    require('../../img/unity/jirou-hui.png')}

                                style={styles.amMenuIcon}/>
                            <Text style={[styles.menuText, {fontWeight: currJirou ? 'bold' : null}]}>肌肉</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.changeText('呼吸', this.state.currAnimation.huxi_url)
                            }}
                            style={styles.amMenu}>
                            <Image
                                source={currHuxi ?
                                    require('../../img/unity/huxi-bai.png') :
                                    require('../../img/unity/huxi-hui.png')}

                                style={styles.amMenuIcon}/>
                            <Text style={[styles.menuText, {fontWeight: currHuxi ? 'bold' : null}]}>呼吸</Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/*说明*/}
                {currShuoming ? <ScrollView>
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
                                {this.state.currAnimation.kaishi}
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
                                {this.state.currAnimation.guocheng1}
                            </Text>
                            <Text style={{
                                color: "#FFF",
                                fontSize: size(26),
                                marginLeft: size(40),
                                marginRight: size(40),
                                lineHeight: size(50)
                            }}>
                                {this.state.currAnimation.guocheng2}
                            </Text>
                        </View>
                    </View>
                </ScrollView> : null}

                {/*错误*/}
                {currCuowu ? <ScrollView>
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
                                {this.state.currAnimation.cuowu}
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
                                {this.state.currAnimation.zhuyi}
                            </Text>

                        </View>
                    </View>
                </ScrollView> : null}

                {/*肌肉*/}
                {currJirou ? <ScrollView>
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
                                {this.state.currAnimation.jirou}
                            </Text>
                        </View>
                    </View>
                </ScrollView> : null}

                {/*呼吸*/}
                {currHuxi ? <ScrollView>
                    <View>
                        <View style={{justifyContent: "center", height: size(90),}}>
                            <Text style={styles.tag}>
                                呼吸
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
                                {this.state.currAnimation.huxi}
                            </Text>
                        </View>
                    </View>
                </ScrollView> : null}


            </View>;
        }

        let flag = this.state.searchWin || this.state.descWin || this.state.jirouDetail
        let jirouDetail = null;
        if (this.state.jirouDetail) {
            jirouDetail = <View style={{
                position: 'absolute',
                backgroundColor: "rgba(0,0,0,0.8)",
                left: size(100),
                right: size(100),
                bottom: size(370),
                height: size(500),
                borderRadius: size(10),

            }}>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({
                            jirouDetail: false
                        })
                    }}
                    style={{justifyContent: 'center', alignItems: "center"}}>
                    <Image
                        source={require('../.././img/unity/arrow_down.png')}
                        style={{width: size(50), height: size(50)}}/>
                </TouchableOpacity>

                <ScrollView style={{marginLeft: size(20), marginBottom: size(10), marginRight: size(10)}}>
                    <View style={{marginTop: size(20)}}>
                        <Text style={{color: "#1296db", fontSize: size(26)}}>中文:</Text>
                    </View>
                    <View>
                        <Text style={{color: "#FFF", fontSize: size(26)}}>{this.state.currModel.chName} </Text>
                    </View>
                    <View>
                        <Text style={{color: "#1296db", fontSize: size(26)}}>英文:</Text>
                    </View>
                    <View>
                        <Text style={{color: "#FFF", fontSize: size(26)}}>{this.state.currModel.enName} </Text>
                    </View>
                    <View>
                        <Text style={{color: "#1296db", fontSize: size(26)}}>解释:</Text>
                    </View>
                    <View>
                        <Text style={{
                            color: "#FFF",
                            fontSize: size(26),lineHeight:size(40),
                        }}>{this.state.currModel.note == '' ? '暂无相关简介!' : this.state.currModel.note} </Text>

                    </View>
                    <View style={{height: size(50)}}>

                    </View>
                </ScrollView>

            </View>
        }
        return (
            <View style={{
                position: 'absolute',
                bottom: size(0.00001),
                left: 0,
                top: flag ? size(0.00001) : null,
                right: 0
            }}>

                {/*肌肉详情窗口*/}
                {jirouDetail}


                {/*底部动画列表*/}
                {animationList}

                {/*打开更多*/}
                {moreWin}

                {/*动作说明*/}
                {amDescList}

                {/*打开动作介绍*/}
                {descWin}
                {/*搜索*/}
                {searchWin}


            </View>
        );
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1
    }, btn: {
        flex: 1,
        alignItems: 'center',
        height: size(60),
        justifyContent: "center",
        color: '#FFF',
    }, menuText: {
        fontSize: size(18), color: "#FFF"
    }, amMenu: {
        alignItems: 'center', flex: 1, justifyContent: 'center',
    }, amMenuIcon: {
        width: size(44), height: size(44)
    }, tag: {
        color: "#FFF", fontWeight: 'bold', fontSize: size(30), marginLeft: size(40), marginRight: size(40)
    }
    , videoContainer: {}
    , difficulty: {
        flexDirection: 'row',
        justifyContent: "center",
        borderTopLeftRadius: size(20),
        borderTopRightRadius: size(20),
        alignSelf: "flex-end",
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: "center"
    }, diffText: {
        fontSize: size(20), color: "#1296db", alignSelf: "center",
    }

});
