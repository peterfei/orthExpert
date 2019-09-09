import React, {Component} from "react";
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    Platform, NativeModules,
    ImageBackground
} from "react-native";
import {size} from '../ScreenUtil';
import api from "../../api";
import DeviceInfo from "react-native-device-info";
import {ScrollView} from "react-native-af-video-player";

export default class AppUpdate extends Component{
    constructor(props){
        super(props)

        this.state = {
            showUpdate:false,
            mustUpdate:"no",
            newAppVersion:'',
            description:'',
            url:''
        }
    }

    async componentDidMount(){
        if (Platform.OS == 'android') {
            await this.checkVersion();
        }
    }

    checkVersion = async () => {
        try {
            const currVersion = DeviceInfo.getVersion();
            const url =
                api.base_uri +
                "/v1/app/member/getAppVersion?version=" +
                currVersion +
                "&plat=" +
                Platform.OS+
                '&business=orthope'; //拉取服务器最新版本
            await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(resp => resp.json())
                .then(result => {

                    if (result.List.length > 0) {
                        let item = result.List[0];
                        let serverVersion = item.version;
                        let mustUpdate = item.must_update;
                        let localVersion = new Number(DeviceInfo.getVersion().replace(/\./g, ""));

                        if (serverVersion > localVersion) {
                            this.setState({
                                showUpdate: true,
                                mustUpdate: mustUpdate,
                                newAppVersion: "V" + item.title,
                                description: item.description,
                                url: item.url
                            })
                        }
                    }
                });
        } catch (e) {

        }
    }

    toAppStore(){
        NativeModules.DownloadApk.downloading(
            this.state.url,
            "guke.apk"
        );
    }

    render(){
        if (this.state.showUpdate){
            return (
                <View style={styles.container}>
                    <ImageBackground style={styles.backGroundStyle} source={require('../../img/home/update_backgroundImg.png')}>
                        <Text style={styles.findNewVersionStyle}> 发现新版本</Text>
                        <Text style={styles.versionStyle}>{this.state.newAppVersion}</Text>
                        <View style={{marginTop:size(130),height:size(250),marginLeft:size(40),marginRight:size(40)}}>
                            <ScrollView style={{flex: 1}}   showsVerticalScrollIndicator={false}>
                                <Text style={styles.descriptionStyle}>{this.state.description}</Text>
                            </ScrollView>
                        </View>
                        <View style={styles.buttonsStyle}>
                            {
                                this.state.mustUpdate == 'no'
                                ?
                                    <TouchableOpacity  style={styles.cancelButtonStyle} onPress={() => {
                                        this.setState({
                                            showUpdate: false
                                        })}}>
                                        <Text  style={{color:'#000'}}>取消</Text>
                                    </TouchableOpacity>
                                :
                                    null
                            }
                            <TouchableOpacity style={styles.configButtonStyle} onPress={() => this.toAppStore()}>
                                <Text style={{color: '#fff'}}>立即更新</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                </View>
            )
        }else{
            return null
        }
    }
}

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        right: 0,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: 'center'
    },
    backGroundStyle:{
        width:size(550),
        height:size(732)
    },
    findNewVersionStyle:{
        color:"#fff",
        fontWeight: "bold",
        fontSize:size(42),
        marginTop:size(100),
        marginLeft:size(40)
    },
    versionStyle:{
        fontWeight: "800",
        fontSize:size(28),
        color:'#fff',
        marginLeft:size(40),
        marginTop:size(10)
    },
    buttonsStyle:{
        flexDirection:'row',
        justifyContent:'space-around',
        marginTop:size(40)
},
    descriptionStyle:{
        fontSize:size(28),
        lineHeight:size(30),
        color:'#282828'
    },
    cancelButtonStyle:{
        width: size(230),
        height: size(80),
        backgroundColor: "#f4f4f4",
        justifyContent:'center',
        alignItems:'center',
        borderRadius:size(10)
    },
    configButtonStyle:{
        width: size(230),
        height: size(80),
        backgroundColor: "#489ef6",
        justifyContent:'center',
        alignItems:'center',
        borderRadius:size(10)
    }
})