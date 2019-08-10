import {
  StyleSheet
} from 'react-native';
import { screen, system } from "../../common";
import { size } from '../../common/ScreenUtil';

export default {
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightMenu: {
    position: 'absolute',
    height: screen.height * 0.5,
    right: 0,
    top: screen.height * 0.5,
    backgroundColor: 'rgba(0,0,0,0.8)',
    width: screen.width * 0.38,
    transform: [{ translateY: -screen.height * 0.5 * 0.5 }],
    alignItems: 'center',
    borderRadius: 5,
    zIndex: 999
  },
  closeButton:{
    alignItems:'flex-end',
    width:screen.width,
    borderBottomWidth:1,
    borderBottomColor:'#343434',
    borderTopLeftRadius:size(20),
    borderTopRightRadius:size(20),
    backgroundColor: 'rgba(0,0,0,0.8)',
    height:30
  },
  information:{
    Maxheight:100,
    borderBottomWidth:1,
    borderBottomColor:'#343434',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding:10,
  },
  deleteStyle: {
    position: "absolute",
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 55
  },
  searchImg: {
    width: 35,
    height: 35,
    position: "absolute",
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchImgMain: {
    width: 20,
    height: 20,
  },
  reasonStyle:{
    width:'100%',
  },
  videoSourceStyle: {
    width: '100%',
    backgroundColor: 'red',
    borderTopLeftRadius: size(20),
    borderTopRightRadius: size(20),
    overflow: 'hidden',
    flex: 1
  },
  btnStyle: {
    width: size(90),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 10
  },
  btnTextStyle: {
    textAlign: "center",
    fontSize: size(16),
    color: "#FFF",
    marginTop: size(8),
    alignSelf: "center",
  },
  details: {
    position: 'absolute',
    width: screen.width,
    bottom: 0,
    left: 0
  },
  detailsImage:{
    position:'absolute',
    top:'50%',
    left:'50%',
    transform: [{ translateX: -screen.width*0.7*0.5 },{ translateY: -screen.height*0.7*0.5 }],
    width:screen.width*0.7,
    height:screen.height*0.7
  },
  btnImgStyle: {
    width: size(28),
    height: size(28),
    resizeMode: 'contain',
  },
  detailsRow: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  boneName: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#343434',
    width: '100%',
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  boneDisease: {
    height: 40,
    width: '100%',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
  },
  closeRightMenuStyle: {
    height: 40,
    width: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    position: 'absolute',
    top: screen.height * 0.5,
    right: screen.width * 0.38 - 20,
    transform: [{ translateY: -20 }],
    paddingLeft: 3,
    justifyContent: 'center',
  },
  closeRightMenuImg: {
    height: 20,
  },
  histortTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#C8C8C8',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#343434',
    paddingTop: 15,
    paddingBottom: 15,
  },
  histortMain: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 10,
    paddingTop: 10,
  },
  place: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,1)',
    width: size(1),
    height: size(1),
  },
  histortBody: {
    padding: 5,
    margin: 7,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    //fontSize: 15,
    color: '#C8C8C8'
  },
  searchBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: "absolute",
    width: screen.width,
    height: screen.height
  },
  icon: {
    width: 25,
    height: 25,
  },
  body: {
    position: "absolute",
    width: screen.width,
    //height: 20,
    backgroundColor: 'rgba(250,250,250,0)',
  },
  top: {
    marginTop: 30,
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  input: {
    height: 35,
    width: '70%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    margin: 0, padding: 0,
    paddingLeft: 30,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 35,
    borderRadius: 3
  },
  iconTitle: {
    fontSize: size(20),
    color: "#C8C8C8"
  }
};