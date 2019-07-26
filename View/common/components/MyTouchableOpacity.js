import React, {Component} from "react";
import {TouchableOpacity, View} from "react-native";

export default class MyTouchableOpacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true
        };
        this.lastClickTime = 0;
        this.timeDiffert = 800;
    }

    onPress() {
        const clickTime = Date.now();
        let time = this.props.timeDiffert == undefined ? this.timeDiffert : this.props.timeDiffert;
        if (!this.lastClickTime || Math.abs(this.lastClickTime - clickTime) > time) {  //350的时间可以延长，根据需要改变
            this.lastClickTime = clickTime;
            if (this.props.onPress) {
                this.props.onPress()
            } else {
                return ''
            }
        }
    }

    render() {
        return (
            <TouchableOpacity
                onPress={this.onPress.bind(this)}
                activeOpacity={this.props.activeOpacity || 0.85}
                style={this.props.style}
                disabled={this.props.disabled}
            >
                {this.props.children}
            </TouchableOpacity>)
    }
}