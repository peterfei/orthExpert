import React, {Component} from "react";
import {ImageBackground, NativeModules, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {size} from '../ScreenUtil';
import * as Progress from 'react-native-progress';
import RNFS from "react-native-fs";

let that = null;
let seconds = 0;
let tipObj = {
    wjxzyc: "文件只需下载一次哟,下次使用无需下载~",
    nxdd: "耐心等待下载完成哟~",
    wlct: "请稍等,正在加速下载中~",
    xzwc: '下载已完成~'
}

export default class DownLoadFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWin: false,
            description: "",
            url: "http://fileprod.vesal.site/upload/unity3D/common/android/assetbundle/framework.assetbundle",
            currProgress: 0,//当前进度
            percentProgress: '0%',//百分比进度
            sizeProgress: "正在获取资源大小...",
            tip: tipObj.wjxzyc,
            jobId:null

        };

        this.downLoadURL = '';
    }

    async componentDidMount() {
        if (Platform.OS == 'android') {
            await this.checkVersion();
        }
    }

    componentWillUnmount() {
        //取消下载
        this.cancelDown();
    }

    async downLoad(fileUrl) {
        let cacheFileName = this.getCacheName(fileUrl);
        let isExit = await this.checkFileExist(cacheFileName);
        if (!isExit) {
            this.setState({
                showWin: true
            }, () => {
                this.downLoadURL = fileUrl;
                this.startDownLoadFile(fileUrl, cacheFileName)
            })
        } else { // 下载过, 直接播放
            this.props.downloadSuccess(cacheFileName);
        }
    }

    checkVersion = async () => {


    };

    /**
     * 获取文件缓存名称
     * @param url
     * @returns {*}
     */
    getCacheName(url) {
        let fileNames = url.split('/');
        let newFileNames = fileNames.slice(-3);
        let newFileName = newFileNames.join('_');
        let cacheFileName = RNFS.TemporaryDirectoryPath + newFileName;
        return cacheFileName;
    }

    async checkFileExist(cacheFileName) {
        return RNFS.exists(cacheFileName)
            .then(res => {
                return new Promise((resolve, reject) => {
                    resolve(res)
                })
            })
            .catch(err => {
                return new Promise((resolve, reject) => {
                    resolve(false)
                })
            })
    }


    /**
     * 下载视频
     * @param cacheUrl
     * @param cacheFileName
     */
    startDownLoadFile(url, cacheFileName) {

        // 视频
        const options = {
            fromUrl: url,
            toFile: cacheFileName,
            background: true,
            progressDivider: 2,
            begin: (res) => {
                let totalSize = "0M/" + (res.contentLength / 1024 / 1024).toFixed(2) + "M";
                this.setState({
                    percentProgress: "0%",
                    currProgress: 0,//当前进度
                    sizeProgress: totalSize//
                })

            },
            progress: (res) => {

                let size = (res.contentLength / 1024 / 1024).toFixed(2) + 'M';
                let currSize = (res.bytesWritten / 1024 / 1024).toFixed(2) + 'M';
                let pro = res.bytesWritten / res.contentLength;

                let newpro = parseFloat(pro) * 100 + '';
                let index = newpro.indexOf('.');

                newpro = newpro.substr(0, index) + "%";

                let title = currSize + "/" + size;
                let tip = this.getTip(pro)
                this.setState({
                    percentProgress: newpro,
                    sizeProgress: title,
                    currProgress: pro,
                    tip: tip
                })
            }
        };
        try {
            const ret = RNFS.downloadFile(options);
            this.setState({
                jobId:ret.jobId
            })
            ret.promise.then(res => {
                console.log('success', res);
                console.log('file://' + cacheFileName)
                // alert("下载完成")
                // let tip = this.getTip(1)
                this.setState({
                    tip: tipObj.wjxzyc,
                    currProgress: 0,//当前进度
                    percentProgress: '0%',//百分比进度
                    sizeProgress: "正在获取资源大小...",
                    showWin: false
                }, () => {
                    this.props.downloadSuccess(cacheFileName);
                })

            }).catch(err => {
                console.log('err', err);
            });
        } catch (e) {
            console.log(error);
        }
    }

    getTip(pro) {
        if (pro > 0.1 && pro < 0.3) {
            return tipObj.wjxzyc;
        } else if (pro > 0.3 && pro < 0.7) {
            return tipObj.wlct
        } else if (pro > 0.7 && pro < 0.9) {
            return tipObj.nxdd
        } else if (pro == 1) {
            return tipObj.xzwc
        } else {
            return tipObj.wjxzyc;
        }
    }

    toAppStore() {

        NativeModules.DownloadApk.downloading(
            this.state.url,
            "vesal.apk"
        );
    }
    /**
     * 取消下载
     * */
    async cancelDown(){
        let jobId = this.state.jobId;
        if (jobId!=null){
            RNFS.stopDownload(jobId);
            console.log(this.downLoadURL);
            let cacheFileName = this.getCacheName(this.downLoadURL);
            let isExist = await this.checkFileExist(cacheFileName);
            console.log(`取消下载后文件是否存在 === ${JSON.stringify(isExist)}`);
            if (isExist) {
                this.deleteFile(cacheFileName);
            } else {
                this.setState({
                    jobId:null,
                    tip: tipObj.wjxzyc,
                    currProgress: 0,//当前进度
                    percentProgress: '0%',//百分比进度
                    sizeProgress: "正在获取资源大小...",
                    showWin: false
                })
            }

        }
    }

    deleteFile(file) {
        // create a path you want to delete
        let rnfsPath = Platform.OS === 'ios'? RNFS.LibraryDirectoryPath : RNFS.ExternalDirectoryPath;
        let cacheFileName = this.getCacheName(this.downLoadURL);
        const path =  rnfsPath+ file;
        return RNFS.unlink(file)
            .then(() => {
                console.log('删除结束');
                this.setState({
                    jobId:null,
                    tip: tipObj.wjxzyc,
                    currProgress: 0,//当前进度
                    percentProgress: '0%',//百分比进度
                    sizeProgress: "正在获取资源大小...",
                    showWin: false
                })
            })
            .catch((err) => {
                console.log('删除失败');
            });
    }

    render() {

        if (this.state.showWin) {
            return <View style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundColor: "rgba(53,53,53,0.8)",
                justifyContent: "center",
                alignItems: 'center'
            }}>
                <ImageBackground source={require('../../img/home/update_backgroundImg.png')}
                                 style={{width: size(550), height: size(732)}}>
                    <Text style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: size(42),
                        marginTop: size(100),
                        marginLeft: size(40)
                    }}>资源准备</Text>
                    <Text style={{
                        fontWeight: "800",
                        fontSize: size(28),
                        color: '#fff',
                        marginLeft: size(40),
                        marginTop: size(10)
                    }}> {this.state.percentProgress}</Text>
                    <View
                        style={{marginTop: size(130), height: size(250), marginLeft: size(40), marginRight: size(40)}}>
                        <Text
                            style={{color: "#6b6b6b", fontSize: size(20), lineHeight: size(30)}}>{this.state.tip}</Text>
                        <View style={{flexDirection: 'row', marginTop:size(20)}}>
                            <View style={{flex: 6}}>
                                <Progress.Bar
                                    borderRadius={size(40)}
                                    borderWidth={0}
                                    unfilledColor={'#ececec'}
                                    borderColor={'#4FA5F4'}
                                    color={'#4FA5F4'}
                                    progress={this.state.currProgress} width={size(480)} height={size(30)}/>
                            </View>
                            {/*<View style={{flex: 2, alignItems: "center",justifyContent:"center"}}>*/}
                            {/*    <Text style={{fontSize:size(24),color: "#4FA5F4"}}> {this.state.percentProgress}</Text>*/}
                            {/*</View>*/}
                        </View>
                        <View style={{alignItems: "center"}}>
                            <Text style={{fontSize: size(30), marginTop:size(30),color: "#4FA5F4"}}>{this.state.sizeProgress}</Text>
                        </View>

                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: size(40)}}>
                        <TouchableOpacity style={{
                            width: size(230),
                            height: size(80),
                            backgroundColor: "#f4f4f4",
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: size(10)
                        }}
                                          onPress={() => {
                                              this.cancelDown()
                                          }}
                        >
                            <Text style={{color: '#000'}}>取消下载</Text>
                        </TouchableOpacity>

                    </View>
                </ImageBackground>
            </View>
        } else {
            return null
        }

    }
}

const styles = StyleSheet.create({
    container: {},

})
