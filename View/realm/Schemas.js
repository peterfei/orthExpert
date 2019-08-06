import Realm from 'realm'

const ExamQuestionSchemea = {
    name: 'Questions',
    primaryKey: 'id',
    properties: {
        id: 'int',
        title: 'string',
        type: 'string',
        chapter_id: 'int',
        correct: 'string',
        is_correct: {type: 'int', default: 0},
        paper_id: 'int',
        major_id: 'int',
        current_option: {type: 'string', default: null},
        options: {type: 'list', objectType: 'Option'}
    }
}

const MarkNailSchema = {
    name: 'MarkNail',
    primaryKey: 'nail_id',
    properties: {
        nail_name: "string",
        is_update: {type: 'int', default: 0},
        nail_no: "string",
        nail_id: {type: 'int', default: 0},
        camera_params: "string",
        nail_model_name: {type: "string", indexed: true},
        info: "string"
    }
}

const MarkNounSchema = {
    name: 'MarkNoun',
    primaryKey: 'mark_noun_no',
    properties: {
        mark_noun_no: "string",
        nail_model_name: "string"
    }
}
const ResWebSchema = {
    name: 'ResWeb',
    primaryKey: 'rw_id',
    properties: {
        icon_url: "string",
        level: {type: 'int', default: 0},
        del: {type: 'int', default: 0},
        rw_id: {type: 'int', default: 0},
        type: "string",
        title: "string",
        content: "string",
        secondSort: {type: 'int', default: 0},
        res_fy_icon_url: "string",
        fy_state: "string",
        charge_id: "string",
        select_icon_url: "string",
        secondFyName: "string",
        secondFyId: {type: 'int', default: 0},
        desc: "string"
    }
}
const ResRelationSchema = {
    name: 'ResRelation',
    primaryKey: 'id',
    properties: {
        sm_name: "string",
        id: {type: 'int', default: 0},
        rw_ids: "string"
    }
}
const TriggerPifuSchema = {
    name: 'TriggerPifu',
    primaryKey: 'id',
    properties: {
        id: {type: 'int', default: 0},
        pifu_name: "string",
        pifu_no: "string",
        cfd_no_list: "string"
    }
}
const TriggerSubmodelSchema = {
    name: 'TriggerSubmodel',
    primaryKey: 'trigger_id',
    properties: {
        trigger_id: {type: 'int', default: 0},
        trigger_no: "string",
        ch_name: "string",
        en_name: "string"
    }
}
const ExamOptionSchemea = {
    name: 'Option',
    properties: {
        name: 'string',
        desc: 'string'

    }
}
const ExamTypeSchemea = {
    name: 'Type',
    properties: {
        name: 'string',
        type_id: 'int',
        type_sub_lists: {type: 'list', objectType: 'TypeSubLists', default: []},
        majorList: {type: 'list', objectType: 'MajorList', default: []}
    }
}
const ExamTypeSubListsSchemea = {
    name: 'TypeSubLists',
    properties: {
        name: 'string',
        chapterList: {type: 'list', objectType: 'ChapterLists', default: []},
        app_id: 'string'
    }
}
const ExamMajorListsSchemea = {
    name: 'MajorList',
    properties: {
        major_name: 'string',
        major_id: 'int'
    }
}
const ExamChapterListsSchemea = {
    name: 'ChapterLists',
    properties: {
        chapter_name: 'string',
        chapter_id: 'int',
        paperList: {type: 'list', objectType: 'PaperLists', default: []}
    }
}
const ExamPaperListsSchemea = {
    name: 'PaperLists',
    properties: {
        type_id: 'int',
        is_charge: 'string',
        name: 'string',
        time: 'int',
        chapter_id: 'int',
        paper_id: 'int',
        major_id: 'int',
        question_ids: 'string',
        add_time: 'string'
    }
}
const ExamVersionSchemea = {
    name: 'Version',
    properties: {
        name: 'string',
        version: 'string',
        paper_id: {type: 'int', default: 0},
        major_id: {type: 'int', default: 0}
    }
}


/*==========================================穿插相关表=======================================*/

const TabVersionSchemea = {
    name: 'TabVersion',
    properties: {
        name: 'string',
        version: 'string',
    }
}

const StructListSchema = {
    name: 'StructList',
    properties: {
        firstSort: "int",
        secondSort: "int",
        firstIconUrl: 'string',
        struct_version: 'string',
        app_version: 'string',
        app_type: 'string',
        ab_list: 'string',
        rs_id: {type: 'int', indexed: true},
        ab_path: 'string',
        res_fy_id: 'int',
        youke_use: 'string',
        platform: 'string',
        res_type: 'string',
        struct_state: 'string',
        first_icon_url: 'string',
        is_charge: 'string',
        struct_id: 'int',
        struct_name: 'string',
        struct_sort: 'string',
        app_id: 'string',
        firstFyName: 'string',
        secondFyName: 'string',
        Introduce: 'string',
        title: 'string',
        content: 'string',
        icon_url: 'string'
    }
}
const VideoListSchema = {
    name: 'VideoList',

    properties: {
        firstSort: "int",
        secondSort: "int",
        firstIconUrl: 'string',
        res_type: 'string',
        icon_url: 'string',
        vedio_desc: 'string',
        vedio_time: 'string',
        firstFyId: 'int',
        rv_id: {type: 'int', indexed: true},
        title: 'string',
        vedio_url: 'string',
        firstFyName: 'string',
        secondFyName: 'string',
        secondFyId: 'int'
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
const HistorySearchSchema = {

    name: 'HistorySearch',
    properties: {
        keyName: "string",
        keyId: "string",
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
const SystemInformsSchema = {

    name: 'SystemInforms',
    properties: {
        message_id: 'int',
        summary: 'string',
        message_type: 'string',
        title: 'string',
        release_time: {type: 'string', optional: true},
        isRead: {type: 'int', default: 0},
    }

}


export {
    ExamQuestionSchemea,
    ExamOptionSchemea,
    ExamTypeSchemea,
    ExamTypeSubListsSchemea,
    ExamChapterListsSchemea,
    ExamPaperListsSchemea,
    ExamMajorListsSchemea,
    ExamVersionSchemea,
    TabVersionSchemea,
    StructListSchema,
    VideoListSchema,
    WebListSchema,
    RelationListSchema,
    HistorySearchSchema,
    GetRecentlyUseSchema,
    SystemInformsSchema,
    MarkNailSchema,
    ResWebSchema,
    ResRelationSchema,
    MarkNounSchema,
    TriggerSubmodelSchema,
    TriggerPifuSchema
}
