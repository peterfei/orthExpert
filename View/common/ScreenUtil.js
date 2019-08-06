import {
    Dimensions,
    PixelRatio,
} from 'react-native';
let ReactNative = require('react-native');


export const deviceWidth = Dimensions.get('window').width;      //设备的宽度
export const deviceHeight = Dimensions.get('window').height;    //设备的高度
let fontScale = PixelRatio.getFontScale();                      //返回字体大小缩放比例

let pixelRatio = PixelRatio.get();      //当前设备的像素密度
const defaultPixel = 2;                           //iphone6的像素密度
//px转换成dp
const w2 = 750 / defaultPixel;
const h2 = 1334 / defaultPixel;
const scale = Math.min(deviceHeight / h2, deviceWidth / w2);   //获取缩放比例

// 根据dp获取屏幕的px
let screenPxW = ReactNative.PixelRatio.getPixelSizeForLayoutSize(deviceWidth);
let screenPxH = ReactNative.PixelRatio.getPixelSizeForLayoutSize(deviceHeight);

// 高保真的宽度和告诉
const designWidth = 750.0;
const designHeight = 1334.0;
/**
 * 设置text为sp
 * @param size sp
 * return number dp
 */
export function setSpText(size: Number) {
    // console.log("screenW======" + deviceWidth);
    // console.log("screenPxW======" + screenPxW);
    var scaleWidth = deviceWidth / designWidth;
    var scaleHeight = deviceHeight / designHeight;
    var scale = Math.min(scaleWidth, scaleHeight);
    size = Math.round(size * scale / fontScale + 0.5);
    return size;
}

export function size(size: number) {

    size = Math.round(size * scale + 0.5);
    return size / defaultPixel;
}