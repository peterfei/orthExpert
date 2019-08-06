import React from "react";
import {Animated, Easing} from "react-native";
import {screen, ScreenUtil} from "../../common/index";
import {size} from '../../common/ScreenUtil'


export default class FadeInView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            offset: new Animated.Value(0),
            opacity: new Animated.Value(0),
            height: 0
        };


    }

    componentDidMount() {
        this.props.onRef(this);
        //    this.show();
    }

    //显示动画
    show(width, height) {
        this.setState({
            height: height
        })
        Animated.timing(
            this.state.offset,
            {
                easing: Easing.easeInEaseOut,
                duration: 200,
                toValue: width,
            }
        ).start();

    }

    //隐藏动画
    close() {


        Animated.timing(
            this.state.offset,
            {
                easing: Easing.spring,
                duration: 200,
                toValue: 0,
            }
        ).start();

        /*   setTimeout(
               () => this.setState({hide: true}),
               300
           );*/
    }


    render() {


        return (
            <Animated.View                 // 使用专门的可动画化的View组件
                style={{
                    ...this.props.style,
                    width: this.state.offset,
                    height: this.state.height
                }}
            >
                {this.props.children}
            </Animated.View>
        );
    }
}
