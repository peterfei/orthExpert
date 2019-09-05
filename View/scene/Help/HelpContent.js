import React, {Component} from 'react';
import api from "../../api";
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,

} from 'react-native';
import {size} from "../../common/ScreenUtil";
import {screen, system} from "../../common";
import {storage} from "../../common/storage";
import TitleBar from '../../scene/Home/TitleBar';

type Props = {};
export default class HelpContent extends Component<Props> {
    /*11*/
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            content: "",
            listDetail: [],
            title: this.props.navigation.state.params.obj.tag,

        };
    }

    async componentDidMount() {
        this.openHtmlSource(this.props.navigation.state.params.obj.type, this.props.navigation.state.params.obj.tag);

    }


    async openHtmlSource(type, name) {
        let tokens = await storage.get("userTokens");
        let url =
            api.base_uri + "v2/app/help/getListByAppSearch?token=" + tokens.token + "&type=" + type + "&tag=" + name

        let response = await fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(resp => resp.json())
            .then(result => {
                this.setState({
                    listDetail: result.listDetail
                })
            })
    }

    render() {
        return (
            <View style={styles.container}>
                <TitleBar title={this.state.title} navigate={this.props.navigation}/>

                {this.state.listDetail.map((v, k) => {
                    return (
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('problemDetails', {
                                obj: {
                                    content: v.content,
                                    title: v.title
                                }
                            })}
                        >
                            <View style={styles.problemViewSty}>
                                <Text style={{
                                    color: "#393939",
                                    paddingBottom: size(10),
                                    fontSize: size(30)
                                }}>{k + 1}. {v.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}

            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff"
    },
    problemViewSty: {
        marginTop: size(25),
        marginBottom: size(10),
        borderBottomWidth: size(1),
        borderBottomColor: "#f4f4f4",
        width: screen.width * 0.92
    }
});


