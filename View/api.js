

let  APPID =  "wxa452dfe169d3c11c";
let  appsecret =  "21a25d1a7762a4d6caf49cd18e9ad116";
//dev 开发   prod 产品

let active = "prod";


let base_url_jiepou ;
let base_url_sport ;
let base_uri;
//正式
if (active=='prod'){

    base_url_sport = "http://slb-sport.vesal.cn/vesal-sport-prod/";
    base_url_jiepou = "http://api.vesal.cn:8000/vesal-jiepao-prod/";
    //解剖
    base_uri="http://api.vesal.cn:8000/vesal-jiepao-prod/";

} if (active=='test'||active=='dev'){

    //开发和测试

    base_url_sport = "http://114.115.210.145:8085/vesal-sport-test/";
    base_url_jiepou = "http://118.24.119.234:8087/vesal-jiepao-test/";
    //
    base_uri="http://118.24.119.234:8003/vesal-jiepao-test/";
}

export default {
    base_url_jiepou,
    base_url_sport,
    base_uri,
    APPID,
    appsecret
};
