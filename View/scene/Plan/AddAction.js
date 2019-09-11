
import React from "react";
import {DeviceEventEmitter, Image, StyleSheet, Text, TouchableOpacity, View,ScrollView} from "react-native";
import {
    AppDef,
    BaseComponent,
    ContainerView,
    deviceHeight,
    deviceWidth,
    HttpTool,
    Line,
    ListEditCell,
    NavBar,
    NetInterface,
    size,
    isIPhoneXFooter
} from '../../common';
import {storage} from "../../common/storage";
import SYImagePicker from 'react-native-syan-image-picker'
import {NavigationActions} from "react-navigation";
import MotionSelectCell from './MotionSelectCell';
const groupBy = (targetList, field) => {
    const names = findNames(targetList, field);
    return names.map(name => {
        const value = targetList.filter(target => target[field] === name)
        return { key: name, value }
    })
}

function findNames(targetList, field) {
    const names = []
    targetList.forEach(target => {
        if (!names.includes(target[field])) {
            names.push(target[field])
        }
    })
    return names
}

export default class AddAction extends BaseComponent {

    constructor(props){
        super(props)
        this.state = {
            trainItemsList:[{title:'部位'},{title:'器材'}],
            sourceData: [],
            motionList: [],
            bodyParts: [],
            sick: props.navigation.state.params.sick,
            currArea: props.navigation.state.params.currArea,
            selectIndex: -1,
            ChoosePartsArr:[], //用来展示部位的选项,
            ChooseEquipArr:[],// 用来展示器材的选项
            areaNos: [], // 部位编号
            equipLists: [], //通过部位 选择后的选项
            equipName: []

        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            sick: nextProps.navigation.state.params.sick,
            currArea: nextProps.navigation.state.params.currArea
        })
    }

    componentDidMount() {
        this.getBodyParts()
    }


    async getBodyParts(){
        const url = 'http://res.vesal.site/commom/sick/GetSick.json';
        await fetch(url)
            .then(res => res.json())
            .then(result => {
                if(result.code == 0){
                    this.setState({
                        bodyParts: result.sickList
                    })
                    let data = result.sickList;
                    let defaultValueIndex = data.findIndex(item =>{
                        return item.pat_area_id == this.state.currArea.pat_area_id && item.pat_area_no == this.state.currArea.pat_area_no;
                    })
                    let defaultValue = data[defaultValueIndex];
                    this.showChoiceLabel(defaultValue.pat_area_id,defaultValue.pat_area_no)
                    this.getEquipmentByBody()
                    this.finishChoice()
                    // alert(JSON.stringify(defaultValue));
                    // let chooseArr = this.state.ChoosePartsArr;
                    // let areasArr = this.state.areaNos;
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    confirm() {
        let arr = [];
        this.state.motionList.forEach((item, index) => {
            let data = item.value;
            data.forEach((motion, index) => {
                if (motion.isSelect) {
                    arr.push(motion);
                }
            })

        })
        if (this.confirmSelectMotions) {
            this.confirmSelectMotions(arr);
        }
    }

    confirmSelectMotions(result) {
        // alert(JSON.stringify(result))
        if (result.length <= 0) {
            this.mainView._toast('请先选择一个动作进行添加!')
        } else {
            result.forEach((motion, index) => {
                motion.sort = index;
                motion.rest = '10';
                motion.taType = motion.amType;
                motion.repetitions = '10';
                motion.taTime = '10';
            })
            this.props.navigation.state.params.recieveData(result);
            this.props.navigation.goBack()
            // this.setState({
            //     amList: [...this.state.amList, ...result]
            // })
        }
    }
    selectCell(motion) {
        motion.isSelect = !motion.isSelect;
        this.setState({
            motionList: this.state.motionList
        })
    }

    getEquipmentByBody(){
        const netInterface = "app/kfxl/v1/animation/getPlanGetEquip?areaNos=" + this.state.areaNos;
        HttpTool.GET(netInterface)
            .then(res => {
                if(res.code == 0 ){
                    this.setState({
                        equipLists: res.equipList
                    })
                }
            })
    }

    _renderMotions() {
        // let allArr = [];
        // let arr = [];
        // this.state.motionList.forEach((item, index) => {
        //     let title = item.key;
        //     let data = item.value;
        //     allArr.push(
        //         <View style={{flex:1}}>
        //             <Text>{title}</Text>
        //             { data.forEach((i,k)=>{
        //                return arr.push(
        //                     <TouchableOpacity onPress={() => {}}>
        //                         <MotionSelectCell key={k} motion={i}/>
        //                     </TouchableOpacity>
        //                 )
        //             })}
        //         </View>
        //     )
        // });
        // return allArr;
        if (this.state.motionList.length > 0) {
           return (
               this.state.motionList.map((item, index) => {
                   let data = item.value;
                   return (
                       <View style={{flex: 1,marginLeft:size(26),marginTop:size(39)}}>
                           <Text style={{color:'#262626',fontSize:size(32),fontWeight:'bold'}}>{item.key}</Text>
                           {data.map((i, k) => {
                               return (
                                   <TouchableOpacity onPress={() => {this.selectCell(i)}}>
                                       <MotionSelectCell key={k} motion={i}/>
                                   </TouchableOpacity>
                               )
                           })}
                       </View>
                   )
               })
           )
        }
    }

    _renderIfIcon(data, selectIndex) {
        if (this.state.selectIndex != selectIndex) {
            return (
                <Image source={require('../../img/kf_main/kf_plan_up.png')} style={{marginLeft: size(15), height: size(11), width: size(16)}}/>
            )
        }
        else {
            return (
                <Image source={require('../../img/kf_main/kf_plan_down.png')} style={{marginLeft: size(15), height: size(11), width: size(16)}}/>
            )
        }
    }

    checkSelectChoice = (m,index) => {
        let rs = false;
        if(index == 0){  //部位
            let chooseArr = this.state.ChoosePartsArr;
            if (chooseArr.length > 0) {
                for (let i = 0; i < chooseArr.length; i++) {
                    if (chooseArr[i] == m) {
                        rs = true;
                        break;
                    }
                }
            }
        }else {
            let ChooseEquipArr = this.state.ChooseEquipArr;
            if (ChooseEquipArr.length > 0) {
                for (let i = 0; i < ChooseEquipArr.length; i++) {
                    if (ChooseEquipArr[i] == m) {
                        rs = true;
                        break;
                    }
                }
            }
        }

        return rs;
    };

    showChoiceLabel(id,areas) {
        let chooseArr = this.state.ChoosePartsArr;
        let areasArr = this.state.areaNos;
        chooseArr.includes(id) ? chooseArr.splice(chooseArr.indexOf(id), 1) : chooseArr.push(id);
        areasArr.includes(areas) ? areasArr.splice(areasArr.indexOf(areas), 1) : areasArr.push(areas);
        this.setState({
            ChoosePartsArr: chooseArr,
            areaNos: areasArr
        })
    }

    showChoiceEquip(name,index){
        let ChooseEquipArr = this.state.ChooseEquipArr;
        let equipNameArr = this.state.equipName;
        ChooseEquipArr.includes(index) ? ChooseEquipArr.splice(ChooseEquipArr.indexOf(index), 1) : ChooseEquipArr.push(index);
        equipNameArr.includes(name) ? equipNameArr.splice(equipNameArr.indexOf(name), 1) : equipNameArr.push(name);
        this.setState({
            equipName: equipNameArr,
            ChooseEquipArr: ChooseEquipArr
        })
    }

    resetChoose(index){
        if(index == 0){  //部位
            let arr = this.state.ChoosePartsArr;
            arr.splice(0, arr.length);
            this.setState({
                ChoosePartsArr: arr
            })
        }else {
            let arr = this.state.ChooseEquipArr;
            arr.splice(0, arr.length);
            this.setState({
                ChooseEquipArr: arr
            })
        }

    }

    finishChoice(){
        this.mainView._showLoading('正在加载中');
        const url ='app/kfxl/v1/animation/getPlanFilterAnimation?business=kfxl&areaNos='+ this.state.areaNos + '&equipNames=' + this.state.equipName;
        // alert(url)
        HttpTool.GET(url)
            .then(res => {
                this.mainView._closeLoading()
                // alert(`res is ${JSON.stringify(res)}`)
                if (res.code == 0 && res.msg == 'success') {
                    res.amList.forEach(item => {
                        item['isSelect'] = false;
                    })
                    let motionList = groupBy(res.amList,'lashenDonzuo')
                    this.setState({
                        motionList: motionList
                    })
                }
            })
            .catch(error => {
                console.log(error);
            })


    }

    _renderChoseOneShow() {
        if (this.state.selectIndex != -1) {
         if(this.state.selectIndex == 0){  //部位
             return (
                 <View style={{zIndex: 999, left: 0, top: size(214), right: 0, bottom: size(0.01), position: 'absolute', backgroundColor: 'rgba(192,192,192,0.5)',}}>
                     <View style={{height: size(600), width: '100%', backgroundColor: '#ffffff', flexDirection: 'column'}}>
                         <ScrollView style={{flex:1}}>
                             <View style={{flexDirection: "row", flexWrap: 'wrap',marginTop: size(40)}}>
                                 {
                                     this.state.bodyParts.map((data,index)=>{
                                         return(
                                             <View style={{width: deviceWidth / 4,justifyContent:'center',alignItems:'center',marginBottom:size(30)}}>
                                                 <TouchableOpacity
                                                     style={{ height: size(50), justifyContent: "center",width:size(160), alignItems:'center', borderRadius: size(30), backgroundColor:this.checkSelectChoice(data.pat_area_id,this.state.selectIndex) ?  '#02BAE6' :'#E6E6E6'}}
                                                     onPress={()=>{
                                                         this.showChoiceLabel(data.pat_area_id,data.pat_area_no)
                                                 }}>
                                                     <Text style={{
                                                         color: this.checkSelectChoice(data.pat_area_id,this.state.selectIndex) ? "#fff" :'#282828',
                                                         fontSize: size(26),
                                                         paddingLeft: size(20),
                                                         paddingRight: size(20)
                                                     }}>{data.pat_name}</Text>
                                                 </TouchableOpacity>
                                             </View>
                                         )
                                     })}
                             </View>
                         </ScrollView>
                         <View style={{justifyContent:'space-around',flexDirection:'row',paddingBottom:size(40)}}>
                             <TouchableOpacity
                                 style={{width:size(270),height:size(60),borderColor:'rgba(2,186,230,1)',borderWidth:size(2),borderRadius:size(29),justifyContent:'center',alignItems:'center'}}
                                 onPress={()=>{this.resetChoose(this.state.selectIndex)}}>
                                 <Text style={{color:'#02BAE6',fontSize:size(28)}}>重置</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                 style={{width:size(270),height:size(60),backgroundColor:'rgba(2,186,230,1)',borderRadius:size(29),justifyContent:'center',alignItems:'center'}}
                                 onPress={()=> {
                                     this.setState({
                                         selectIndex: -1
                                     })
                             }}>
                                 <Text style={{color:'#FFFFFF',fontSize:size(28)}}>完成</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                     <TouchableOpacity style={{flex: 1}} onPress={() => {this.setState({selectIndex: -1})}}/>
                 </View>
             )
         }else{
             this.getEquipmentByBody()
             return(
                 <View style={{zIndex: 999, left: 0, top: size(214), right: 0, bottom: size(0.01), position: 'absolute', backgroundColor: 'rgba(192,192,192,0.5)',}}>
                     <View style={{height: size(600), width: '100%', backgroundColor: '#ffffff', flexDirection: 'column'}}>
                         <ScrollView style={{flex:1}}>
                             <View style={{flexDirection: "row", flexWrap: 'wrap',marginTop:size(40)}}>
                                 {
                                     this.state.equipLists.map((data,index)=>{
                                         return(
                                             <View style={{width:deviceWidth/4,justifyContent:'center',alignItems:'center',marginBottom:size(30)}}>
                                                 <TouchableOpacity style={{ height: size(50), justifyContent: "center",width:size(160), alignItems:'center', borderRadius: size(30), backgroundColor: this.checkSelectChoice(index) ?  '#02BAE6' :'#E6E6E6'}}
                                                                   onPress={()=>{
                                                                       this.showChoiceEquip(data.ch_name,index)
                                                                   }}>
                                                     <Text style={{
                                                         color: this.checkSelectChoice(index) ? "#fff" :'#282828',
                                                         fontSize: size(26),
                                                         paddingLeft: size(20),
                                                         paddingRight: size(20)
                                                     }}>{data.ch_name}</Text>
                                                 </TouchableOpacity>
                                             </View>
                                         )
                                     })}
                             </View>
                         </ScrollView>
                         <View style={{justifyContent:'space-around',flexDirection:'row',paddingBottom:size(40)}}>
                             <TouchableOpacity
                                 style={{width:size(270),height:size(60),borderColor:'rgba(2,186,230,1)',borderWidth:size(2),borderRadius:size(29),justifyContent:'center',alignItems:'center'}}
                                 onPress={()=>{this.resetChoose(this.state.selectIndex)}}>
                                 <Text style={{color:'#02BAE6',fontSize:size(28)}}>重置</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                 style={{width:size(270),height:size(60),backgroundColor:'rgba(2,186,230,1)',borderRadius:size(29),justifyContent:'center',alignItems:'center'}}
                                 onPress={()=> {
                                     this.finishChoice()
                                     this.setState({
                                         selectIndex: -1
                                     })
                                 }}>
                                 <Text style={{color:'#FFFFFF',fontSize:size(28)}}>完成</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                     <TouchableOpacity style={{flex: 1}} onPress={() => {this.setState({selectIndex: -1})}}/>
                 </View>
             )
         }

        }
    }

    selectAction(data, selectIndex) {
        if (this.state.selectIndex == -1) { // 第一次
            this.setState({
                selectIndex: selectIndex
            })
        } else {
            if (this.state.selectIndex == selectIndex) {
                this.setState({
                    selectIndex: -1
                })
            } else {
                this.setState({
                    selectIndex: selectIndex
                })
            }
        }
    }
    render(){
        return(
            <ContainerView ref={r => this.mainView = r}>
                <NavBar title={'添加康复动作'}  navigation={this.props.navigation}/>
                {/*下拉选择*/}
                <View style={{height: size(86),flexDirection: 'row'}}>
                    {
                        this.state.trainItemsList.map((data, index) => {
                            // let title = this.state.label[index];
                            return (
                                <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}
                                    onPress={() => {
                                        this.selectAction(data, index)
                                    }}>
                                    <Text style={{color: '#262626', fontWeight: 'bold', fontSize: size(28)}}>{data.title}</Text>
                                    {this._renderIfIcon(data, index)}
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
                <Line height={size(2)}  color='rgba(227, 227, 227, 0.5)' />
                {/*展示下拉选择项*/}
                {this._renderChoseOneShow()}
                {/*展示内容*/}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    alwaysBounceVertical={false}
                    bounces={false}
                    style={{flex: 1}}>
                    {this._renderMotions()}
                </ScrollView>
                {/*点击完成*/}
                <TouchableOpacity activeOpacity={0.8} style={styles.startTouchStyle}
                                  onPress={() => {this.confirm()}}>
                    <Text style={styles.startTextStyle}>完成</Text>
                </TouchableOpacity>
            </ContainerView>
        )
    }

}

const styles = StyleSheet.create({
    startTouchStyle: {
        backgroundColor: AppDef.Blue,
        height: size(100) + isIPhoneXFooter(0),
        width: '100%',
        bottom:0,
        left:0
    },
    startTextStyle: {
        fontSize: size(48),
        width: '100%',
        height: size(88) + isIPhoneXFooter(0),
        lineHeight: size(88) + isIPhoneXFooter(0),
        fontWeight: 'bold',
        textAlign: 'center',
        color: AppDef.White
    },
})