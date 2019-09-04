import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View, StatusBar, Platform} from "react-native";
import {AppDef, BaseComponent, ContainerView, FuncUtils, HttpTool, NavBar, NetInterface, size, isIPhoneXPaddTop, ImageMapper} from '../../common';
import api from "../../api";
import {deviceWidth} from "../../common/ScreenUtil";
import SplashScreen from "react-native-splash-screen";
import {storage} from "../../common/storage";
import {NavigationActions, StackActions} from "react-navigation";

const DefaultColor = 'rgba(68, 180, 233, 0.5)';
const DefaultLineColor = 'rgba(68, 180, 233, 1)';
const SelectColor = 'rgba(231, 176, 176, 0.5)';
const SelectLineColor = 'rgba(231, 176, 176, 1)';
const statusBarHeight = StatusBar.currentHeight;

export default class Custom extends BaseComponent {

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
      areaSickList: []
    }
  }

  async componentDidMount() {

    SplashScreen.hide();
    let tokens = await storage.get("userTokens", "");
    if (tokens == -1 || tokens == -2) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "LoginPage" })]
      });
      this.props.navigation.dispatch(resetAction);
    } else {
      this.getSickData()
    }
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
    let url = api.base_uri + "v1/app/pathology/getPathologyAndArea?patAreaNo=" + item.pat_area_no + "&business=orthope";
    this.mainView._showLoading('加载中');
    await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(resp => resp.json())
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
        <TouchableOpacity style={[styles.messageView, {marginLeft: size(30)}]} onPress={() => {this.props.navigation.navigate('MyScreen')}}>
          <Image source={require('../../img/home/sick_l.png')} style={styles.messageLeftIcon}/>
        </TouchableOpacity>
        <StatusBar translucent={true}  backgroundColor='rgba(0, 0, 0, 0)' barStyle="light-content" />
        <View style={{flex: 1, backgroundColor: 'white', height: size(60), marginLeft: size(35), marginRight: size(35), borderRadius: size(30), overflow: 'hidden'}}>
          <TouchableOpacity style={styles.searchBar} onPress={() => {alert('中间搜索');}}>
            <Image source={require('../../img/home/search_icon.png')} style={styles.searchIcon}/>
            <Text style={styles.searchText}>请输入疾病名称</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.messageView, {marginRight: size(30)}]} onPress={() => {this.props.navigation.navigate('MessageNotice')}}>
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
  }
})