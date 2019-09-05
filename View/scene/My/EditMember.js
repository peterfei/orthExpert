import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  Picker,
  TouchableOpacity,
  Platform,
  DeviceEventEmitter,
  ScrollView
} from "react-native";
import { screen, system } from "../../common";
import { color } from "../../widget";
import api from "../../api";
import { NavigationActions,StackActions } from "react-navigation";
import { storage } from "../../common/storage";
import { RadioGroup, RadioButton } from "react-native-flexi-radio-button";
import Toast, { DURATION } from "react-native-easy-toast";
import Loading from "../../common/Loading";
import DeviceInfo from "react-native-device-info";
import TitleBar from '../../scene/Home/TitleBar';

export default class EditMember extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      identityList: [],
      member: "",
      mbEmail: "",
      mbName: "",
      mbIdentity: 1,
      mbId: "",
      mbSex: "",
      selectedIndex: 0,
      token: "",
      mIndex: 0,
      title: '编辑资料'
    };
  }

  async saveMember() {
    this.Loading.show("正在保存...");

    let data = {
      mbSex: this.state.mbSex,
      mbName: this.state.mbName,
      mbIdentity: this.state.mbIdentity,
      mbId: this.state.mbId
    };
    console.log(data);
    const url = api.base_uri + "/v1/app/member/updateMemberInfo";
    let curr = this;
    try {
      let responseData = await fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          token: this.state.token
        },
        body: JSON.stringify(data)
      })
        .then(resp => resp.json())
        .then(result => {
          console.log(result);
          if (result.code == 0) {
            curr.Loading.close();
            this.refs.toast.show("保存成功");

            storage.save("memberInfo", "", result.member);
            let _this = this;

            setTimeout(function () {
              curr.props.navigation.goBack();
              DeviceEventEmitter.emit("reloadAboutUs", {});
            }, 1000);
            // storage.clearMapForKey("memberInfo");
          } else {
            curr.Loading.close();
            this.refs.toast.show("保存失败");
          }
        });
    } catch (error) {
      curr.Loading.close();
      this.refs.toast.show("网络错误");
    }
  }

  async componentWillMount() {
    let index = 2;
    this.onSelect = this.onSelect.bind(this);
    let tokens = await storage.get("userTokens");
    let memberInfo = await storage.get("memberInfo");
    if (memberInfo.mbSex == "man") {
      index = 0;
    } else if (memberInfo.mbSex == "woman") {
      index = 1;
    }
    // debugger
    this.setState({
      member: memberInfo,
      mbEmail: memberInfo.mbEmail,
      mbName: memberInfo.mbName,
      mbIdentity: memberInfo.mbIdentity,
      mbId: memberInfo.mbId,
      mbSex: memberInfo.mbSex,
      selectedIndex: index,
      token: tokens.token
    });

    //加载身份列表
    this.getAllIdentity();
  }

  getAllIdentity = async () => {
    const url = api.base_uri + "/v1/app/member/getAllIdentity?state=enabled";
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(resp => resp.json())
      .then(result => {
        console.log(result.List);
        for (let index = 0; index < result.List.length; index++) {
          // debugger;
          // const element = array[index];
          if (result.List[index].identityId == this.state.mbIdentity) {
            this.setState({
              mIndex: index
            });
            break;
          }
        }
        this.setState({
          identityList: result.List
        });
      });
  };

  onSelect(index, value) {
    this.setState({
      mbSex: value
    });
  }
  onSelectRole(index, value) {
    // debugger;
    this.setState({
      mbIdentity: value
    });
  }
  render() {
    return (
      <ScrollView style={styles.container}>
        <TitleBar title={this.state.title} navigate={this.props.navigation} />

        <View style={styles.head}>
          <Text style={styles.headTitle}>基本信息</Text>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>手机号码</Text>
          </View>
          <View style={styles.inputView}>
            <Text style={styles.text}>{this.state.member.mbTell}</Text>
          </View>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>电子邮箱</Text>
          </View>
          <View style={styles.inputView}>
            <Text style={styles.text}>{this.state.member.mbEmail}</Text>
          </View>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>注册时间</Text>
          </View>
          <View style={styles.inputView}>
            <Text style={styles.text}>{this.state.member.regTime}</Text>
          </View>
        </View>

        {/*   <View style={styles.input}>
                    <View style={styles.inputTitle}>
                        <Text style={styles.title}>绑定邮箱</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput placeholderTextColor={'#b3b3b3'} placeholder={'请输入邮箱'} style={styles.edit}
                                   defaultValue={this.state.member.mbEmail}
                                   onChangeText={text =>
                                       this.setState({
                                           mbEmail: text
                                       })
                                   }
                                   underlineColorAndroid='transparent'/>
                    </View>
                </View>*/}
        <View style={styles.head}>
          <Text style={styles.headTitle}>修改资料</Text>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>用户昵称</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              placeholderTextColor={"#b3b3b3"}
              placeholder={"请输入昵称"}
              style={styles.edit}
              defaultValue={this.state.member.mbName}
              onChangeText={text =>
                this.setState({
                  mbName: text
                })
              }
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>更换身份</Text>
          </View>
          <View style={styles.inputView}>
            <RadioGroup
              onSelect={(index, value) => this.onSelectRole(index, value)}
              selectedIndex={this.state.mIndex}
              style={{ flexDirection: "row", marginTop: 5, flexWrap: "wrap" }}>
              {this.state.identityList.map((item, index) => (
                <RadioButton value={item.identityId + ""} flex>
                  <Text style={{fontSize:14}}>{item.identityTitle}</Text>
                </RadioButton>
              ))}
            </RadioGroup>
          </View>
        </View>
        <View style={styles.input}>
          <View style={styles.inputTitle}>
            <Text style={styles.title}>性别</Text>
          </View>
          <View style={styles.inputView}>
            <RadioGroup
              onSelect={(index, value) => this.onSelect(index, value)}
              selectedIndex={this.state.selectedIndex}
              style={{ flexDirection: "row", marginTop: 5 }}>
              <RadioButton value={"man"} flex>
                <Text style={{fontSize:14}}>男</Text>
              </RadioButton>
              <RadioButton value={"woman"} flex>
                <Text style={{fontSize:14}}>女</Text>
              </RadioButton>
              <RadioButton value={"secret"} flex>
                <Text style={{fontSize:14}}>保密</Text>
              </RadioButton>
            </RadioGroup>
          </View>
        </View>
        <TouchableOpacity onPress={this.saveMember.bind(this)}>
          <View style={styles.textLoginViewStyle}>
            <Text style={styles.textLoginStyle}>保存</Text>
          </View>
        </TouchableOpacity>
        <Toast
          ref="toast"
          position="bottom"
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
        />
        <Loading
          ref={r => {
            this.Loading = r;
          }}
          hudHidden={false}
        />
      </ScrollView>
    );
  }

  //todo  弹出选择 性别控件
  showSex() {
    alert("1");
  }
}

const styles = StyleSheet.create({
  head: {
    backgroundColor: "#F4F4F4",
    height: 30
  },
  headTitle: {
    lineHeight: 30,
    paddingLeft: 10
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  edit: {
    height: 50,
    fontSize: 14,
    marginLeft: 10, //左右留出一定的空间
    marginRight: 10
  },
  text: {
    height: 50,
    fontSize: 14,
    marginLeft: 10, //左右留出一定的空间
    marginRight: 10,
    lineHeight: 50
  },
  input: {
    width: screen.width,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F4F4F4",
    borderStyle: "dotted",
    marginLeft: 10
  },
  inputTitle: {
    flex: 2
  },
  inputView: {
    flex: 5
  },
  title: {
    textAlign: "right",
    lineHeight: 50,
    fontSize: 14,
    color: "#909090"
  }, //登录按钮View样式
  textLoginViewStyle: {
    width: screen.width - 40,
    height: 40,
    backgroundColor: color.main,
    borderRadius: 20,
    marginTop: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  //登录Text文本样式
  textLoginStyle: {
    fontSize: 18,
    color: "white"
  }
});
