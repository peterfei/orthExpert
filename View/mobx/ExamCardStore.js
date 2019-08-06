import { observable, computed, action, runInAction } from "mobx"
import {
  Button,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,

} from "react-native"
class ExamCardStore {
  @observable visible = false

  constructor(rootStore) {
    // this.fetchDissectLists()
    this.rootStore = rootStore
  }

  @action
  showVisible = () => {
    // debugger
    // debugger
    this.visible = true
  }

  @action
  hideVisible = () => {
    // debugger
    // debugger
    this.visible = false
  }
  render(){
    return(
      <View>
        <Text>1111111</Text>
      </View>
    );
  }
}

export default ExamCardStore
