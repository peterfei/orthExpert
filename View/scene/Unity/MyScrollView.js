import React, {Component} from 'react';
import {Text, StyleSheet, View, Image, ScrollView, PanResponder} from 'react-native';
import {deviceWidth, size} from "../../common/ScreenUtil";
import MyTouchableOpacity from "../../common/components/MyTouchableOpacity";

export default class MyScrollView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sourceData: props.sourceData,
            marginTopList: []
        };
        this.scrollPage = 0;
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({

            /***************** 要求成为响应者 *****************/
            // 单机手势是否可以成为响应者
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            // 移动手势是否可以成为响应者
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            // 拦截子组件的单击手势传递,是否拦截
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            // 拦截子组件的移动手势传递,是否拦截
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            /***************** 响应者事件回调处理 *****************/
            // 单击手势监听回调
            onPanResponderGrant: (e, gestureState) => {
                console.log('onPanResponderGrant==>' + '单击手势申请成功,开始处理手势')
                this._onPanResponderGrant(e)
            },
            // 移动手势监听回调
            onPanResponderMove: (e, gestureState) => {
                console.log('onPanResponderMove==>' + '移动手势申请成功,开始处理手势' + `${gestureState}`)
                this._onPanResponderMove(e, gestureState);
            },
            // 手势动作结束回调
            onPanResponderEnd: (evt, gestureState) => {
                console.log('onPanResponderEnd==>' + '手势操作完成了,用户离开')
                this._onPanResponderEnd(evt)
            },
            // 手势释放, 响应者释放回调
            onPanResponderRelease: (e) => {
                // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
                // 一般来说这意味着一个手势操作已经成功完成。
                console.log('onPanResponderRelease==>' + '放开了触摸,手势结束')
            },
            // 手势申请失败,未成为响应者的回调
            onResponderReject: (e) => {
                // 申请失败,其他组件未释放响应者
                console.log('onResponderReject==>' + '响应者申请失败')
            },

            // 当前手势被强制取消的回调
            onPanResponderTerminate: (e) => {
                // 另一个组件已经成为了新的响应者，所以当前手势将被取消
                console.log('onPanResponderTerminate==>' + '由于某些原因(系统等)，所以当前手势将被取消')
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
                // 默认返回true。目前暂时只支持android。
                return true;
            },
        })
    }

    // 单点手势开始
    _onPanResponderGrant(e) {

        //1. 开始触发时,获取触摸点绝对位置
        this.touchX = e.nativeEvent.locationX;
        this.touchY = e.nativeEvent.locationY;

        console.log('==== 单点手势开始处理 ====');
        console.log(e.nativeEvent);

    }

    // 移动手势处理
    _onPanResponderMove(evt, g) {
        console.log('==== 移动手势处理 ====');
        console.log(evt.nativeEvent);
    }

    // 手势结束
    _onPanResponderEnd(evt) {
        console.log('==== 手势结束 ====');
        console.log(evt.nativeEvent);
    }

    _renderScrollItem() {
        let data = this.state.sourceData;
        let arr = [];
        let marginTopList = this.state.marginTopList;
        data.forEach((item, index) => {
            arr.push(
                <ScrollView {...this.panResponder.panHandlers} key={index}
                            onContentSizeChange={(contentWidth, contentHeight) => {
                                // alert(`width : ${contentWidth}, height : ${contentHeight}, `)
                                if (item.marginTop == undefined) {
                                    let space = size(200) - contentHeight;
                                    let margin = space > 0 ? (size(200) - contentHeight) / 2 : 0;
                                    item['marginTop'] = margin;
                                    let arr = this.state.sourceData;
                                    arr.splice(index, 1, item);
                                    this.setState({
                                        sourceData: arr
                                    })
                                }
                            }}
                      style={{width: deviceWidth - 2 * size(100)}}>
                    <Text
                      style={{width: '100%', flexWrap: 'wrap', color: '#fff', fontSize: size(26),lineHeight:size(28), marginTop: item.marginTop}}>
                        {item.info}
                    </Text>
                </ScrollView>
            )
        })

        return arr;
    }

    _onLayout(event) {
        //使用大括号是为了限制let结构赋值得到的变量的作用域，因为接来下还要结构解构赋值一次
        {
            //获取根View的宽高，以及左上角的坐标值
            let {x, y, width, height} = event.nativeEvent.layout;
            console.log('通过onLayout得到的宽度：' + width);
            console.log('通过onLayout得到的高度：' + height);

        }
    }

    _onScrollEnd(e) {
        let width = deviceWidth - 2 * size(100);
        let currentOffsetX = e.nativeEvent.contentOffset.x;
        let page = parseInt(currentOffsetX / width);
        this.scrollPage = page;
        this.props.setPage(page);

        // alert("滚动时，页数为"+page)
        // select new dropdown item
    }

    _onScorllClick(type) {
        let data = this.state.sourceData;
        let page = this.scrollPage;
        let width = deviceWidth - 2 * size(100);
        if (type == 'next') {
            page = page == data.length - 1 ? 0 : page + 1;
        } else {
            page = page == 0 ? data.length - 1 : page - 1;
        }
        this.scrollPage = page;
        let contentX = page * width;
        this.refs.scrollView.scrollTo({x: contentX, y: 0, animated: true});
        this.props.setPage(page);
        // alert("点击按钮时，页数为"+page)
    }

    _onScrollEndDrag() {
        // alert(111)
    }

    scrollToPage(page) {
        page = Math.abs(page);
        page = page > this.state.sourceData.length - 1 ? this.state.sourceData.length - 1 :page;
        let width = deviceWidth - 2 * size(100);
        let contentX = page * width;
        this.refs.scrollView.scrollTo({x: contentX, y: 0, animated: true});
        this.props.setPage(page);

    }

    render() {
        let btnW = size(40);
        return (
            <View style={{width: '100%', height: size(200), overflow: 'hidden', flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)'}}>
                <MyTouchableOpacity onPress={() => {
                    this._onScorllClick('pervious')
                }} timeDiffert={200}>
                    <View style={{height: '100%', justifyContent: 'center', alignItems: 'center', width: size(100)}}>
                       <Image source={require('../../img/unity/arrow_l.png')} style={{width: btnW, height: btnW}}/>
                    </View>
                </MyTouchableOpacity>
                <ScrollView
                    ref='scrollView'
                    automaticallyAdjustContentInsets={false}
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={this._onScrollEnd.bind(this)}
                    onScrollEndDrag={this._onScrollEndDrag.bind(this)}
                    style={{width: deviceWidth - 2 * size(100)}}
                >
                    {this._renderScrollItem()}
                </ScrollView>
                <MyTouchableOpacity onPress={() => {
                    this._onScorllClick('next')
                }} timeDiffert={200}>
                    <View style={{height: '100%', justifyContent: 'center', alignItems: 'center', width: size(100)}}>
                       <Image source={require('../../img/unity/arrow_r.png')} style={{width: btnW, height: btnW}}/>
                    </View>
                </MyTouchableOpacity>
            </View>
        );
    }
}
