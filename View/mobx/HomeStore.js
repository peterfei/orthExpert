import { observable, computed, action, runInAction } from "mobx";
import { RefreshState } from "react-native-refresh-list-view";
import api from "../api";

class HomeStore {
  @observable menuViews = [];
  @observable pageCount = 1;
  @observable peopleDatas = [];
  constructor(rootStore) {
    // this.fetchDissectLists()
    this.rootStore = rootStore;
  }

  @action
  orderBySort = () => {
    // debugger
    this.peopleDatas.sort();
  };
}

export default HomeStore;
