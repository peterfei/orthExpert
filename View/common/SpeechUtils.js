/**
 * Created by zhangxiaoduo on 2017/11/6.
 */

import {NativeModules, DeviceEventEmitter, Platform, NativeEventEmitter} from 'react-native';

const SpeechRecognition = NativeModules.SpeechRecognition;

export default {

    init(callback){
        const emitter = Platform.OS == 'ios' ? new NativeEventEmitter(SpeechRecognition) : DeviceEventEmitter;
        this.listener && this.listener.remove();
        this.listener = emitter.addListener("RECOGNIZE_SUCC", resp => {

            if (Platform.OS == 'android' && resp && JSON.parse(resp) && JSON.parse(resp).best_result) {

                callback && callback(JSON.parse(resp).best_result);
            } else if (Platform.OS == 'ios') {
                let resultArray = resp.results_recognition;
                let text = resultArray[resultArray.length -1];
                if (text.length > 0) {
                    console.log('——————————————————————————');
                    console.log(JSON.stringify(text));
                    callback && callback(text);
                    console.log('——————————————————————————');
                }


                // callback && callback(resp.bestTranscription.formattedString.replace(/-/g, ''));
            }
            else return '';
        });
    },

    start(lang){
        if (lang && (lang === 'eng' || lang === 'zh')) {
            SpeechRecognition.startRecognition(lang);
        } else {
            SpeechRecognition.startRecognition('zh');
        }
    },

    finish(){
        SpeechRecognition.finishRecognition();
    },

    end(){
        this.listener && this.listener.remove();
    }
};