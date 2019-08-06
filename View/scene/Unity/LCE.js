import {storage} from "../../common/storage";
import DeviceInfo from "react-native-device-info";
import api from "../../api";
import {DeviceEventEmitter} from "react-native";
import {Alert, BackAndroid, Platform, StyleSheet, View, AppState, Text, Image} from "react-native";
import {
    insertRecentlyUse,
    queryRecentlyUse,

} from "../../realm/RealmManager";

/**
 * 檢查是否已收藏
 * @param struct_id
 * @returns {Promise<void>}
 */
export async function checkConnect(struct_id) {

    let member = await storage.get("memberInfo");
    let tokens = await storage.get("userTokens");
    let isConnect;
    //isConnect 未收藏
    const url = api.base_uri + "/v1/app/member/isMemberCollection?mbId=" + member.mbId + "&structId=" + struct_id;
    try {
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token

            }
        }).then(resp => resp.json()).then(result => {

            if (result.code == 0) {

                if (result.isMemberCollection) {
                    isConnect = true;
                } else {
                    isConnect = false;
                }
            }

        });

    } catch (e) {

    }
    return isConnect;
}

/**
 * 添加收藏
 * @returns {Promise<void>}
 */
export async function addConnect(struct_id) {

    let memberInfo = await storage.get("memberInfo", "");
    let tokens = await storage.get("userTokens");
    let flag = memberInfo != -1 && memberInfo != -2 && tokens != -1 && tokens != -2;

    if (flag) {
        try {
            await fetch(api.base_uri + "v1/app/member/operateMemberCollection?" +
                "token=" + tokens.token + "&structId=" + struct_id + "&mbId=" + memberInfo.mbId, {
                method: "get",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(resp => resp.json()).then(result => {
                /*clear*/
                //为了体验 不做任何处理
                DeviceEventEmitter.emit("showCollectionList");
            });
        } catch (e) {

        }
    }

}

/**
 * 检测证书是否使用
 * 传入模型 显示是否使用
 * 未购买  免费   xxx到期
 * @param struct
 */
export function checkIsUse(info, licenList) {


    let rsTitle = "未购买";
    //检测用户token 是否过期
    //免费
    if (info.is_charge == "no") {
        //不收费
        rsTitle = "免费"

    } else if (info.is_charge == "yes") {
        rsTitle = getEndTime(licenList, info);
    }
    return rsTitle;

}

/**
 * 判断是否为空
 * @param obj
 * @returns {*}
 */
export function ifnull(obj) {
    if (obj == undefined || obj == null || obj == "null") {
        return ""
    } else {
        return obj
    }
}

/**
 * 开始使用 判断去unity 还是商城
 * @param struct
 * @param containModel 包含的模型
 * @param _this
 */
export async function useStart(struct, containModel, _this) {
    let tokens = await storage.get("userTokens");
    let memberInfo = await storage.get("memberInfo");

    if (memberInfo.isYouke == "yes") {
        if (struct.youke_use == "disabled") {
            //游客不可用
            Alert.alert("温馨提示", "您当前身份是游客,请先注册或登录使用会员功能");
            _this.timer = setTimeout(() => {
                _this.props.navigation.navigate("LoginPage");
            }, 1000);

        } else {
            checkBuyState(struct, containModel, _this, tokens)
        }
    } else {
        //检查是否可用
        checkBuyState(struct, containModel, _this, tokens)
    }


}

async function checkBuyState(struct, containModel, _this, tokens) {

    if (struct.lince == '未购买') {
        try {
            const url =
                api.base_uri +
                "/v2/app/struct/checkStructIsUse?structId=" +
                struct.struct_id;
            await fetch(url, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    token: tokens.token
                }
            })
                .then(resp => resp.json())
                .then(result => {

                    if (result.code == 0 && result.count > 0) {
                        checkGotoUnity(struct, containModel, _this);
                        DeviceEventEmitter.emit("loadHomeData");
                    } else {
                        toShopDetail(struct.struct_id, _this);
                    }
                });
        } catch (error) {
            Alert.alert("网络异常")
        }
    } else {
        checkGotoUnity(struct, containModel, _this);
    }
}

/**
 * 去商城购买
 */
async function toShopDetail(structId, _this) {
    Alert.alert("付费版请先购买", "已为您推荐套餐");
    let tokens = await storage.get("userTokens");
    const url =
        api.base_uri +
        "v2/app/struct/findComboByStructId?&structId=" +
        structId +
        "&plat=" +
        Platform.OS +
        "& business=anatomy&appVersion=3.3.0"; //拉取服务器最新版本
    await fetch(url, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            token: tokens.token
        }
    })
        .then(resp => resp.json())
        .then(result => {
            if (result.code == 0) {
                //  alert(JSON.stringify(result.List))
                if (result.List.length > 1) {
                    DeviceEventEmitter.emit("ShopEmitter", {
                        struct_id: structId
                    });
                    _this.props.navigation.navigate("ChosenStore", {
                        struct_id: structId
                    });
                } else if (result.List.length == 1) {
                    _this.props.navigation.navigate("ShopDetail", {
                        obj: result.List[0],
                        navigation: _this.props.navigation
                    });
                } else {
                    Alert.alert("溫馨提示", "系统暂未发布相关套餐");

                }
            } else if (result.msg.indexOf("token失效") != -1) {
                storage.clearMapForKey("userTokens");
                storage.clearMapForKey("memberInfo");
                // Alert.alert("登录过期,请重新登录")
                _this.props.navigation.navigate("LoginPage");
            }
        });
}

/**
 * 开始使用
 * @param struct
 */
export function checkGotoUnity(struct, containModel, _this) {


    if (containModel != undefined && containModel != '') {
        struct['signModelName'] = containModel
        struct['tissueModelName'] = containModel
    } else {
        containModel = "";
    }

    if (struct.app_version == undefined) {
        struct['app_version'] = struct.struct_version
    }

    if (struct.ab_path == undefined) {
        struct['ab_path'] = struct.file_url
    }
    if (struct.app_type == 'microlesson') {

        if (struct.ab_path && (struct.ab_path.indexOf("mp4") != -1 || struct.ab_path.indexOf("MP4") != -1)) {
            _this.props.navigation.navigate("WkVideo", {struct: struct});
            return;
        }

    }

    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    if (struct.struct_name == struct.search_key_name) {
        containModel = ""
    }
    let temp = {
        id: struct.struct_id,
        name: struct.struct_name,
        date: (new Date()).Format("yyyy-MM-dd hh:mm:ss"),
        count: 1,
        modelName: containModel
    }
    if (struct.app_type != 'game' && struct.app_type != 'microlesson') {

        insertRecentlyUse(temp);
    }

    addUseLog(struct)
    DeviceEventEmitter.emit('refreshRecentlyUse')
    if (struct.app_type == 'exam2d') {//跳转2D测验练习
        _this.props.navigation.navigate('ExamList', {info: struct})
    } else {
        const isTablet = DeviceInfo.isTablet() //是否为平板
        struct['isTablet'] = isTablet
        if (struct.app_type == 'acu') {
            _this.props.navigation.navigate("AcupointNewScene", {info: struct});
        } else if (struct.app_type == 'model' ) {
            _this.props.navigation.navigate("BonesScene", {info: struct});
        } else if (struct.app_type == 'cfd') {
            _this.props.navigation.navigate("TriggerScene", {info: struct});
        }  else if (struct.app_type == 'new_cfd') {
            _this.props.navigation.navigate("WholeTriggersScene", {info: struct});
        } else if (struct.app_type == 'medical'|| struct.app_type == 'medical_part') {
            _this.props.navigation.navigate("MedicalScene", {info: struct});
        } else {
            _this.props.navigation.navigate("ModelScene", {info: struct});
        }

    }

}

/**
 * 添加使用记录
 * @param info
 * @returns {Promise<boolean>}
 */
async function addUseLog(info) {

    try {
        const url =
            api.base_uri +
            "/v1/app/struct/addStructUseLog?structId=" +
            info.struct_id;
        let tokens = await storage.get("userTokens");
        let responseData = await fetch(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                token: tokens.token
            }
        })
            .then(resp => resp.json())
            .then(result => {
            });
    } catch (error) {
    }
    return true;
}

/**
 * 将日期转 刚刚 1小时前等
 * @param dateStr
 * @returns {*}
 */
export function getDate(dateStr) {
    try {
        let dateTimeStamp = new Date(dateStr.replace(/-/g, '/')).getTime();
        var minute = 1000 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var halfamonth = day * 15;
        var month = day * 30;
        var now = new Date().getTime();
        var diffValue = now - dateTimeStamp;

        if (diffValue < 0) {
            return;
        }
        var monthC = diffValue / month;
        var weekC = diffValue / (7 * day);
        var dayC = diffValue / day;
        var hourC = diffValue / hour;
        var minC = diffValue / minute;
        let result = '';
        if (monthC >= 1) {
            result = "" + parseInt(monthC) + "月前";
        }
        else if (weekC >= 1) {
            result = "" + parseInt(weekC) + "周前";
        }
        else if (dayC >= 1) {
            result = "" + parseInt(dayC) + "天前";
        }
        else if (hourC >= 1) {
            result = "" + parseInt(hourC) + "小时前";
        }
        else if (minC >= 1) {
            result = "" + parseInt(minC) + "分钟前";
        } else
            result = "刚刚";
        return result;
    } catch (e) {
        return "";
    }

}

/**
 * 获取授权证书列表
 * @returns {Promise<*>}
 */
export async function getLinceList() {

    let licenList = await storage.get("licenList");
    /*    let wkList = await storage.get("licenCyList");
        let licenWkList = await storage.get("licenWkList");*/
    let rs = licenList == undefined ? [] : licenList;
    if (rs == undefined || rs == null) {
        rs = []
    }

    return rs;

}

/**
 * 获取产品到期日期
 * @param licenList
 * @param info
 * @returns {string}
 */
function getEndTime(licenList, info) {
    let temp = "未购买";
    if (licenList != -1 && licenList != -2 && licenList && licenList.length > 0) {
        for (let i = 0; i < licenList.length; i++) {
            let item = licenList[i];

            if (item.struct_id == info.struct_id) {
                let currTime = new Date();
                let flag =
                    new Date(item.e_time.substring(0, 10)).getTime() + 1000 * 60 * 60 * 24 >=
                    currTime.getTime();
                if (flag) {
                    let use =
                        (new Date(item.e_time.substring(0, 10)).getTime() -
                            currTime.getTime()) /
                        1000 /
                        60 /
                        60 /
                        24;
                    //  return "还可用" + Math.round(use) + "天";
                    temp = item.e_time.substring(0, 10) + "到期";
                }
            }
        }

    }
    return temp;
}

/**
 * 16进制转字符
 * */
export function hexToStr(str) {
    var val = ""
    var arr = str.split("_")
    for (var i = 0; i < arr.length; i++) {
        val += String.fromCharCode(parseInt(arr[i], 16))
    }
    return val
}

export function changeArr(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i])
    }
    return newArr;
}

export function filterTree(json, input) {
    let sure = Object.keys(input).toString().replace(/,/g, '|')
    let _reg = '\{"children":\[\],"en_name":"[^"]*?","ch_name":"[^"]*?","sm_name":"((?!(' + sure + ')).)[^"]*"\}(,)'
    let reg = new RegExp(_reg, 'g')

    return json.replace(reg, '').replace(reg, '').replace(reg, '').replace(reg, '').replace(reg, '').replace(reg, '').replace(reg, '');
}

