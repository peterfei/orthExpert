import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Button,
  DeviceEventEmitter,
  Platform
} from "react-native";
import StarRating from "react-native-star-rating";
import { screen, system,NetInterface, HttpTool } from "../../common";
import { RadioGroup, RadioButton } from "react-native-flexi-radio-button";
import Toast, { DURATION } from "react-native-easy-toast";
import Loading from "../../common/Loading";
import DeviceInfo from "react-native-device-info";
import { storage } from "../../common/storage";
import { color } from "../../widget";
import { NavigationActions,StackActions } from "react-navigation";
import TitleBar from '../../scene/Home/TitleBar';
import {size} from "../../common/ScreenUtil";

export default class showMessages extends Component {
  static navigationOptions = {
    header: null
  };

  async componentDidMount() {
    this.props.navigation.setParams({
      handleChangeType: this.onShowMessage
    });
    let memberInfo = await storage.get("memberInfo");
    if (memberInfo.mbEmail != "") {
      this.setState({
        phone: memberInfo.mbEmail
      });
    }
    if (memberInfo.mbTell != "") {
      this.setState({
        phone: memberInfo.mbTell
      });
    }
  }
  onShowMessage = () => {
    console.log(`=============`);
    DeviceEventEmitter.emit("ShowMessageEmmit", { name: "MessageBoards" });
  };
  // onShowMessage = () => {
  //   console.log(`=============`);
  //   this.props.navigation.navigate("showMessages");
  // };
  constructor(props) {
    super(props);
    this.state = {
      starCount: 5,
      content: "",
      onSelectedValue: "public",
      phone: "",
      title: '意见反馈'
    };
  }
  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    });
  }
  onSelect(index, value) {
    this.setState({
      onSelectedValue: value
    });
    console.log(`
      \n 选中的value ${value}
    `);
  }
  render() {
    return (
      <View style={styles.container}>
        <TitleBar title={this.state.title} navigate={this.props.navigation} />

        <TextInput
          style={{
            borderRadius: 4,
            margin: 10,
            fontSize: 20,
            borderColor: "#F4F4F4",
            borderWidth: 1,
            width: screen.width - 10
          }}
          defaultValue={this.state.phone}
          placeholder="请输入您的联系方式"
          underlineColorAndroid="transparent"
          onChangeText={text => this.setState({ phone: text })}
        />
        <TextInput
          style={{
            borderRadius: 4,
            margin: 10,
            fontSize: 20,
            borderColor: "#F4F4F4",
            borderWidth: 1,
            width: screen.width - 10
          }}
          placeholder="请输入您宝贵的意见!"
          multiline={true}
          height={120}
          underlineColorAndroid="transparent"
          onChangeText={text => this.setState({ content: text })}
        />
      {/*  <StarRating
          disabled={false}
          maxStars={5}
          emptyStar={"ios-star-outline"}
          fullStar={"ios-star"}
          halfStar={"ios-star-half"}
          iconSet={"Ionicons"}
          rating={this.state.starCount}
          fullStarColor={"red"}
          selectedStar={rating => this.onStarRatingPress(rating)}
        />*/}
        <View style={{ width: screen.width, flexDirection: "row" }}>
          <RadioGroup
            onSelect={(index, value) => this.onSelect(index, value)}
            selectedIndex={0}
          >
            <RadioButton value={"public"}>
              <Text>公开</Text>
            </RadioButton>
            <RadioButton value={"private"}>
              <Text>不公开</Text>
            </RadioButton>
          </RadioGroup>
        </View>
        <View style={{width:"100%"}}>
          <TouchableOpacity style={{width:"100%"}} onPress={this.onSaveMessage.bind(this)}>
            <View style={styles.textLoginViewStyle}>
              <Text style={styles.textLoginStyle}>提交</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Toast
          ref="toast"
          position="top"
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
      </View>
    );
  }
  onSaveMessage = async () => {

    let curr = this;
    console.log(`
      ============\n
      onSaveMessage
      \n===========
    `);
    let tokens = await storage.get("userTokens");
    console.log(`\n token is =====
       ${JSON.stringify(tokens)}
    `);
    if (this.state.phone == "" || this.state.phone == undefined) {
      this.refs.toast.show("请输入您的手机号/QQ/邮箱");
      return;
    }
    if (this.state.content != "") {
      curr.Loading.show("正在提交...");
      // 提交数据
      let deviceInfo = "手机型号:" + DeviceInfo.getModel() + ",品牌:" + DeviceInfo.getBrand() + ",手机版本:" + DeviceInfo.getSystemVersion() + ",维萨里软件版本:" + DeviceInfo.getVersion();
      let body={
        content: this.state.content,
        msgType: this.state.onSelectedValue,
        msgGrade: this.state.starCount,
        plat: Platform.OS,
        contact: this.state.phone,
        deviceInfo: deviceInfo,
        business:'orthope'
      }
      let url = NetInterface.gk_pushMsg;
      console.info("url is " + url);
      let responseData =HttpTool.POST_JP(url,body)
        .then(
          result => {
            // debugger;
            if (result.code == 0) {
              curr.Loading.close();
              this.refs.toast.show("反馈信息提交成功! ");
              let _this = this;
              setTimeout(function () {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: "NewHome"
                    })
                  ]
                });
                _this.props.navigation.dispatch(resetAction);
              }, 1000);

              // resolve && resolve(result.labelList);
            }
          },
          error => {
            curr.Loading.close();
            console.log("getTypeList error");
            // reject && reject(error);
          }
        );
    } else {
      this.refs.toast.show("反馈信息内容为空");
    }
  };
}
const styles = StyleSheet.create({
  container: {
    // marginTop: 10,
    color: "white",
    backgroundColor: "white",
    // flex: 1,
    // justifyContent: "center"
    alignItems: "center",
    height: screen.height
  },
  textLoginViewStyle: {
    width:'50%',
    height: size(100),
    backgroundColor: color.main,
    borderRadius: size(100),
    marginTop: size(90),
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  //登录Text文本样式
  textLoginStyle: {
    fontSize: size(30),
    color: "white"
  }
});
