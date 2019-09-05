import { observable, computed, action, runInAction, autorun } from "mobx";
import { RefreshState } from "react-native-refresh-list-view";
import api from "../api";
import { get } from "../common/httpTool";
//import xml2js from "react-native-xml2js/lib/parser";

export default class UserStore {
  @observable user_name = "";
  @observable password = "";
  @observable params_data = {};
  @observable userDatas = {};
  @observable props = {};
  @observable result = "";
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  LoginAction = async () => {
    try {
      const url = api.base_uri + "v1/app/member/login";
      let responseData = await fetch(url, {
        method: "post",
        body: JSON.stringify(this.params_data),
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      })
        .then(resp => resp.json())
        .then(result => {
          return result;
        });
      runInAction(() => {
        // debugger
        this.userDatas = responseData;
      });
      return this.userDatas;
    } catch (error) {
      return -1;
      console.log("登陆数据错误" + error);
      // this.isRefreshing = RefreshState.Failure
    }
  };

  @action
  sendVeryCode = async () => {
    try {
      const url = api.verify_url;
      const parseString = require("react-native-xml2js").parseString;
      // const _data = this.params_data;
      const paramArr = [];
      if (Object.keys(this.params_data).length !== 0) {
        for (const key in this.params_data) {
          paramArr.push(`${key}=${this.params_data[key]}`);
        }
      }
      const urlStr = `${url}?${paramArr.join("&")}`;
      // debugger
      let responseData = await fetch(urlStr)
        .then(res => res.text())
        .then(response => {
          return new Promise(function(resolve, reject) {
            parseString(
              response,
              {
                explicitArray: false,
                ignoreAttrs: true
              },
              function(err, result) {
                // debugger
                resolve(JSON.parse(result.string));
              }
            );
          });
        });
      // debugger
      const { Ry_result } = responseData;
      runInAction(() => {
        // debugger
        this.result = Ry_result;
      });
    } catch (error) {
      console.log("发送校验码失败");
    }
  };

  @action
  modifyPassword = async () => {
    try {
      const url = api.base_uri + "/v1/app/member/forgetPwd";
      let responseData = await fetch(url, {
        method: "post",
        body: JSON.stringify(this.params_data),
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      })
        .then(resp => resp.json())
        .then(
          result => {
            return result;
          },
          error => {
            console.log("modifyPassword error");
          }
        );

      runInAction(() => {
        // debugger
        this.result = responseData;
      });
      return this.result;
    } catch (error) {
      return -1;
      console.log("登陆数据错误" + error);
      // this.isRefreshing = RefreshState.Failure
    }
  };

  @action
  registerUser = async () => {
    try {
      const url = api.base_uri + "v1/app/member/register";
      let responseData = await fetch(url, {
        method: "post",
        body: JSON.stringify(this.params_data),
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      })
        .then(resp => resp.json())
        .then(
          result => {
            return result;
          },
          error => {
            console.log("registerUser error");
          }
        );

      runInAction(() => {
        // debugger
        this.result = responseData;
      });
      return this.result;
    } catch (error) {
      return -1;
      console.log("登陆数据错误" + error);
      // this.isRefreshing = RefreshState.Failure
    }
  };

  @action
  loginWithTourist = async () => {
    try {
      const url = api.base_uri + "v1/app/member/youkeLogin";
      let responseData = await fetch(url, {
        method: "post",
        body: JSON.stringify(this.params_data),
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      })
        .then(resp => resp.json())
        .then(
          result => {
            return result;
          },
          error => {
            console.log("registerUser error");
          }
        );

      runInAction(() => {
        // debugger
        this.result = responseData;
      });
      return this.result;
    } catch (error) {
      return -1;
      console.log("登陆数据错误" + error);
      // this.isRefreshing = RefreshState.Failure
    }
  };
}
