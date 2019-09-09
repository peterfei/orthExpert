/** @format */

import {AppRegistry, BackHandler, Platform, Text, View, ToastAndroid, DeviceEventEmitter} from "react-native";
import App from './App';
import {name as appName} from './app.json';
import  AppUpdate from './View/common/components/APPUpdate';
import React, {PureComponent} from "react";
import ErrorBoundary from './View/ErrorBoundary'

export default class VesalOrthExpert extends PureComponent<{}> {

    render() {
        return (
            <ErrorBoundary>
                <App/>
                <AppUpdate
                    ref={r => {
                        this.GraphicValidate = r
                    }}/>
            </ErrorBoundary>
        )
    }
}


console.disableYellowBox = true
AppRegistry.registerComponent(appName, () => VesalOrthExpert);
