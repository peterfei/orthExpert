import {
  StyleSheet
} from 'react-native';
import { screen, system } from "../../common";
import { size } from '../../common/ScreenUtil';

export default{
  container: {
    flex: 1,
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightMenu: {
    position: 'absolute',
    height: screen.height * 0.7,
    right: 0,
    top: screen.height * 0.5,
    backgroundColor: '#262626',
    width: 175,
    transform: [{ translateY: -screen.height * 0.7 * 0.5 }],
    alignItems: 'center',
    borderRadius: 5,
    zIndex: 999
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
  videoSourceStyle: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    marginTop: 15
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
    backgroundColor: '#262626',
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
    backgroundColor: '#262626',
    borderRadius: 20,
    position: 'absolute',
    top: screen.height * 0.5,
    right: 155,
    transform: [{ translateY: -20 }],
    paddingLeft: 3,
    justifyContent: 'center',
  },
  closeRightMenuImg: {
    height: 20,
  },
  histortTitle: {
    fontWeight: 'bold',
    fontSize: 18,
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
  histortBody: {
    padding: 10,
    margin: 7,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    fontSize: 15,
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