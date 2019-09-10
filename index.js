/** @format */

import {AppRegistry, View,} from "react-native";
import App from './App';
import {name as appName} from './app.json';
import React from "react";

console.disableYellowBox = true
AppRegistry.registerComponent(appName, () => App);
