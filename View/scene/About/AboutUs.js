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
                    维萨里骨科专家，与“维萨里3D解剖”“维萨里运动康复”“维萨里健身”是维萨里旗下，专业医学解剖，运动与健康，医患沟通系列app，维萨里骨科专家致力于为广大群众提供常见疾病的病因视频，为专业医生提供手术操作流程辅助医患沟通，目前以覆盖30万+健康及医疗领域人群。
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


