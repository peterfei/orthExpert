import Realm from "realm";
import Migrations from "./Migrations";

var RNFS = require('react-native-fs');
let a = Migrations;
let realm = null;
let realmSystem = null;

realm = new Realm(Migrations[0]);
Realm.copyBundledRealmFiles();
realmSystem = new Realm(Migrations[1]);
/**

 */
/*
async function checkIsCopy() {
    let localAppVersion = await getTabVersionByName("appVersion");
    if (localAppVersion==undefined||localAppVersion==''){

    }
}*/


// 增 改
const insertExamQuestions = async questions => {
    // debugger
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
            // schema: a[0].schema,
            // schemaVersion: a[0].schemaVersion
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {
            // debugger
            let oldExamQues = realm.objects("Questions").filtered(`id = ${questions.id}`);
            let count = oldExamQues.length;
            // debugger
            if (oldExamQues == null || count == 0) {
                realm.create("Questions", questions);
            } else {
                // oldExamQues[count - 1].id = questions.id;

                questions.title != undefined ? oldExamQues[count - 1].title = questions.title : null;
                questions.correct != undefined ? oldExamQues[count - 1].correct = questions.correct : null;
                questions.type != undefined ? oldExamQues[count - 1].type = questions.type : null;
                questions.chapter_id != undefined ? oldExamQues[count - 1].chapter_id = questions.chapter_id : null;
                questions.paper_id != undefined ? oldExamQues[count - 1].paper_id = questions.paper_id : null;
                questions.is_correct != undefined ? oldExamQues[count - 1].is_correct = questions.is_correct : null;
                questions.current_option != undefined ? oldExamQues[count - 1].current_option = questions.current_option : null;
                // oldExamQues[count - 1].options = questions.options;
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// 查询
const queryExamQuestions = (paper_id, major_id) => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("Questions").filtered(`paper_id = ${paper_id} and major_id=${major_id}`);
    } catch (error) {
        console.log(error);
    }

    return _query;
};

// 查询错题本
const queryExamQuestionsIsCorrect = (is_correct, chapter_id = '', paper_id = '', major_id = '') => {
    // debugger;

    let _query;
    try {
        // debugger
        if (chapter_id != '' && major_id != '') {
            _query = realm.objects("Questions").filtered(` is_correct = ${is_correct} and chapter_id=${chapter_id} and major_id=${major_id}  and paper_id=${paper_id}`);

        } else {
            _query = realm.objects("Questions").filtered(` is_correct = ${is_correct}`);
        }

    } catch (error) {
        console.log(error);
    }
    return _query;
};
// 删除
// const deleteExamQuestions = () => {
//   try {
//     realm.write(() => {
//       realm.delete(realm.objects("Questions"));
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

const insertExamType = async types => {
    // debugger
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
            // schema: a[0].schema,
            // schemaVersion: a[0].schemaVersion
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {
            // debugger
            let oldExamType = realm.objects("Type").filtered(`type_id = ${types.type_id}`);
            let count = oldExamType.length;
            // debugger
            if (oldExamType == null || count == 0) {
                realm.create("Type", types);
            } else {
                // oldExamQues[count - 1].id = questions.id;

                types.name != undefined ? oldExamType[count - 1].name = types.name : null;
                types.type_id != undefined ? oldExamType[count - 1].type_id = types.type_id : null;
                types.type_sub_lists != undefined ? oldExamType[count - 1].type_sub_lists = types.type_sub_lists : null;
                types.majorList != undefined ? oldExamType[count - 1].majorList = types.majorList : null;
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// 查询
const queryExamTypes = () => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("Type");
    } catch (error) {
        console.log(error);
    }

    return _query;
};

const queryExamTypesById = (type_id) => {
    let _query;
    try {
        _query = realm.objects("Type").filtered(`type_id=${type_id}`);
    } catch (error) {
        console.log(error);
    }

    return _query;
};


// 删除
const deleteExamTypes = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects("Type"));
            realm.delete(realm.objects("TypeSubLists"));
            realm.delete(realm.objects("MajorList"));
            realm.delete(realm.objects("ChapterLists"));
            realm.delete(realm.objects("PaperLists"));
        });
    } catch (error) {
        console.log(error);
    }
};
//deleteExamQuestion
// 删除
const deleteExamQuestions = (paper_id, major_id) => {
    try {
        realm.write(() => {
            realm.objects("Questions").filtered(`paper_id=${paper_id} and major_id=${major_id}`).map((m) => {
                realm.delete(m.options)
            })
            realm.delete(realm.objects("Questions").filtered(`paper_id=${paper_id} and major_id=${major_id}`));
            // realm.delete(realm.objects("Option"));
            // realm.delete(realm.objects("TypeSubLists"));
            // realm.delete(realm.objects("MajorList"));
            // realm.delete(realm.objects("ChapterLists"));
            // realm.delete(realm.objects("PaperLists"));
        });
    } catch (error) {
        console.log(error);
    }
};
const insertExamVersion = async version => {
    // debugger
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
            // schema: a[0].schema,
            // schemaVersion: a[0].schemaVersion
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {
            // debugger
            // if()
            let oldExamVersion = realm.objects("Version").filtered(`name = "${version.name}" and paper_id=${version.paper_id} and major_id=${version.major_id}`);
            let count = oldExamVersion.length;
            // debugger
            if (oldExamVersion == null || count == 0) {
                realm.create("Version", version);
            } else {
                // oldExamQues[count - 1].id = questions.id;

                version.name != undefined ? oldExamVersion[count - 1].name = version.name : null;
                version.version != undefined ? oldExamVersion[count - 1].version = version.version : null;
                version.paper_id != undefined ? oldExamVersion[count - 1].paper_id = version.paper_id : null;
                version.major_id != undefined ? oldExamVersion[count - 1].major_id = version.major_id : null;

            }
        });
    } catch (error) {
        console.log(error);
    }
};
const queryExamVersionByName = (name, paper_id = null, major_id = null) => {
    let _query;
    try {
        if (paper_id != null && major_id != null) {
            _query = realm.objects("Version").filtered(`name="${name}" and paper_id=${paper_id} and major_id=${major_id}`);
        } else {
            _query = realm.objects("Version").filtered(`name="${name}"`);
        }

    } catch (error) {
        console.log(error);
    }

    return _query;
};

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

/*穿插多功能相关*/
/**
 * 保存关系表
 */
const saveRelationList = async temp => {
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {


        let obj = {
            rs_ids: temp.rs_ids,
            rv_ids: temp.rv_ids,
            sm_name: temp.sm_name,
            id: temp.id,
            rw_ids: temp.rw_ids,
            app_id: temp.app_id
        }

        realm.write(() => {
            let old = realm.objects("RelationList").filtered(`id = ${obj.id}`);
            if (old == null || old.length == 0) {
                realm.create("RelationList", obj);
            } else {

                realm.create('RelationList', obj, true);
            }
        });
    } catch (error) {

        console.log(error);
    }
};

/**
 * 保存  资源-产品表
 */
const saveStructList = async temp => {
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {


        let obj = {
            firstSort: temp.firstSort,
            secondSort: temp.secondSort,
            firstIconUrl: temp.firstIconUrl,
            struct_version: temp.struct_version,
            app_version: temp.app_version,
            app_type: temp.app_type,
            ab_list: temp.ab_list,
            rs_id: temp.rs_id,
            ab_path: temp.ab_path,
            res_fy_id: temp.res_fy_id,
            youke_use: temp.youke_use,
            platform: temp.platform,
            res_type: temp.res_type,
            struct_state: temp.struct_state,
            first_icon_url: temp.first_icon_url,
            is_charge: temp.is_charge,
            struct_id: temp.struct_id,
            struct_name: temp.struct_name,
            struct_sort: temp.struct_sort,
            app_id: temp.app_id,
            firstFyName: temp.firstFyName,
            secondFyName: temp.secondFyName,
            Introduce: temp.Introduce,
            title: temp.title,
            content: temp.content,
            icon_url: temp.icon_url
        }


        realm.write(() => {
            let old = realm.objects("StructList").filtered(`rs_id = ${obj.rs_id}`);
            if (old == null || old.length == 0) {
                realm.create("StructList", obj);
            } else {
                realm.create('StructList', obj, true);
            }
        });
    } catch (error) {

        console.log(error);
    }
};

/**
 * 保存  资源-视频
 */
const saveVideoList = async temp => {
    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {


        let obj = {
            firstSort: temp.firstSort,
            secondSort: temp.secondSort,
            firstIconUrl: temp.firstIconUrl,
            res_type: temp.res_type,
            icon_url: temp.icon_url,
            vedio_desc: temp.vedio_desc,
            vedio_time: temp.vedio_time,
            firstFyId: temp.firstFyId,
            rv_id: temp.rv_id,
            title: temp.title,
            vedio_url: temp.vedio_url,
            firstFyName: temp.firstFyName,
            secondFyName: temp.secondFyName,
            secondFyId: temp.secondFyId
        }


        realm.write(() => {
            let old = realm.objects("VideoList").filtered(`rv_id = ${obj.rv_id}`);
            if (old == null || old.length == 0) {
                realm.create("VideoList", obj);
            } else {
                realm.create('VideoList', obj, true);
            }
        });
    } catch (error) {

        console.log(error);
    }
};

/**
 * 保存  资源-web
 */
const saveWebList = async temp => {


    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }

    try {


        let obj = {
            firstSort: temp.firstSort,
            secondSort: temp.secondSort,
            firstIconUrl: temp.firstIconUrl,
            res_type: temp.res_type,
            icon_url: temp.icon_url,
            firstFyId: temp.firstFyId,
            rw_id: temp.rw_id,
            title: temp.title,
            firstFyName: temp.firstFyName,
            secondFyName: temp.secondFyName,
            content: temp.content,
            secondFyId: temp.secondFyId,
            type: temp.type
        }


        realm.write(() => {
            let old = realm.objects("WebList").filtered(`rw_id = ${obj.rw_id}`);
            if (old == null || old.length == 0) {
                realm.create("WebList", obj);
            } else {
                realm.create('WebList', obj, true);
            }
        });
    } catch (error) {

        console.log(error);
    }
};


// 查询全部关系表
const getAllRelation = () => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("RelationList");
    } catch (error) {
        console.log(error);
    }

    return _query;
};


// 查询全部 资源-产品表
const getAllStruct = () => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("StructList");
    } catch (error) {
        console.log(error);
    }

    return _query;
};

// 查询全部 资源-视频表
const getAllVideo = () => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("VideoList");
    } catch (error) {
        console.log(error);
    }

    return _query;
};
// 查询全部 资源-web
const getAllWeb = () => {
    //   debugger;

    let _query;
    try {
        _query = realm.objects("WebList");
    } catch (error) {
        console.log(error);
    }

    return _query;
};


//删除全部的关系表
const deleteAllRelation = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects("RelationList"));
        });
    } catch (error) {
        console.log(error);
    }
};
//刪除全部資源關係
const deleteAllStruct = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects("StructList"));
        });
    } catch (error) {
        console.log(error);
    }
};
const deleteAllVideo = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects("VideoList"));
        });
    } catch (error) {
        console.log(error);
    }
};
const deleteAllWeb = () => {
    try {
        realm.write(() => {
            realm.delete(realm.objects("WebList"));
        });
    } catch (error) {
        console.log(error);
    }
};
/*根据ids查询*/
// 查询全部 资源-web
const getWebByIds = (ids) => {
    //   debugger;
    let _query;
    try {
        let str = getRequire('rw_id', ids);

        _query = realm.objects("WebList").filtered(str);

    } catch (error) {
        console.log(error);
    }
    return _query;
};

// 查询全部 资源-产品
const getStructByIds = (ids) => {
    //   debugger;
    let _query;
    try {
        let str = getRequire('rs_id', ids);
        _query = realm.objects("StructList").filtered(str);
    } catch (error) {
        console.log(error);
    }
    return _query;
};
// 查询全部表版本
const getTabVersionByName = (tabName) => {

    let _query;
    try {
        _query = realm.objects("TabVersion").filtered(`name="${tabName}"`);
    } catch (error) {
        console.log(error);
    }

    return _query;
};
// 查询全部表版本
const getTabVersionByNameSystem = (tabName) => {

    let _query;
    try {
        _query = realmSystem.objects("TabVersion").filtered(`name="${tabName}"`);
    } catch (error) {
        console.log(error);
    }

    return _query;
};

const insertTabVersion = async temp => {


    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });

    }
    try {

        let obj = {
            name: temp.name,
            version: temp.version
        }

        realm.write(() => {
            //
            let rs = realm.objects('TabVersion').filtered(`name = "${obj.name}"`)
            let counts = rs.length;
            // debugger
            if (rs == null || rs.length == 0) {
                realm.create("TabVersion", obj);
            } else {
                obj.version != undefined ? rs[counts - 1].version = obj.version : null;
                obj.name != undefined ? rs[counts - 1].name = obj.name : null;
            }
        });
    } catch (error) {

        console.log(error);
    }
};
const insertTabVersionSystem = async temp => {


    if (realmSystem == null) {
        realmSystem = await Realm.open({
            path: a[1].path
        });

    }
    try {

        let obj = {
            name: temp.name,
            version: temp.version
        }

        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('TabVersion').filtered(`name = "${obj.name}"`)
            let counts = rs.length;
            // debugger
            if (rs == null || rs.length == 0) {
                realmSystem.create("TabVersion", obj);
            } else {
                obj.version != undefined ? rs[counts - 1].version = obj.version : null;
                obj.name != undefined ? rs[counts - 1].name = obj.name : null;
            }
        });
    } catch (error) {

        console.log(error);
    }
};


// 查询全部 资源-视频
const getVideoByIds = (ids) => {
    //   debugger;
    let _query;
    try {
        let str = getRequire('rv_id', ids);
        _query = realm.objects("VideoList").filtered(str);
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
    /**
     keyName: "string",
     keyId: "string",
     type: "string",
     addTime:"int"
     */
    // debugger
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

/**
 * 点击产品插入最近使用数据
 */

const insertRecentlyUse = async obj => {

    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {
            //
            let rs = realm.objects('GetRecentlyUse').filtered(`id = ${obj.id}`)
            let counts = rs.length;
            // debugger
            if (rs == null || rs.length == 0) {
                realm.create("GetRecentlyUse", obj);
            } else {
                obj.date != undefined ? rs[counts - 1].date = obj.date : null;
                obj.name != undefined ? rs[counts - 1].name = obj.name : null;
                obj.modelName != undefined ? rs[counts - 1].modelName = obj.modelName : null;
                obj.count != undefined ? rs[counts - 1].count = (rs[counts - 1].count + 1) : null;
            }
        });
    } catch (error) {
        console.log(error);
    }
};

//添加消息通知本地数据
const insertSystemInformData = async data => {

    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {
        let obj = {
            message_id: data.message_id,
            summary: data.summary,
            title: data.title,
            release_time: data.release_time,
            message_type: data.message_type
        }
        realm.write(() => {

            realm.create("SystemInforms", obj);

        });
    } catch (error) {
        console.log(error);
    }
}
//clean mgs
const deleteAllMsg = async obj => {

    if (realm == null) {
        realm = await Realm.open({
            path: a[0].path
        });
        console.log("realm path:" + realm.path);
    }
    try {
        realm.write(() => {

            realm.delete(realm.objects('SystemInforms'));

        });

    } catch (error) {
        console.log(error);
    }
}

//查询本地数据系统消息通知

const querySystemInformData = () => {
    let _query;
    try {
        _query = realm.objects("SystemInforms");
    } catch (error) {
        console.log(error);
    }

    return _query;
};
/*3.2新加*/
//插入钉子信息
const insertMarkNail = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[0].path}) : null;

        let obj = {
            nail_name: ifNullString(data.nail_name),
            is_update: ifNullInt(data.is_update),
            nail_no: ifNullString(data.nail_no),
            nail_id: ifNullInt(data.nail_id),
            camera_params: ifNullString(data.camera_params),
            nail_model_name: ifNullString(data.nail_model_name),
            info: ifNullString(data.info)
        }

        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('MarkNail').filtered(`nail_id = ${obj.nail_id}`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("MarkNail", obj);
            } else {
                obj.nail_name != undefined ? rs[counts - 1].nail_name = obj.nail_name : null;
                obj.is_update != undefined ? rs[counts - 1].is_update = obj.is_update : null;
                obj.nail_no != undefined ? rs[counts - 1].nail_no = obj.nail_no : null;
                obj.camera_params != undefined ? rs[counts - 1].camera_params = obj.camera_params : null;
                obj.nail_model_name != undefined ? rs[counts - 1].nail_model_name = obj.nail_model_name : null;
                obj.info != undefined ? rs[counts - 1].info = obj.info : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};
//插入钉子信息
const insertMarkNoun = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[0].path}) : null;

        let obj = {
            nail_model_name: ifNullString(data.nail_model_name),
            mark_noun_no: ifNullString(data.mark_noun_no)
        }

        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('MarkNoun').filtered(`mark_noun_no="${obj.mark_noun_no}"`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("MarkNoun", obj);
            } else {
                obj.nail_model_name != undefined ? rs[counts - 1].nail_model_name = obj.nail_model_name : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};
const queryMarkNoun = () => {
    let _query;
    try {
        _query = realmSystem.objects("MarkNoun");
    } catch (error) {
        console.log(error);
    }

    return _query;
};
//插入web/图片/文字等资源
const insertResWeb = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[1].path}) : null;

        let obj = {
            icon_url: ifNullString(data.icon_url),
            level: ifNullInt(data.level),
            del: ifNullInt(data.del),
            rw_id: ifNullInt(data.rw_id),
            type: ifNullString(data.type),
            title: ifNullString(data.title),
            content: ifNullString(data.content),
            secondSort: ifNullInt(data.secondSort),
            res_fy_icon_url: ifNullString(data.res_fy_icon_url),
            fy_state: ifNullString(data.fy_state),
            charge_id: ifNullString(data.charge_id),
            select_icon_url: ifNullString(data.select_icon_url),
            secondFyName: ifNullString(data.secondFyName),
            secondFyId: ifNullInt(data.secondFyId),
            desc: ifNullString(data.desc)
        }

        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('ResWeb').filtered(`rw_id = ${obj.rw_id}`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("ResWeb", obj);
            } else {

                obj.icon_url != undefined ? rs[counts - 1].icon_url = obj.icon_url : null;
                obj.level != undefined ? rs[counts - 1].level = obj.level : null;
                obj.del != undefined ? rs[counts - 1].del = obj.del : null;
                obj.type != undefined ? rs[counts - 1].type = obj.type : null;
                obj.title != undefined ? rs[counts - 1].title = obj.title : null;
                obj.content != undefined ? rs[counts - 1].content = obj.content : null;
                obj.secondSort != undefined ? rs[counts - 1].secondSort = obj.secondSort : null;
                obj.res_fy_icon_url != undefined ? rs[counts - 1].res_fy_icon_url = obj.res_fy_icon_url : null;
                obj.fy_state != undefined ? rs[counts - 1].fy_state = obj.fy_state : null;
                obj.charge_id != undefined ? rs[counts - 1].charge_id = obj.charge_id : null;
                obj.select_icon_url != undefined ? rs[counts - 1].select_icon_url = obj.select_icon_url : null;
                obj.secondFyName != undefined ? rs[counts - 1].secondFyName = obj.secondFyName : null;
                obj.secondFyId != undefined ? rs[counts - 1].secondFyId = obj.secondFyId : null;
                obj.desc != undefined ? rs[counts - 1].desc = obj.desc : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};
//插入关系表
const insertResRelation = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[1].path}) : null;

        let obj = {
            sm_name: ifNullString(data.sm_name),
            id: ifNullInt(data.id),
            rw_ids: ifNullString(data.rw_ids)
        }

        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('ResRelation').filtered(`id = ${obj.id}`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("ResRelation", obj);
            } else {
                obj.sm_name != undefined ? rs[counts - 1].sm_name = obj.sm_name : null;
                obj.rw_ids != undefined ? rs[counts - 1].rw_ids = obj.rw_ids : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};
//插入触发点皮肤
const insertTriggerPifu = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[1].path}) : null;


        let obj = {
            id: ifNullInt(data.id),
            pifu_name: ifNullString(data.pifu_name),
            pifu_no: ifNullString(data.pifu_no),
            cfd_no_list: ifNullString(data.cfd_no_list)
        }


        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('TriggerPifu').filtered(`id = ${obj.id}`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("TriggerPifu", obj);
            } else {
                obj.pifu_name != undefined ? rs[counts - 1].pifu_name = obj.pifu_name : null;
                obj.pifu_no != undefined ? rs[counts - 1].pifu_no = obj.pifu_no : null;
                obj.cfd_no_list != undefined ? rs[counts - 1].cfd_no_list = obj.cfd_no_list : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};
//插入触发点子模型大纲
const insertTriggerSubmodel = async data => {
    try {
        realmSystem == null ? realmSystem = await Realm.open({path: a[1].path}) : null;


        let obj = {
            trigger_id: ifNullInt(data.trigger_id),
            trigger_no: ifNullString(data.trigger_no),
            ch_name: ifNullString(data.ch_name),
            en_name: ifNullString(data.en_name)
        }


        realmSystem.write(() => {
            //
            let rs = realmSystem.objects('TriggerSubmodel').filtered(`trigger_id = ${obj.trigger_id}`)
            let counts = rs.length;

            if (rs == null || rs.length == 0) {
                realmSystem.create("TriggerSubmodel", obj);
            } else {
                obj.trigger_no != undefined ? rs[counts - 1].trigger_no = obj.trigger_no : null;
                obj.ch_name != undefined ? rs[counts - 1].ch_name = obj.ch_name : null;
                obj.en_name != undefined ? rs[counts - 1].en_name = obj.en_name : null;
            }
        });

    } catch (error) {
        alert(error);
    }
};

//根据皮肤查找触发点信息

const queryTriggerByPifuNo = pifuNo => {

    let result;
    try {


        if (pifuNo != '' && pifuNo != undefined) {
            let _query = realmSystem.objects('TriggerPifu').filtered(`pifu_no="${pifuNo}"`)

            if (_query && _query.length > 0) {
                let ids = _query[0].cfd_no_list;

                let require = getRequireString('trigger_no', ids);

                result = realmSystem.objects("TriggerSubmodel").filtered(require);
            }
        }
    } catch (error) {
        alert(error);
    }
    // alert("path:" + realmSystem.path + " result:" + JSON.stringify(result))
    return result;
};
const queryTriggerInfo = pifuNo => {

    let result = {};
    try {


        if (pifuNo != '' && pifuNo != undefined) {
            result = realmSystem.objects('TriggerPifu').filtered(`pifu_no="${pifuNo}"`)
        }
    } catch (error) {
        alert(error);
    }
    // alert("path:" + realmSystem.path + " result:" + JSON.stringify(result))
    return result;
};


//查询钉子全部信息

const queryMarkNail = () => {
    let _query;
    try {
        _query = realmSystem.objects("MarkNail");
    } catch (error) {
        console.log(error);
    }

    return _query;
};
const queryResWeb = () => {
    let _query;
    try {
        _query = realmSystem.objects("ResWeb").slice(0, 5);
    } catch (error) {
        console.log(error);
    }

    return _query;
};
const queryResRelation = () => {
    let _query;
    try {
        _query = realmSystem.objects("ResRelation").slice(0, 5);
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
    insertExamQuestions,
    queryExamQuestions,
    deleteExamQuestions,
    queryExamQuestionsIsCorrect,
    insertExamType,
    queryExamTypes,
    queryExamTypesById,
    queryExamVersionByName,
    insertExamVersion,
    deleteExamTypes,
    // deleteExamQuestion
    saveRelationList,
    saveStructList,
    saveVideoList,
    saveWebList,
    /*getAll*/
    getAllRelation,
    getAllStruct,
    getAllVideo,
    getAllWeb,
    /*delete*/
    deleteAllWeb,
    deleteAllVideo,
    deleteAllStruct,
    deleteAllRelation,
    /*getByIds*/
    getWebByIds,
    getVideoByIds,
    getStructByIds,
    getRelationByName,
    queryHistoryAll,

    //历史搜索
    insertHistory,
    deleteHistories,

    //首页推荐最近使用
    insertRecentlyUse,
    queryRecentlyUse,
    getTabVersionByName,
    insertTabVersion,
    deleteAllMsg,
    //消息通知
    insertSystemInformData,
    querySystemInformData,
    queryMarkNail,
    insertMarkNail,
    insertResRelation,
    insertResWeb,
    queryResWeb,
    queryResRelation,
    queryRelationBySmName,
    insertMarkNoun,
    queryMarkNoun,
    queryMarkNailByNoun,
    getTabVersionByNameSystem,
    insertTabVersionSystem,
    insertTriggerPifu,
    insertTriggerSubmodel,
    queryTriggerByPifuNo,
    queryTriggerInfo
};
