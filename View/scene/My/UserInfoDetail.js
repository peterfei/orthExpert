/**
 * Created by xzh on 13:33 2019-08-03
 *
 * @Description:
 */

import React from "react";
import { DeviceEventEmitter, Image, StyleSheet, Text, TouchableOpacity, View,NativeModules} from "react-native";
import {
    AppDef,
    BaseComponent,
    ContainerView,
    deviceHeight,
    deviceWidth,
    HttpTool,
    Line,
    ListEditCell,
    NavBar,
    NetInterface,
    size,
} from '../../common';
import { storage } from "../../common/storage";
import SYImagePicker from 'react-native-syan-image-picker'
import { NavigationActions, StackActions } from "react-navigation";
const UMPushModule =  NativeModules.UMPushModule

export default class UserInfoDetail extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            getMemberInfo: {},
            getMemberId: '',
            identityList: [],
            modifyNickName: [{ title: '昵称', content: '', type: 'input', }],
            sectionSexData: [{ title: '性别', content: '', type: 'select', }],
            sectionIdentityData: [{ title: '选择身份', content: '', type: 'select', }],
            isPhoneUser: false,
    };
        this.modifyPassword = [{ title: '修改密码', content: 'ModifyPassword', type: 'page' }];
    }

    componentDidMount() {
        this.getMemberInfo()
    }

    handleSexField(mbSex){
        if (mbSex == 'man' || mbSex == '男') {
            mbSex = '男';
        } else if (mbSex == 'woman' || mbSex == '女') {
            mbSex = '女';
        } else {
            mbSex = '保密';
        }
        return mbSex
    }

    async getMemberInfo(){
        let memberInfo = await storage.get("memberInfo");
        let isEmail = memberInfo.mbEmail != null && memberInfo.mbEmail != undefined && memberInfo.mbEmail.length > 0;
        let isPhoneUser = (memberInfo.mbTell != null && memberInfo.mbTell != undefined && memberInfo.mbTell.length > 0) ||isEmail? true : false;
        let mbSex = this.handleSexField(memberInfo.mbSex);

        this.getAllIdentity();
        this.setState({
            getMemberInfo: memberInfo,
            getMemberId: memberInfo.mbId,
            modifyNickName: [{ title: '昵称', content: memberInfo.mbName, type: 'input' }],
            sectionSexData: [{ title: '性别', content: mbSex, type: 'select' }],
            sectionIdentityData: [{ title: '选择身份', content: memberInfo.identityTitle, type: 'select' }],
            isPhoneUser:isPhoneUser
        })
    }

    async getAllIdentity() {
        let url = NetInterface.gk_getAllIdentity;
        HttpTool.GET_JP(url)
            .then(result => {
                if (result.code == 0) {
                    this.setState({
                        identityList: result.List
                    })
                }
            })
    }

    async updateMemberInfo(field) {
        let memberInfo = this.state.getMemberInfo;
        let body = {
            mbName: memberInfo.mbName,
            mbSex: memberInfo.mbSex,
            mbIdentity: memberInfo.mbIdentity,
            identityTitle: memberInfo.identityTitle,
            mbHeadUrl: memberInfo.mbHeadUrl,
            mbId: this.state.getMemberId
        };

        // let tokens = await storage.get("userTokens");
        let url = NetInterface.gk_updateMemberInfo;
        HttpTool.POST_JP(url, body)
            .then(async result => {
                if (result.code == 0) {
                    let memberInfo = result.member;
                    let mbSex = this.handleSexField(memberInfo.mbSex)

                    if(field === 'mbHeadUrl'){
                        this.setState({
                            getMemberInfo: memberInfo,
                        })
                    }
                    if(field === 'mbSexOrMbIdentity'){
                        this.setState({
                            getMemberInfo: memberInfo,
                            sectionSexData: [{ title: '性别', content: mbSex, type: 'select' }],
                            sectionIdentityData: [{ title: '选择身份', content: memberInfo.identityTitle, type: 'select' }]
                        })
                    }
                    if(field === 'mbName'){
                        this.setState({
                            getMemberInfo: memberInfo,
                            modifyNickName: [{ title: '昵称', content: memberInfo.mbName, type: 'input' }],
                        })
                    }

                    await storage.save("memberInfo", "", result.member);
                    DeviceEventEmitter.emit(AppDef.kNotify_UpdateUserInfoSuccess);
                }
            })
    }

    async logout() {
        /**
         * 友盟SetAlias
         */
        let memberInfo = await storage.get("memberInfo","")
        // alert(`memberInfo is ${JSON.stringify(memberInfo)}`)
        let tag = 'orthope' + memberInfo.mbId;
        await UMPushModule.deleteAlias(tag,"orthope",(code) =>{
        if (code == 200){
            console.log(`===========解绑友盟别名${tag}成功!!! ===========`);
        }
        })
        await storage.clearMapForKey("userTokens");
        // await  storage.clearMapForKey("mystructList");
        // await storage.clearMapForKey("versionByInitMyStruct");
        // await storage.clearMapForKey("initMyStruct");
        await storage.clearMapForKey("memberInfo");
        await storage.clearMapForKey("memberCgetombo");
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: "LoginPage" })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }

    
    handlePromiseSelectPhoto() {
        SYImagePicker.showImagePicker({
            imageCount: 1,
            quality: 90,
            compress: true,
            enableBase64: true
        }, (err, photos) => {
            if (!err) {
                this.mainView._showLoading("正在上传...")
                HttpTool.UploadImg(photos)
                    .then(res => {
                        this.mainView._closeLoading();
                        if (res.code == 0) {
                            let memberInfo = this.state.getMemberInfo;
                            memberInfo.mbHeadUrl = res.url;
                            this.updateMemberInfo('mbHeadUrl');
                        }
                    })
            }
        })
    };

    handleSelectionAction(result) {
        let memberInfo = this.state.getMemberInfo;
        if (result.name == 'sex') { // 性别选择完成
            memberInfo.mbSex = result.value.title;
        } else {                    //身份选择完成
            memberInfo.identityTitle = result.value.title;
            memberInfo.mbIdentity = result.value.identityId;
        }
        this.updateMemberInfo('mbSexOrMbIdentity');
        this.mainView._closeSelectDialog();
    }

    selectAction(item) { // 点击cell的方法
        if (item.type == 'input') {
            this.props.navigation.navigate("kfModifyData", {
                returnData: this.recieveName.bind(this),
                nickName: this.state.modifyNickName[0].content
            })
        } else if (item.type == 'select') {
            let list = [];
            let name = '';
            let type = 'Default';
            if (item.title == '性别') {
                list = [{ title: '男' }, { title: '女' }];
                name = 'sex';
            } else {
                this.state.identityList.forEach(item => {
                    item.title = item.identityTitle;
                });
                list = this.state.identityList;
                name = 'identify';
            }
            this.mainView._showSelectDialog(name, list, type);
        }
    }

    recieveName(name) {
        let memberInfo = this.state.getMemberInfo;
        memberInfo.mbName = name;
        this.updateMemberInfo('mbName');
    }

    _renderHeader() {
        let userIcon = this.state.getMemberInfo.mbHeadUrl ? { uri: this.state.getMemberInfo.mbHeadUrl } : require('../../img/kf_mine/defalutHead.png');
        return (
            <TouchableOpacity onPress={() => {
                this.handlePromiseSelectPhoto()
            }}>
                <View style={{
                    width: '100%',
                    height: size(140),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Image source={userIcon}
                        style={{ width: size(80), height: size(80), marginLeft: size(40), borderRadius: size(40) }} />
                    <Image source={require('../../img/kf_mine/mine_arrow.png')}
                        style={{ width: size(14), height: size(23), marginRight: size(40) }} />
                </View>
            </TouchableOpacity>
        )
    }

    _renderNickName() {
        let arr = [];
        this.state.modifyNickName.forEach((item, index) => {
            arr.push(
                <ListEditCell
                    title={item.title}
                    type={item.type}
                    content={item.content}
                    selectAction={() => {
                        this.selectAction(item)
                    }}
                    navigation={this.props.navigation}
                    key={index}
                />
            )
        })
        return arr;
    }

    _renderSectionSex() {
        let arr = [];
        this.state.sectionSexData.forEach((item, index) => {
            arr.push(
                <ListEditCell
                    title={item.title}
                    type={item.type}
                    content={item.content}
                    selectAction={() => {
                        this.selectAction(item)
                    }}
                    navigation={this.props.navigation}
                    key={index}
                />
            )
        })
        return arr;
    }

    _renderSectionIdentity() {
        let arr = [];
        this.state.sectionIdentityData.forEach((item, index) => {
            arr.push(
                <ListEditCell
                    title={item.title}
                    type={item.type}
                    content={item.content}
                    selectAction={() => {
                        this.selectAction(item)
                    }}
                    navigation={this.props.navigation}
                    key={index}
                />
            )
        })
        return arr;
    }

    _renderModifyPassword() {
        let arr = [];
        this.modifyPassword.forEach((item, index) => {
            arr.push(
                <ListEditCell
                    title={item.title}
                    type={item.type}
                    content={item.content}
                    selectAction={() => {
                        this.selectAction(item)
                    }}
                    navigation={this.props.navigation}
                    key={index}
                />
            )
        })
        return arr;
    }

    _renderFooter() {
        return (
            <View style={{ marginLeft: size(40), marginRight: size(40), marginTop: size(80), }}>
                <TouchableOpacity onPress={() => {
                    this.logout()
                }}>
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: AppDef.Blue,
                            height: size(90),
                            width: '100%',
                            borderRadius: size(45)
                        }}>
                        <Text style={{ color: AppDef.White, fontSize: size(32) }}>
                            退出登录
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <ContainerView ref={r => this.mainView = r} selectDialogAction={(result) => {
                this.handleSelectionAction(result)
            }}>
                <NavBar title='个人资料' navigation={this.props.navigation} />
                {this._renderHeader()}
                <Line height={size(14)} />
                {this._renderNickName()}
                {this._renderSectionSex()}
                {this._renderSectionIdentity()}
                <Line height={size(14)} />
                {this.state.isPhoneUser && this._renderModifyPassword() }
                {this.state.isPhoneUser && <Line height={size(14)}/>}
                {this._renderFooter()}

            </ContainerView>
        );
    }
}

const styles = StyleSheet.create({
    LoadingPage: {
        position: "absolute",
        left: 0,
        top: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        width: deviceWidth,
        height: deviceHeight,
        justifyContent: "center",
        alignItems: "center",
    },
});