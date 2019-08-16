import {
    Dimensions,
    PixelRatio,
    Platform,
} from 'react-native';


export const deviceWidth = Dimensions.get('window').width;      //设备的宽度
export const deviceHeight = Dimensions.get('window').height;    //设备的高度
let fontScale = PixelRatio.getFontScale();                      //返回字体大小缩放比例
let pixelRatio = PixelRatio.get();                              //当前设备的像素密度
const defaultPixel = 2;                                         //iphone6的像素密度
//px转换成dp
const w2 = 750 / defaultPixel;
const h2 = 1334 / defaultPixel;
const scale = Math.min(deviceHeight / h2, deviceWidth / w2);   //获取缩放比例

// iPhoneX
// const X_WIDTH = 375;
// const X_HEIGHT = 812;
//iphoneX 序列机型的屏幕高宽 以下即可看出全是216左右
//XSM SCREEN_HEIGHTL = 896.000000,SCREEN_WIDTHL = 414.000000  2.1642512077
//XS  SCREEN_HEIGHTL = 812.000000,SCREEN_WIDTHL = 375.000000  2.1653333333
//XR  SCREEN_HEIGHTL = 896.000000,SCREEN_WIDTHL = 414.000000  2.1642512077
//X   SCREEN_HEIGHTL = 812.000000,SCREEN_WIDTHL = 375.000000  2.1653333333
export const isIPhoneX = (Platform.OS === 'ios' && (Number(((deviceHeight/deviceWidth)+"").substr(0,4)) * 100) === 216);

//iphoneX 顶部留白的兼容处理
export function isIPhoneXPaddTop(number) {
    number = isNaN(+number) ? 0 : +number;
    return number + (isIPhoneX ? 44 : 20)
}

//iPhoneX 底部高度兼容处理
export function isIPhoneXFooter(number){
    number = isNaN(+number) ? 0 : +number;
    return number + (isIPhoneX ? 34 : 0 )
}

//文字适配size, 暂不使用
export function setSpText(size: number) {
    size = Math.round((size * scale + 0.5) * pixelRatio / fontScale);
    return size / defaultPixel;
}

//view适配size
export function size(size: number) {
    size = Math.round(size * scale + 0.5);
    return size / defaultPixel;
}