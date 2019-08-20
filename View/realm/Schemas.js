import Realm from 'realm'
const RelationListSchema = {
    name: 'RelationList',
    properties: {
        rs_ids: 'string',
        rv_ids: 'string',
        sm_name: {type: 'string', indexed: true},
        id: 'int',
        rw_ids: 'string',
        app_id: {type: 'string', indexed: true}
    }
}
/**
 * 肌肉动画关系表
 */
const SportItemAnimations = {

    name: 'SportItemAnimations',
    primaryKey: 'id',
    properties: {
        am_no_list: 'string',
        item_type: 'string',
        item_name: 'string',
        id: {type: 'int', default: 0},
    }

}
const WebListSchema = {
    name: 'WebList',
    properties: {
        firstSort: "int",
        secondSort: "int",
        firstIconUrl: 'string',
        res_type: 'string',
        icon_url: 'string',
        firstFyId: 'int',
        rw_id: {type: 'int', indexed: true},
        title: 'string',
        firstFyName: 'string',
        secondFyName: 'string',
        content: 'string',
        secondFyId: 'int',
        type: 'string'
    }
}
/**
 * 动画信息表
 */
const AnimationSchema = {

    name: 'Animation',
    primaryKey: 'am_id',
    properties: {
        huxi_url: {type: 'string', optional: true},
        am_id: "int",
        equip_no_list: "string",
        huxi: "string",
        jirou: "string",
        is_charge: "string",
        lashen_donzuo: "string",
        is_hot: "string",
        jirou_url: "string",
        camera_params: "string",
        scene_name: "string",
        kaishi: "string",
        icon_url: "string",
        guocheng2: "string",
        am_ch_name: "string",
        guocheng1: "string",
        cuowu_url: "string",
        difficulty: "string",
        am_en_name: "string",
        cuowu: "string",
        shuoming_url: "string",
        am_sort: "int",
        am_no: "string",
        zhuyi: "string",
        combo_code:"string",
        desc_video_url:"string"
    }

}

const HistorySearchSchema = {

    name: 'HistorySearch',
    properties: {
        keyName: "string",
        ketNo: "string",
        type: "string",
        addTime: "int"
    }

}


const GetRecentlyUseSchema = {

    name: 'GetRecentlyUse',
    properties: {
        id: 'int',
        name: 'string',
        modelName: "string",
        count: {type: 'int', default: 1},
        date: {type: 'string', optional: true}
    }
}



export {
    RelationListSchema,
    WebListSchema,
    AnimationSchema,
    SportItemAnimations,
    HistorySearchSchema,
    GetRecentlyUseSchema,
}
