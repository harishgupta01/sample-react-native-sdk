import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as IrisLoginRequest from "../../networking/IrisLoginRequest"

export default class IrisLogin extends Component {

    constructor(props) {
        super(props);
    }

    tokenRequest(){
        IrisLoginRequest.irisTokenRequest(this.props.loginType,this.props.token,this.props.appKey,this.props.appSecret,this.props.onSuccess.bind(this.props.context),this.props.onFailure.bind(this.props.context));
    }


    render() {
        {this.tokenRequest()}
        return null;
    }
}

IrisLogin.propTypes = {
    token: PropTypes.string.isRequired,
    loginType : PropTypes.string.isRequired,
    appKey : PropTypes.string.isRequired,
    appSecret : PropTypes.string.isRequired,
    onSuccess : PropTypes.func.isRequired,
    onFailure : PropTypes.func.isRequired,
    context : PropTypes.object.isRequired

};


