import { Platform } from "react-native";
import {
    RelationListSchema,
    WebListSchema,
    AnimationSchema,
    SportItemAnimations,
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
        RelationListSchema,
        WebListSchema,
        AnimationSchema,
        SportItemAnimations,
        HistorySearchSchema,
        GetRecentlyUseSchema,

    ],
    path: 'orth.realm',
    schemaVersion: 1,
    migration: (oldRealm, newRealm) => {
    }
},
{
    schema: [
        SportItemAnimations,
        AnimationSchema,
    ],
    path: RNFS.DocumentDirectoryPath + '/sportSystem220.realm',
    schemaVersion: 56,
    migration: (oldRealm, newRealm) => {
    }
}
]
