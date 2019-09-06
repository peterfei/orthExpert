import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Platform,AppState,Modal,ImageBackground,ScrollView} from "react-native";
import {AppDef, BaseComponent, ContainerView, FuncUtils, HttpTool, NavBar, NetInterface, size, isIPhoneXPaddTop, ImageMapper} from '../../common';
import api from "../../api";
import {deviceWidth,deviceHeight} from "../../common/ScreenUtil";
import SplashScreen from "react-native-splash-screen";
import {storage} from "../../common/storage";
import {NavigationActions, StackActions} from "react-navigation";
import CodePush from "react-native-code-push"; // 引入code-push
import Progress from '../../common/ProgressBar'
import Icon from '../../common/Icon'
const DefaultColor = 'rgba(68, 180, 233, 0.5)';
const DefaultLineColor = 'rgba(68, 180, 233, 1)';
const SelectColor = 'rgba(231, 176, 176, 0.5)';
const SelectLineColor = 'rgba(231, 176, 176, 1)';
const statusBarHeight = StatusBar.currentHeight;
const CODE_PUSH_KEY = 'q4YE8sCIJ4Xepd6gaJA1qWTza76x4ksvOXqog'

class Custom extends BaseComponent {

  constructor(props) {
    super(props);

    this.MAPPING = []

    this.state = {
      color: null,
      tabNames: [],
      zhengmian: false,
      selectId: '',
      MAPPING: this.MAPPING,
      title:'方案', //props.navigation.state.params.title,
      sickData: [],
      areaSickList: [],
      modalVisible: false,
      isMandatory: false,
      immediateUpdate: false,
      updateInfo: {}
    }
    this.currProgress = 0.0
    this.syncMessage = ''
  }

  async checkLoginStatus() {
    let tokens = await storage.get("userTokens");
    
    let status = false;
    if (!(tokens == -1 || tokens == -2)) { // 有token
      if (tokens.member.isYouke == "yes") { // 游客
        
        status = false;
      } else {
        status = true;
      }
    } else {
      status = false;
    }

    if (!status) {
      this.gotoLogin();
    }
  }
  
  gotoLogin() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
    });
    this.props.navigation.dispatch(resetAction);
  }

  _immediateUpdate() {
    this.setState({immediateUpdate: true})
    CodePush.sync(
        {deploymentKey: CODE_PUSH_KEY, updateDialog: {
          appendReleaseDescription: true, //是否显示更新description，默认为false
          descriptionPrefix: "更新内容：", //更新说明的前缀。 默认是” Description:
          mandatoryContinueButtonLabel: "立即更新", //强制更新的按钮文字，默认为continue
          mandatoryUpdateMessage: "发现新版本，请确认更新", //- 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
          optionalIgnoreButtonLabel: "稍后", //非强制更新时，取消按钮文字,默认是ignore
          optionalInstallButtonLabel: "后台更新", //非强制更新时，确认文字. Defaults to “Install”
          optionalUpdateMessage: "发现新版本，是否更新？", //非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
          title: "更新提示"
        }, installMode: CodePush.InstallMode.IMMEDIATE},
        this.codePushStatusDidChange.bind(this),
        this.codePushDownloadDidProgress.bind(this)
    )
    
  }

  syncImmediate() {
    // this.setState({modalVisible: true})
    //     setTimeout(()=>{
    //       this.setState({modalVisible: false})
    //     },8000)
    CodePush.checkForUpdate(CODE_PUSH_KEY).then((update) => {
      // console.log('-------' + update)
      if (!update) {
        this.mainView._toast('目前已是最新版本！')
      } else {
        this.setState({modalVisible: true, updateInfo: update, isMandatory: update.isMandatory})
        setTimeout(()=>{
          this.setState({modalVisible: false})
        },8000)
      }
    })
  }

  codePushDownloadDidProgress(progress) {
    if (this.state.immediateUpdate) {
      this.currProgress = parseFloat(progress.receivedBytes / progress.totalBytes).toFixed(2)
      if(this.currProgress >= 1) {
        this.setState({modalVisible: false})
      } else {
        this.refs.progressBar.progress = this.currProgress
      }
      
    }
  }

  codePushStatusDidChange(syncStatus) {
    if (this.state.immediateUpdate) {
      switch(syncStatus) {
        case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
          this.syncMessage = 'Checking for update'
          break;
        case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
          this.syncMessage = 'Downloading package'
          break;
        case CodePush.SyncStatus.AWAITING_USER_ACTION:
          this.syncMessage = 'Awaiting user action'
          break;
        case CodePush.SyncStatus.INSTALLING_UPDATE:
          this.syncMessage = 'Installing update'
          break;
        case CodePush.SyncStatus.UP_TO_DATE:
          this.syncMessage = 'App up to date.'
          break;
        case CodePush.SyncStatus.UPDATE_IGNORED:
          this.syncMessage = 'Update cancelled by user'
          break;
        case CodePush.SyncStatus.UPDATE_INSTALLED:
          this.syncMessage = 'Update installed and will be applied on restart.'
          break;
        case CodePush.SyncStatus.UNKNOWN_ERROR:
          this.syncMessage = 'An unknown error occurred'
          Toast.showError('更新出错，请重启应用！')
          this.setState({modalVisible: false})
          break;
      }
    }
  }

  renderModal() {
    return (
        <Modal
            animationType={"none"}
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible:false})
            }}>
          <View style={styles.modal}>
            <View style={styles.modalContainer}>
              {
                   !this.state.immediateUpdate ?
                   <View>
                     <ImageBackground style={{width: size(550),height:size(732)}} source={require('../../img/home/update_backgroundImg.png')}>
                     <View>
                       <Text style={{color:"#5E5E5E", fontWeight: "bold", fontSize:size(42), marginTop:size(280), marginLeft:size(40)}}>更新内容</Text>
                       <View style={{marginTop:size(15),height:size(220),marginLeft:size(40),marginRight:size(40)}}>
                         <ScrollView style={{flex: 1}}   showsVerticalScrollIndicator={false}>
                           <Text style={{fontSize:size(28),lineHeight:size(30),color:'#282828'}}>{this.state.updateInfo.description}</Text>
                         </ScrollView>
                       </View>
                       <Text style={{color:'#282828',textAlign:'center',fontSize:size(22),marginBottom:size(10)}}>wifi情况下更新不到30秒</Text>
                       {
                         !this.state.isMandatory ?
                             <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                               <TouchableOpacity style={{width: size(230), height: size(80),
                                   backgroundColor: "#f4f4f4",justifyContent:'center',alignItems:'center',borderRadius:size(10)}}
                                                 onPress={() => this.setState({modalVisible: false})}>
                                 <Text style={{color:'#000'}}>残忍拒绝</Text>
                               </TouchableOpacity>
                               <TouchableOpacity
                                   onPress={() => this._immediateUpdate()}
                                   style={{width: size(230), height: size(80),
                                       backgroundColor: "#489ef6",justifyContent:'center',alignItems:'center',borderRadius:size(10)}}>
                                 <Text style={{color: '#fff'}}>极速下载</Text>
                               </TouchableOpacity>
                             </View>
                             :
                               <TouchableOpacity onPress={() => this._immediateUpdate()}>
                                 <View style={{height: 40,marginRight:size(75), justifyContent:'center',
                                     alignItems:'center',backgroundColor:'#3496FA',marginLeft:size(75),borderRadius:size(10)}}>
                                   <Text style={{color: '#fff',fontSize: 17,fontWeight: 'bold'}}>立即更新</Text>
                                 </View>
                               </TouchableOpacity>
                       }
                     </View>
                     </ImageBackground>
                   </View> :
                   <View>
                     <ImageBackground style={{width: size(550),height:size(732)}} source={require('../../img/home/update_backgroundImg.png')}  />
                     <View style={{justifyContent:'center',alignItems:'center'}}>
                       <Progress
                           ref="progressBar"
                           progressColor={'#89C0FF'}
                           style={{
                             marginTop:size(-500),
                             height: 10,
                             width: size(400),
                             backgroundColor: "#3496FA",
                             borderRadius: 10,
                           }}
                       />
                       <View style={{alignItems: "center", marginVertical: 20}}>
                         <Text style={{fontSize: 14, color:"gray"}}>版本正在努力更新中，请等待</Text>
                       </View>
                     </View>
                   </View>
              }
            </View>
          </View>
        </Modal>
    )
  }

  componentWillUnmount() {
    
    // AppState.removeEventListener("change", this._handleAppStateChange);
  }

  componentWillMount = () => {
    CodePush.disallowRestart()
    this.syncImmediate()
    
  };

  _handleAppStateChange = nextAppState => {
    if (nextAppState != null && nextAppState === "active") {
      
      CodePush.checkForUpdate(CODE_PUSH_KEY).then((update) => {
        if (!update) {
          // this.mainView._toast('已是最新版本！')
          this.setState({modalVisible: false})
        } else {
          this.setState({modalVisible: true, updateInfo: update, isMandatory: update.isMandatory})
        }
      })

    } else if (nextAppState != null && nextAppState === "background") {
    }
    
  };

  async componentDidMount() {
    CodePush.allowRestart()
    SplashScreen.hide();
    // AppState.addEventListener("change", this._handleAppStateChange);
    this.getSickData()
  }

  getSickData() {
    const url = NetInterface.getSick;
    this.mainView._showLoading('加载中');
    HttpTool.GET_JP(url)
      .then(res => {
        this.mainView._closeLoading();
        if (res.code == 0) {
          let sickData = FuncUtils.groupBy(res.sickList, "label_a");
          this.setState({
            sickData: sickData
          })
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(error));
      })
  }

  fanzhuan() {
    this.setState({
      zhengmian: !this.state.zhengmian
    })
  }

  selectArea(item, index) { // 选择了某个部位

    this.checkLoginStatus();

    this.setState({
      selectId: item.id
    }, () => {
      this.MAPPING.forEach((option) => {
        if (option.id == this.state.selectId) {
          option.prefill = SelectColor;
          option.lineColor = SelectLineColor;
        } else {
          option.prefill = DefaultColor;
          option.lineColor = DefaultLineColor;
        }
      })
      this.setState({
        MAPPING: this.MAPPING
      });
      //查询区域下的疾病
      this.getAreaPathology(item);
    })
  }

  async getAreaPathology(item) {  //获取区域下疾病
    const url = NetInterface.getSickArea + '?patAreaNo=' + item.pat_area_no + "&business=orthope";
    // let url = api.base_uri + "v1/app/pathology/getPathologyAndArea?patAreaNo=" + item.pat_area_no + "&business=orthope";
    this.mainView._showLoading('加载中');
    HttpTool.GET_JP(url)
      .then(result => {
        this.mainView._closeLoading();
        let sickList = result.pathologyList;
        sickList.forEach(item => {
          item['title'] = item.pat_name;
        })
        this.setState({
          areaSickList:sickList,
          currArea:item
        })
        if (sickList.length <= 0) {
          this.mainView._toast('此部位暂无疾病内容.');
        } else {
          this.mainView._showSelectDialog('sick', sickList, 'Default', item.pat_name);
        }
      })
      .catch(error => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(error));
      })
  }

  recieveSelectResult(result) {
    let sick = result.value;
    this.props.navigation.navigate('SickDetail', {sick: sick, areaSickList: this.state.areaSickList, currArea: this.state.currArea});
  }

  getImgMap(value) {
    let result = [];
    for (let i = 0; i < value.length; i++) {

      let item = Object.assign({}, value[i]);
      item['shape'] = "circle";
      item['radius'] = size(58);
      item['prefill'] = DefaultColor;
      item['lineColor'] = DefaultLineColor;
      item['x1'] = size(item.x1);
      item['y1'] = size(item.y1);
      item['name'] = item.pat_name;
      item['id'] = item.pat_area_id;

      if (!this.state.zhengmian) {
        if (item.front_back == 'front') {
          result.push(item);
        }
      } else if (this.state.zhengmian) {
        if (item.front_back == 'back') {
          result.push(item);
        }
      }
    }
    return result;
  }

  _renderNav() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={[styles.messageView, {marginLeft: size(30)}]} onPress={() => {
          this.checkLoginStatus();
          this.props.navigation.navigate('MyScreen')
        }}>
          <Image source={require('../../img/home/sick_l.png')} style={styles.messageLeftIcon}/>
        </TouchableOpacity>
        <StatusBar translucent={true}  backgroundColor='rgba(0, 0, 0, 0)' barStyle="light-content" />
        <View style={{flex: 1, backgroundColor: 'white', height: size(60), marginLeft: size(20), marginRight: size(20), borderRadius: size(30), overflow: 'hidden'}}>
          <TouchableOpacity style={styles.searchBar} onPress={() => {
            this.checkLoginStatus();
            this.props.navigation.navigate('Search');
          }}>
            <Image source={require('../../img/home/search_icon.png')} style={styles.searchIcon}/>
            <Text style={styles.searchText}>请输入疾病名称.</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.messageView, {marginRight: size(30)}]} onPress={() => {
          this.checkLoginStatus();
          this.props.navigation.navigate('MessageNotice');
        }}>
          <Image source={require('../../img/home/sick_r.png')} style={styles.messageRightIcon}/>
        </TouchableOpacity>
      </View>
    )
  }

  _renderSubPage() {
    let tabArr = this.state.sickData;
    let arr = [];
    for (let i = 0; i < tabArr.length; i++) {
      arr.push(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ImageMapper
            imgHeight={size(787)}
            imgWidth={size(475)}
            imgSource={this.state.zhengmian ? require('../../img/kf_main/human_zheng.png') : require('../../img/kf_main/human_fan.png')}
            imgMap={this.getImgMap(tabArr[i].value)}
            onPress={(item, idx, event) => {
              this.selectArea(item, idx)
            }}
            containerStyle={styles.mapper}
            selectedAreaId="my_area_id"
            multiselect={true}
          />
          <View style={{
            position: 'absolute',
            left: 0,
            bottom: size(180),
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {
              this.fanzhuan()
            }}>
              <Image source={require('../../img/kf_main/fanzhuan_l.png')}
                     style={{width: size(84), height: size(74), marginLeft: size(110)}}/>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={1} onPress={() => {
              this.fanzhuan()
            }}>
              <Image source={require('../../img/kf_main/fanzhuan_r.png')}
                     style={{width: size(84), height: size(74), marginRight: size(110)}}/>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return arr;
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r} selectDialogAction={(result) => {
        this.recieveSelectResult(result)
      }}>
        {this._renderNav()}
        {this._renderSubPage()}
        {this.renderModal()}
      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'android' ? size(148) :  size(88) + isIPhoneXPaddTop(0),
    paddingTop: isIPhoneXPaddTop(0) +  ( Platform.OS === 'android' ? statusBarHeight : 0),
    flexDirection: "row",
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#00BDF1'
  },
  searchBar: {
    height: size(60),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginLeft: size(30),
    width: size(28),
    height: size(28)
  },
  topBackground: {
    height: size(280)
  },
  searchText: {
    fontSize:size(24),
    color: 'rgba(222, 222, 222, 1)',
    marginLeft: size(20),
  },
  messageView: {
    alignItems: "center",
    justifyContent: 'center',
    width: size(60),
    height: size(60),
  },
  messageLeftIcon: {
    width: size(40),
    height: size(46),
  },
  messageRightIcon: {
    width: size(44),
    height: size(42),
  },
  mapper: {
    width: size(475),
    height: size(787),
    backgroundColor: AppDef.White,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modal: {
    height:deviceHeight,
    width: deviceWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  modalContainer: {
    marginHorizontal: 60,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  }

})

export default  CodePush(Custom)