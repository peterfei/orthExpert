import {Alert, NativeModules, Platform} from 'react-native';
import {HttpTool, NetInterface} from "./index";
import {storage} from "./storage";
import {NavigationActions, StackActions} from "react-navigation";
import api from "../api";
import DeviceInfo from "react-native-device-info";


//检测app 版本是否是最新版本
export async function CheckAppVersion(item) {
    Alert.alert(
        "发现新版本" + item.title + "(" + item.size + ")",
        item.description,
        [
            {text: "稍后再说"},
            {
                text: "立即更新",
                onPress: function () {
                    const downloadUrl = item.url;
                    NativeModules.DownloadApk.downloading(
                        downloadUrl,
                        "guke.apk"
                    );
                }
            }
        ]
    );
}

/**
 * 更新会员的权限
 * @param token
 */
export async function getMemberAllCombo() {

    const url = NetInterface.memberComboList;
    await HttpTool.GET(url)
        .then(res => {

            if (res.code == 0) {
                storage.save("memberCombo", "", res.memberComboList);
            }
        })
        .catch(error => {
            console.log(error)
        })
}

/**
 * 从缓存获取某个套餐的权限信息
 * @param token
 */
export async function getComboByCode(comboCode) {
    let result = null;
    let comboList = await storage.get("memberCombo");

    if (comboList != -1 && comboList != -2) {

        for (let ind in comboList) {
            let item = comboList[ind];

            if (item.combo_code == comboCode) {
                result = item;

                break;
            }
        }
    }

    return result;

}

export function validatePwd(s) {
    var patrn = /^(\w){6,20}$/;
    if (!patrn.exec(s)) {
        return false
    }
    return true
}

export async function checkComboisExpire(comboCode) {
    let isUse = false
    let url = NetInterface.checkComboisExpire + `?comboCode=${comboCode}`
    await HttpTool.GET_JP(url)
        .then(res => {
            if (res.code === 0 && res.result === 'no') {
                isUse = true
            } else {
                isUse = false
            }
        })

    return isUse
}

export async function checkPerm(isFree, comboCode) {
    //isFree 是否收费 yes no

    let isUse = false;//false false 不能使用 true 可以使用
    //ifFree 0
    if (isFree == 'no') {
        isUse = true;
    } else {
        let perm = await getComboByCode(comboCode);
        if (perm != null) {
            let currTime = new Date();
            let flag = new Date(perm.end_time.substring(0, 10)).getTime() + 1000 * 60 * 60 * 24 >= currTime.getTime();
            if (flag) {
                isUse = true;
            }
        }
    }
    //如果真的不可用 那就去服务器查一下吧
    if (!isUse) {

        const url = NetInterface.checkProductIsUse + "?comboCode=" + comboCode;
        await HttpTool.GET(url)
            .then(res => {

                if (res.code == 0) {
                    if (res.isUse) {
                        isUse = true;
                    }
                }
            })
            .catch(error => {
                console.log(error)
            })


    }

    return isUse;

}

/**
 *     检查骨科vip  使用权限
 */
export function checkKfPerm() {
    const url = NetInterface.checkComboisExpire + '?comboCode=ORTHOPE_VIP';
    return new Promise((reslove, reject) => {
        HttpTool.GET_JP(url)
            .then(result => {
                reslove(result)
            })
            .catch(error => {
                reject(error)
            });
    })
}

//检测手机号或邮箱是否合法
export function CheckIsPhoneEmail(poneInput) {
    let rs = false;
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    let email = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    if (myreg.test(poneInput)) {
        rs = true;
    }
    if (!rs) {
        if (email.test(poneInput)) {
            rs = true;
        }
    }
    return rs;
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
        if (monthC >= 1) {
            result = "" + parseInt(monthC) + "月前";
        } else if (weekC >= 1) {
            result = "" + parseInt(weekC) + "周前";
        } else if (dayC >= 1) {
            result = "" + parseInt(dayC) + "天前";
        } else if (hourC >= 1) {
            result = "" + parseInt(hourC) + "小时前";
        } else if (minC >= 1) {
            result = "" + parseInt(minC) + "分钟前";
        } else
            result = "刚刚";
        return result;
    } catch (e) {
        return "";
    }

}


/**
 * 排序
 * @param targetList
 * @param field
 * @returns {{parent_sort: *, value: *, key: *}[]}
 */
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

/**
 * 排序
 * @param property
 * @returns {function(*, *): number}
 */
export function compare(property) {
    return function (a, b) {
        let value1 = a[property];
        let value2 = b[property];
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


// 下划线转驼峰
export const replaceUnderLine = (val, char = '_') => {
    const arr = val.split('')
    const index = arr.indexOf(char)
    arr.splice(index, 2, arr[index + 1].toUpperCase())
    val = arr.join('')
    if (val.indexOf(char) != -1) {
        val = replaceUnderLine(val);
    }
    return val
}

export const filterUnderLine = (obj, char = '_') => {
    const arr = Object.keys(obj).filter(item => item.indexOf(char) !== -1)
    arr.forEach(item => {
        const before = obj[item]
        const key = replaceUnderLine(item)
        obj[key] = before
        delete obj[item]
    })
    return obj
}


/**
 * 退出登录
 */
export async function logout(that) {
    await storage.clearMapForKey("userTokens");
    await storage.clearMapForKey("memberInfo");
    await storage.clearMapForKey("memberCombo");
    const resetAction = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({routeName: "LoginPage"})
        ]
    });
    that.props.navigation.dispatch(resetAction);
}

export function checkReviewStatus() {
    let url = api.base_url_jiepou + "v1/app/xml/getAppAuditState?version=" + DeviceInfo.getVersion() + "&plat=" + Platform.OS + '&business=orthExpert';
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
          .then(resp => resp.json())
          .then(result => {
              resolve(result.state);
          })
          .catch(err => {
              reject(false);
          })
    })
}
