import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, BackHandler,
  StatusBar,
  Animated,
  TouchableHighlight, Image, TouchableOpacity, DeviceEventEmitter, ScrollView,

} from 'react-native';
import { deviceHeight, screen, system } from "../../common";
import SearchComponent from "./search";
import Details from "./details"
import UnityView, { UnityModule } from 'react-native-unity-view';
import api from "../../api";
import styles from './styles';
import Toast from "react-native-easy-toast";
import ImagePlaceholder from 'react-native-image-with-placeholder'
import _ from "lodash";
import LoadingView from '../../common/LoadingView.js'
import { size } from '../../common/ScreenUtil';
import { set } from 'mobx';
import Help from "./help";
import CodePush from "react-native-code-push"; // 引入code-push
import { NavigationActions, StackActions } from "react-navigation";
import { storage } from "../../common/storage";
import SplashScreen from "react-native-splash-screen";

export default class HomeScreen extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    getData: '',
    search: false,
    rightMenu: false,
    img: false,
    rightMenuData: '',
    fadeAnim: new Animated.Value(screen.width * 0.4),
    willCloseAnimated: false,
    reconfirm: false,
    EnterNowScreen: "isMainScreen",
    loading: true,
    isUnityReady: false,
    iArr: '',//有效i值,
    // showLoading: false,
    nowIndex: 0,//当前数据下标
    help: false,
    patNo: '',
    load_app_id: '',
    numImg: '',
    times: 0,
    unityHeight: screen.height,
    unityWith: screen.width
  }

  syncImmediate() {
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE, //启动模式三种：ON_NEXT_RESUME、ON_NEXT_RESTART、IMMEDIATE
        updateDialog: {
          appendReleaseDescription: true, //是否显示更新description，默认为false
          descriptionPrefix: "更新内容：", //更新说明的前缀。 默认是” Description:
          mandatoryContinueButtonLabel: "立即更新", //强制更新的按钮文字，默认为continue
          mandatoryUpdateMessage: "发现新版本，请确认更新", //- 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
          optionalIgnoreButtonLabel: "稍后", //非强制更新时，取消按钮文字,默认是ignore
          optionalInstallButtonLabel: "后台更新", //非强制更新时，确认文字. Defaults to “Install”
          optionalUpdateMessage: "发现新版本，是否更新？", //非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
          title: "更新提示" //要显示的更新通知的标题. Defaults to “Update available”.,
        }
      }
      // this._codePushDownloadDidProgress.bind(this)
    );
  }

  Animated() {
    Animated.timing(                  // 随时间变化而执行动画
      this.state.fadeAnim,            // 动画中的变量值
      {
        duration: 300,          // 让动画持续一段时间
        toValue: 0,                         // 动画结束变量值
        useNativeDriver: true
      }
    ).start();

  }
  AnimatedOver() {
    Animated.timing(                  // 随时间变化而执行动画
      this.state.fadeAnim,            // 动画中的变量值
      {
        duration: 300,          // 让动画持续一段时间
        toValue: screen.width * 0.4,                         // 动画结束变量值
        useNativeDriver: true
      }
    ).start();
  }
  onUnityMessage(handler) {
    if (this.state.EnterNowScreen == 'isMainScreen') {
      if (handler.name == "title") {  //只运行一次初始化判断
        this.setState({
          times: this.state.times + 1
        })
        if (this.state.times == 1) {
          SplashScreen.hide();
          this.setState({
            isUnityReady: true,
            // showLoading: false
          })
        } else {
          // this.setState({
          //   showLoading: false
          // })
        }
      }
      if (handler.name == "clickBlank") {
        this.closeRightMenu()
      }
      if (handler.data != null) {
        let boneDisease = this.hexToStr(handler.data.boneDisease)
        this.getPathologyAndArea(boneDisease)
        this.setState({
          rightMenu: true,
        })
      }
    }
    if (this.state.EnterNowScreen == 'isNotMainScreen') {
      //alert(JSON.stringify(handler))
      if (handler.name == 'help') {
        this.setState({
          help: true
        })
      }
      if (handler.data != null && handler.data.Note != null) {
        let boneDisease = this.hexToStr(handler.data.Note)
        let towScreenName = this.hexToStr(handler.data.Chinese)
        //alert(towScreenName)
        DeviceEventEmitter.emit("textData", { text: boneDisease });//传递简介
        DeviceEventEmitter.emit("towScreenName", { towScreenName: towScreenName });//传递骨名
      }
      if (handler.name == "ClickBlank") {
        DeviceEventEmitter.emit("textData", { text: "no" });//关闭简介
      }
      if (handler.name == "title") {
        //发送给detail Hide Loading
        DeviceEventEmitter.emit("hideLoading", { hide: true });
      }
      DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
      DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
    }
  }
  /**
     * 16进制转字符
     * */
  hexToStr(str) {
    let val = "";
    let arr = str.split("_");
    for (let i = 0; i < arr.length; i++) {
      val += String.fromCharCode(parseInt(arr[i], 16));
    }
    return val;
  }
  listeners = {
    update: DeviceEventEmitter.addListener("closeHomeModule",
      ({ ...passedArgs }) => {
        let closeBigImg = passedArgs.closeBigImg
        let onlyCloseBigImg = passedArgs.onlyCloseBigImg
        let closeUnity = passedArgs.closeUnity
        if (closeBigImg == true) {
          this.setState({
            img: false,
            isUnityReady: true
          })
        }
        if (closeBigImg == false) {
          // alert(111111)
          this.setState({
            img: true,
            isUnityReady: false
          })
          DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
        }
        if (onlyCloseBigImg == true) {
          this.setState({
            img: false,
          })
        }
        if (closeUnity == true) {
          this.setState({
            unityHeight: 0,
            unityWith: 0
          })
        }
        if (closeUnity == false) {
          this.setState({
            unityHeight: screen.height,
            unityWith: screen.width
          })
        }
      }
    ),
  };
  componentWillUnmount() {
    _.each(this.listeners, listener => {
      listener.remove();
    });
    this.timer && clearInterval(this.timer);
    BackHandler.removeEventListener("back", this.goBackClicked);
  }
  async componentWillMount() {

    CodePush.notifyAppReady(); //为避免警告
    //Unity 是否已加载
    this.setState({
      isUnityReady: await (UnityModule.isReady()),
      // showLoading: true
    })
    this.BackHandler()
    /**
     * 30秒后关闭Loading
     */
    // setTimeout(() => {
    //   this.setState({
    //     showLoading: false
    //   })
    // }, 5000)
  }
  BackHandler() {
    BackHandler.addEventListener("back", this.goBackClicked);
  }
  async componentDidMount() {
    let tokens = await storage.get("userTokens", "");
    if (tokens == -1 || tokens == -2) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
      });
      this.props.navigation.dispatch(resetAction);
    }
    await this.syncImmediate(); //开始检查更新
    if (await (UnityModule.isReady())) {
      // this.setState({
      //   showLoading: false
      // })
    }
  }
  /**
   * 点击物理回退键，
   * 修复闪退
   */
  goBackClicked = () => {
    this.props.navigation.goBack(null);
    this.details.clickBack('返回');
    if (this.state.rightMenu) {
      this.closeRightMenu()
    } else {
      this.refs.toast.show("再次点击退出");
      BackHandler.removeEventListener("back", this.goBackClicked);
      this.timer = setTimeout(
        () => this.reconfirm(), 1000
      );
    }
    return true;
  };
  reconfirm() {
    this.BackHandler()
  }
  render() {
    return (
      <View style={styles.container}>


        {/**
         * Hide the StatusBar on the top which some cellphone's
         * color always show White.
         * By peterfei.
         */}
        <StatusBar
          hidden={true}
        />
        <UnityView
          ref={(ref) => this.unity = ref}
          onUnityMessage={this.onUnityMessage.bind(this)}
          style={{
            width: this.state.unityWith,
            height: this.state.unityHeight + (Platform.OS == 'ios' ? 0 : size(35)),
            marginTop: 25

          }} />

        {/* 点击疾病后图片 */}
        {this.state.img && !this.state.search ? this.imgOpen() : null}

        {/* 底部详情 */}
        <Details ref={details => this.details = details} patNo={this.state.patNo} load_app_id={this.state.load_app_id} navigation={this.props.navigation} setScreen={(Screen) => this.setState({ EnterNowScreen: Screen })} setImg={() => this.setImg()}
          img={this.state.img}
          sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)} />
        {/* 顶部/搜索 */}
        {this.state.isUnityReady ? (
          <SearchComponent navigation={this.props.navigation}
            pushRightMune={(pat_no, img) => { this.showDetails(pat_no, img); this.setState({ numImg: "one" }) }}
            setSearch={(bool) => this.setSearchComponent(bool)}
          />
        ) : null}
        {/* 帮助按钮 */}
        {this.state.help ?
          <Help navigation={this.props.navigation}
            setHelp={(bool) => this.setHelp(bool)}
            sendMsgToUnity={(name, info, type) => this.sendMsgToUnity(name, info, type)} /> : null}
        {/* 右侧菜单及关闭按钮 */}
        {this.state.rightMenu && !this.state.search && this.state.rightMenuData.pathologyList != null ? this.MenuBody() : <View style={styles.place}></View>}
        {/* 提示组件 */}
        <Toast
          ref="toast"
          position="top"
          positionValue={200}
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
        />
        {/* <LoadingView showLoading={this.state.showLoading} /> */}
        <View style={{
          width: size(10),
          position: 'absolute',
          top: 0,
          height: size(10),
          backgroundColor: "rgba(0,0,0,0.2)",
          left: 0,
        }} />
      </View>
    );
  }
  /**
     * 发送消息给unity
     */
  sendMsgToUnity(name, info, type) {

    if (this.unity) {
      if (type == 'json') {
        let temp = Object.assign({}, info)
        this.unity.postMessageToUnityManager({
          name: name,
          data: JSON.stringify(temp)
        })
      } else {
        this.unity.postMessageToUnityManager({
          name: name,
          data: info
        })
      }
    }
  }
  async pushDetails(pat_no, img, num) { //获取单个疾病资源,包括底部菜单,图片,摄像机参数等
    this.setState({
      isUnityReady: false,
      patNo: pat_no
    })
    //获取搜索后数据
    let mbId = await storage.get("memberInfo");
    let url = api.base_uri + "v1/app/pathology/getPathologyRes?patNo=" + pat_no + "&business=orthope&mbId=" + mbId.mbId;

    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        // alert(JSON.stringify(result));
        this.setState({
          getData: result.pathology,
          load_app_id: result.pathology.app_id,
        }
          //, () => alert(JSON.stringify(result))
        )
      })
    if (img == "img") {
      this.setState({
        img: true,
        nowIndex: num
      }, () => { this.defaultLocation(num) }
      )
      DeviceEventEmitter.emit("EnterNowScreen", { EnterNowScreen: "closeAllsearch" });
    } else if (img == "noImg") {
      alert(111)

      this.setState({
        img: false,
      })


    }
    DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
    DeviceEventEmitter.emit("getData", { getData: this.state.getData });
  }
  async getPathologyAndArea(patAreaNo) {//点击区域获取右侧疾病数据
    let url = api.base_uri + "v1/app/pathology/getPathologyAndArea?patAreaNo=" + patAreaNo + "&business=orthope";
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          rightMenuData: result,
          iArr: ''//有效i值重置
        })
      })
  }
  setImg() {
    this.defaultLocation(this.state.nowIndex)
  }
  imgOpen() {
    let _that = this
    //alert(this.state.getData.img_url)
    if (this.state.numImg == "one") {
      return (
        <View style={styles.detailsImage}>
          <View style={{ marginTop: screen.height * 0.5, width: screen.width, height: screen.height, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', height: '70%', justifyContent: 'center', alignItems: 'center' }}>
              <ImagePlaceholder
                style={{ width: '100%', height: '100%' }}
                duration={500}
                // imageStyle={{ borderRadius:20 }}
                // placeholderStyle={{ borderRadius:20 }}
                // activityIndicatorProps={{
                //   size: 'large',
                //   color: 'green',
                // }}
                showActivityIndicator={false}
                src={this.state.getData.img_url}
              // placeholder='http://res.vesal.site/pathology/img/T_JBGK001.jpg'
              />
            </View>
          </View>
        </View>
      )
    }
    if (this.state.numImg == "more") {
      return (
        <View style={styles.detailsImage}>
          <ScrollView
            ref={component => this._scrollView = component}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={this.onScrollAnimationEnd.bind(_that)}
            style={{ width: screen.width, height: screen.height }}
          >
            {this.renderImg()}
          </ScrollView>
        </View>
      )
    }
  }
  defaultLocation(num) {
    if (num != null) {
      this.fristTime = setTimeout(() => {
        this._scrollView.scrollTo({ x: num * screen.width, y: 0, animated: false })
      }, 0)
    }
  }
  onScrollAnimationEnd(e) {
    let i = Math.floor(e.nativeEvent.contentOffset.x / (screen.width - 0.01));
    let num = this.state.iArr[i]
    this.pushDetails(this.state.rightMenuData.pathologyList[num].pat_no, "img", num)
  }
  MenuBody() {
    return (
      // <TouchableOpacity activeOpacity={1} style={{ width: '100%', height: '100%', position: 'absolute' }} >
      //[this.rightMenu(), this.rightMenuClose()]
      //</TouchableOpacity>
      <TouchableOpacity activeOpacity={1} style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: 'rgba(0,0,0,0.8)' }} onPress={() => this.closeRightMenu()} >
        <View>{this.rightMenu()}{this.rightMenuClose()}</View>
      </TouchableOpacity>
    )
  }
  renderImg() {
    let iArrs = []//有效i值
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      //判断数据第一个元素的i和最后一个元素的i
      iArrs.push(i)
      if (this.state.rightMenuData.pathologyList[i].img_url == null) { iArrs.pop() }
    }
    if (this.state.iArr == '') {
      this.setState({
        iArr: iArrs
      })
    }
    let fristiArr = iArrs[0]
    let lastiArr = iArrs[iArrs.length - 1]

    //遍历图片
    let arr = []
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      let src = this.state.rightMenuData.pathologyList[i].img_url !== null && this.state.rightMenuData.pathologyList[i].img_url !== '' ? this.state.rightMenuData.pathologyList[i].img_url : 'http://filetest1.vesal.site/image/slt/flowers-small.jpg'
      //alert(src)
      console.log(`========${src}`)
      arr.push(
        <View key={i} style={{ marginTop: screen.height * 0.5, width: screen.width, height: screen.height, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', height: '70%', justifyContent: 'center', alignItems: 'center' }}>
            <ImagePlaceholder
              style={{ width: '100%', height: '100%' }}
              duration={500}
              // imageStyle={{ borderRadius:20 }}
              // placeholderStyle={{ borderRadius:20 }}
              // activityIndicatorProps={{
              //   size: 'large',
              //   color: 'green',
              // }}
              src={src}
            // placeholder='http://res.vesal.site/pathology/img/T_JBGK001.jpg'
            />
          </View>
          {i != fristiArr ?
            <TouchableOpacity style={{ width: 50, height: 50, position: 'absolute', left: 15, top: '50%', transform: [{ translateY: -25 }], }}
              onPress={() => this.changeImg(i - 1)}>
              <Image style={{ height: 30, width: 30 }}
                source={require('../../img/unity/arrow_l.png')}
              />
            </TouchableOpacity>
            : null
          }
          {i != lastiArr ?
            <TouchableOpacity style={{ width: 50, height: 50, position: 'absolute', right: 0, top: '50%', transform: [{ translateY: -25 }], }}
              onPress={() => this.changeImg(i + 1)}>
              <Image style={{ height: 30, width: 30 }}
                source={require('../../img/unity/arrow_r.png')}
              />
            </TouchableOpacity>
            : null
          }
        </View>
      )
      if (
        !(this.state.nowIndex == i
          || this.state.nowIndex == i - 1
          || this.state.nowIndex == i + 1)
      ) {
        arr.pop()
        arr.push(
          <View key={i} style={{ marginTop: screen.height * 0.5, width: screen.width, height: screen.height, justifyContent: 'center', alignItems: 'center' }}>
          </View>
        )
      }
      if (this.state.rightMenuData.pathologyList[i].img_url == null) {
        arr.pop()
      }
    }
    // inRenderArr=false
    // arr.pop()
    // let lastArr =arr[arr.length-1]
    // arr.push(lastArr)
    return arr
  }
  changeImg(num) {
    this._scrollView.scrollTo({ x: num * screen.width, y: 0, animated: true })
    this.pushDetails(this.state.rightMenuData.pathologyList[num].pat_no, "img", num)
    // alert(num)
  }
  _onLoadEnd = () => {
    this.setState({
      loading: false
    })
  }
  closeImg() {
    this.setState({
      img: false
    })
    //DeviceEventEmitter.emit("DetailsWinEmitter", { details: true });
  }
  setSearchComponent(bool) {
    this.setState({
      search: bool
    })
    if (bool == false) {
      this.setState({
        rightMenu: bool,
        img: bool
      })
    }
    DeviceEventEmitter.emit("DetailsWinEmitter", { search: bool });
  }
  setHelp(bool) {
    this.setState({
      help: bool
    })
  }
  setDetailsComponent(bool) {
    this.setState({
      details: bool
    })
  }
  rightMenu() {
    let { fadeAnim } = this.state;
    this.Animated()
    if (this.state.willCloseAnimated) {
      this.AnimatedOver()
    }
    return (
      <Animated.View                 // 使用专门的可动画化的View组件
        style={{
          position: 'absolute',
          height: screen.height,
          right: 0,                 //  将位置指定为动画变量
          top: screen.height * 0.5,
          backgroundColor: 'rgba(0,0,0,1)',
          width: screen.width * 0.4,
          transform: [{ translateY: -screen.height * 0.5 }, { translateX: fadeAnim }],
          alignItems: 'center',
          borderRadius: 5,
          zIndex: 999,
        }} >
        <Text style={styles.boneName}>{this.state.rightMenuData.area.pat_name}</Text>
        <ScrollView>
          {this.renderRightMenuBody()}
        </ScrollView>
      </Animated.View>
    )
  }
  renderRightMenuBody() {
    let arr = []
    arr.push(
      <View style={{ width: 10, height: 8 }}></View>
    )
    for (let i = 0; i < this.state.rightMenuData.pathologyList.length; i++) {
      let sick = this.state.rightMenuData.pathologyList[i];
      arr.push(
        <Text style={styles.boneDisease} key={i}
          onPress={() => this.showDetailsRight(sick.pat_no, "img", i)}>
          {sick.pat_name}
        </Text>
      )
    }
    //alert(this.state.rightMenuData.pathologyList[1])
    arr.push(
      <View style={{ width: 10, height: 15 }}></View>
    )
    return arr
  }
  showDetailsRight(pat_no, img, i) {
    if (this.state.rightMenuData.pathologyList[i].img_url != null) {
      this.showDetails(pat_no, "img", i)
      this.setState({
        isUnityReady: false,
        numImg: "more"
      })
    } else {
      this.showDetails(pat_no, "img", i)//noImg
      this.setState({
        isUnityReady: false,  // true
        numImg: "more"
      })
    }
  }
  rightMenuClose() {
    let { fadeAnim } = this.state;
    this.Animated()
    if (this.state.willCloseAnimated) {
      this.AnimatedOver()
    }
    return (
      <Animated.View                 // 使用专门的可动画化的View组件
        style={{
          height: 40,
          width: 40,
          //borderRadius: 20,
          position: 'absolute',
          top: screen.height * 0.5,
          right: screen.width * 0.4 - 20,
          transform: [{ translateY: -20 }, { translateX: fadeAnim }],
          paddingLeft: 3,
          justifyContent: 'center'
        }
        } >
        <TouchableOpacity style={{ height: 40, width: 40 }} onPress={() => this.closeRightMenu()}>
          <View>
            <Image style={{ width: 25, position: 'absolute', left: -8, top: -44 }} resizeMode="contain"
              source={require('../../img/home/memuOne.png')} />
          </View>

        </TouchableOpacity>
      </Animated.View >
    )
  }

  showDetails(pat_no, img, num) {
    this.pushDetails(pat_no, img, num)
    this.setState({
      rightMenu: false,
      isUnityReady: false
    })
  }
  closeRightMenu() {
    this.setState({
      willCloseAnimated: true
    })
    this.timer = setTimeout(
      () => this.setState({
        rightMenu: false,
        willCloseAnimated: false
      }), 300
    );
  }
}