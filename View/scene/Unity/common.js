import {DeviceEventEmitter} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
    Platform
} from "react-native";
import { getItemBySmName,
    getAnimationByNos,
    getRelationByName,
    getWebByIds
} from "../../realm/RealmManager"
import {storage} from "../../common/storage";

export function groupBy(targetList, field) {
    const names = findNames(targetList, field);
    return names.map(name => {
        const value = targetList.filter(target => target[field] === name)
        if (name == '动作') {
            return {
                key: name,
                value,
                parent_sort: 1
            }
        } else {
            return {
                key: name,
                value,
                parent_sort: 2
            }
        }


    })
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

export function groupWeb(targetList, field) {
    const names = findNames(targetList, field);
    return names.map(name => {

        const value = targetList.filter(target => target[field] === name)
        return {
            firstSort: value[0].firstSort == undefined ? "" : value[0].firstSort,
            secondSort: value[0].secondSort == undefined ? "" : value[0].secondSort,
            key: name,
            "icon_url": value[0].firstIconUrl == undefined ? "" : value[0].firstIconUrl,
            value
        }
    })
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

//排序

export function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

export function s_to_hs(s) {
    //计算分钟
    //算法：将秒数除以60，然后下舍入，既得到分钟数
    var h;
    h = Math.floor(s / 60);
    //计算秒
    //算法：取得秒%60的余数，既得到秒数
    s = s % 60;
    //将变量转换为字符串
    h += '';
    s += '';
    //如果只有一位数，前面增加一个0
    h = (h.length == 1) ? '0' + h : h;
    s = (s.length == 1) ? '0' + s : s;
    return h + ':' + s;
}

export function changeArr(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i])
    }
    return newArr;
}

/**
 * 根据子模型查找对应的动画列表
 * @param smName
 */
export function getAmList(smName) {
    let animation = getItemBySmName(smName);
    if (animation.length > 0) {
        let no_list = animation[0].am_no_list;
        return getAnimationByNos(no_list);
    } else {
        return [];
    }
}

/**
 * 查找子模型的web
 */
export function getWebList(name, type) {
    let webList = [];

    let relation = getRelationByName(name, type)
    if (relation.length > 0) {
        webList = getWebByIds(relation[0].rw_ids);
    }
    return webList;


}

/**
 * 筛选难度结果
 */
export function getSelectDifficulty(currAmList, currBottom, diffArr) {
    //  let temp = Object.assign({}, currAmList);


    for (let i = 0; i < currAmList.length; i++) {
        let item = currAmList[i];
        if (item.key == currBottom) {
            let obj = JSON.parse(JSON.stringify(item.value));
            item.value = filterByDiffArr(obj, diffArr)
            //  alert( filterByDiffArr(obj, diffArr))
            break;
        }
    }
}

/**
 * 筛选难度结果
 */
export function getDiffLevel(currAmList, currBottom) {
    let rs = [];
    for (let i = 0; i < currAmList.length; i++) {
        let item = currAmList[i];
        if (item.key == currBottom) {
            let obj = JSON.parse(JSON.stringify(item.value));
            let arr = groupBy(obj, "difficulty");
            arr.forEach(target => {
                if (target["key"] != '') {
                    let obj = {
                        difficulty: target["key"],
                        check: true
                    }
                    rs.push(obj)
                }
            })
            break;
        }
    }

    return rs;
}

function filterByDiffArr(aim, nameArr) {


    for (let i = 0; i < nameArr.length; i++) {
        for (let j = 0; j < aim.length; j++) {
            let item = aim[j];
            if (item.difficulty == nameArr[i].difficulty) {
                if (nameArr[i].check) {
                    item['hide'] = true
                } else {
                    item['hide'] = false
                }
            }
        }

    }
    //alert(JSON.stringify(aim))
    return aim
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
//对字符串进行加密
export function compileStr(code){ //对字符串进行加密
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);
    for(var i=1;i<code.length;i++)
    {
        c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
    }
    return escape(c);   }




//字符串进行解密
export function uncompileStr(code){
    code=unescape(code);
    var c=String.fromCharCode(code.charCodeAt(0)-code.length);
    for(var i=1;i<code.length;i++)
    {
        c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));
    }
    return c;   }
