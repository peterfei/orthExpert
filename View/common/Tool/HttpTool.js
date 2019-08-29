
import NetInterface from '../NetInterface';
import {storage} from "../storage";
import {NetInfo} from 'react-native';
import api from '../../api';

//dev 开发   prod 产品

let active = "dev";

let base_url_jiepou ;
let base_url_sport ;

let base_url;
if (active=='prod'){
     base_url_sport = "http://slb-sport.vesal.cn/vesal-sport-prod/";
     base_url_jiepou = "http://api.vesal.cn:8000/vesal-jiepao-prod/";
     base_url= "http://api.vesal.cn:8000/vesal-jiepao-prod/"
} if (active=='test'||active=='dev'){
     base_url_sport = "http://114.115.210.145:8085/vesal-sport-test/";
     base_url_jiepou = "http://118.24.119.234:8087/vesal-jiepao-test/";
     base_url = "http://118.24.119.234:8087/vesal-jiepao-test/"
}

let connect = false;
const netChange = (isConnect) => {
  // NetInfo.isConnected.removeEventListener('change', netChange);
  connect = isConnect;
}

// RN获取网络状态(true/false)
async function getNetWorkState() {
  if (Platform.OS === 'ios') {
    await NetInfo.isConnected.addEventListener('change', netChange);
    return connect;
  } else {
    await NetInfo.isConnected.addEventListener('change', netChange);
    return await NetInfo.isConnected.fetch();
  }
}


export async function POST(urlInterface, params) {
  let tokens = await storage.get("userTokens");
  let url = base_url + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "post",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
      .then((resp) => resp.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error);
        let isConnect = getNetWorkState();
        if (!isConnect) {
          error = '检测到你当前无网络连接';
        }
        reject(error);
      });
  });
}

export async function POST_SP(urlInterface, params) {
  let tokens = await storage.get("userTokens");
  let url = base_url_sport + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "post",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
        .then((resp) => resp.json())
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          let isConnect = getNetWorkState();
          if (!isConnect) {
            error = '检测到你当前无网络连接';
          }
          reject(error);
        });
  });
}

export async function GET(urlInterface) {
  let tokens = await storage.get("userTokens");
  let url = base_url_sport + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "get",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
      .then((resp) => resp.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // alert(error)
        let isConnect = getNetWorkState();
        if (!isConnect) {
          error = '检测到你当前无网络连接';
        }
        reject(error);
      });
  });
}
export async function GETX(urlInterface) {
  let tokens = await storage.get("userTokens");
  let url = api.base_uri + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "get",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
      .then((resp) => resp.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        let isConnect = getNetWorkState();
        if (!isConnect) {
          error = '检测到你当前无网络连接';
        }
        reject(error);
      });
  });
}

export async function UploadImg(photos) {
  let uploadUrl = base_url+NetInterface.uploadImg + '?type=6';
  let tokens = await storage.get("userTokens");
  let formData = new FormData();
  photos.forEach((photo) => {
    let file = { uri:  photo.uri, type: 'multipart/form-data', name: 'image.png'};
    formData.append('file', file);
  })
  return new Promise(function(resolve, reject){
    fetch(uploadUrl, {
      method: "post",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        token: tokens.token
      }
    })
      .then(resp => resp.json())
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        let isConnect = getNetWorkState();
        if (!isConnect) {
          error = '检测到你当前无网络连接';
        }
        reject(error);
      })
  });
}



export async function POST_JP(urlInterface, params) {
  let tokens = await storage.get("userTokens");
  let url = base_url_jiepou + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "post",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
        .then((resp) => resp.json())
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          let isConnect = getNetWorkState();
          if (!isConnect) {
            error = '检测到你当前无网络连接';
          }
          reject(error);
        });
  });
}

export async function GET_JP(urlInterface) {
  let tokens = await storage.get("userTokens");
  let url = base_url_jiepou + urlInterface;
  return new Promise(function(resolve, reject){
    fetch(url,{
      method: "get",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        token: tokens.token
      }
    })
        .then((resp) => resp.json())
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          let isConnect = getNetWorkState();
          if (!isConnect) {
            error = '检测到你当前无网络连接';
          }
          reject(error);
        });
  });
}

export async function UploadImg_JP(photos) {
  let uploadUrl = base_url_jiepou+NetInterface.uploadImg + '?type=6';
  let tokens = await storage.get("userTokens");
  let formData = new FormData();
  photos.forEach((photo) => {
    let file = { uri:  photo.uri, type: 'multipart/form-data', name: 'image.png'};
    formData.append('files', file);
  })
  return new Promise(function(resolve, reject){
    fetch(uploadUrl, {
      method: "post",
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        token: tokens.token
      }
    })
        .then(resp => resp.json())
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          let isConnect = getNetWorkState();
          if (!isConnect) {
            error = '检测到你当前无网络连接';
          }
          reject(error);
        })
  });
}
