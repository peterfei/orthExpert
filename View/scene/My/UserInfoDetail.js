/**
 * Created by xzh on 13:33 2019-08-03
 *
 * @Description:
 */

import React from "react";
import {DeviceEventEmitter, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
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
import {storage} from "../../common/storage";
import SYImagePicker from 'react-native-syan-image-picker'
import {NavigationActions,StackActions} from "react-navigation";

export default class UserInfoDetail extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            getMemberInfo: {},
            photos: [],
            sexContent: '',
            identityContent: '',
            getMemberId: '',
            identityList: [],
            identityId: '',
            getImageUrl: '',
            modifyNickName: [{title: '昵称', content: '', type: 'input',}],
            sectionSexData: [{title: '性别', content: '', type: 'select',}],
            sectionIdentityData: [{title: '选择身份', content: '', type: 'select',}]
        };
        this.modifyPassword = [{title: '修改密码', content: 'kfModifyPassword', type: 'page'}];
    }

    async componentDidMount() {
        let memberInfo = await storage.get("memberInfo");
        this.getAllIdentity();
        this.setState({
            getMemberInfo: memberInfo,
            getMemberId: memberInfo.mbId,
            modifyNickName: [{title: '昵称', content: memberInfo.mbName, type: 'input'}],
            sectionSexData: [{title: '性别', content: memberInfo.mbSex, type: 'select'}],
            sectionIdentityData: [{title: '选择身份', content: memberInfo.identityTitle, type: 'select'}]
        })
    }

    async getAllIdentity() {
        const netInterface = NetInterface.getAllIdentity;
        HttpTool.GET(netInterface)
            .then(res => {
                if (res.code == 0) {
                    this.setState({
                        identityList: res.List
                    });
                } else {
                    this.mainView._toast(res.msg);
                }
            })
            .catch(err => {
                this.mainView._toast(JSON.stringify(err));
            })
    }

    async updateMemberInfo() {
        let memberInfo = this.state.getMemberInfo;
        let body = {
            mbName: memberInfo.mbName,
            mbSex: memberInfo.mbSex,
            mbIdentity: memberInfo.mbIdentity,
            identityTitle: memberInfo.identityTitle,
            mbHeadUrl: memberInfo.mbHeadUrl,
            mbId: this.state.getMemberId
        };
        // alert(JSON.stringify(body))
        const netInterface = NetInterface.updateMemberInfo;
        HttpTool.POST(netInterface, body)
            .then(async res => {
                if (res.code == 0) {
                    // alert("code==0" + JSON.stringify(res.member));
                    let memberInfo = res.member;
                    this.setState({
                        getMemberInfo: memberInfo,
                        getMemberId: memberInfo.mbId,
                        modifyNickName: [{title: '昵称', content: memberInfo.mbName, type: 'input'}],
                        sectionSexData: [{title: '性别', content: memberInfo.mbSex, type: 'select'}],
                        sectionIdentityData: [{title: '选择身份', content: memberInfo.identityTitle, type: 'select'}]
                    })
                    await storage.save("memberInfo", "", res.member);
                    DeviceEventEmitter.emit(AppDef.kNotify_UpdateUserInfoSuccess);
                }
            })
            .catch(
                err => {
                    this.mainView._toast(JSON.stringify(err));
                })
    }

    async logout() {
        await storage.clearMapForKey("userTokens");
        // await  storage.clearMapForKey("mystructList");
        // await storage.clearMapForKey("versionByInitMyStruct");
        // await storage.clearMapForKey("initMyStruct");
        await storage.clearMapForKey("memberInfo");
        await storage.clearMapForKey("memberCombo");
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: "LoginPage"})
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
            console.log('开启', err, photos);
            if (!err) {
                this.mainView._showLoading("正在上传...")
                HttpTool.UploadImg(photos)
                  .then(res => {
                      this.mainView._closeLoading();
                      if(res.code == 0){
                          let memberInfo = this.state.getMemberInfo;
                          memberInfo.mbHeadUrl = res.url;
                          this.updateMemberInfo();
                      }
                      this.setState({
                          getImageUrl: res.url
                      })
                  }).catch(err => {
                    console.log(JSON.stringify(err))
                })
            } else {
                console.log(err)
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
        this.updateMemberInfo();
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
                list = [{title: '男'}, {title: '女'}];
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
        this.updateMemberInfo();
    }

    _renderHeader() {
        let userIcon = this.state.getMemberInfo.mbHeadUrl ? {uri: this.state.getMemberInfo.mbHeadUrl} : require('../../img/kf_mine/defalutHead.png');
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
                           style={{width: size(80), height: size(80), marginLeft: size(40), borderRadius: size(40)}}/>
                    <Image source={require('../../img/kf_mine/mine_arrow.png')}
                           style={{width: size(14), height: size(23), marginRight: size(40)}}/>
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
            <View style={{marginLeft: size(40), marginRight: size(40), marginTop: size(80),}}>
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
                        <Text style={{color: AppDef.White, fontSize: size(32)}}>
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
                <NavBar title='个人资料' navigation={this.props.navigation}/>
                {this._renderHeader()}
                <Line height={size(14)}/>
                {this._renderNickName()}
                {this._renderSectionSex()}
                {this._renderSectionIdentity()}
                <Line height={size(14)}/>
                {this._renderModifyPassword()}
                <Line height={size(14)}/>
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