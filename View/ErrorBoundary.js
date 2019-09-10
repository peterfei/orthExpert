import React, { Component } from 'react'
import { View, TextInput, Text, Button } from 'react-native-ui-lib'
export default class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hasError: false,
      errors: ''
    }
  }

  componentDidCatch (error, info) {
    this.setState({
      hasError: true,
      errors: error
    })
    console.info(error, info)
  }

  render () {
    if (this.state.hasError) {
      return (
        <View marginT-100 center>
          <Text red50 text70>
            数据请求发生错误
          </Text>
          <Button
            text70
            white
            background-orange30
            label='返回主页'
            onPress={this.props.navigation.navigate('NewHome')}
          />
        </View>
      )
    }
    return this.props.children
  }
}
