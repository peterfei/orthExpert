import NetInterface from '../NetInterface';
import {storage} from "../storage";
import {NetInfo} from 'react-native';

//dev 开发   prod 产品
import api from "../../api";
let base_url_jiepou = api.base_url_jiepou ;
let base_url_sport  = api.base_url_sport;

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
        let isConnect = getNetWorkState();
        if (!isConnect) {
          error = '检测到你当前无网络连接';
        }
        reject(error);
      });
  });
}

export async function UploadImg(photos) {
  let uploadUrl = base_url_sport+NetInterface.uploadImg + '?type=6';
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
  console.log(JSON.stringify(url));
  console.log(JSON.stringify(tokens.token));
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

