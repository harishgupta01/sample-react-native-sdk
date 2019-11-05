import React, {Component} from 'react';
import { Dialer } from 'rtc-react-native-sdk';
import UserInfo from '../screens/login/UserInfo';

export default class AudioCall extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
         console.log("Audio call screen mounted")
    }

    render() {
        const { navigation } = this.props;
        const mode = navigation.getParam('mode', 'Outgoing');
        const Payload = navigation.getParam('notificationPayload', {});  
        const sourceTN =  UserInfo.getSharedInstance().getSourceTN();          
        const config = { "irisToken": UserInfo.getSharedInstance().getIrisToken(), 
                        "routingId":UserInfo.getSharedInstance().getRoutingId() }
        
        return(
            <Dialer sourceTN = {sourceTN} mode = {mode} notificationPayload = {Payload} config = {config} onCallStatus = {this.onSdkEvents.bind(this)} onError = {this.onError.bind(this)}/>
        );
    }

    onSdkEvents(json){
        console.log("callid"+json.callId+"status"+json.status)        
    }

    onError(json){
        console.log("onerror "+json.code+"status"+json.reason)
    }
}
