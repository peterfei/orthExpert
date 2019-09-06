import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,Image
} from 'react-native';
import {screen, system,NetInterface, HttpTool,size} from "../../common";
import DeviceInfo from "react-native-device-info";
import TitleBar from '../../scene/Home/TitleBar';

type Props = {};
export default class help extends Component<Props> {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            title: '关于我们',
            DeviceInfo:DeviceInfo.getVersion()
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <TitleBar title={this.state.title} navigate={this.props.navigation}/>
                <View style={styles.topIcon}>
                    <Image style={styles.logo}
                       source={require('../../img/about/logo.png')} />
                    <Image style={{width:size(200),resizeMode: 'contain'}}
                       source={require('../../img/about/text.png')} />
                    <Text style={{fontSize:size(23),color:'black'}}>当前版本{this.state.DeviceInfo}</Text>
                </View>
                <Text style={styles.textBody}>
                    维萨里运动康复，与”维萨里3d解剖”“骨科专家”“维萨里健身”是维萨里旗下，专业医学解剖，运动与健康，医患沟通系列app，维萨里运动康复致力于助推在线损伤恢复新模式全方位解决各类疾病、慢痛等损伤。目前以覆盖30万＋健康领域人群。
                </Text>
                <View style={{width:screen.width}}>
                    <View style={styles.rowBody}>
                        <Image style={styles.icon}
                           source={require('../../img/about/iphone.png')} />
                           <Text style={{color:'black'}}>客服电话： 029-68579950</Text>
                    </View>
                    {/*<View style={styles.rowBody}>*/}
                    {/*    <Image style={styles.icon}*/}
                    {/*       source={require('../../img/about/weixin.png')} />*/}
                    {/*       <Text style={{color:'black'}}>微信公众号：搜索“维萨里健身”</Text>*/}
                    {/*</View>*/}
                    <View style={styles.rowBody}>
                        <Image style={styles.icon}
                           source={require('../../img/about/mzsm.png')} />
                           <Text onPress={()=>{this.props.navigation.navigate('AboutUsDetails')}} style={{color:'#44B4E9'}}>查看免责声明</Text>
                    </View>
                </View>
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
    topIcon:{
        alignItems:'center',
        margin:size(20),
    },
    logo:{
        width:size(150),
        height:size(150)
    },
    textBody:{
        color:'black',
        margin:size(35),
        marginTop:size(15),
        lineHeight:size(40)
    },
    rowBody:{
        flexDirection:'row',
        marginLeft:size(35),
        marginTop:size(20)
    },
    icon:{
        width:size(40),
        height:size(40),
        marginRight:size(28)
    }
});


