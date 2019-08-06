import React from "react";
import {Button, DeviceEventEmitter, TouchableOpacity, Text, View, StyleSheet} from "react-native";


export default class Empty extends React.Component {

    static navigationOptions = {
        header: null
    };


    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {

    }


    render() {


        return (
            <View style={styles.parent}>
                <Text style={styles.childfirst}> View1 </Text>
                <Text style={styles.childsecond}> View2 </Text>
                <Text style={styles.childthird}> View3 </Text>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    parent: {
        flex: 1
    },
    childfirst: {
        backgroundColor: 'red',
        width: 50,
        height: 50,
        fontSize: 13,
        textAlign: 'center',
        textAlignVertical: 'center',
        margin: 5
    },
    childsecond: {
        backgroundColor: 'green',
        width: 50,
        height: 50,
        fontSize: 13,
        textAlign: 'center',
        textAlignVertical: 'center',
        margin: 5
    },
    childthird: {
        backgroundColor: 'yellow',
        width: 50,
        height: 50,
        fontSize: 13,
        textAlign: 'center',
        textAlignVertical: 'center',
        margin: 5
    }

});
