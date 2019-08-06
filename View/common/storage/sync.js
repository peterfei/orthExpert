/**
 * Created by guangqiang on 2017/11/15.
 */
import { storage } from './index'
//import api from '../../api'///////
import { NavigationActions } from 'react-navigation'

/**
 * sync方法的名字必须和所存数据的key完全相同
 * 方法接受的参数为一整个object，所有参数从object中解构取出
 * 这里可以使用promise。或是使用普通回调函数，但需要调用resolve或reject
 * @type {{user: ((params))}}
 */
const sync = {
  user(params) {
    // debugger
    console.log(
      'params is ' + JSON.stringify(params.syncParams.extraFetchOptions)
    )
    // debugger
    let { resolve, reject, id } = params
    //
    console.log('------------')
    console.log('token is' + params.syncParams.extraFetchOptions.token)
    fetch(
      api.base_uri+'v1/app/member/userInfo?token=' +
      params.syncParams.extraFetchOptions.token
    )
      .then(response => {
        return response.json()
      })
      .then(json => {

        console.log('result is ***' + JSON.stringify(json))
        if (json.code == '500') {
          reject({ name:"ExpiredError"})
        // setTimeout(
        //   function () {
        //     const resetAction = StackActions.reset({
        //       index: 0,
        //       actions: [NavigationActions.navigate({ routeName: 'LoginPage' })]
        //     })
        //     this.props.navigation.dispatch(resetAction)
        //   }.bind(this),
        //   1000
        // )
        }

        // console.log(json)
        // debugger
        if (json && json.member) {
          storage.save('user', id, json.member)

          // 成功则调用resolve
          resolve && resolve(json.member)
        } else {
          // 失败则调用reject
          reject && reject(new Error('data parse error'))
        }
      })
      .catch(err => {
        console.warn(err)
        reject && reject(err)
      })
  },
  initMyStruct(params) {
    console.log(`-----拉取线上接口资源\n`)
    let { resolve, reject, id } = params
    let token = params.syncParams.extraFetchOptions.token
    console.log('token is' + token)
    let data = params.syncParams.extraFetchOptions.data
    const paramArr = []
    if (Object.keys(data).length !== 0) {
      for (const key in data) {
        paramArr.push(`${key}=${data[key]}`)
      }
    }
    const url =
    api.base_uri + '/v1/app/struct/initMyStruct?' + paramArr.join('&')
    console.log('==================================')

    console.log('getMyClassifyList url is ' + url)

    let responseData = fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    })
      .then(resp => resp.json())
      .then(
        result => {
          if (result && result.List) {
            storage.save('initMyStruct', id, result.List)
            console.log(`------------\n保存的版本号为\n${result.maxVersion}------------`)
            storage.save('versionByInitMyStruct', id, result.maxVersion)
            resolve && resolve(result.List)
          } else {
            reject && reject(new Error('data parse error'))
          }
        },
        error => {
          console.log('getTypeList error')
          reject && reject(error)
        }
    )
  },
  getMyClassifyList(params) {
    let { resolve, reject } = params
    let token = params.syncParams.extraFetchOptions.token
    let data = params.syncParams.extraFetchOptions.data
    console.log('token is' + token)
    const paramArr = []
    if (Object.keys(data).length !== 0) {
      for (const key in data) {
        paramArr.push(`${key}=${data[key]}`)
      }
    }
    const url =
    api.base_uri + '/v1/app/struct/getMyClassifyList?' + paramArr.join('&')
    console.log('==================================')
    console.log('getMyClassifyList url is ' + url)
    let responseData = fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    })
      .then(resp => resp.json())
      .then(
        result => {
          if (result && result.List) {
            storage.save('getMyClassifyList', id, result.List)

            resolve && resolve(result.List)
          } else {
            reject && reject(new Error('data parse error'))
          }
        },
        error => {
          console.log('getTypeList error')
          reject && reject(error)
        }
    )
  },
  getMyStructList(params) {
    // debugger
    let { resolve, reject, id } = params

    let token = params.syncParams.extraFetchOptions.token
    console.log('==================')
    console.log('token is' + token)
    console.log('==================')
    let data = params.syncParams.extraFetchOptions.data
    console.log('token is' + token)
    const paramArr = []
    if (Object.keys(data).length !== 0) {
      for (const key in data) {
        paramArr.push(`${key}=${data[key]}`)
      }
    }
    const url =
    api.base_uri + '/v1/app/struct/getMyStructList?' + paramArr.join('&')
    console.log('==================================')
    console.log('getMyStructList url is ' + url)
    let responseData = fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    })
      .then(resp => resp.json())
      .then(
        result => {
          if (result && result.List) {
            storage.save('getMyStructList', id, result.List)

            resolve && resolve(result.List)
          } else {
            reject && reject(new Error('data parse error'))
          }
        },
        error => {
          console.log('getTypeList error')
          reject && reject(error)
        }
    )
  },
  // 组合商品
  containsStructCombo(params) {
    // debugger
    let { resolve, reject, id } = params

    let token = params.syncParams.extraFetchOptions.token
    console.log('==================')
    console.log('token is' + token)
    console.log('==================')
    let data = params.syncParams.extraFetchOptions.data
    console.log('token is' + token)
    const url = api.base_uri + '/v1/app/combo/containsStructCombo'
    console.log('==================================')
    let responseData = fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        token: token
      },
      body: JSON.stringify(data)
    })
      .then(resp => resp.json())
      .then(
        result => {
          if (result && result.page) {
            storage.save('containsStructCombo', id, result.page)

            resolve && resolve(result.page)
          } else {
            reject && reject(new Error('data parse error'))
          }
        },
        error => {
          console.log('商城数据 error')
          reject && reject(error)
        }
    )
  },
  comboLabel(params) {
    let { resolve, reject, id } = params
    let token = params.syncParams.extraFetchOptions.token
    console.log('token is' + token)
    let data = params.syncParams.extraFetchOptions.data
    const paramArr = []
    if (Object.keys(data).length !== 0) {
      for (const key in data) {
        paramArr.push(`${key}=${data[key]}`)
      }
    }
    const url = api.base_uri + '/v1/app/combo/comboLabel'
    console.log('==================================')

    console.log('getTagList url is ' + url)

    let responseData = fetch(url, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        token: token
      }
    })
      .then(resp => resp.json())
      .then(
        result => {
          if (result && result.labelList) {
            storage.save('comboLabel', id, result.labelList)

            resolve && resolve(result.labelList)
          } else {
            reject && reject(new Error('data parse error'))
          }
        },
        error => {
          console.log('getTypeList error')
          reject && reject(error)
        }
    )
  }
}

export { sync }
