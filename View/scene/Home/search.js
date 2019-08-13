import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View,
  Dimensions, TouchableHighlight, TextInput, Image, TouchableOpacity, DeviceEventEmitter
} from 'react-native';
import { screen, system } from "../../common";
import UnityView, { UnityViewMessageEventData, MessageHandler } from 'react-native-unity-view';
import { size } from '../../common/ScreenUtil';
import { VoiceUtils } from "../../common/VoiceUtils";
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import { NavigationActions, StackActions } from "react-navigation";
import { groupBy, changeArr } from "../../common/fun";
import { queryHistoryAll, insertHistory, deleteHistories, queryRecentlyUse } from "../../realm/RealmManager";
import { values, set } from 'mobx';
import Loading from "../../common/Loading";
import Toast from "react-native-easy-toast";
import api from "../../api";
import historyData from "./History.json";
let unity = UnityView;
let index = 0;
import styles from './styles';

export default class SearchComponent extends Component {
  static navigationOptions = {
    header: null,
  }
  state = {
    search: false,
    allSearch: false,
    sourceData: '',
    hotData: '',
    historyData: '',
    linceList: '',
    key: '',
    currKeyName: '',
    currKeyId: '',
    keyData: '',
    showHotAndKey: true,
  }
  listeners = {
    update: DeviceEventEmitter.addListener("EnterNowScreen",
      ({ ...passedArgs }) => {
        let EnterNowScreen = passedArgs.EnterNowScreen
        let search = passedArgs.search
        if (EnterNowScreen == "closeAllsearch") {
          this.setState({
            allSearch: false
          })
        }
        if (EnterNowScreen == "showAllsearch") {
          this.setState({
            allSearch: true
          })
        }
        if(search==false){
          this.setState({
            search:false
          })
        }
      }
    )
  };
  componentWillMount() {
    //获取热词
    this.getHotKey();
    this.getHistory();
    //this.refreshDetail()
    // this.emitter = DeviceEventEmitter.addListener('queryStructRefresh',
    //   () => {
    //     this.refreshDetail();
    //     this.refs.toast.show("刷新成功");
    //   }
    // )
  }
  componentWillUnmount() {
    _.each(this.listeners, listener => {
      listener.remove();
    });
    this.timer && clearInterval(this.timer);
    if (this.emitter) {
      this.emitter.remove()
    }
  }
  async getHistory() {
    let arr = await queryHistoryAll();
    this.setState({
      historyData: changeArr(arr)
    })
  }
  async getHotKey() {

    //获取热门搜索数据
    let url = api.base_uri + "v1/app/pathology/getSearchHot?size=6";
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
      .then(result => {
        this.setState({
          hotData: result.pathologyList
        })
      })
    // let tokens = await storage.get("userTokens");
    // if (tokens != -1 && tokens) {
    //   let url = api.base_uri + "v1/app/struct/selectHotProduct?token=1";
    //   await fetch(url, {
    //     method: "get",
    //     headers: {
    //       "Content-Type": "application/json",
    //       token: tokens.token
    //     }
    //   }).then(resp => resp.json())
    //     .then(result => {

    //       this.setState({
    //         hotData: result.hotList
    //       })

    //     })
    // } else {
    //   Alert.alert("会话过期,请重新登录");
    //   setTimeout(
    //     function () {
    //       const resetAction = StackActions.reset({
    //         index: 0,
    //         actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
    //       });
    //       this.props.navigation.dispatch(resetAction);
    //     }.bind(this), 1000
    //   );
    // }

  }
  // async refreshDetail() {
  //   let that = this;
  //   let linceList = await getLinceList();
  //   that.setState({
  //     linceList: linceList
  //   });
  // }
  render() {
    return (
      <View style={{ position: 'absolute', width: screen.width }}>
        {this.state.allSearch ?
          <View style={{ width: screen.width }}>
            {!this.state.search ? this.renderTop() : this.searchScreen()}
          </View>
          : null
        }
        <Loading
          ref={r => {
            this.Loading = r;
          }}
          hudHidden={false}
        />
        <Toast style={{ backgroundColor: '#343434' }} ref="toast" opacity={1} position='top'
          positionValue={size(100)} fadeInDuration={750} textStyle={{ color: '#FFF' }}
          fadeOutDuration={1000} />
      </View>
    )
  }
  searchScreen() {
    return (
      <View style={styles.searchBackground}>
        <View style={[styles.top, { justifyContent: 'flex-start' }]}>
          <TouchableHighlight style={[styles.icon, { marginLeft: 10, marginRight: 10 }]}
            onPress={() => this.closeSearch()}>
            <Image style={styles.icon}
              source={require('../../img/public/left.png')} />
          </TouchableHighlight>
          <View style={{ width: "85%" }}>
            <TextInput
              style={[styles.input, { width: "100%" }]}
              placeholder="请输入病症名称"
              placeholderTextColor='#757575'
              autoFocus={true}
              onChangeText={(value) => this.queryKey(value)} />
            <TouchableHighlight style={styles.searchImg}
              onPress={() => this.searchStart()}>
              <Image style={styles.searchImgMain}
                source={require('../../img/search/search.png')} />
            </TouchableHighlight>
          </View>
        </View>
        <View style={{ width: '100%', padding: 10 }}>
          {this.state.showHotAndKey ?
            <View>
              {
                this.state.historyData.length !== 0 ?
                  <View>
                    <Text style={styles.histortTitle}>历史记录</Text>
                    <TouchableHighlight style={styles.deleteStyle}
                      onPress={() => this.deleteHistory()}>
                      <Image style={styles.searchImgMain}
                        source={require('../../img/search/delete.png')} />
                    </TouchableHighlight>
                    <View style={styles.histortMain}>
                      {this.renderHistory()}
                    </View>
                  </View> : null
              }

              <Text style={styles.histortTitle}>常见疾病</Text>
              <View style={styles.histortMain}>
                {this.renderHot()}
              </View>
            </View>
            : <View>
              {this.renderSeachBody()}
            </View>
          }
        </View>
      </View>
    )
  }
  searchStart() {
    // if (this.state.key == '' || this.state == undefined) {
    //   this.refs.toast.show("请输入搜索内容");
    // } else {
    let data = {
      "keyName": this.state.currKeyName,
      "keyId": this.state.currKeyId
    }
    if (this.state.currKeyId && this.state.currKeyId != '') {
      this.queryStruct(data, "key");
    } else {
      this.queryStruct(data, "not_key");
    }

    // }
  }
  deleteHistory() {
    this.setState({
      historyData: []
    })
    deleteHistories()
  }
  async queryStruct(data, type) {
    this.Loading.show("查询中...");
    //this.refs.textInput.blur();
    // let tokens = await storage.get("userTokens");
    // let url = api.base_uri + "v1/app/struct/getStructByKeyWord";
    this.saveHistory(data, type);

    this.Loading.close();
    // let params = {

    //     "keyName": data.keyName,
    //     "keyId": data.keyId,
    //     "type": type,
    //     "plat": Platform.OS,
    //     "appVersion": DeviceInfo.getVersion()

    // }

    // await fetch(url, {
    //     method: "post",
    //     headers: {
    //         "Content-Type": "application/json",
    //         token: tokens.token
    //     },
    //     body: JSON.stringify(params)
    // }).then(resp => resp.json())
    //     .then(result => {
    //         this.Loading.close();
    //         if (result.code == 0) {
    //             let currkey = "";
    //             let currKeyId = "";
    //             if (data.keyId != '' && data.keyId != undefined) {
    //                 currkey = data.keyName;
    //                 currKeyId = data.keyId;
    //             }
    //             if (result.keyId && result.keyId != '') {
    //                 currkey = data.keyName;
    //             }

    //             this.setState({
    //                 structData: groupBy(result.result, "parent_name").sort(compare("parent_sort")),
    //                 showStruct: true,
    //                 showKey: false,
    //                 showHot: false,
    //                 key: this.getKeyName(data.keyName),
    //                 currKeyName: currkey,
    //                 currKeyId: currKeyId,
    //                 btnTitle: "搜索"
    //             })
    //         }
    //     })

  }
  async queryKey(value) {
    try {
      if (value != '') {
        this.setState({
          key: value,
          currKeyName: value,
          showHotAndKey: false
        })
        // let tokens = await storage.get("userTokens");
        // let url = api.base_uri + "v1/app/struct/getLenovoKeyWord?key=" + value;

        // await fetch(url, {
        //   method: "get",
        //   headers: {
        //     "Content-Type": "application/json",
        //     token: tokens.token
        //   }
        // }).then(resp => resp.json())
        //   .then(result => {

        //     if (result.result) {
        //       this.setState({
        //         key: value,
        //         currKeyName: value,
        //         currKeyId: "",
        //         keyData: result.result,
        //         showHot: false,
        //         showKey: true,
        //         showStruct: false,
        //         btnTitle: "搜索"
        //       })
        //     }
        for (let i = 0; i < historyData.data.length; i++) {
          if (historyData.data[i].name == value) {
            let data = historyData.data[i]
            this.setState({
              key: value,
              currKeyName: value,
              currKeyId: data.id,
            })
          }
        }

        //   })

      } else {
        this.setState({
          // showHot: true,
          // showKey: true,
          // showStruct: false,
          keyData: [],
          showHotAndKey: true,
          //btnTitle: "取消"
        })
      }
    } catch (e) {

    }
  }
  renderHistory() {
    let arr = []
    for (let i = 0; i < this.state.historyData.length; i++) {
      let historyData = this.state.historyData[i]
      arr.push(
        <Text style={styles.histortBody} onPress={() => this.searchChicks(historyData.ketNo, historyData.keyName)}>{this.getKeyName(historyData.keyName)}</Text>
      )
    }
    return arr
  }
  renderSeachBody() {
    for (let i = 0; i < historyData.data.length; i++) {
      if (this.state.currKeyName == historyData.data[i].keyName) {
        return (
          <Text style={styles.histortBody} onPress={() => this.searchChick(historyData.data[i])}>{historyData.data[i].keyName}</Text>
        )
      }
    }
    return (
      <Text style={{ fontSize: 15, color: 'white', textAlign: "center", marginTop: 30 }}>没有找到相关结果,换个关键字试试哟~</Text>
    )
  }
  getKeyName(keyName) {
    if (keyName != '' && keyName != undefined) {
      return keyName.replace('#', '');
    } else {
      return "";
    }
  }

  searchChicks(pat_no, pat_name) {
    let data = { "keyName": pat_name, "ketNo": pat_no }
    this.saveHistory(data, "key")
    this.getHistory()
    this.props.pushRightMune(pat_no,"noImg")
    this.closeSearch()
  }
  saveHistory(data, type) {
    if ("key" == type) {
      let temp = {
        keyName: data.keyName,
        ketNo: data.ketNo + "",
        type: type,
        addTime: new Date().getTime()
      }
      insertHistory(temp)
    }
  }
  renderHot() {
    let arr = []
    for (let i = 0; i < this.state.hotData.length; i++) {
      arr.push(
        <Text style={styles.histortBody} onPress={() => this.searchChicks(this.state.hotData[i].pat_no, this.state.hotData[i].pat_name, this.state.hotData[i].pat_id)}>{this.state.hotData[i].pat_name}</Text>
      )
    }
    return arr
  }
  renderTop() {
    return (
      <View style={styles.body}>
        <View style={styles.top}>
          <TouchableHighlight
            onPress={() => this.My()}>
            <View style={[styles.button, { marginLeft: 10 }]}>
              <Image style={styles.icon}
                source={require('../../img/home/left.png')} />
              <Text style={styles.iconTitle}>我的</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={[styles.input, { paddingLeft: 0 }]}
            onPress={() => this.showSearch()}>
            <View>
              <TextInput
                style={{ width: '100%', height: '100%', paddingLeft: 30 }}
                placeholder="请输入病症名称"
                placeholderTextColor='#757575'
                editable={false} />
              <View style={styles.searchImg}>
                <Image style={styles.searchImgMain}
                  source={require('../../img/search/search.png')} />
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => this.Message()}>
            <View style={[styles.button, { marginRight: 10 }]}>
              <Image style={styles.icon}
                source={require('../../img/home/right.png')} />
              <Text style={styles.iconTitle}>消息</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
  showSearch() {
    this.setState({
      search: true
    })
    this.props.setSearch(true)
  }
  closeSearch() {
    this.setState({
      search: false,
      showHotAndKey: true
    })
    this.props.setSearch(false)
  }
  My() {
    this.props.navigation.navigate('MyScreen');
  }
  Message() {
    this.props.navigation.navigate('MessageNotice');
  }
}

