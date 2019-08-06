import { observable, computed, action, runInAction } from 'mobx'
import cartGoods from './cartGoods'
import DissectStore from './DissectStore'
import UserStore from './User'
import OrderStore from './OrderStore'
import ExamCardStore from './ExamCardStore'
class RootStore {
  constructor () {
    this.OrderStore = new OrderStore(this)
    this.DissectStore = new DissectStore(this)
    this.UserStore = new UserStore(this)
    this.ExamCardStore = new ExamCardStore(this)
  }
}

// 返回RootStore实例
export default new RootStore()
