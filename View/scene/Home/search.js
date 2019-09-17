import React from "react";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity,StatusBar, Text,Platform , ImageBackground,DeviceEventEmitter , TextInput } from "react-native";
import {
  BaseComponent,
  ContainerView,
  NavBar,
  Line,
  size,
  screen, deviceWidth, AppDef,isIPhoneXPaddTop,NetInterface,HttpTool
} from '../../common';
import { queryHistoryAll, insertHistory, deleteHistories, queryRecentlyUse } from "../../realm/RealmManager";
import Loading from "../../common/Loading";
import Toast from "react-native-easy-toast";
import { groupBy, changeArr } from "../../common/fun";


const statusBarHeight = StatusBar.currentHeight;

export default class SearchComponent extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      search: false,
      allSearch: true,
      sourceData: '',
      hotData: '',
      historyData: '',
      linceList: '',
      key: '',
      currKeyName: '',
      currKeyId: '',
      keyData: '',
      searchpathologyList: '',
      showHotAndKey: true,
    }
  }
  componentWillMount() {
    //获取热词
    this.getHotKey();
    this.getHistory();
  }
  async getHistory() {
    let arr = await queryHistoryAll();
    this.setState({
      historyData: changeArr(arr)
    })
  }
  async getHotKey() {
    //获取热门搜索数据
    let url = NetInterface.gk_getSearchHot + "?size=6";
    HttpTool.GET_JP(url)
      .then(result => {
        // alert(JSON.stringify(result))
        this.setState({
          hotData: result.pathologyList
        })
      })
  }

  async queryStruct(data, type) {
    this.Loading.show("查询中...");
    this.saveHistory(data, type);

    this.Loading.close();
  }

  async queryKey(value) {
    try {
      if (value != '') {
        this.setState({
          key: value,
          currKeyName: value,
          showHotAndKey: false
        })
        let url = NetInterface.gk_searchPathologyList + "?key=" + value;
        HttpTool.GET_JP(url)
          .then(result => {
            if (result.msg == "success") {
              this.setState({
                key: value,
                searchpathologyList: result.pathologyList,
              })
            }
          })
      } else {
        this.setState({
          keyData: [],
          showHotAndKey: true,
          searchpathologyList: ''
        })
      }
    } catch (e) {

    }
  }

  
  deleteHistory() {
    this.setState({
      historyData: []
    })
    deleteHistories()
  }

  closeSearch() {
    this.props.navigation.goBack()
    this.setState({
      showHotAndKey: true,
    })
  }
  
  My() {
    this.props.navigation.navigate('MyScreen');
  }

  Message() {
    this.props.navigation.navigate('MessageNotice');
  }

  getKeyName(keyName) {
    if (keyName != '' && keyName != undefined) {
      return keyName.replace('#', '');
    } else {
      return "";
    }
  }

  searchChicks(pat_no, pat_name) {
    let sick={'pat_no':pat_no,'pat_name':pat_name}
    let data = { "keyName": pat_name, "ketNo": pat_no }
    this.saveHistory(data, "key")
    this.getHistory()
    this.props.navigation.navigate('SickDetail',{sick:sick,areaSickList:[sick]});
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

  _renderTop() {
    return (
        <View style={styles.container}>
          <StatusBar translucent={true}  backgroundColor='rgba(0, 0, 0, 0)' barStyle="light-content" />
          <TouchableOpacity style={[styles.icon, { marginLeft: 10, marginRight: 10 }]}
            onPress={() => this.closeSearch()}>
            <Image style={styles.icon}
              source={require('../../img/public/left.png')} />
          </TouchableOpacity>
          <View style={{ width: "85%",justifyContent:'center' }}>
            <TextInput
              style={[styles.input, { width: "100%" }]}
              placeholder="请输入病症名称"
              placeholderTextColor='#757575'
              autoFocus={true}
              onChangeText={(value) => this.queryKey(value)} />
            <TouchableOpacity style={styles.searchImg}
              onPress={() => { }}>
              <Image style={styles.searchImgMain}
                source={require('../../img/search/search.png')} />
            </TouchableOpacity>
          </View>
        </View>
        
    )
  }

  _renderBottom(){
    return(
      <ScrollView style={{ width: '100%', padding: 10 }}>
          {this.state.showHotAndKey ?
            <View>
              {
                this.state.historyData.length !== 0 ?
                  <View>
                    <Text style={styles.histortTitle}>历史记录</Text>
                    <TouchableOpacity style={styles.deleteStyle}
                      onPress={() => this.deleteHistory()}>
                      <Image style={styles.searchImgMain}
                        source={require('../../img/search/delete.png')} />
                    </TouchableOpacity>
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
              <View style={styles.histortMain}>
                {this.renderSeachBody()}
              </View>
            </View>
          }
        </ScrollView>
    )
  }

  renderHistory() {
    let arr = []
    // alert(JSON.stringify(this.state.historyData))
    for (let i = 0; i < this.state.historyData.length; i++) {
      let historyData = this.state.historyData[i]
      arr.push(
        <Text style={styles.histortBody} onPress={() => this.searchChicks(historyData.ketNo, historyData.keyName)}>{this.getKeyName(historyData.keyName)}</Text>
      )
    }
    return arr
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
  
  renderSeachBody() {
    let searchpathologyList = this.state.searchpathologyList
    if (searchpathologyList == null || searchpathologyList == '') {
      return (
        <Text style={{ fontSize: 15, textAlign: "center", marginTop: 30 }}>没有找到相关结果,换个关键字试试哟~</Text>
      )
    } else {
      let arr = []
      for (let i = 0; i < searchpathologyList.length; i++) {
        arr.push(
          <Text style={styles.histortBody} onPress={() => this.searchChicks(searchpathologyList[i].patNo, searchpathologyList[i].patName)}>{searchpathologyList[i].patName}</Text>
        )
      }
      return arr
    }
  }

  render() {
    return (
      <ContainerView ref={r => this.mainView = r}>
        {this._renderTop()}
        {this._renderBottom()}
        <Loading
          ref={r => {
            this.Loading = r;
          }}
          hudHidden={false}
        />
        <Toast style={{ backgroundColor: '#343434' }} ref="toast" opacity={1} position='top'
          positionValue={size(100)} fadeInDuration={750} textStyle={{ color: '#FFF' }}
          fadeOutDuration={1000} />
      </ContainerView>
    )
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
  top: {
    marginTop: 25,
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  input: {
    height: size(60),
    borderRadius: size(20),
    width: '70%',
    backgroundColor: 'white',
    margin: 0, padding: 0,
    paddingLeft: 40,
  },
  searchImg: {
    width: 40,
    height: 35,
    position: "absolute",
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchImgMain: {
    width: 15,
    height: 15,
  },
  histortTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    width: '100%',
    paddingTop: 15,
    paddingBottom: 5,
    color:'black'
  },
  deleteStyle: {
    position: "absolute",
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 55
  },
  histortMain: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 10,
    paddingTop: 10,
  },
  histortBody: {
    padding: 5,
    margin: 7,
    borderRadius: 3,
    borderWidth: 1,
    color:'black',
    borderColor: '#C8C8C8',
    //fontSize: 15,
  },
});

