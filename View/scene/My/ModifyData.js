import React from "react";
import {
    View,
    StyleSheet,
    TextInput
} from "react-native";
import {
    BaseComponent,
    NavBar,
    size,

} from '../../common';
import {storage} from "../../common/storage";

export default class UserInfoDetail extends BaseComponent {

    constructor(props) {
        super(props)
        this.state = {
            nickName: "",
            defaultName:this.props.navigation.state.params.nickName
        }
    }
    saveNickName(){
        let name = this.state.nickName;
        this.props.navigation.state.params.returnData(name);
        this.props.navigation.goBack();
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#ffffff'}}>
                <NavBar title='设置昵称' navigation={this.props.navigation} rightAction={() => this.saveNickName()} rightTitle={'保存'}/>
                <TextInput
                    autoFocus={true}
                    maxLength={30}
                    style={{
                        height: size(80),
                        borderBottomColor: '#e0e0e0',
                        borderBottomWidth: size(2),
                        fontSize: size(26),
                        marginTop: size(50),
                        marginLeft:size(25),
                        marginRight:size(25)
                    }}
                    // placeholder="请输入手机号"
                    placeholderTextColor="#B9B9B9"
                    underlineColorAndroid="transparent"
                    defaultValue={this.state.defaultName}
                    onChangeText={text => {
                        this.setState({
                            nickName: text
                        });
                    }}
                />

                {/*<TouchableOpacity onPress={() => {*/}
                    {/*// this.updateInfo()*/}
                {/*}}>*/}
                    {/*<View*/}
                        {/*style={{*/}
                            {/*justifyContent: 'center',*/}
                            {/*alignItems: 'center',*/}
                            {/*backgroundColor: AppDef.Blue,*/}
                            {/*height: size(90),*/}
                            {/*borderRadius: size(45),*/}
                            {/*marginLeft:size(25),*/}
                            {/*marginRight:size(25),*/}
                            {/*marginTop: size(50),*/}
                        {/*}}>*/}
                        {/*<Text style={{color: AppDef.White, fontSize: size(32)}}>*/}
                            {/*保存信息*/}
                        {/*</Text>*/}
                    {/*</View>*/}
                {/*</TouchableOpacity>*/}
            </View>

        )
    }
}

const styles = StyleSheet.create({});