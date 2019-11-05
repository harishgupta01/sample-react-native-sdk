import React, {Component} from 'react';
import LoginButton from "./LoginButton";
import LoginPage from "./LoginPage";
import {View} from "react-native"

export default class IrisLoginButton extends Component {

    constructor(props){
        super(props);
        this.state = {
            isButton:true
        };
    }

    handleClick(){
        this.setState({isButton:false});
    }

    handleSuccess(){

        this.props.onSuccess.call(this.props.context);

    }

    handleFailure(){

        this.props.onFailure.call(this.props.context);

        this.setState({
            isButton:true
        });
    }


    render() {
        return(
            <View>
                {
                    this.state.isButton ? <LoginButton onClick={this.handleClick.bind(this)}/>
                    : <LoginPage successCb = {this.handleSuccess.bind(this)}  failureCb = {this.handleFailure.bind(this)}/>}
            </View>
        );
    }
}


