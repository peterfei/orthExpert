import React from "react";
import {Button,ScrollView, DeviceEventEmitter,Image,Platform,BackAndroid,WebView, TouchableOpacity, Text, View, StyleSheet} from "react-native";
import {size} from "../../common/ScreenUtil";

// import Video from "react-native-video";
export default class MenusVideo extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {
            info:this.props.navigation.state.params.video,
            loadTitle:'请稍等...',
        };

    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener("back", this.onBackClicked);
        }
    }



    componentWillMount() {
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener("back", this.onBackClicked);
        }else {

        }
    }

    //返回 ;//return  true 表示返回上一页  false  表示跳出RN
    onBackClicked = () => { // 默认 表示跳出RN
        this.props.navigation.state.params.callback('返回的数据');
        this.props.navigation.goBack()
        return true;
    }




    render() {
        let head = <View style={{backgroundColor: "#323232",flexDirection: 'row',alignItems:'center'}}>

            <View style={{flex:2}}>
                <TouchableOpacity
                    onPress={() =>this.onBackClicked()}
                    style={{
                        alignItems:'center',marginTop:size(40)
                    }}>
                    <Image source={require('../../img/common/back.png')}
                           style={{width: size(50), height: size(50)}}/>
                </TouchableOpacity>
            </View>
            <View style={{flex:4}}>
                <Text
                    style={{
                        color: "#FFF",
                        fontSize: size(29),
                        fontWeight: "bold",
                        lineHeight: size(120),
                        marginTop: size(25),
                        alignSelf: "center"
                    }}>
                    {this.state.info.title}
                </Text>
            </View>
            <View style={{flex:2}}>

            </View>


        </View>;
         return (
             <View style={{flex:1,  backgroundColor:"#323232"}}>
                 {head}




                     {/*<Video*/}
                         {/*source={{uri: this.state.info.vedio_url}}*/}

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
                             {/*position: "absolute",*/}
                             {/*top: size(128),*/}
                             {/*left: 0,*/}
                             {/*bottom: 0,*/}
                             {/*right: 0,*/}
                             {/*width:'100%',*/}

                         {/*}}*/}
                     {/*/>*/}
                     <Text style={{color:"#fefefe",fontSize:size(30),
                         position: 'absolute',

                         left: size(300),top:size(400),


                     }}>{this.state.loadTitle}</Text>


             </View>

        );
    }
}
const styles = StyleSheet.create({});
