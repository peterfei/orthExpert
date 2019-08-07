import {Platform} from "react-native";
import {
    
    HistorySearchSchema,
    GetRecentlyUseSchema,
    
} from './Schemas'

/*
* 数据库版本管理
* a[0] 用户数据, a[1] 系统数据
* */
var RNFS = require('react-native-fs');
export default [{
    schema: [
        
        HistorySearchSchema,
        GetRecentlyUseSchema,
        
    ],
    path: 'orth.realm',
    schemaVersion: 1,
    migration: (oldRealm, newRealm) => {
    }
},
    // {
    //     schema: [
    //         MarkNailSchema,
    //         ResWebSchema,
    //         ResRelationSchema,
    //         MarkNounSchema,
    //         TabVersionSchemea,
    //         TriggerSubmodelSchema,
    //         TriggerPifuSchema
    //     ],
    //     path: RNFS.DocumentDirectoryPath + '/system330.realm',
    //     schemaVersion: 330,
    //     migration: (oldRealm, newRealm) => {
    //     }
    // }
]
