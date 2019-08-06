import { observable, computed, action, runInAction } from "mobx";
import { RefreshState } from "react-native-refresh-list-view";
import api from "../api";
import { get } from "../common/httpTool";

class DissectStore {
  @observable functionType = "";
  // @observable token = '';
  @observable result = "";
  @observable list = "";
  constructor(rootStore) {
    // this.fetchDissectLists()
    this.rootStore = rootStore;
  }
  // 获取tabs
  @action
  getTypeList = async () => {
    try {
      const url = api.base_uri + "/v1/app/struct/funTypeList";
      let responseData = await fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          token: this.token
        }
      })
        .then(resp => resp.json())
        .then(
          result => {
            return result;
          },
          error => {
            console.log("getTypeList error");
          }
        );

      runInAction(() => {
        this.result = responseData;
        this.list = responseData.List;
      });
      return this.result;
    } catch (error) {
      return -1;
      console.log("登陆数据错误" + error);
    }
  };
  // 获取数据列表

  @action
  fetchDissectLists = async () => {
    try {
      const url =
        api.dissect +
        this.typeID +
        "&loginCode=" +
        this.loginCode +
        "&memberId=" +
        this.memberId +
        "&queryType=" +
        this.queryType +
        "&rykjKey=" +
        this.api_key;
      const parseString = require("react-native-xml2js").parseString;
      console.log("***lists url is " + url);
      let responseData = await fetch(url)
        .then(res => res.text())
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
                resolve(JSON.parse(result.string));
              }
            );
          });
        });

      const {
        Data,
        peopleStructData,
        resourceData,
        testPracticeData
      } = responseData;
      // debugger
      runInAction(() => {
        Data = Data.map(function(m, index) {
          if (m.StructId != "") {
            return m;
          } else {
            Data.pop();
          }
        });
        console.log("Count Datais" + Data);
        this.allDatas = Data;
        try {
          peopleStructData[peopleStructData.length - 1].StructId == ""
            ? peopleStructData.pop()
            : peopleStructData;
          this.peopleStructData = peopleStructData;
          this.resourceData = resourceData;
        } catch (error) {
          console.log("暂无peopleStructData");
        }
        testPracticeData = testPracticeData.map(function(m, index) {
          if (m.StructId != "") {
            return m;
          } else {
            testPracticeData.pop();
          }
        });
        // testPracticeData[testPracticeData.length-1].StructId==""? testPracticeData.pop():testPracticeData
        this.testPracticeData = testPracticeData;
        // this.isRefreshing = RefreshState.Idle
      });
      return { Data, peopleStructData, resourceData, testPracticeData };
    } catch (error) {
      console.log("数据错误" + error);
      throw error;
      // this.isRefreshing = RefreshState.Failure
    }
  };
}

export default DissectStore;
