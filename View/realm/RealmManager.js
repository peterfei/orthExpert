import Realm from "realm";
import Migrations from "./Migrations";

var RNFS = require('react-native-fs');
let a = Migrations;
let realm = null;

realm = new Realm(Migrations[0]);
Realm.copyBundledRealmFiles();




function ifNullString(item) {
    if (item == undefined || item == null) {
        return "";
    } else {
        return item.toString();
    }
}

function ifNullInt(item) {
    if (item == undefined || item == null) {
        return 0;
    } else {
        return item;
    }
}



function getRequire(filed, ids) {
    if (ids == undefined || ids == '' || ids == null) {
        return filed + "=-1";
    } else {
        let temp = "";
        var arr = ids.split(",");
        for (var i = 0; i < arr.length; i++) {
            if (i == arr.length - 1) {
                temp += filed + "=" + arr[i] + "  "
            } else {
                temp += filed + "=" + arr[i] + " or  "
            }

        }
        return temp;
    }
}

function getRequireString(filed, ids) {
    if (ids == undefined || ids == '' || ids == null) {
        return filed + "=-1";
    } else {
        let temp = "";
        var arr = ids.split(",");
        for (var i = 0; i < arr.length; i++) {
            if (i == arr.length - 1) {
                temp += filed + "='" + arr[i] + "'  "
            } else {
                temp += filed + "='" + arr[i] + "' or  "
            }

        }
        return temp;
    }
}

/**
 * 查询全部的历史搜索
 */

const queryHistoryAll = () => {
    let _query;
    let _queryLimit;
    try {
        _query = realm.objects("HistorySearch").sorted('addTime', true).slice(0, 15)
        //  _queryLimit = _query.slice(0, 10)
    } catch (error) {
        console.log(error);
    }

    return _query;
};

/**
 * 点击搜索后插入数据
 */
const insertHistory = async obj => {
    
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {

            let rs = realm.objects('HistorySearch').filtered(`keyName = '${obj.keyName}'`)
            let counts = rs.length;
            if (rs == null || rs.length == 0) {
                realm.create("HistorySearch", obj);
            } else {
                obj.addTime != undefined ? rs[counts - 1].addTime = obj.addTime : null;
            }

        });
    } catch (error) {

        console.log(error);
    }
};

/**
 * 删除历史数据
 */

const deleteHistories = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects('HistorySearch'));
        });
    } catch (error) {
        console.log(error);
    }
};

/**
 * 查询最近使用数据
 */
const queryRecentlyUse = () => {
    let _query;
    let _queryLimit;
    try {
        _query = realm.objects("GetRecentlyUse");
    } catch (error) {
        console.log(error);
    }

    return _query;
};




export {
    //insertExamQuestions,
    //queryExamQuestions,
    // deleteExamQuestions,
    // queryExamQuestionsIsCorrect,
    // insertExamType,
    // queryExamTypes,
    // queryExamTypesById,
    // queryExamVersionByName,
    // insertExamVersion,
    // deleteExamTypes,
    // deleteExamQuestion
    // saveRelationList,
    // saveStructList,
    // saveVideoList,
    // saveWebList,
    /*getAll*/
    // getAllRelation,
    // getAllStruct,
    // getAllVideo,
    // getAllWeb,
    /*delete*/
    // deleteAllWeb,
    // deleteAllVideo,
    // deleteAllStruct,
    // deleteAllRelation,
    /*getByIds*/
    // getWebByIds,
    // getVideoByIds,
    // getStructByIds,
    // getRelationByName,
    queryHistoryAll,
    

    //历史搜索
    queryHistoryAll,
    deleteHistories,

    //首页推荐最近使用
    //insertRecentlyUse,
    queryRecentlyUse,
    //getTabVersionByName,
    //insertTabVersion,
    //deleteAllMsg,
    //消息通知
    // insertSystemInformData,
    // querySystemInformData,
    // queryMarkNail,
    // insertMarkNail,
    // insertResRelation,
    // insertResWeb,
    // queryResWeb,
    // queryResRelation,
    // queryRelationBySmName,
    // insertMarkNoun,
    // queryMarkNoun,
    // queryMarkNailByNoun,
    // getTabVersionByNameSystem,
    // insertTabVersionSystem,
    // insertTriggerPifu,
    // insertTriggerSubmodel,
    // queryTriggerByPifuNo,
    // queryTriggerInfo
    // insertRecentlyUse,
    queryRecentlyUse,
    
};
