import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ScrollableTabView, {ScrollableTabBar} from "react-native-scrollable-tab-view";
import {AppDef, BaseComponent, ContainerView, FuncUtils, HttpTool, NavBar, NetInterface, size} from '../../common';
import ImageMapper from 'react-native-image-mapper';

const DefaultColor = 'rgba(68, 180, 233, 0.5)';
const DefaultLineColor = 'rgba(68, 180, 233, 1)';
const SelectColor = 'rgba(231, 176, 176, 0.5)';
const SelectLineColor = 'rgba(231, 176, 176, 1)';

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
      currArea:{}
    }
  }

  componentDidMount() {
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
          //  alert(JSON.stringify(sickData))
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
    let url = NetInterface.gk_getPathologyAndArea + "?patAreaNo=" + item.pat_area_no + "&business=orthope";
    this.mainView._showLoading('加载中');
    HttpTool.GET_JP(url)
      .then(result => {
        this.mainView._closeLoading();
        //alert(JSON.stringify(result))
        this.requestBWData(result.pathologyList, item);
      })
      .catch(error => {
        this.mainView._closeLoading();
        this.mainView._toast(JSON.stringify(error));
      })
  }

  requestBWData(list, item) { // 查找对应部位数据
   //当前部位
    this.setState({
      currArea:item
    })

    if (list.length <= 0) {
      this.mainView._toast('此部位暂无疾病内容.');
    } else {
      this.mainView._showSelectDialog('sick', list, 'Default', item.pat_name);
    }
  }

  // recieveSelectResult(result) {
  //   let name = result.name;
  //   let val = result.value;
  //     // this.mainView._closeSelectDialog();
  //   this.props.navigation.navigate('kfSickPlanList', {sick: val,currArea:this.state.currArea, type: this.state.title});
  // }

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

  renderSubPage = () => {
    let tabArr = this.state.sickData;
    let arr = [];
    for (let i = 0; i < tabArr.length; i++) {
      arr.push(
        <View style={{flex: 1, borderTopWidth: size(0), borderTopColor: "#f4f4f4"}} tabLabel={tabArr[i].key}>
          <View style={{
            width: '100%',
            marginTop: size(58),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{color: AppDef.Black, fontSize: size(26)}}>
              请点击人物，选择您需要康复部位的病症。
            </Text>
          </View>

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

        </View>
      )
    }
    return arr;
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r} selectDialogAction={(result) => {alert(JSON.stringify(result))
       // this.recieveSelectResult(result)
      }}>
        {/* <NavBar title={this.state.title} navigation={this.props.navigation}/> */}
        <ScrollableTabView
            tabBarUnderlineStyle={{
                backgroundColor: AppDef.Blue,
            }}
            tabBarTextStyle={{
                fontSize: size(26),
                width: '100%',
                textAlign: "center",
            }}
            tabBarInactiveTextColor='#404040'
            tabBarActiveTextColor={AppDef.Blue}
          renderTabBar={() =>
            <ScrollableTabBar
              backgroundColor={'#fff'}
              style={{borderWidth: 1, borderColor: '#f0f0f0'}}/>}
              scrollWithoutAnimation={true}
        >
          {this.renderSubPage()}
        </ScrollableTabView>
      </ContainerView>
    );
  }
}


const styles = StyleSheet.create({
  mapper: {
    width: size(475),
    height: size(787),
    backgroundColor: AppDef.White,
    justifyContent: 'center',
    alignItems: 'center'
  }
})