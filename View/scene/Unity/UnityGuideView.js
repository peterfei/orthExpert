import React, {Component} from "react";
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {screen, ScreenUtil} from "../../common/index";
import {size, deviceWidth, deviceHeight} from "../../common/ScreenUtil";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';

export default class UnityGuideView extends Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {

    }

    gotoHelp() {
        if (this.props.navigation != undefined) {
            this.props.navigation.navigate('Help')
        }
    }

    clickClose() {
        this.props.closeAction();
    }

    clickBtn() {
        if (this.props.btnAction != null) {
            this.props.btnAction();
        } else {
            alert('跳转视频111');
        }
    }

    render() {
        return (
          <View style={styles.container}>
              <View style={styles.topViewStyle}>
                  <Text style={{height: size(90), lineHeight: size(90), fontSize: size(28), fontWeight: '600', color: 'white'}}>操作指示</Text>
                  <MyTouchableOpacity
                    onPress={() => {this.clickClose()}}
                    style={{width: size(90), height: size(90), justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 0, top: 0}}>
                      <Image source={require('../../img/unity/guanbi.png')} style={{width: size(36), height: size(36)}}/>
                  </MyTouchableOpacity>
              </View>
              <Image source={require('../../img/unity/unity_yd.png')} style={styles.imgStyle}/>
              <MyTouchableOpacity style={styles.btnStyle} onPress={() => {this.clickBtn()}}>
                  <Text style={{width: size(250), height: size(60), lineHeight: size(60), textAlign: 'center', color: 'white', fontSize: size(24)}}>视频引导</Text>
              </MyTouchableOpacity>
              <View style={styles.bottomViewStyle}>
                  <Text style={{fontSize: size(22)}}>
                      更多帮助, 请前往: 个人中心 -- 帮助中心
                  </Text>
                  <MyTouchableOpacity onPress={()=>{this.gotoHelp()}}>
                      <Text style={{fontSize: size(22), color: '#0094E1'}}>
                          去查看
                      </Text>
                  </MyTouchableOpacity>
              </View>
          </View>
        );
    }


}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: size(20),
        alignItems: 'center',
        width: '75%',
        overflow: 'hidden'
    },
    topViewStyle: {
        backgroundColor: '#0094E1', width: '100%', justifyContent: 'center', alignItems: 'center'
    },
    imgStyle: {
        width: '100%', height: size(240) * deviceWidth * 0.75 / size(400)
    },
    btnStyle: {
        backgroundColor: '#0094E1',
        alignItems: 'center',
        marginTop: size(30),
        height: size(60),
        width: size(250),
        borderRadius: size(10)
    },
    bottomViewStyle: {
        width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: size(40), marginBottom: size(50)
    },
});



