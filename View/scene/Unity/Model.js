import React, {Component} from "react";
import {
    ScrollView,
    Animated,
    StyleSheet,
    Text,
    View,
    Button,
    Easing,
    TouchableOpacity,
    Alert,
    TextInput,
    WebView,
    Image
} from "react-native";
import {ScreenUtil} from "../../common/index";
import {size} from '../../common/ScreenUtil'
import Toast from "react-native-easy-toast";
import FadeInView from "./FadeInView";
import Loading from "../../common/Loading";
import SlidingUpPanel from "rn-sliding-up-panel"
import {screen, system} from "../../common/index";
import UnityView, {UnityViewMessageEventData, MessageHandler} from 'react-native-unity-view';
// import Video from "react-native-video";
import SplashScreen from "react-native-splash-screen";

let unity = UnityView;
export default class Model extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            paused:false,
            isOpen: false,
            currSubmodel:'',
            styles: {position: 'absolute', top: size(128), bottom: 0, left: 0, right: 0},
            info: this.props.navigation.state.params.info,
            html: '',
            title: '',
            videoUrl: '1',
            loadTitle:'',
            videoWidth: size(0.1),
            aboutList: [{
                name: '相关人体构造',
                type: 'RTGZ',
                list: [
                    {
                        struct_version: "6",
                        app_type: "model",
                        app_version: "6",
                        ab_path: "http://filetest1.vesal.site/upload/unity3D/ios/xml/SA0000000.xml",
                        youke_use: "disabled",
                        function_type: "5",
                        platform: "android,ios,pc",
                        download_count: 1,
                        struct_sell_amount: 48,
                        first_icon_url: "http://fileprod.vesal.site/upload/sportProductImage/v4/SA0000000.png",
                        fy_id: 4,
                        Introduce: "",
                        visible_identity: "1,2,3,4,5,6",
                        is_charge: "yes",
                        member_is_use: "no",
                        ab_list: "framework,nervous,nervous01,articulation,heart,reproductive,respiratorysystem,alimentarysystem,lymphatic,lymphatic01,circulatorysystem,peripheralnervous,musclesizhi,musclequgan,skin,local,reference",
                        struct_id: 76,
                        struct_name: "男性整体人",
                        struct_sort: "1",
                        noun_id: "422",
                        struct_code: "50001",
                        app_id: "SA0000000",
                        noun_no: "SA0000000"
                    },
                    {
                        struct_version: "1",
                        app_type: "model",
                        app_version: "1",
                        ab_path: null,
                        youke_use: "disabled",
                        function_type: "5",
                        platform: "android,ios,pc",
                        download_count: 0,
                        struct_sell_amount: 1371,
                        first_icon_url: "http://fileprod.vesal.site/upload/resources/20180726/b571a159f8ce4cd6be31b38cdc690e3b.jpg",
                        fy_id: 21,
                        Introduce: "<meta name='viewport' content='width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'/>",
                        visible_identity: "1,2,3,4,5,6,7,8,9",
                        is_charge: "yes",
                        member_is_use: "no",
                        ab_list: "framework,articulation,heart,reproductive,alimentarysystem,lymphatic,circulatorysystem,peripheralnervous,musclesizhi,musclequgan,skin",
                        struct_id: 226,
                        struct_name: "下肢",
                        struct_sort: "1",
                        noun_id: "565",
                        struct_code: "RA0800001",
                        app_id: "RA0800001",
                        noun_no: "RA0800001"
                    },{
                        struct_version: "1",
                        app_type: "model",
                        app_version: "1",
                        ab_path: null,
                        youke_use: "disabled",
                        function_type: "5",
                        platform: "android,ios,pc",
                        download_count: 0,
                        struct_sell_amount: 0,
                        first_icon_url: "http://fileprod.vesal.site/upload/resources/20180726/e55f9a13f3e84d36a543801fb9bc483f.jpg",
                        fy_id: 17,
                        Introduce: "<meta name='viewport' content='width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'/><meta name='viewport' content='width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'/>",
                        visible_identity: "1,2,3,4,5,6,7,8,9",
                        is_charge: "no",
                        member_is_use: "yes",
                        ab_list: "framework,articulation,heart,reproductive,respiratorysystem,alimentarysystem,lymphatic,circulatorysystem,peripheralnervous,musclesizhi,musclequgan,skin",
                        struct_id: 202,
                        struct_name: "结肠上区",
                        struct_sort: "3",
                        noun_id: "546",
                        struct_code: "RA0400003",
                        app_id: "RA0400003",
                        noun_no: "RA0400003"
                    }
                ]
            }, {
                name: '动画视频',
                type: 'video',
                list: [
                    {
                        title: "肌肉锻炼视频",
                        imgUrl: "http://filetest1.vesal.site/upload/video/js1.png",
                        video: "http://filetest1.vesal.site/upload/video/WeChat_20181207171032.mp4"
                    }, {
                        title: "针灸治疗视频",
                        imgUrl: "http://filetest1.vesal.site/upload/video/js2.png",
                        video: "http://filetest1.vesal.site/upload/video/WeChat_20181207171017.mp4"
                    }
                ]
            }, {
                name: '常见疾病',
                type: 'QA',
                list: [
                    {
                        title: "软肋骨炎如何治疗?严重吗?",
                        value: " 维生素B1和酮洛芬治疗。如果见效不明显的话，明确诊断后进行治疗比较好，那就要去医院检查胸片，B超，祝你早日恢复。"
                    }, {
                        title: "肋骨骨折多久能好?",
                        value: " 肋骨骨折，以后的患者朋友这种疾病在恢复期是非常长的，要给自己更多的耐心，刚开始出现了骨折的这些症状患者一定要注意平时生活当中这种骨折可能会引发休克，也可能会导致迅速死亡所以必须做紧急的处理。"
                    }, {
                        title: "肋骨断裂什么方法养伤最好?",
                        value: " 首先，说说肋骨容易骨折的都是哪几根。这1-3根肋骨粗短，并且有锁骨和肩胛骨的保护，不容易骨折；4-7根肋骨长而且薄，最易折断，如果骨折，容易引起腹腔脏器和膈肌损伤。第8-10根肋前端肋软骨形成肋弓和胸骨相连，11-12肋前端游离，弹性都比较大，都不容易骨折。所以最容易骨折的就是4-7根肋骨。多根多处的肋骨骨折会使胸壁失去完整肋骨支撑而软化，出现反常呼吸运动，即吸气时软化区胸壁内陷，呼气时外凸，称为廉价熊（PS：不好意思，打错，是连枷胸）。 其次，说说临床表现了。这骨折了嘛，刺激肋间神经，就会疼，不疼不正常撒，在呼吸、咳嗽或转体运动的时候会加剧。胸痛使呼吸变浅、咳嗽无力，呼吸道分泌物增多、潴留，容易导致肺不张和肺部感染。骨折前端向内移位可刺破胸膜、肋间血管和肺组织，产生血胸、气胸、皮下气肿或咯血。伤后晚期骨折断端以为会引起迟发性血胸或血气胸。连枷胸的反常呼吸可影响肺部通气，导致体内二氧化碳滞留和缺氧，严重时会呼吸衰竭和循环衰竭。连枷胸常伴有广泛肺挫伤、挫伤区域的肺间质或肺泡水肿导致氧弥散障碍，就是氧输送至身体其他部位的障碍，从而出现低氧血症。"
                    }, {
                        title: "第一肋骨错位评估与治疗手法（经典）?",
                        value: "全身的淋巴通过右侧和左侧的淋巴静脉入口（位于颈内静脉和锁骨下静脉交汇处或附近）回到全身静脉的循环之中。通常每一侧的三个小淋巴干在其静脉连接处汇集，在左侧三个小的淋巴干先汇入较大的胸导管，而在右侧则多数各自单独进入静脉，开口汇聚在颈内静脉和锁骨下静脉交界处的腹侧面或就近开口于这两个大静脉的任一壁上，极少数情况下右侧三支淋巴干可汇聚成一个长约1cm的右淋巴导管，在颈根部斜行越过前斜角肌的内侧缘，到达静脉交界处的腹侧，在此处进入静脉。"
                    }, {
                        title: "第一肋骨错位病因",
                        value: "1.肋骨骨折一般由外来暴力所致，直接暴力作用于胸部时，肋骨骨折常发生于受打击部位，骨折端向内折断，同时胸内脏器造成损伤。\n" +
                        "2.间接暴力作用于胸部时，如胸部受挤压的暴力，肋骨骨折发生于暴力作用点以外的部位，骨折端向外，容易损伤胸壁软组织，产生胸部血肿。\n" +
                        "3.开放性骨折多见于火器或锐器直接损伤。\n" +
                        "4.当肋骨有病理性改变如骨质疏松、骨质软化，或在原发性和转移性肋骨肿瘤的基础上，也容易发生病理性肋骨骨折。"
                    }, {
                        title: "肋骨疼痛的临床表现",
                        value: "1.局部疼痛是肋骨骨折最明显的症状，且随咳嗽，深呼吸或身体转动等运动而加重，有时患者可自己听到骨摩擦音，或感觉到骨摩擦感。\n" +
                        "2.疼痛以及胸廓稳定性受破坏，可使呼吸动度受限，呼吸浅快和肺泡通气减少，患者不敢咳嗽，痰潴留，从而引起下呼吸道分泌物梗阻，肺实变或肺不张，这在老弱患者或原有肺部疾患的患者尤应予以重视。\n" +
                        "3.当患者出现两根以上相邻肋骨各自发生两处或以上骨折（又称“连枷胸”），吸气时，胸腔负压增加，软化部分胸壁向内凹陷；呼气时，胸腔压力增高，损伤的胸壁浮动凸出，这与其他胸壁的运动相反，称为“反常呼吸运动”，反常呼吸运动可使两侧胸腔压力不平衡，纵隔随呼吸而向左右来回移动，称为“纵隔摆动”，影响血液回流，造成循环功能紊乱，是导致和加重休克的重要因素之一。"
                    }, {
                        title: "单处闭合性肋骨骨折的治疗",
                        value: " 骨折两端因有上下肋骨和肋间肌支撑，发生错位、活动很少，多能自动愈合。固定胸廓主要是为了减少骨折端活动和减轻疼痛，方法有：多带条胸布固定或弹力胸带固定。单纯性肋骨骨折的治疗原则是止痛、固定和预防肺部感染。硬膜外或者静脉注射止痛剂，可有效长期镇痛。"
                    }, {
                        title: "连枷胸的治疗",
                        value: " 纠正反常呼吸运动，抗休克、防治感染和处理合并损伤。当胸壁软化范围小或位于背部时，反常呼吸运动可不明显或不严重，可采用局部夹垫加压包扎。但是，当浮动幅度达3厘米以上时可引起严重的呼吸与循环功能紊乱，当超过5厘米或为双侧连枷胸软胸综合征时，可迅速导致死亡，必须进行紧急处理。"
                    }, {
                        title: "开放性骨折的治疗",
                        value: " 应及早彻底清创治疗。清除碎骨片及无生机的组织，咬平骨折断端，以免刺伤周围组织。如有肋间血管破损者，应分别缝扎破裂血管远近端。胸膜破损者按开放性气胸处理。术后常规注射破伤风抗毒血清和给予抗生素防治感染。"
                    }
                ]
            }
            ]
        };


    }

    /**
     * ui渲染完后的操作
     */
    componentDidMount() {

        this.onToggleRotate("app", this.state.info);
    }


    /**
     * 接收unity消息
     * @param event
     */
    onUnityMessage(event) {

        if (event.name == 'back') {
            this.props.navigation.goBack();
        }else{
            this.setState({
                currSubmodel:event.data.name
            })
            this.child.close();
            let _this = this;
            setTimeout(function() {
                _this.child.show(size(250), screen.height)
            }, 200);

        }

        /*     setTimeout(() => {
                     hander.send('I am click callback!');
             }, 2000);*/
    }

    /**
     * 打开QA
     */
    openQA(item) {
        this.closeVideo()

        if (this.state.title == item.title) {
            this.childWeb.close();
            this.setState({
                title: '',
                videoWidth: 0
            })

        } else {
            this.setState({
                html: item.value,
                title: item.title,
                videoWidth: 0
            })
            this.childWeb.show(size(500), '70%')
        }
    }

    closeQA() {
        this.childWeb.close();
    }

    /**
     * 打开视频
     */
    openVideo(item) {
        this.childWeb.close()
        this.setState({
            paused:false,
            videoUrl: item.video,
            videoWidth: size(500)
        })
        this.childVideo.show(size(500), size(828))
    }

    /**
     * 關閉視頻
     */
    closeVideo() {
        this.childVideo.close();
        this.setState({
            videoWidth: size(0.1),
            paused:true
        })
    }

    /**
     * 打開相关应用
     */
    showSliding() {
        this.state.isOpen ? this.child.close() : this.child.show(size(250), screen.height)
        this.setState({
            isOpen: this.state.isOpen ? false : true
        })
    }

    /**
     * 关闭相关应用
     */
    closeSliding() {
        this.closeQA();
        this.closeVideo();
        this.child.close();
        this.setState({
            isOpen: false
        })
    }


    /**
     * 发送消息给unity
     * @param name
     * @param info
     */
    onToggleRotate(name, info) {

        if (this.unity) {

            this.closeSliding();
            this.setState({
                videoWidth: size(0.1),
                info:info
            })
            this.childWeb.close()
            this.childVideo.close()
            //   alert("发消息给uniy , name :" + name + ",info:" + info)
            //  return;
            this.unity.postMessageToUnityManager({
                name: name,
                data: JSON.stringify(info),
                callBack: (data) => {
                    Alert.alert('Tip', JSON.stringify(data))
                }
            });
        }
    }




    onRef = (ref) => {
        this.child = ref
    }

    onRefWeb = (ref) => {
        this.childWeb = ref
    }

    onRefVideo = (ref) => {
        this.childVideo = ref
    }


    render() {


        return (
            <View style={{
                width: screen.width,
                height: screen.height
            }}>
                {/*323232,0094e1*/}
                <View style={{flexDirection: 'row', backgroundColor: "#323232", height: size(128)}}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={{flex: 2, marginTop: size(40), justifyContent: 'center',}}>
                        <Image source={require('../../img/common/back.png')}
                               style={{width: size(50), height: size(50), marginLeft: size(30),}}/>
                    </TouchableOpacity>

                    <Text style={{
                        flex: 4,
                        marginTop: size(40),
                        lineHeight: size(88),
                        color: "#FFF",
                        textAlign: 'center',
                        fontSize: size(27)
                    }}>
                        {this.state.info.struct_name}
                    </Text>

                    <TouchableOpacity
                        onPress={() => this.showSliding()}
                        style={{flex: 2, marginTop: size(40), justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/common/xiangguan.png')}
                               style={{width: size(30), height: size(30), lineHeight: size(88)}}/>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{flex: 1, marginTop: size(40), justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../../img/common/shouchang.png')}
                               style={{width: size(30), height: size(30), lineHeight: size(88)}}/>
                        <Text style={{fontSize: size(18), color: "#FFF"}}>收藏</Text>
                    </TouchableOpacity>
                </View>

                <FadeInView
                    onRef={this.onRef}
                    navigation={this.props.navigation}
                    style={{
                        borderRadius: size(10),
                        backgroundColor: 'rgba(18,18,18,0.53)',
                        position: 'absolute',
                        top: size(128),
                        zIndex: 999,
                        width: '100%',
                        right: 0,
                        paddingBottom: size(128)
                    }}>
                    <TouchableOpacity
                        onPress={() => this.closeSliding()}
                        style={{justifyContent: 'center'}}>
                        <Image source={require('../../img/common/guanbi.png')}
                               style={{width: size(30), height: size(30), margin: size(5)}}/>
                    </TouchableOpacity>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={{fontSize: size(16), color: "#ff1625", margin: size(10)}}>{this.state.currSubmodel}</Text>
                            <Text style={{fontSize: size(16), color: "#FFF", margin: size(10)}}>为您找到相关结果约10个</Text>
                        </View>
                        {this.state.aboutList.map((data, index) => {
                            if (data.type == 'RTGZ') {
                                return (
                                    <View>
                                        <View style={{backgroundColor: 'rgba(18,18,18,0.8)'}}>
                                            <Text
                                                style={{
                                                    fontSize: size(20), margin: size(10), color: "#dfdfdf",
                                                    lineHeight: size(30),
                                                }}>{data.name}</Text>
                                        </View>


                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: size(10)
                                        }}>

                                            {data.list.map((item, index) => {
                                                return (
                                                    <TouchableOpacity onPress={() => this.onToggleRotate('app', item)}>
                                                        <Image source={{uri: item.first_icon_url}}
                                                               style={{
                                                                   width: size(128),
                                                                   height: size(128),
                                                                   lineHeight: size(88),
                                                                   borderRadius: size(10)
                                                               }}/>
                                                        <Text
                                                            style={{
                                                                fontSize: size(16),
                                                                color: "#FFF",
                                                                margin: size(10),
                                                                textAlign: 'center'
                                                            }}>
                                                            {item.struct_name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </View>
                                    </View>
                                )
                            } else if (data.type == 'QA') {
                                return (
                                    <View>
                                        <View style={{backgroundColor: 'rgba(18,18,18,0.8)'}}>
                                            <Text
                                                style={{
                                                    fontSize: size(20), margin: size(10), color: "#dfdfdf",
                                                    lineHeight: size(30),
                                                }}>{data.name}</Text>
                                        </View>


                                        <View style={{justifyContent: 'center', marginTop: size(10)}}>

                                            {data.list.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => this.openQA(item)}
                                                    >

                                                        <Text
                                                            style={{
                                                                fontSize: size(20),
                                                                color: "#FFF",
                                                                margin: size(10)
                                                            }}>
                                                            {item.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </View>
                                    </View>
                                )
                            } else if (data.type == 'video') {
                                return (
                                    <View>
                                        <View style={{backgroundColor: 'rgba(18,18,18,0.8)'}}>
                                            <Text
                                                style={{
                                                    fontSize: size(20), margin: size(10), color: "#dfdfdf",
                                                    lineHeight: size(30),
                                                }}>{data.name}</Text>
                                        </View>


                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'center', marginTop: size(10)
                                        }}>

                                            {data.list.map((item, index) => {
                                                return (
                                                    <TouchableOpacity onPress={() => this.openVideo(item)}>
                                                        <Image source={{uri: item.imgUrl}}
                                                               style={{
                                                                   width: size(128),
                                                                   height: size(128),

                                                                   borderRadius: size(10)
                                                               }}/>
                                                        <Text
                                                            style={{
                                                                fontSize: size(16),
                                                                color: "#FFF",
                                                                margin: size(10),
                                                                textAlign: 'center'
                                                            }}>
                                                            {item.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}

                                        </View>
                                    </View>
                                )
                            }

                        })}

                    </ScrollView>


                </FadeInView>
                {/*webView*/}
                <FadeInView
                    onRef={this.onRefWeb}
                    navigation={this.props.navigation}
                    style={{

                        backgroundColor: 'rgba(18,18,18,0.7)',
                        position: 'absolute',
                        top: size(220),
                        zIndex: 999,
                        borderRadius: size(20),
                        width: size(400),
                        right: size(250)
                    }}>
                    <TouchableOpacity
                        onPress={() => this.childWeb.close()}
                        style={{justifyContent: 'center'}}>
                        <Image source={require('../../img/common/guanbi.png')}
                               style={{width: size(30), height: size(30), margin: size(5)}}/>
                    </TouchableOpacity>
                    <ScrollView style={{paddingRight: size(20)}}>
                        <View>
                            <Text style={{
                                color: "#FFF",
                                fontSize: size(26),
                                lineHeight: size(50)
                            }}>{this.state.title}</Text>
                        </View>
                        <Text style={{color: "#FFF", fontSize: size(22), lineHeight: size(50)}}>{this.state.html}</Text>
                    </ScrollView>
                </FadeInView>


                <FadeInView
                    onRef={this.onRefVideo}
                    navigation={this.props.navigation}
                    style={{

                        backgroundColor: 'rgba(18,18,18,0.7)',
                        position: 'absolute',
                        top: size(220),
                        zIndex: 999,
                        borderRadius: size(20),
                        width: size(400),
                        right: size(250)
                    }}>
                    <TouchableOpacity
                        onPress={() => this.closeVideo()}
                        style={{justifyContent: 'center'}}>
                        <Image source={require('../../img/common/guanbi.png')}
                               style={{width: size(30), height: size(30), margin: size(5)}}/>
                    </TouchableOpacity>
                    <View>

                            {/*<Video*/}
                                {/*source={{uri: this.state.videoUrl}}*/}

                                {/*rate={1.0} // 控制暂停/播放，0 代表暂停*/}
                                {/*volume={1.0} // 声音的放大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数*/}
                                {/*muted={false} //true代表静音，默认为false.*/}
                                {/*paused={this.state.paused} // Pauses playback entirely.*/}
                                {/*repeat={true} // 是否重复播放*/}
                                {/*onProgress={this.setTime} // 进度控制，每250ms调用一次，以获取视频播放的进度*/}
                                {/*onLoadStart={() =>this.setState({*/}
                                    {/*loadTitle: "视频加载中..."*/}
                                {/*})}*/}
                                {/*onLoad={() =>this.setState({*/}
                                    {/*loadTitle: ""*/}
                                {/*})}*/}


                                {/*style={{*/}
                                    {/*width: this.state.videoWidth,*/}
                                    {/*height: size(700),*/}
                                    {/*position: 'absolute',*/}
                                    {/*top: 0,*/}
                                    {/*left: 0,*/}
                                    {/*bottom: 0,*/}
                                    {/*right: 0,*/}
                                {/*}}*/}
                            {/*/>*/}
                             <Text style={{color:"#ffffff",fontSize:size(20),
                            position: 'absolute',

                            left: size(200),zIndex:9999999,top:size(200)

                        }}>{this.state.loadTitle}</Text>
                    </View>


                </FadeInView>


                <UnityView
                    ref={(ref) => this.unity = ref}

                    onUnityMessage={this.onUnityMessage.bind(this)}

                    style={this.state.styles}
                />

                <Toast ref="toast" opacity={0.5} position='top' positionValue={500} fadeInDuration={750}
                       fadeOutDuration={1000}/>
            </View>

        );
    }


}

/**
 * styles
 */
const styles = StyleSheet.create({

    container: {
        backgroundColor: '#60ccff',

    }, msg: {
        fontWeight: 'bold',
        fontSize: size(50),
        color: "#FFF", textAlign: 'center', marginTop: size(160)
    }, img: {
        height: size(90), width: size(90),
        marginLeft: size(25),
    },
    headTitle: {
        lineHeight: 30,
        paddingLeft: 10, alignSelf: "center", fontWeight: 'bold', color: "#FFF"
    }, icon: {
        width: size(180),
        height: size(80),
        marginTop: size(5),
        resizeMode: "contain",
        alignSelf: "center",
        opacity: 0.7
    },
    structIem: {
        width: size(115),
        height: size(135),
        marginBottom: size(10),
        /*    borderWidth: size(1),*/
        /*   borderColor: "#dedede",*/
        backgroundColor: 'rgba(178,178,178,0.5)',
        marginTop: size(20),
        alignSelf: "center",
        borderRadius: size(1)
    },

});


