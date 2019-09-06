import Realm from "realm";
import Migrations from "./Migrations";

var RNFS = require('react-native-fs');
let a = Migrations;
let realm = null;

realm = new Realm(Migrations[0]);
Realm.copyBundledRealmFiles();

realmSystem = new Realm(Migrations[1]);


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
 * 根据肌肉查找相关动画
 * @returns {*}
 */
const getItemBySmName = (smName) => {
    let _query;
    try {
        _query = realmSystem.objects("SportItemAnimations").filtered(`item_name = '${smName}'`);
    } catch (error) {
        console.log(error);
    }
    return _query;
};
/**
 * 根据多个动画编号查找列表
 * @returns {*}
 */
const getAnimationByNos = (nos) => {
    //   debugger;
    let _query;
    try {
        let str = getRequire('am_no', nos);
        _query = realmSystem.objects("Animation").filtered(str);
        // alert(`query is ${JSON.stringify(_query)}`)
    } catch (error) {
        console.log(error);
    }
    return _query;
};
// 查询
const getRelationByName = (name, type) => {
    let _query;
    try {
        _query = realm.objects("RelationList").filtered(`${type} = '${name}'`);
    } catch (error) {
        console.log(error);
    }
    return _query;
};

/*根据ids查询*/
// 查询全部 资源-web
const getWebByIds = (ids) => {
    //   debugger;
    let _query;
    try {
        let str = getIds('rw_id', ids);

        _query = realm.objects("WebList").filtered(str);

    } catch (error) {
        console.log(error);
    }
    return _query;
};

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

            let rs = realm.objects('HistorySearch').filtered(`ketNo = '${obj.ketNo}'`)
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

/**
 * 根据子模型查找关系资源
 * @param smName
 * @returns {*}
 */
const queryRelationBySmName = smName => {

    let result;
    try {


        if (smName != '' && smName != undefined) {
            let _query = realmSystem.objects('ResRelation').filtered(`sm_name="${smName}"`)
            if (_query && _query.length > 0) {
                let ids = _query[0].rw_ids;

                let require = getRequire('rw_id', ids);
                require = "(" + require + ") and del=0";
                result = realmSystem.objects("ResWeb").filtered(require);
            }
        }
    } catch (error) {
        alert(error);
    }
    // alert("path:" + realmSystem.path + " result:" + JSON.stringify(result))
    return result;
};

/**
 * 根据结构名词查找全部钉子列表
 * @param markNounNo
 * @returns {*}
 */
const queryMarkNailByNoun = markNounNo => {
    let result;
    try {
        if (markNounNo != '' && markNounNo != undefined) {

            let _query = realmSystem.objects('MarkNoun').filtered(`mark_noun_no="${markNounNo}"`)
            if (_query && _query.length > 0) {
                let name = _query[0].nail_model_name;
                result = realmSystem.objects("MarkNail").filtered(`nail_model_name="${name}"`);
            }

        }
    } catch (error) {
        alert(error);
    }

    return result;
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
    getWebByIds,
    getItemBySmName,
    getAnimationByNos,
    getRelationByName,
    // getVideoByIds,
    // getStructByIds,
    // getRelationByName,
    //queryHistoryAll,
    

    //历史搜索
    insertHistory,
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
    queryRelationBySmName,
    // insertMarkNoun,
    // queryMarkNoun,
    queryMarkNailByNoun,
    // getTabVersionByNameSystem,
    // insertTabVersionSystem,
    // insertTriggerPifu,
    // insertTriggerSubmodel,
    // queryTriggerByPifuNo,
    // queryTriggerInfo
    // insertRecentlyUse,
    //queryRecentlyUse,
    
};
