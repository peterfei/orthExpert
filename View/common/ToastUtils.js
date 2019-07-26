import Toast, { DURATION } from 'react-native-easy-toast'

let show = (data) => {
  if (data != null) {
    this.refs.toast.show(data, {
      duration: DURATION.LENGTH_SHORT,
      position: 'bottom',
      textStyle: {color: '#222222'}
    })
  }
}

export { show }
