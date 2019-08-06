import React, { PureComponent } from "react";
import { View, Text, StyleSheet } from "react-native";
import {size, setSpText} from "../common/ScreenUtil";

import color from "./color";

class SpacingView extends PureComponent<{}> {
  render() {
    return <View style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    height: size(14),
    backgroundColor: color.paper
  }
});

export default SpacingView;
