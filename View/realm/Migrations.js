import {Platform} from "react-native";
import {
    ExamQuestionSchemea,
    ExamOptionSchemea,
    ExamTypeSchemea,
    ExamTypeSubListsSchemea,
    ExamChapterListsSchemea,
    ExamPaperListsSchemea,
    ExamMajorListsSchemea,
    ExamVersionSchemea,
    StructListSchema,
    VideoListSchema,
    WebListSchema,
    RelationListSchema,
    HistorySearchSchema,
    GetRecentlyUseSchema,
    SystemInformsSchema,
    TabVersionSchemea,
    MarkNailSchema,
    ResWebSchema,
    ResRelationSchema,
    MarkNounSchema,
    TriggerSubmodelSchema,
    TriggerPifuSchema
} from './Schemas'

/*
* 数据库版本管理
* a[0] 用户数据, a[1] 系统数据
* */
var RNFS = require('react-native-fs');
export default [{
    schema: [
        ExamQuestionSchemea,
        ExamOptionSchemea,
        ExamTypeSchemea,
        ExamTypeSubListsSchemea,
        ExamChapterListsSchemea,
        ExamPaperListsSchemea, ExamMajorListsSchemea,
        ExamVersionSchemea,
        StructListSchema, VideoListSchema, WebListSchema,
        RelationListSchema,
        HistorySearchSchema,
        GetRecentlyUseSchema,
        SystemInformsSchema,
        TabVersionSchemea,
        MarkNailSchema,
        ResWebSchema,
        ResRelationSchema,
        MarkNounSchema
    ],
    path: 'vesali.realm',
    schemaVersion: 60,
    migration: (oldRealm, newRealm) => {
    }
},
    {
        schema: [
            MarkNailSchema,
            ResWebSchema,
            ResRelationSchema,
            MarkNounSchema,
            TabVersionSchemea,
            TriggerSubmodelSchema,
            TriggerPifuSchema
        ],
        path: RNFS.DocumentDirectoryPath + '/system330.realm',
        schemaVersion: 330,
        migration: (oldRealm, newRealm) => {
        }
    }
]
