import { observable, computed, action, runInAction } from "mobx";
import { RefreshState } from "react-native-refresh-list-view";
import {NetInterface,HttpTool} from "../common";
import { get } from "../common/httpTool";
import xml2js from "react-native-xml2js/lib/parser";

class OrderStore {
  @observable allDatas = [];
  @observable peopleStructData = [];
  @observable resourceData = [];
  @observable isRefreshing = 0;
  @observable isNoMore = true;

  @observable allMoreDatas = [];
  @observable currentPage = 1;
  @observable pageSize = 5;
  @observable api_key = "";

  @observable memberId = "";
  @observable loginCode = "";

  @observable queryType = "";
  @observable callSource = 2;
  @observable orderState = 1;
  constructor(rootStore) {
    // this.fetchDissectLists()
    this.rootStore = rootStore;
  }
  @action
  OrderList = async () => {
    console.log("传入的currentPage" + this.currentPage);
    try {
      this.isRefreshing;
      const url =NetInterface.gk_Ry_Store_Order_List +
        "?&rykjKey=" +
        this.api_key +
        "&currentPage=" +
        this.currentPage +
        "&pageCount=" +
        this.pageCount +
        "&loginCode=" +
        this.loginCode +
        "&memberId=" +
        this.memberId +
        "&callSource=" +
        this.callSource +
        "&orderState=" +
        this.orderState;
      console.log("url is " + url);
      const parseString = require("react-native-xml2js").parseString;
      let responseData = HttpTool.GET_JP(url)
        .then(response => {
          // return response;
          return new Promise(function(resolve, reject) {
            parseString(
              response,
              {
                explicitArray: false,
                ignoreAttrs: true
              },
              function(err, result) {
                // debugger
                let resp = JSON.parse(
                  result.string.replace(/\n/g, "").replace(/\s/g, "")
                );
                if (resp.Ry_result != "88888") {
                  reject(-1);
                } else {
                  resolve(resp);
                }
              }
            );
          });
        });
      const { Data } = responseData;
      // debugger
      runInAction(() => {
        this.allMoreDatas = Data;
        // this.isRefreshing = RefreshState.Idle
        this.isRefreshing;
        console.log("===isRefreshing is ==" + this.isRefreshing);
      });
      return Data;
    } catch (error) {
      console.log("数据错误" + error);
      if (error == -1) {
        runInAction(() => {
          this.isRefreshing = RefreshState.NoMoreData;
          console.log("错误后" + this.allMoreDatas.length);
        });
      } else {
        runInAction(() => {
          this.isRefreshing = RefreshState.Failure;
        });
      }
    }
  };
}

export default OrderStore;
