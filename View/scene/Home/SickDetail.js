/**
 * Created by xzh on 11:29 2019-09-03
 *
 * @Description:
 */

import React from "react";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Text, ImageBackground ,DeviceEventEmitter} from "react-native";
import {
  BaseComponent,
  ContainerView,
  NavBar,
  Line,
  size,
  screen, deviceWidth, AppDef,FuncUtils,NetInterface, HttpTool
} from '../../common';
import { storage } from "../../common/storage";
import Video from 'react-native-af-video-player';
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';

export default class SickDetail extends BaseComponent {


  constructor(props) {
    super(props);
    let selectIndex = this.findSickIndex();
    this.state = {
      currArea: props.navigation.state.params.currArea, // 当前疾病所在区域
      selectIndex: selectIndex,        // 当前疾病在  疾病列表 中的下标
      sick: props.navigation.state.params.sick, // 当前疾病
      areaSickList: props.navigation.state.params.areaSickList,  // 从上个页面查出来的所有疾病
      menus: [],           // 当前疾病的所有按钮数据
      selectBtnIndex: -1,  // 当前底部选中的按钮
      selectImgIndex: 0,   // 当前页面显示的疾病对应的图片
      showSourceType: 'img', // 当前显示的内容类型  img 图片  video播放视频  videoList 视频列表
      playVideoUrl: '',    // 当前播放的视频的url
      details: '',  //当前疾病所有数据
    }
  }

  componentDidMount() {
    this.requestSickData();
      this.emitter = DeviceEventEmitter.addListener('updatePermission',
          () => {
              FuncUtils.checkKfPerm()
          }
      )
  }

  componentWillUnmount(){
    this.emitter.remove()
  }

  findSickIndex() {
    let sick = this.props.navigation.state.params.sick;
    let areaSickList = this.props.navigation.state.params.areaSickList;
    for (let i = 0; i < areaSickList.length; i++) {
      if (areaSickList[i].pat_no === sick.pat_no) {
        return i
      }
    }
  }

  async requestSickData() {
    let memberInfo = await storage.get("memberInfo");
    let sick = this.state.sick;
    let url = NetInterface.gk_getPathologyRes + "?patNo=" + sick.pat_no + "&business=orthope&mbId=" + memberInfo.mbId
    this.mainView._showLoading('加载中...');
    HttpTool.GET_JP(url)
      .then(result => {
        // alert(JSON.stringify(result))
        this.mainView._closeLoading();
        if (result.msg == 'success' && result.code == 0) {
          let pathology = result.pathology;
          let menus = JSON.parse(pathology.menus);
          let kf = {
            res_fy_icon_url: require('../../img/home/kangfu_d.png'),
            select_icon_url: require('../../img/home/kangfu_s.png'),
            secondFyName: '康复',
            type: 'static'
          }
          let model = {
            res_fy_icon_url: require('../../img/home/model_d.png'),
            select_icon_url: require('../../img/home/model_s.png'),
            secondFyName: '3D模型',
            type: 'static'
          }
          menus.push(kf);
          menus.push(model);
          this.setState({
            menus: menus,
            selectBtnIndex: -1,
            details: result
          })
          // alert(JSON.stringify(menus));
        }
      })
      .catch(err => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(err));
      })
  }

  changeImg(type) {
    let index;
    if (type) { // next
      index = this.state.selectImgIndex + 1;
    } else { // perious
      index = this.state.selectImgIndex - 1;
    }
    let sick = this.state.areaSickList[index];
    this.setState({
      selectImgIndex: index,
      sick: sick
    }, () => {
      this._scrollView.scrollTo({ x: this.state.selectImgIndex * size(510), y: 0, animated: true });
      this.requestSickData();
    })
  }

  onScrollAnimationEnd(e) {
    let i = Math.floor(e.nativeEvent.contentOffset.x / size(508));
    let sick = this.state.areaSickList[i];
    this.setState({
      selectImgIndex: i,
      sick: sick
    }, () => {
      this.requestSickData();
    })
  }

  closeVideo() {
    this.setState({
      selectBtnIndex: -1,
      showSourceType: 'img',
      playVideoUrl: ''
    })
  }

  selectBtn(index) {
    let msg = {
      "struct_version": "1",
      "app_type": "medical",
      "app_version": "1",
      "ab_path": "http://fileprod.vesal.site/upload/unity3D/android/zip/medical/v330/RA0801014.zip",
      "youke_use": "disabled",
      // "cate_id": 42,
      "platform": "android",
      "first_icon_url": "http://fileprod.vesal.site/upload/unity3D/android/img/medical/v240/v2/RA0801014.png",
      "visible_identity": null,
      "is_charge": "yes",
      "ab_list": null,
      "struct_id": 606,
      // "struct_name": "颈部",
      "struct_sort": null,
      "noun_id": null,
      "struct_code": this.state.details.pathology.load_app_id,
      "app_id": `${this.state.details.pathology.load_app_id}_GK`,
      "showModelList": this.state.details.pathology.open_model
    }
    if (this.state.selectBtnIndex === index) {
      this.setState({
        selectBtnIndex: -1,
        showSourceType: 'img',
        playVideoUrl: ''
      })
    } else {

      let menuBtn = this.state.menus[index];
      if (menuBtn.type == 'zhiliao') {
        this.setState({
          showSourceType: 'videoList',
          selectBtnIndex: index
        })
      }

      if (menuBtn.type == 'video') {

        this.setState({
          showSourceType: 'video',
          selectBtnIndex: index,
          playVideoUrl: menuBtn.content
        })
      }

      if (menuBtn.type == 'static') { //static 跳转unity 或者 跳转康复
        if (menuBtn.secondFyName == '康复') {
          // alert(JSON.stringify(this.state.currArea))
          this.props.navigation.navigate('Recovery', { patNo: this.state.sick.pat_no, sick: this.state.sick, currArea: this.state.currArea });
        } else {
          this.props.navigation.navigate('BonesScene', { info: msg });
          this.setState({
            selectBtnIndex: -1,
          })
          return
        }
      }
    }
  }

  _renderContent() {
    if (this.state.showSourceType == 'videoList') { // 视频列表
      return (
        this._renderVideoList()
      )
    } else if (this.state.showSourceType == 'video') { // 视频播放
      return (
        this._renderVideo()
      )
    } else {
      return (
        this._renderImages()
      )
    }

  }

  _renderVideoList() {
    let arr = [];
    let menuBtn = this.state.menus[this.state.selectBtnIndex];
    let videoList = JSON.parse(menuBtn.content);
    let width = (screen.width - size(75)) / 2;
    videoList.forEach((item, index) => {

      arr.push(
        <TouchableOpacity style={{ marginBottom: size(30) }} onPress={() => {
          this.setState({
            playVideoUrl: item.url,
            showSourceType: 'video'
          })
        }}>
          <ImageBackground
            source={{ uri: item.img }}
            style={{ width: width - 1, height: size(210), marginRight: size(25), marginBottom: size(20), justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../../img/home/video.png')} style={{ width: size(78), height: size(78) }} />
          </ImageBackground>
          <Text style={{ color: AppDef.Black, fontSize: size(24), width: width, }}>{item.name}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1, marginLeft: size(25), marginTop: size(30) }}>
          {arr}
        </View>
      </ScrollView>
    );
  }

  _renderVideo() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Video
          autoPlay
          scrollBounce
          volume={0.8}
          inlineOnly
          style={{ width: screen.width, height: screen.height }}
          url={this.state.playVideoUrl}
          ref={(ref) => {
            this.video = ref
          }}
          onError={(msg) => {
            this.playVideoError(msg)
          }}
        />
        <MyTouchableOpacity style={{
          position: 'absolute',
          height: size(60),
          width: size(60),
          left: 10,
          top: 27,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 9999999999,
        }} onPress={() => { this.closeVideo() }}>
          <Image source={require('../../img/unity/close.png')} style={{
            width: 25,
            height: 25,
            resizeMode: 'contain'
          }} />
        </MyTouchableOpacity>
      </View>
    )
  }

  _renderImages() {

    let arr = [];
    if (this.state.areaSickList[0].img_url) {
      this.state.areaSickList.forEach((item, index) => {
        arr.push(
          <View style={{ width: size(510), height: size(850) }}>
            <Image
              style={{ width: size(510), height: size(850) }}
              source={{ uri: item.img_url }}
            />
          </View>
        )
      })
    }else if(this.state.details){
      arr.push(
        <View style={{ width: size(510), height: size(850) }}>
          <Image
            style={{ width: size(510), height: size(850) }}
            source={{ uri: this.state.details.pathology.img_url }}
          />
        </View>
      )
    }

    let isFirst = this.state.selectImgIndex == 0 ? true : false;
    let isLast = this.state.selectImgIndex == this.state.areaSickList.length - 1 ? true : false;

    let periousImg = isFirst ? { uri: '' } : require('../../img/home/img_l.png');
    let nextImg = isLast ? { uri: '' } : require('../../img/home/img_r.png');

    return (
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

        <TouchableOpacity style={styles.arrowStyle} onPress={() => {
          if (!isFirst) {
            this.changeImg(false)
          }
        }}>
          <Image
            style={{ height: size(53), width: size(29) }}
            source={periousImg}
          />
        </TouchableOpacity>

        <ScrollView
          ref={r => this._scrollView = r}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.onScrollAnimationEnd.bind(this)}
          style={{ width: size(510), height: size(850) }}
        >
          {arr}
        </ScrollView>

        <TouchableOpacity style={styles.arrowStyle} onPress={() => {
          if (!isLast) {
            this.changeImg(true)
          }
        }}>
          <Image
            style={{ height: size(53), width: size(29) }}
            source={nextImg}
          />
        </TouchableOpacity>

      </View>
    )
  }



  //判断是否开始使用
  async  startIsUse(index){
    this.selectBtn(index)
    return
      FuncUtils.checkKfPerm()
          .then(res => {
              if(res.code  == 0 && res.result == 'yes'){
                  this.props.navigation.navigate('BuyVip')
              }else {
                  this.selectBtn(index)
              }
          })
          .catch(err => {
            this.mainView._toast(JSON.stringify(err))
          })
    }

  _renderBottom() {
    let arr = [];
    this.state.menus.forEach((item, index) => {
      let isSelect = this.state.selectBtnIndex === index ? true : false;
      let color = isSelect ? AppDef.Blue : 'rgba(212, 212, 212, 1)';
      let img = isSelect ? { uri: item.select_icon_url } : { uri: item.res_fy_icon_url };
      if (item.secondFyName == '康复' || item.secondFyName == '3D模型') {
        img = isSelect ? item.select_icon_url : item.res_fy_icon_url;
      }
      arr.push(
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: size(104), height: size(104) }} onPress={() => {
          // this.selectBtn(index)
            this.startIsUse(index)
        }}>
          <Image resizeMode={'contain'} source={img} style={{ width: size(44), height: size(44) }} />
          <Text style={{ fontSize: size(24), color: color, marginTop: size(8) }}>{item.secondFyName}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <View style={{ height: size(104), }}>
        <Line color={'rgba(213, 213, 213, 1)'} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          {arr}
        </View>
      </View>
    )
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>
        <NavBar title={this.state.sick.pat_name} navigation={this.props.navigation} />
        {this._renderContent()}
        {this._renderBottom()}
      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({
  arrowStyle: {
    marginLeft: size(20),
    marginRight: size(20),
    width: size(80),
    height: size(80),
    justifyContent: 'center',
    alignItems: 'center',
  }
});