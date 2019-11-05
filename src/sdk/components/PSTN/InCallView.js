
import React from 'react';
import { View, Text, ViewPropTypes, Dimensions} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import IconButton from '../common/IconButton';
import defaultStyle from '../../Styles/InCallViewStyle';

var width = Dimensions.get('window').width;

export default class InCallView extends React.Component {

    
    constructor(props) {
        super(props);
        this.state = {
            callViewStyle: defaultStyle(),
            isMuted : false,
            isHold : false,
        }
    }

    static propTypes = {
        onMute : PropTypes.func.isRequired,
        onHold : PropTypes.func.isRequired,
        destinationTN: PropTypes.string.isRequired,
        onEndPressed: PropTypes.func.isRequired,
        inCallViewTheam: ViewPropTypes.style,
    } 

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.inCallViewTheam != undefined){
          return {  callViewStyle: nextProps.inCallViewTheam};
       }
       return null;
    }

    handleEndCallPress = () => { 
        this.props.onEndPressed();
    }

    handleOnMute = () => {
        this.props.onMute(!this.state.isMuted);

        this.setState({
            isMuted : !this.state.isMuted,
        });
    }

    handleOnHold = () => {
        this.props.onHold(!this.state.isHold);
        this.setState({
            isHold : !this.state.isHold,
        });
    }

    render(){
        return(
            <View style={this.state.callViewStyle.container}>
                <View style={this.state.callViewStyle.textColumn}> 
                    <MaterialIcon name = 'account-circle' size = {width/5} color = '#9e9e9e'/>
                    <Text style={this.state.callViewStyle.name}>{this.props.destinationTN}</Text>
                    <Text style={this.state.callViewStyle.status}>{''}</Text>
                </View>
                
                <View style={ this.state.callViewStyle.buttonContainer}>
                    <View style={this.state.callViewStyle.buttonRow}>
                        {this.state.isMuted ?    <IconButton iconName='mic-off' iconColor='#0277BD' enableToggleEffect='true' onButtonPress={this.handleOnMute} />
                                                :<IconButton iconName='mic' iconColor='#FFFFFF' enableToggleEffect='true' onButtonPress={this.handleOnMute} />}
                    
                        <IconButton iconName='call-end' style ={{backgroundColor :'#DB3F18'}} iconColor='#ffffff' onButtonPress={this.handleEndCallPress} /> 
                        
                        {this.state.isHold ?    <IconButton iconName='phone-paused' iconColor='#0277BD' enableToggleEffect='true' onButtonPress={this.handleOnHold} />
                                                :<IconButton iconName='phone-paused' iconColor='#FFFFFF' enableToggleEffect='true' onButtonPress={this.handleOnHold} />}
                          
                    
                    </View> 
                </View>  
            </View>
        );
    }  
}
