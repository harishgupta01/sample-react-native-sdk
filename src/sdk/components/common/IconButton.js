
import React from 'react';
import { Text, View, TouchableOpacity, ViewPropTypes } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';

import defaultIconButtonStyle from '../../Styles/IconButtonStyle';


export default class IconButton extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            buttonStyle:defaultIconButtonStyle(),
            isPressed : false ,
            iconView: '',
            iconColor:'#FFFFFF'
        }
    }

    static propType = {
        iconColor : PropTypes.string,
        onButtonPress : PropTypes.func,
        buttonLabel : PropTypes.string,
        buttonTheme : ViewPropTypes.style,
        enableToggleEffect : PropTypes.bool,
        renderCustomIcon :  PropTypes.string,
        iconName : PropTypes.string.isRequired, 
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.buttonTheme != undefined){
          return {buttonStyle: nextProps.buttonTheme};
        }
        if(nextProps.iconColor != undefined){
            return {iconColor: nextProps.iconColor};
        } 
        return null;
     }

    static defaultProps = {
        color:'#0099ff',
        buttonBackgroundColor:'',
        renderCustomIcon :  ''
    }

    handlePress = () =>{
        if(this.isValid(this.props.enableToggleEffect) && this.props.enableToggleEffect){
        this.setState(previousState => (
            { isPressed: !previousState.isPressed }
          ))
        }
        this.props.onButtonPress(!this.state.isPressed)
    }

    render(){
        return(
            <View style={[this.state.buttonStyle.container]}>
                <TouchableOpacity style={[this.state.isPressed ?  this.state.buttonStyle.iconBttnPressed : 
                                                                  this.state.buttonStyle.iconBttn,this.props.style]}  onPress={this.handlePress}>
            
                    {this.renderIcon()}
                </TouchableOpacity>
                {this.renderTextLabel()}
            </View>
        );
    }

    renderIcon(){
        return(this.isValid(this.props.renderCustomIcon) ?   this.props.renderCustomIcon : this.defaultIcon());
    }

    renderTextLabel(){
        return(this.isValid(this.props.buttonLabel) && <Text style={this.state.buttonStyle.iconLabel}>{this.props.buttonLabel}</Text>)
    }

    defaultIcon(){
        return(<MaterialIcon style={this.state.buttonStyle.icon} name={this.props.iconName} color={this.state.iconColor} />)
    }

    isValid = (value) =>{
        if(value != undefined && value != '')
        return true;
        else
        return false;
    }
}
