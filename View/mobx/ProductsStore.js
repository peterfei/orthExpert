import { observable, computed, action, runInAction } from "mobx";
import { RefreshState } from "react-native-refresh-list-view";
import api from "../api";
import { get } from "../common/httpTool";

class ProductsStore {
  @observable allDatas = [];
  @observable isRefreshing = false;
  @observable isNoMore = true;
  constructor(rootStore) {
    // this.fetchProductLists();
    this.rootStore = rootStore;
  }
  // 获取数据列表
  @action
  fetchProductLists = async () => {
    try {
      this.isRefreshing = RefreshState.HeaderRefreshing;
      const url = api.recommend;
      let responseData = await get({ url, timeout: 30 }).then(res =>
        res.json()
      );
      const { data } = responseData;
      const o = data.map(info => {
        return {
          id: info.id,
          imageUrl: info.squareimgurl,
          title: info.mname,
          subtitle: `[${info.range}]${info.title}`,
          price: info.price,
          count: 0
        };
      });
      runInAction(() => {
        // this.allDatas =  data
        this.allDatas.replace(o);
        this.isRefreshing = RefreshState.NoMoreData;
      });
    } catch (error) {
      console.log("数据错误" + error);
      this.isRefreshing = RefreshState.Failure;
    }
  };
}

export default ProductsStore;
