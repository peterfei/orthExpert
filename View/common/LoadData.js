import {
    insertTabVersion,
    queryMarkNail,
    insertMarkNoun,
    insertMarkNail,
    getTabVersionByName,
    insertResWeb,
    queryResWeb,
    insertResRelation,
    queryResRelation,
    queryRelationBySmName,
    queryMarkNoun,
    queryMarkNailByNoun,
    getTabVersionByNameSystem,
    insertTabVersionSystem,
    insertTriggerSubmodel,
    insertTriggerPifu,
    queryTriggerByPifuNo
} from "../realm/RealmManager";
import {DeviceEventEmitter} from "react-native";
import DeviceInfo from "react-native-device-info";
import {
    Platform, Alert
} from "react-native";

//3.2版本数据前缀
let prefix = "http://res.vesal.site/json/jiepao/330/";

/**
 * 初始化数据
 * @returns {Promise<void>}
 */
export async function initData() {

    try {
      // alert(JSON.stringify(queryRelationBySmName("GuGu_L")))
      // alert(JSON.stringify(queryTriggerByPifuNo("CMTT030_R")))
        await fetch(prefix + "Version.json", {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {
            if (result.code == 0) {
                checkGetData(result.list);
            }

        });

    } catch (e) {
        // alert("e");
    }
}


async function checkGetData(list) {
    try {

        if (list && list.length > 0) {
            let local_TAB_res_web = await getTabVersionByNameSystem("TAB_res_web_new");
            let local_TAB_res_relation = await getTabVersionByNameSystem("TAB_res_relation_new");
            let local_TAB_mark_nail = await getTabVersionByNameSystem("TAB_mark_nail");
            let local_TAB_mark_noun = await getTabVersionByNameSystem("TAB_mark_noun");
            let local_TAB_trigger_pifu = await getTabVersionByNameSystem("TAB_trigger_pifu");
            let local_TAB_trigger_submodel = await getTabVersionByNameSystem("TAB_trigger_submodel");


            list.map((data) => {

                if (data.name == 'TAB_res_web') {

                    if (local_TAB_res_web && local_TAB_res_web.length > 0) {
                        if (data.version != local_TAB_res_web[0].version) {
                            updateResWeb(data.version);
                        }
                    } else {
                        updateResWeb(data.version);
                    }
                }
                if (data.name == 'TAB_res_relation') {

                    if (local_TAB_res_relation && local_TAB_res_relation.length > 0) {
                        if (data.version != local_TAB_res_relation[0].version) {
                            updateResRelation(data.version);
                        }
                    } else {
                        updateResRelation(data.version);
                    }
                }
                if (data.name == 'TAB_mark_nail') {

                    if (local_TAB_mark_nail && local_TAB_mark_nail.length > 0) {
                        if (data.version != local_TAB_mark_nail[0].version) {
                            updateMarkNail(data.version);
                        }
                    } else {
                        updateMarkNail(data.version);
                    }
                }
                if (data.name == 'TAB_mark_noun') {

                    if (local_TAB_mark_noun && local_TAB_mark_noun.length > 0) {
                        if (data.version != local_TAB_mark_noun[0].version) {
                            updateMarkNoun(data.version);
                        }
                    } else {
                        updateMarkNoun(data.version);
                    }
                }
                if (data.name == 'TAB_trigger_pifu') {

                    if (local_TAB_trigger_pifu && local_TAB_trigger_pifu.length > 0) {
                        if (data.version != local_TAB_trigger_pifu[0].version) {
                            updateTriggerPifu(data.version);
                        }
                    } else {
                        updateTriggerPifu(data.version);
                    }
                }
                if (data.name == 'TAB_trigger_submodel') {

                    if (local_TAB_trigger_submodel && local_TAB_trigger_submodel.length > 0) {
                        if (data.version != local_TAB_trigger_submodel[0].version) {
                            updateTriggerSubmodel(data.version);
                        }
                    } else {
                        updateTriggerSubmodel(data.version);
                    }
                }

            })


        }


    } catch (e) {
        //Alert.alert("警告!", e);
    }
}


async function updateResWeb(version) {
    // alert("updateResWeb")
    try {
        let url = prefix + "ResWeb.json"
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {
            /*clear*/


            result.List.map((m) => {
                insertResWeb(m)
            })
            let temp = {
                name: "TAB_res_web_new",
                version: version
            }

            insertTabVersionSystem(temp)

        });
    } catch (e) {

    }
}


async function updateResRelation(version) {
    // alert("updateResRelation")
    let url = prefix + "ResRelation.json";
    await fetch(url, {
        method: "get",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(resp => resp.json()).then(result => {

        result.List.map((m) => {
            insertResRelation(m)
        })

        let temp = {
            name: "TAB_res_relation_new",
            version: version
        }
        insertTabVersionSystem(temp)

    });
}

/**
 * 钉子信息
 * @param version
 * @returns {Promise<void>}
 */
async function updateMarkNail(version) {
    // alert("updateMarkNail")
    try {
        let url = prefix + "MarkNail.json";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {

            result.List.map((m, index) => {
                insertMarkNail(m)
            })
            let temp = {
                name: "TAB_mark_nail",
                version: version
            }
            insertTabVersionSystem(temp)
        });

    } catch (e) {

    }
}

async function updateMarkNoun(version) {
    //alert("updateMarkNoun")
    try {
        let url = prefix + "MarkNoun.json";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {

            result.List.map((m, index) => {
                insertMarkNoun(m)
            })
            let temp = {
                name: "TAB_mark_noun",
                version: version
            }
            insertTabVersionSystem(temp)
        });

    } catch (e) {

    }
}
async function updateTriggerPifu(version) {

    try {
        let url = prefix + "TriggerPifu.json";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {

            result.list.map((m, index) => {
                insertTriggerPifu(m)
            })
            let temp = {
                name: "TAB_trigger_pifu",
                version: version
            }
            insertTabVersionSystem(temp)
        });

    } catch (e) {
        alert(e)
    }
}
async function updateTriggerSubmodel(version) {

    try {
        let url = prefix + "TriggerSubmodel.json";
        await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json()).then(result => {

            result.list.map((m, index) => {
                insertTriggerSubmodel(m)
            })
            let temp = {
                name: "TAB_trigger_submodel",
                version: version
            }
            insertTabVersionSystem(temp)
        });

    } catch (e) {
        alert(e)
    }
}



