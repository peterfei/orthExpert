/**
 * Created by xzh on 11:20 2019-08-22
 *
 * @Description:
 */

import React from "react";
import {ScrollView, StyleSheet, Text, View, WebView} from "react-native";
import {BaseComponent, ContainerView, NavBar, size,} from '../../common';

export default class PlanDescHtml extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      planName: this.props.navigation.state.params.planName,
      desc: this.props.navigation.state.params.desc
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  render() {

    let desc = this.state.desc;
    let isHtml = desc.indexOf('.html') == -1 ? false : true;

    return (
      <ContainerView ref={r => this.mainView = r}>
        <NavBar title={this.state.planName} navigation={this.props.navigation}/>
        <View style={{flex: 1}}>

          {
            isHtml
              ?
              <WebView
                style={styles.WebViewStyle}
                startInLoadingState={true}
                source={{uri: desc}}
              />
              :
              <ScrollView>
                <Text style={{
                  marginLeft: size(20),
                  marginRight: size(10),
                  fontSize: size(28),
                  lineHeight: size(50),
                  color:"#2f2f2f"
                }}>
                  {desc}
                </Text>
              </ScrollView>
          }

        </View>
      </ContainerView>
    );
  }
}

const styles = StyleSheet.create({});