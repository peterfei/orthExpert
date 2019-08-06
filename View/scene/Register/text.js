/**
 * Sample React Native App
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    TextInput
} from 'react-native';
import { RadioGroup, RadioButton } from "react-native-flexi-radio-button";

export default class MemberComplete extends Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headtitle}>完善个人信息</Text>
                </View>
                <View style={styles.marginTopview}/>
                <RadioGroup

                    style={{ flexDirection: "row" }}>
                    <RadioButton value={"student"} flex>
                        <Text>我是学生</Text>
                    </RadioButton>
                    <RadioButton value={"teacher"} flex>
                        <Text>我是教师</Text>
                    </RadioButton>
                    <RadioButton value={"doctor"}   flex>
                        <Text>我是医生</Text>
                    </RadioButton>
                </RadioGroup>
                <View style={styles.inputview}>
                    <TextInput underlineColorAndroid='transparent' style={styles.textinput} placeholder='请输入手机号'/>
                    <View style={styles.dividerview}>
                        <Text style={styles.divider}></Text>
                    </View>
                    <TextInput underlineColorAndroid='transparent' style={styles.textinput} placeholder='设置密码'
                               secureTextEntry={true}/>
                </View>
                <View style={styles.bottomview}>
                    <View style={styles.buttonview}>
                        <Text style={styles.logintext}>立即提交</Text>
                    </View>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    header: {
        height: 50,
        backgroundColor: '#096d96',
        justifyContent: 'center',
    },
    headtitle: {
        alignSelf: 'center',
        fontSize: 20,
        color: '#ffffff',
    },
    avatarview: {
        height: 150,
        backgroundColor: '#ECEDF1',
        justifyContent: 'center',
    },
    avatarimage: {
        width: 100,
        height: 100,
        alignSelf: 'center'
    },
    marginTopview: {
        height: 15,
        backgroundColor: '#F7F7F9'
    },
    inputview: {
        height: 100,
    },
    textinput: {
        flex: 1,
        fontSize: 16,
    },
    dividerview: {
        flexDirection: 'row',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ECEDF1'
    },
    bottomview: {
        backgroundColor: '#ECEDF1',
        flex: 1,
    },
    buttonview: {
        backgroundColor: '#096d96',
        margin: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logintext: {
        fontSize: 17,
        color: '#FFFFFF',
        marginTop: 10,
        marginBottom: 10,
    },
    emptyview: {
        flex: 1,
    },
    bottombtnsview: {
        flexDirection: 'row',
    },
    bottomleftbtnview: {
        flex: 1,
        height: 50,
        paddingLeft: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    bottomrightbtnview: {
        flex: 1,
        height: 50,
        paddingRight: 10,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    bottombtn: {
        fontSize: 15,
        color: '#096d96',
    }
});
