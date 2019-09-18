import {
  deleteAllRelation,
  deleteAllStruct,
  deleteAllVideo,
  deleteAllWeb,
  saveRelationList,
  saveStructList,
  saveVideoList,
  saveWebList,
  getTabVersionByName,
  insertTabVersion,
} from "../realm/RealmManager";
import {DeviceEventEmitter} from "react-native";
import DeviceInfo from "react-native-device-info";
import {Platform, Alert} from "react-native"
import {storage} from "../common/storage"

import {NativeModules} from "react-native"
import _ from "lodash"
import {NavigationActions,StackActions} from "react-navigation"

const {InAppUtils} = NativeModules
import api from "../api"

/**
* 检测证书是否使用
* 传入模型 显示是否使用
* @param struct
*/
  //先拉取版本表
let prefix = "http://res.vesal.site/json/V310_";

export function groupBy(targetList, field) {
  const names = findNames(targetList, field);
  return names.map(name => {
      const value = targetList.filter(target => target[field] === name)
      return {
          key: name,
          value,
          parent_sort: value[0].parent_sort == undefined ? "" : value[0].parent_sort,
      }

  })
}

//排序

export function compare(property) {
  return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
  }
}


export function changeArr(arr) {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
      newArr.push(arr[i])
  }
  return newArr;
}


function findNames(targetList, field) {
  const names = []
  targetList.forEach(target => {
      if (!names.includes(target[field])) {
          names.push(target[field])
      }
  })
  return names
}

async function updateResWeb(version) {

  try {
      //    let url ="http://api.vesal.cn:8000/vesal-jiepao-prod/v1/app/xml/getResWeb?Version=-1"
      let url = prefix + "GetResWeb.json"
      await fetch(url, {
          method: "get",
          headers: {
              "Content-Type": "application/json"
          }
      }).then(resp => resp.json()).then(result => {
          /*clear*/
          deleteAllWeb();
          let temp = {
              name: "TAB_res_web",
              version: version
          }

          insertTabVersion(temp)
          result.List.map((m) => {
              saveWebList(m)
          })


      });
  } catch (e) {

  }
}

async function updateResVideo(version) {
  //   let url = "http://api.vesal.cn:8000/vesal-jiepao-prod/v1/app/xml/getResVideo?Version=-1";
  let url = prefix + "GetResVideo.json";
  await fetch(url, {
      method: "get",
      headers: {
          "Content-Type": "application/json"
      }
  }).then(resp => resp.json()).then(result => {
      /*clear*/
      let temp = {
          name: "TAB_res_video",
          version: version
      }
      insertTabVersion(temp)
      deleteAllVideo();
      result.List.map((m) => {
          saveVideoList(m)
      })

  });
}


async function updateResRelation(version) {
  //  let url = "http://api.vesal.cn:8000/vesal-jiepao-prod/v1/app/xml/getResRelation?Version=-1"
  let url = prefix + "GetResRelation.json";
  await fetch(url, {
      method: "get",
      headers: {
          "Content-Type": "application/json"
      }
  }).then(resp => resp.json()).then(result => {
      /*clear*/

      let temp = {
          name: "TAB_res_relation",
          version: version
      }
      insertTabVersion(temp)

      deleteAllRelation();
      result.List.map((m) => {
          saveRelationList(m)
      })

  });
}

async function updateResStruct(version) {
  //   let url = "http://api.vesal.cn:8000/vesal-jiepao-prod/v1/app/xml/getResStruct?Version=0&appVersion=2.5.0&plat=android&business=anatomy";
  let url = prefix + "GetResStruct_" + Platform.OS + ".json"
  await fetch(url, {
      method: "get",
      headers: {
          "Content-Type": "application/json"
      }
  }).then(resp => resp.json()).then(result => {
      /*clear*/

      let temp = {
          name: "TAB_res_struct",
          version: version
      }
      insertTabVersion(temp)

      deleteAllStruct();
      result.List.map((m) => {
          saveStructList(m)
      })

  });
}


/**
* 检查穿插数据版本更新
* @param list
* @returns {Promise<void>}
*/


async function checkGetData(list) {
  try {

      if (list) {

          let local_TAB_res_web = await getTabVersionByName("TAB_res_web");
          let local_TAB_res_relation = await getTabVersionByName("TAB_res_relation");
          let local_TAB_res_video = await getTabVersionByName("TAB_res_video");
          let local_TAB_res_struct = await getTabVersionByName("TAB_res_struct");

          list.map((data, index) => {

              /* updateResWeb(data.version);
               updateResVideo(data.version);
               updateResRelation(data.version);
               updateResStruct(data.version);*/


              if (data.name == 'TAB_res_web') {

                  if (local_TAB_res_web && local_TAB_res_web.length > 0) {
                      if (data.version != local_TAB_res_web[0].version) {
                          updateResWeb(data.version);
                      }
                  } else {

                      updateResWeb(data.version);

                  }
              }

              //
              if (data.name == 'TAB_res_video') {
                  if (local_TAB_res_video && local_TAB_res_video.length > 0) {
                      if (data.version != local_TAB_res_video[0].version) {
                          updateResVideo(data.version);
                      }
                  } else {
                      updateResVideo(data.version);
                  }
              }

              //
              if (data.name == 'TAB_res_relation') {
                  if (local_TAB_res_relation && local_TAB_res_relation.length > 0) {
                      if (data.version != local_TAB_res_relation[0].version) {
                          updateResRelation(data.version);

                      }
                  } else {
                      updateResRelation(data.version);
                  }
              }
              //
              if (data.name == 'TAB_res_struct') {
                  if (local_TAB_res_struct && local_TAB_res_struct.length > 0) {
                      if (data.version != local_TAB_res_struct[0].version) {
                          updateResStruct(data.version);

                      }
                  } else {
                      updateResStruct(data.version);
                  }
              }


          })


      }


  } catch (e) {

  }
}


export async function getRelationData() {


  try {
      //记得检查版本
      //http://filetest1.vesal.site/upload/relation/v2/ResourceStructList.json

      await fetch(prefix + "Version.json", {
          method: "get",
          headers: {
              "Content-Type": "application/json"
          }
      }).then(resp => resp.json()).then(result => {

          checkGetData(result.list);

      });

  } catch (e) {
      // alert("e");
  }
}

export function getNeedPay(data) {
  let price = " ￥" + data.sell_price;
  if (data.needPay != undefined && data.needPay != '') {
      price = "只需支付￥" + data.needPay;
  }
  return price;
}


export async function checkEnvironment(that) {
  //    let url ="http://api.vesal.cn:8000/vesal-jiepao-prod/v1/app/xml/getResWeb?Version=-1"
  let url =
      api.base_uri +
      "v1/app/xml/getAppAuditState?version=" +
      DeviceInfo.getVersion() +
      "&plat=" +
      Platform.OS
  // alert(`url is ${url}`)

  //   alert(`this is ${JSON.stringify(that)}`)

  //   await in_app_pay(that)
  // that.props.navigation.navigate("Login")
  //   return

  //如果是在审核期间,服务端返回true,否则false
  let review_stat = true

  review_stat = await fetch(url, {
      method: "get",
      headers: {
          "Content-Type": "application/json"
      }
  })
      .then(resp => resp.json())
      .then(result => {
          // alert(`result is ${JSON.stringify(result)}`)
          return new Promise((resolve, reject) => {
              //   alert(`result is ${result.state}`)
              resolve(result.state)
          })
      })

  return review_stat;
}

export async function ifReviewByApple(that) {

  let review_stat = await checkEnvironment(that);

  // alert(`review_stat is ${review_stat}`)
  let memberInfo = await storage.get("memberInfo")
  // alert(`review_stat is ${review_stat}`)
  if (review_stat) {
      //   alert(222)
      await in_app_pay(that, that.state.infos)
  } else {
      try {
          //如果是游客跳转注册
          if (memberInfo.isYouke == "yes") {
              // that.refs.toast.show(
              //   "您现在身份是游客,请先注册或登录哦"
              // );
              that.props.navigation.navigate("LoginPage")
          } else {
              //   alert(111)
              // that.in_app_pay()
              let isBug = await that.checkRebuy(
                  that.props.navigation.state.params.obj.combo_id,
                  that
              )
              // debugger;
              that.props.navigation.navigate("ConfirmPayScreen", {
                  infos: infos
              })
          }
      } catch (e) {
          //   that.props.navigation.navigate("Login")
      }
  }
}

async function checkRebuy(comboId, that) {
  let _this = that
  let tokens = await storage.get("userTokens", "")
  const url =
      api.base_uri +
      "/v1/app/combo/checkIsBuyCombo?comboId=" +
      comboId +
      "&token=" +
      tokens.token //拉取服务器最新版本
  // debugger;
  await fetch(url, {
      method: "get",
      headers: {
          "Content-Type": "application/json"
      }
  })
      .then(resp => resp.json())
      .then(result => {
          // debugger;
          if (result.isBuyCombo) {
              Alert.alert("温馨提醒", "您已经购买过此套餐,确认再次购买?", [
                  {text: "稍后再说"},
                  {
                      text: "再次购买",
                      onPress: function () {
                          _this.props.navigation.navigate("ConfirmPayScreen", {
                              infos: _this.state.infos
                          })
                      }
                  }
              ])
          } else {
              _this.props.navigation.navigate("ConfirmPayScreen", {
                  infos: _this.state.infos
              })
          }
      })
}

async function getOrderId(that, infos) {
  //如果没有订单号就获取订单号  (继续支付会有订单号 点击了一次立即支付也会有订单号)
  //   if (
  //     that.state.OrderNo == null ||
  //     that.state.OrderNo == "" ||
  //     that.state.OrderNo == undefined
  //   ) {
  //console.log(`================\n 进入getOrderId`)
  let tokens = await storage.get("userTokens")
  //   alert(222)
  //console.log(`================\n tokens is ${tokens}`)
  const url = api.base_uri + "/v1/app/order/addOrder"
  //console.log(`================\n url is ${url}`)
  // debugger;
  let responseData = await fetch(url, {
      method: "post",
      headers: {
          "Content-Type": "application/json",
          token: tokens.token
      },
      body: JSON.stringify({
          comboId: infos.combo_id,
          ordRes: Platform.OS,
          lang: "ch"
      })
  })
      .then(resp => resp.json())
      .then(result => {
          return new Promise((resolve, reject) => {
              // debugger;
              if (result && result.order) {
                  //console.log(`=====\n生成的订单号为:${JSON.stringify(result)}`)
                  //storage.save('containsStructCombo', id, result.page);

                  resolve && resolve(result.order)
              } else {
                  reject && reject(new Error("data parse error"))
              }
          })
      })
  return responseData.ordNo
  // that.setState({
  //   OrderNo: responseData.ordNo
  // })
  //   }
}

async function in_app_pay(that, infos) {
  that.Loading.show("正在支付...")
  // alert(111)
  // return
  // alert(`infos is ${(infos.sell_price)}`)
  // return
  //   console.info("-----------------")
  let products = [
      "com.Vesal.Vesal3DAnatomy_jubu",
      "com.Vesal.Vesal3DAnatomy_titong",
      "com.Vesal.Vesal3DAnatomy_gjxlyyjp",
      "com.Vesal.Vesal3DAnatomy_jbjpqj",
      "com.Vesal.Vesal3DAnatomy_xtjpqj",
      "com.Vesal.Vesal3DAnatomy_xtjbzsb",
      "com.Vesal.Vesal3DAnatomy_xtjpzsb",
      "com.Vesal.Vesal3DAnatomy_jzyyjp",
      "com.Vesal.Vesal3DAnatomy_xtjpwk",
      "com.Vesal.Vesal3DAnatomy_hemianbu",

      "com.Vesal.Vesal3DAnatomy_gjqyyjp",
      "com.Vesal.Vesal3DAnatomy_rtzspgyjpfxjj",
      "com.Vesal.Vesal3DAnatomy_jlsx",
      "com.Vesal.Vesal3DAnatomy_jlsxzsb",
      "com.Vesal.Vesal3DAnatomy_cfdjgczwkqj",
      "com.Vesal.Vesal3DAnatomy_cfdjgczwkqjzsb"
  ]

  // 生成OrderId
  //console.log(`gointo getOrderId`)
  let orderId = await getOrderId(that, infos)
  //   console.log(`end getOrderId`)
  //   alert(`****getOrderId****\n${orderId}`)
  InAppUtils.canMakePayments(async canMakePayments => {
      if (!canMakePayments) {
          Alert.alert("提醒", "您的设备暂时不支持内购")
          that.Loading.close()
      } else {
          InAppUtils.loadProducts(products, async (error, products) => {
              // console.log("products" + JSON.stringify(products))
              // console.log("products" + JSON.stringify(infos))
              // console.log("products error" + JSON.stringify(error))
              let productIdentifier = ""
              if (infos.combo_name == "系统解剖全集") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_xtjpqj"
              } else if (infos.combo_name == "关节系列医用解剖") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_gjxlyyjp"
              } else if (infos.combo_name == "局部解剖全集") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_jbjpqj"
              } else if (infos.combo_name == "系统解剖全集") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_xtjpqj"
              } else if (infos.combo_name == "系统解剖全集与局部解剖全集终身版") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_xtjbzsb"
              } else if (infos.combo_name == "系统解剖全集终身版") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_xtjpzsb"
              } else if (infos.combo_name == "系统解剖微课") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_xtjpwk"
              } else if (infos.combo_name == "脊柱医用解剖") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_jzyyjp"
              } else if (infos.combo_name == "颌面部医用解剖") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_hemianbu"
              }

              else if (infos.combo_name == "感觉器医用解剖") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_gjqyyjp"
              } else if (infos.combo_name == "人体姿势评估与解剖分析（进阶）") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_rtzspgyjpfxjj"
              } else if (infos.combo_name == "经络腧穴") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_jlsx"
              } else if (infos.combo_name == "经络腧穴终身版") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_jlsxzsb"
              } else if (infos.combo_name == "触发点方案/结构/操作微课全集") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_cfdjgczwkqj"
              } else if (infos.combo_name == "触发点方案/结构/操作微课全集终身版") {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_cfdjgczwkqjzsb"
              }

              else {
                  productIdentifier = "com.Vesal.Vesal3DAnatomy_titong"
              }

              // console.log("products" + JSON.stringify(productIdentifier))

              InAppUtils.purchaseProduct(
                  productIdentifier,
                  async (error, response) => {
                      console.log('________________');
                      console.log("error" + JSON.stringify(error))
                      console.log("response" + JSON.stringify(response))
                      // NOTE for v3.0: User can cancel the payment which will be available as error object here.
                      if (response && response.productIdentifier) {
                          let tokens = await storage.get("userTokens")
                          const url = api.base_uri + "/v1/app/pay/applyPayNotify"
                          let responseData = await fetch(url, {
                              method: "POST",
                              body: JSON.stringify({
                                  ordNo: orderId,
                                  transactionReceipt: response.transactionReceipt
                              }),
                              headers: {
                                  "Content-Type": "application/json",
                                  token: tokens.token
                              }
                          })
                              .then(resp => resp.json())
                              .then(result => {
                                  // debugger
                                  return new Promise((resolve, reject) => {
                                      if (result && result.result) {
                                          //storage.save('containsStructCombo', id, result.page);
                                          // that.Loading.close();
                                          resolve && resolve(result.result)
                                      } else {
                                          that.Loading.close()
                                          reject && reject(new Error("data parse error"))
                                      }
                                  })
                              })

                          console.log(JSON.stringify(responseData));
                          if (responseData) {
                              //console.log(
                              //   `=====\napplyPayNotify  is ${JSON.stringify(responseData)}`
                              // )
                              that.refs.toast.show("您已成功支付,正在跳转,请稍候...")
                              that.Loading.close()
                              storage.clearMapForKey("versionByInitMyStruct")
                              storage.clearMapForKey("mystructList")
                              DeviceEventEmitter.emit("RefreshEmitter")
                              // DeviceEventEmitter.emit("HomeListener");
                              setTimeout(
                                  function () {
                                      const resetAction = StackActions.reset({
                                          index: 0,
                                          actions: [
                                              NavigationActions.navigate({routeName: "NewHome"})
                                          ]
                                      })
                                      // that.props.navigation.pop() && that.props.navigation.pop();
                                      that.props.navigation.dispatch(resetAction)
                                  }.bind(that),
                                  1000
                              )
                          }

                          //unlock store here.
                      } else {
                          //console.log(`支付失败`)
                          that.Loading.close()
                      }
                  }
              )
          })
      }
  })
}


export async function isFirstOpenUnity() {
  let firstOpenUnity = await storage.get('isFirstOpenUnity');
  let isFirst = false;
  if (firstOpenUnity == -1) {
      storage.saveNoExpires('isFirstOpenUnity', "", 1);
      isFirst = true;
  }

  return isFirst;
}

export function ConvertString(string) {
  if (string == null || string == undefined || typeof(string) == 'undefined') {
      return '';
  } else {
      return string;
  }
}

export function isAvailableString(string) {

  let convertStr = ConvertString(string);

  if (convertStr.length > 0) {
      return true;
  } else {
      return false;
  }
}

export function isAvailableStringArray(arr) {
  let result = true;

  if (typeof(arr) == 'undefined' || arr == null) {
      return false;
  }

  arr.forEach(string => {
      let isAvailable = isAvailableString(string);
      if (!isAvailable) {
          result = false;
      }
  })
  return result;
}

export function isAvailableKey(obj, key) {
  if (obj[key] == undefined) {
      return false;
  } else {
      return true;
  }
}

export function isUndefinedVal(val) {
  return val == undefined;
}

export function analysis(list, appId, smChName) {
  if (smChName == '') {
      return [];
  }
  let resultArr = []
  for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].key === appId) {
          let result = []
          let lastChildren = []
          leafNode(list[i].val, result, lastChildren, smChName)

          resultArr.push(result.toString())
          break;
      }
  }
  return resultArr;
}

function leafNode(valList, result, lastChildren, smChName) {
  for (var i = valList.length - 1; i >= 0; i--) {
      if (valList[i].children.length !== 0) {
          lastChildren = JSON.stringify(valList[i])
          leafNode(valList[i].children, result, lastChildren, smChName)
      } else {
          if (valList[i].name === smChName) {
              let lastChildrenJson = JSON.parse(lastChildren)
              console.log(lastChildrenJson.children.length)
              let currChildre = lastChildrenJson.children
              for (var j = currChildre.length - 1; j >= 0; j--) {
                  result.push(currChildre[j].smName)
              }
          }
      }
  }
}


/**
* 根据名字获取该名称下所有子节点信息
* @param list
* @param appId
* @param smChName
*/
export function getChildNode(list, appId, smChName) {
  let resultArr = []
  for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].key === appId) {
          let result = []
          leafChildNode(list[i].val, result, smChName)
          resultArr.push(...result)
      }
  }

  return resultArr
}

function leafChildNode(valList, result, smChName) {
  // 查找对应名称的结果数组
  for (let i = valList.length - 1; i >= 0; i--) {
      if (valList[i].name === smChName && valList[i].children.length !== 0) {
          getResult(valList[i].children, result)
      } else if (valList[i].name === smChName && valList[i].children.length === 0) {
          result.push(valList[i].smName)
      } else if (valList[i].name !== smChName && valList[i].children.length !== 0) {
          leafChildNode(valList[i].children, result, smChName)
      }
  }
}

function getResult(valList, result) {
  for (let i = valList.length - 1; i >= 0; i--) {
      if (valList[i].children.length === 0) {
          result.push(valList[i].smName)
      } else {
          getResult(valList[i].children, result)
      }
  }
}