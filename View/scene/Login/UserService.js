import React, {Component} from 'react';
import {
    View,
    Text,
    ScrollView,
} from 'react-native';
import NavBar from "../../common/components/NavBar"
import {size} from "../../common/ScreenUtil";
import Loading from "../../common/Loading";


export default class UserService extends Component<Props> {

    static navigationOptions = {
        header: null
    };

    constructor(props){
        super(props);
        this.state = {
            UserServiceText: ''
        }
    }

    componentDidMount(){
        this.getUserService()
    }

    async getUserService() {
        this.Loading.show();
        const url = 'http://res.vesal.site/json/home/v343/UserAgreementGuKe.json';
        await fetch(url)
            .then(res => res.json())
            .then(result => {
                this.Loading.close();

                if(result.code == 0){
                    this.setState({
                        UserServiceText: result.value
                    })
                }
            })
    }

    render(){
        return(
            <View style={{backgroundColor:'#fff',flex:1}}>
                <NavBar title='用户服务协议' navigation={this.props.navigation} TextStyle={{color:'#000'}} style={{backgroundColor:'#fff'}} blackBack={true}/>
                <ScrollView style={{flex:1}}>
                    <View style={{marginLeft: size(20), marginRight: size(20), marginTop: size(20)}}>
                        <Text style={{fontSize: size(28), lineHeight: size(50)}}>
                            {this.state.UserServiceText}
                        </Text>
                    </View>
                </ScrollView>
                <Loading
                    ref={r => {
                        this.Loading = r
                    }}
                    hudHidden={false}
                />
            </View>
        )
    }
}