import Realm from 'realm'


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
    
    HistorySearchSchema,
    GetRecentlyUseSchema,
}
