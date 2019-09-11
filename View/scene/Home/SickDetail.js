/**
 * Created by xzh on 11:29 2019-09-03
 *
 * @Description:
 */

import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ImageBackground,
  DeviceEventEmitter,
  PanResponder
} from "react-native";
import {
  BaseComponent,
  ContainerView,
  NavBar,
  Line,
  size,
  screen, deviceWidth, AppDef, FuncUtils, NetInterface, HttpTool
} from '../../common';
import { storage } from "../../common/storage";
import Video from 'react-native-af-video-player';
import MyTouchableOpacity from '../../common/components/MyTouchableOpacity';
import RNFS from "react-native-fs"

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
      selectImgIndex: selectIndex,   // 当前页面显示的疾病对应的图片
      showSourceType: 'img', // 当前显示的内容类型  img 图片  video播放视频  videoList 视频列表
      playVideoUrl: '',    // 当前播放的视频的url
      details: '',  //当前疾病所有数据
      videoUrl: ''
    }
  }

  componentDidMount() {
    this.requestSickData();
    this.mainView._showLoading('加载中...');
    this.defaultLocation()
    this.emitter = DeviceEventEmitter.addListener('updatePermission',
      () => {
        FuncUtils.checkKfPerm()
      }
    )
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({

      /***************** 要求成为响应者 *****************/
      // 移动手势是否可以成为响应者
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      // 拦截子组件的单击手势传递,是否拦截
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      // 拦截子组件的移动手势传递,是否拦截
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      /***************** 响应者事件回调处理 *****************/
      // 移动手势监听回调
      onPanResponderMove: (e, gestureState) => {
        console.log('onPanResponderMove==>' + '移动手势申请成功,开始处理手势' + `${gestureState}`)
        console.log('开始移动');
      },
      // 手势动作结束回调
      onPanResponderEnd: (evt, gestureState) => {
        console.log('onPanResponderEnd==>' + '手势操作完成了,用户离开')
        console.log('停止移动');
      },
      // 手势释放, 响应者释放回调
      onPanResponderRelease: (e, gestureState) => {
        // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
        // 一般来说这意味着一个手势操作已经成功完成。
        console.log('onPanResponderRelease==>' + '放开了触摸,手势结束')
        console.log('收拾放开');
        this._onPanResponderRelease(gestureState);
      },
      // 手势申请失败,未成为响应者的回调
      onResponderReject: (e) => {
        // 申请失败,其他组件未释放响应者
        console.log('onResponderReject==>' + '响应者申请失败')
      },

      // 当前手势被强制取消的回调
      onPanResponderTerminate: (e) => {
        // 另一个组件已经成为了新的响应者，所以当前手势将被取消
        console.log('onPanResponderTerminate==>' + '由于某些原因(系统等)，所以当前手势将被取消')
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
        // 默认返回true。目前暂时只支持android。
        return true;
      },
    })
  }

  // 手势结束
  _onPanResponderRelease(state) {
    let touchX = Math.abs(state.dx);
    let isNextMove = false;
    if (state.dx < 0) { // 左滑
      isNextMove = true;
    } else { // 右滑
      isNextMove = false;
    }



    let i;
    if (touchX < size(80)) { // 移动的距离小于scroll的1/4
      i = this.state.selectImgIndex;
      // alert('弹回');
    } else {
      if (isNextMove) { // 下一张
        i = this.state.selectImgIndex == this.state.areaSickList.length - 1 ? this.state.selectImgIndex : this.state.selectImgIndex + 1;
      } else { // 上一张
        i = this.state.selectImgIndex == 0 ? this.state.selectImgIndex : this.state.selectImgIndex - 1;
      }
    }
    // alert(`x == ${touchX}`);

    // alert(i)
    this._scrollView.scrollTo({ x: i * (deviceWidth - size(240)), y: 0, animated: true });
    let sick = this.state.areaSickList[i];
    this.setState({
      selectImgIndex: i,
      sick: sick
    }, () => {
      this.requestSickData();
    })
  }

  componentWillUnmount() {
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
    let _details = await storage.get(sick.pat_no, 'details')
    let url = NetInterface.gk_getPathologyRes + "?patNo=" + sick.pat_no + "&business=orthope&mbId=" + memberInfo.mbId
    HttpTool.GET_JP(url)
      .then(result => {
        // alert(JSON.stringify(result))
        this.mainView._closeLoading();
        if (result.msg == 'success' && result.code == 0) {
          let pathology = result.pathology;
          let menus = JSON.parse(pathology.menus);
          let kf = {
            res_fy_icon_url: require('../../img/home/kangfu_s.png'),
            select_icon_url: require('../../img/home/kangfu_s.png'),
            secondFyName: '康复',
            type: 'static'
          }
          let model = {
            res_fy_icon_url: require('../../img/home/model_s.png'),
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
          storage.save(sick.pat_no, 'details', result)
          // alert(JSON.stringify(menus));
        }
      })
      .catch(err => {
        this.mainView._closeLoading();
        if (_details == -1) {
          this.mainView._toast('暂无网络,请连接网络后重试.')
        } else {
          let pathology = _details.pathology;
          let menus = JSON.parse(pathology.menus);
          let kf = {
            res_fy_icon_url: require('../../img/home/kangfu_s.png'),
            select_icon_url: require('../../img/home/kangfu_s.png'),
            secondFyName: '康复',
            type: 'static'
          }
          let model = {
            res_fy_icon_url: require('../../img/home/model_s.png'),
            select_icon_url: require('../../img/home/model_s.png'),
            secondFyName: '3D模型',
            type: 'static'
          }
          menus.push(kf);
          menus.push(model);
          this.setState({
            menus: menus,
            selectBtnIndex: -1,
            details: _details
          })
        }
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
      this._scrollView.scrollTo({ x: this.state.selectImgIndex * (deviceWidth - size(240)), y: 0, animated: true });
      this.requestSickData();
    })
  }

  defaultLocation() {
    this.fristTime = setTimeout(() => {
      this._scrollView.scrollTo({ x: this.state.selectImgIndex * (deviceWidth - size(240)), y: 0, animated: false })
    }, 0)
  }

  onScrollAnimationEnd(e) {
    // let i = Math.floor(e.nativeEvent.contentOffset.x / (deviceWidth - size(238)));
    // let sick = this.state.areaSickList[i];
    // this.setState({
    //   selectImgIndex: i,
    //   sick: sick
    // }, () => {
    //   this.requestSickData();
    // })
  }

  closeVideo() {
    this.setState({
      selectBtnIndex: -1,
      showSourceType: 'img',
      playVideoUrl: ''
    }, () => { this.defaultLocation() })
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
      "showModelList": this.state.details.pathology.open_model,
      "greenModelList": this.state.details.pathology.highlight_model
    }
    if (this.state.selectBtnIndex === index) {
      this.setState({
        selectBtnIndex: -1,
        showSourceType: 'img',
        playVideoUrl: ''
      }, () => { this.defaultLocation() })
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
          playVideoUrl: menuBtn.content == undefined ? '' : menuBtn.content
        })
      }

      if (menuBtn.type == 'text') {
        this.setState({
          showSourceType: 'text',
          selectBtnIndex: index,
          playVideoUrl: menuBtn.content == undefined ? '' : menuBtn.content
        })
      }

      if (menuBtn.type == 'static') { //static 跳转unity 或者 跳转康复
        if (menuBtn.secondFyName == '康复') {
          // alert(JSON.stringify(this.state.currArea))
          this.props.navigation.navigate('Recovery', { patNo: this.state.sick.pat_no, sick: this.state.sick, currArea: this.state.currArea });
        } else {
          this.props.navigation.navigate('BonesScene', { info: msg });
          this.setState({
            showSourceType: 'img',
            selectBtnIndex: -1,
            playVideoUrl: ''
          })
          return
        }
      }
    }
  }

  dowloadVideoFile(cacheUrl, cacheFileName) {

    // 视频
    const options = {
      fromUrl: cacheUrl,
      toFile: cacheFileName,
      background: true,
      begin: (res) => {
        console.log('begin', res);
        console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
      },
      progress: (res) => {

        let pro = res.bytesWritten / res.contentLength;
        console.log(`=====当前下载进度 ${pro} =====`);
        let newpro = parseFloat(pro) * 100+ '';
        let index = newpro.indexOf('.');

        newpro = newpro.substr(0,index);
        this.mainView._showLoading('下载中' + newpro + '%')
      }
    };
    try {
      const ret = RNFS.downloadFile(options);
      ret.promise.then(res => {
        console.log('success', res);
        console.log('file://' + cacheFileName)
        // ios 读取视频地址不需要加 file:// 安卓可能需要加
        this.setState({
          playVideoUrl: cacheFileName
        }, () => {
          // alert(111)
          this.mainView._closeLoading();
          this.setState({
            showSourceType: 'video'
          })
        })
      }).catch(err => {
        console.log('err', err);
      });
    }
    catch (e) {
      console.log(error);
    }
  }

  _renderContent() {
    if (this.state.showSourceType == 'videoList') { // 视频列表
      return (
        this._renderVideoList()
      )
    } else if (this.state.showSourceType == 'video') { // 视频播放
      let url = this.state.playVideoUrl;
      if (url.length < 0) return;
      let fileNames = url.split('/');
      let newFileNames = fileNames.slice(-3);
      let newFileName = newFileNames.join('_');
      let cacheFileName = RNFS.TemporaryDirectoryPath + newFileName;

      RNFS.exists(cacheFileName)
          .then(res => {
            if (res) {
              this.setState({
                // showSourceType: 'video',
                playVideoUrl: cacheFileName
              })
            } else {
              this.dowloadVideoFile(url, cacheFileName)
            }

          })
          .catch(err => {
            this.dowloadVideoFile(url, cacheFileName)
            this.setState({
              // showSourceType: 'video',
              playVideoUrl: cacheFileName
            })
          })
      return (
        this._renderVideo()
      )
    } else if (this.state.showSourceType == 'text') { // 文本
      return (
        [this._renderImages(),
        this._renderText()]
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
    try {
      let videoList = JSON.parse(menuBtn.content);
      let width = (screen.width - size(75)) / 2;
      videoList.forEach((item, index) => {

        arr.push(
          <TouchableOpacity style={{ marginBottom: size(30), }} onPress={() => {
            let url = item.url;
            if (url.length < 0) return;
            let fileNames = url.split('/');
            let newFileNames = fileNames.slice(-3);
            let newFileName = newFileNames.join('_');
            let cacheFileName = RNFS.TemporaryDirectoryPath + newFileName;

            RNFS.exists(cacheFileName)
                .then(res => {
                  if (res) {
                    this.setState({
                      showSourceType: 'video',
                      playVideoUrl: cacheFileName
                    })
                  } else {
                    this.dowloadVideoFile(url, cacheFileName)
                  }

                })
                .catch(err => {
                  this.dowloadVideoFile(url, cacheFileName)
                  this.setState({
                    showSourceType: 'video',
                    playVideoUrl: cacheFileName
                  })
                })
          }}>
            <ImageBackground
              source={{ uri: item.img }}
              style={{ width: width - 1, height: size(210), borderRadius: size(10), overflow: 'hidden', marginRight: size(25), marginBottom: size(20), justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../../img/home/video.png')} style={{ width: size(78), height: size(78) }} />
            </ImageBackground>
            <Text style={{ color: AppDef.Black, fontSize: size(24), width: width, }}>{item.name}</Text>
          </TouchableOpacity>
        )
      })
    } catch (e) {

    }


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
          style={{ width: screen.width, height: screen.height + size(148) }}
          url={this.state.playVideoUrl}
          ref={(ref) => {
            this.video = ref
          }}
          onError={(msg) => {
            this.playVideoError(msg)
          }}
        />
        <View style={{ height: size(23), backgroundColor: 'black', width: screen.width }}></View>
        <MyTouchableOpacity style={{
          position: 'absolute',
          height: size(60),
          width: size(60),
          right: 20,
          top: -20,
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

  _renderText() {
    return (
      <View style={{
        position: 'absolute',
        width: screen.width, height: screen.height,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 999999999, justifyContent: 'center', alignItems: 'center'
      }}>
        <View style={{
          position: 'absolute', bottom: 0,
          backgroundColor: 'white',
          height: size(250),
          width: screen.width,
          borderTopLeftRadius: 15, borderTopRightRadius: 15
        }}>
          <View style={{ margin: 10 }}>
            <TouchableOpacity onPress={() => { this.closeVideo() }}>
              <Image style={{ width: size(23), height: size(23) }}
                source={require('../../img/kf_main/kf_plan_close.png')} />
            </TouchableOpacity>
            <Text style={{ position: 'absolute', left: screen.width * 0.5 - size(50), width: size(100) }}>成因</Text>
          </View>
          <ScrollView style={{ padding: 10 }}>
            <Text style={{ marginBottom: 15 }}>{this.state.playVideoUrl}</Text>
          </ScrollView>
        </View>
      </View>
    )
  }

  _renderImages() {

    let arr = [];
    if (this.state.areaSickList[0].img_url) {
      this.state.areaSickList.forEach((item, index) => {
        arr.push(
          <View style={{
            width: deviceWidth - size(240), height: size(850)
            // , backgroundColor: index%2 == 0? 'orange' : 'red'
          }}>
            <Image
              resizeMode={'contain'}
              style={{ width: deviceWidth - size(240), height: size(850) }}
              source={{ uri: item.img_url }}
            />
          </View>
        )
      })
    } else if (this.state.details) {
      arr.push(
        <View style={{ width: deviceWidth - size(240), height: size(850) }}>
          <Image
            resizeMode={'contain'}
            style={{ width: deviceWidth - size(240), height: size(850) }}
            source={{ uri: this.state.details.pathology.img_url }}
          />
        </View>
      )
    }

    let isFirst = this.state.selectImgIndex == 0 ? true : false;
    let isLast = this.state.selectImgIndex == this.state.areaSickList.length - 1 ? true : false;

    let periousImg = isFirst ? { uri: '' } : require('../../img/home/img_l.png');
    let nextImg = isLast ? { uri: '' } : require('../../img/home/img_r.png');
    // alert(arr)
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>

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
          {...this.panResponder.panHandlers}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          onMomentumScrollEnd={this.onScrollAnimationEnd.bind(this)}
          style={{ width: deviceWidth - size(240), height: size(850) }}
        >
          {arr}
        </ScrollView>

        <TouchableOpacity style={styles.arrowStyle} onPress={() => {
          if (!isLast) {
            this.changeImg(true)
          }
        }}>
          <Image
            resizeMode={'contain'}
            style={{ height: size(53), width: size(29) }}
            source={nextImg}
          />
        </TouchableOpacity>

      </View>
    )
  }

  //判断是否开始使用
  async  startIsUse(index) {
    // this.selectBtn(index)
    // return
    FuncUtils.checkKfPerm()
      .then(res => {
        if (res.code == 0 && res.result == 'yes') {
          this.props.navigation.navigate('BuyVip')
        } else {
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
      let color = isSelect ? AppDef.Blue : AppDef.Blue;
      let img = isSelect ? { uri: item.select_icon_url } : { uri: item.select_icon_url };
      if (item.secondFyName == '康复' || item.secondFyName == '3D模型') {
        img = isSelect ? item.select_icon_url : item.res_fy_icon_url;
      }
      arr.push(
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: size(104), height: size(104) }} onPress={() => {
          // this.selectBtn(index)
          this.startIsUse(index)
        }}>
          <Image resizeMode={'contain'} source={img} style={{ width: size(44), height: size(44), opacity: this.state.selectBtnIndex === index ? 0.8 : 1 }} />
          <Text style={{ fontSize: size(24), color: color, marginTop: size(8), opacity: this.state.selectBtnIndex === index ? 0.8 : 1 }}>{item.secondFyName}</Text>
        </TouchableOpacity>
      )
    })

    return (
      <View style={{ height: size(120) }}>
        <Line color={'rgba(213, 213, 213, 0.8)'} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', position: 'absolute', bottom: 0, width: screen.width }}>
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
    width: size(120),
    height: size(120),
    justifyContent: 'center',
    alignItems: 'center'
  }
});