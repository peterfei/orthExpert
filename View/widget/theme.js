import { Typography, Colors } from 'react-native-ui-lib'

Colors.loadColors({
  primary: '#4C6FB0',
  secondary: '#7DC8FF',

  border: '#bbbbbb',
  line: '#c5c5c5',
  paper: '#f3f3f3',
  highlighted: '#f9f9f9',

  lightGray: '#bbbbbb',
  gray: '#888888',
  darkGray: '#444444',

  green: '#176500',
  red: '#FF0032',
  blue: '#02008E',
  yellow: '#FFB400',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  defaultText: '#666666',
  lightText: '#aeaeae',
  darkText: '#444444'
})

Typography.loadTypographies({
  h1: {fontSize: 18, fontWeight: 'bold', color: Colors.darkText},
  h2: {fontSize: 16, color: Colors.darkText},
  h3: {fontSize: 15, color: Colors.darkText},
  h4: {fontSize: 14, color: Colors.defaultText},
  h5: {fontSize: 12, color: Colors.lightText}
})
