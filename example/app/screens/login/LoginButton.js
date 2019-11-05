import React, {Component} from 'react';
import RoundedButton from "../common/RoundedButton";


export default class LoginButton extends Component {

    constructor(props){
        super(props);
    }


    render() {
        return(
            <RoundedButton text='Sign In with Xfinity' handleOnPress={this.props.onClick}/>
        );
    }
}