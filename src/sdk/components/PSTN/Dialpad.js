import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ViewPropTypes, SafeAreaView, Dimensions } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import DialerConfig from '../../Resources/DialerConfig'
import defaultDialerStyle from '../../Styles/DialerStyle';

var width = Dimensions.get('window').width;

export default class Dialpad extends Component{
    
    state = {
        phoneNumber: '',
        dialerStyle: defaultDialerStyle(),
        lastPressed: {
            key: '',
            timeStamp: '',
            iterationCount: 0,
        }
    };

    static propType = {
        dialerTheme: ViewPropTypes.style,
        onStartCall: PropTypes.func.isRequired,
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.dialerTheme != undefined){
            return {  dialerStyle: nextProps.dialerTheme};
       }
       return null;
    }

    onStartCall = () => {
        if(this.state.phoneNumber != "")
            this.props.onStartCall(this.state.phoneNumber);
    }

    isSameKeyPressed = (lastPressed, item) => {
        return new Date().getTime() - lastPressed.timeStamp < 5000  && lastPressed.key===item.key
    }

    handleKeyPress = (item) => {
        let {phoneNumber, lastPressed} = this.state;
        if(item.key === '0' && this.isSameKeyPressed(lastPressed, item)){
            const alphaLength = item.alphabets.length;
            const index = (lastPressed.iterationCount)%alphaLength;
            phoneNumber = phoneNumber.slice(0, -1);
            phoneNumber = phoneNumber + item.alphabets[index]
            lastPressed.iterationCount = lastPressed.iterationCount+1;
        }else{
            phoneNumber += item.key;
            lastPressed.iterationCount = 0;
        }
        lastPressed.key = item.key;
        lastPressed.timeStamp = new Date().getTime();
        this.setState({phoneNumber, lastPressed})
    }

    /*onClose = () => {
        this.setState({phoneNumber: ""});
        this.props.onCloseDialer();
    }*/

    onClearNumber = () => {
        let {phoneNumber} = this.state;
        phoneNumber = phoneNumber.slice(0, -1);
        this.setState({phoneNumber});
    }

    renderDeleteButton = () =>{
        return(
            <TouchableOpacity style={this.state.dialerStyle.clearNumber} onPress={this.onClearNumber}>
                <MaterialIcon name='backspace' 
                    size={width/15} 
                    style={this.state.dialerStyle.clearNumber}/>
            </TouchableOpacity>
        );
    }

    renderNumberWrapper = () => {
        return(
            <View style={ this.state.dialerStyle.numberDisplay}>
                <Text style={this.state.dialerStyle.enteredNumber}>{this.state.phoneNumber}</Text>
                
                {this.renderDeleteButton()}
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style = {{flex: 1}}>
                <View style={this.state.dialerStyle.container}>
                    {this.renderNumberWrapper()}
                    <View style = {this.state.dialerStyle.keyContainer}>  
                        {
                            DialerConfig.map((item, index) => {
                                return(
                                    <TouchableOpacity style={this.state.dialerStyle.key} key={index} onPress={()=>this.handleKeyPress(item)}>
                                        <View style={this.state.dialerStyle.keyContent}>
                                            <Text style={this.state.dialerStyle.number}>{item.key}</Text>
                                            <Text style={this.state.dialerStyle.alphabets}>{item.alphabets.join('')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View> 
                    <View style={this.state.dialerStyle.callButtonContainer}>
                        <TouchableOpacity style={this.state.dialerStyle.callButton} onPress={this.onStartCall}>
                            <MaterialIcon name={'call'}
                                size={width/10} 
                                style={this.state.dialerStyle.inputIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}