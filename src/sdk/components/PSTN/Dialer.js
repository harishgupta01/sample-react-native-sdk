import React, { Component } from 'react';
import { Alert, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';

import Events from  '../../RtcEvents';
import InCallView from './InCallView';
import Dialpad from './Dialpad';
import RtcSession from '../../IrisRtcSession';
import RtcConnection from '../../IrisRtcConnection';
import logger from '../../RtcLogger'
//import defaultDialerStyle from '../../Styles/DialerStyle';



//var sourceTelephonNum;
const Tag = "Dialer";

export default class Dialer extends Component {
  
    constructor(props) {
        super(props);

        audioSession = null;

        this.state = {
            mode: 'Outgoing',
            onCreate: false,
            targetNum: null,
            sourceNum:null,
            notificationPayload: {},
        };
    } 

    static propTypes = {
        sourceTN : PropTypes.string.isRequired,
        mode: PropTypes.oneOf(['Outgoing', 'Incoming']).isRequired,
        notificationPayload: PropTypes.object,
        config: PropTypes.object,
        dialerTheme : ViewPropTypes.style,
        inCallViewTheam: ViewPropTypes.style,
        onCallStatus: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired
    }

    //Executed before render
    componentWillMount(){
        // AsyncStorage.getItem('fromTN').then((res)=>{
        //     logger.Info(Tag, 'Target telephone number ',res)
        //     //sourceNum = res
        //     this.setState({fromTN:res})
        // })
        // .catch(error =>{
        //     logger.Error(Tag, "Error in retreving source TN", error)
        // });
        
        this.setState({
            mode: this.props.mode,
            sourceNum: this.props.sourceTN,
            notificationPayload: this.props.notificationPayload
        });
    }
  
    componentDidMount() {
        RtcConnection.onNotification = this.onNotification.bind(this);
    }

    render(){
        if(this.state.mode == 'Incoming' || this.state.onCreate){
            this.startSession();
            return(
                <InCallView
                    onMute = {this.muteCall} 
                    onHold = {this.holdCall} 
                    onEndPressed = {this.endSession} 
                    destinationTN = {this.state.targetNum} 
                    inCallViewTheam = {this.props.inCallViewTheam}
                />
            );
        }else{
            return (
                <Dialpad
                    onStartCall = {this.startCall}
                    dialerTheme = {this.props.dialerTheme}
                />
            );
        }
    }

    //Invoked to start an audio session for incoming or outgoing
    startSession = () =>{
        var self = this;
        this.audioSession = new RtcSession();

        // if(self.props.mode == "incoming"){
        //     let config =  {'sessionType':'videocall', 'stream':stream, 
        //                       'callType':'incoming', 'notificationdata':self.props.notificationPayload,'useBridge':true};
        //     videosession.joinSession(config, self.onSessionCallback)
        //   }else{
        //     let config =  {'sessionType':'videocall', 'stream':stream, 'notifydata': self.getNotificationPayload(username)
        //                       , 'callType':'outgoing', 'roomID' : self.props.inRoom,'notificationdata':{},'useBridge':true};
        //     videosession.createSession(config,self.onSessionCallback)
        //   }

        if(this.state.mode == 'Incoming'){
         //   let config =  {'sessionType':'pstncall','callType':'incoming','notificationdata': this.state.notificationPayload
         //                       ,'useBridge':true,'userData':this.props.config};
         //   this.audioSession.joinSession(config, this.onSessionCallback)
        
            var Payload = this.state.notificationPayload; 
            Payload.sessionType = "pstncall";
            this.audioSession.accept(Payload,this.props.config).then(response => {
                console.log("Call id ", response)
            }).catch(error => {                
                if (self.props.onError !== undefined ) {
                    self.props.onError(error);
                }else {
                    logger.Info(Tag,"onError callback undefined");
                }                    
            });
           
            
        }else{
            let dialedNumber = this.state.targetNum;
            if(dialedNumber != null){
                if(!dialedNumber.startsWith('+1'))
                    dialedNumber = '+1' + dialedNumber;

                // let config =  {'sessionType':'pstncall','Sourcenum': this.state.sourceNum , 'Targetnum': dialedNumber , 'notifydata': this.getNotificationPayload(),'notificationdata':{}
                //                 , 'callType':'outgoing','userData':this.props.config,'useBridge':true};                                
               // this.audioSession.createSession(config,this.onSessionCallback) 

                this.audioSession.dial( this.state.sourceNum , dialedNumber ,this.getNotificationPayload(), this.props.config).then(response => {
                    console.log("Call id ", response)
                }).catch(error => {                   
                    if (self.props.onError !== undefined ) {
                        self.props.onError(error);
                    }else {
                        logger.Info(Tag,"onError callback undefined");
                    }                    
                });              
            }
        }

        this.audioSession.on('status', (callId, status) => {
            
            if (self.props.onCallStatus !== undefined ) {

                var json = { "callId": callId, "status": status}; 
                self.props.onCallStatus(json);
                if(status == "onSessionEnded"){           
                    self.setState({
                        mode: 'Outgoing',
                        onCreate: false,
                        targetNum: null,
                        notificationPayload: {}
                    });
        
                    if(self.audioSession != null)               
                        self.audioSession = null;
                    
                }
            }else {
                logger.Info(Tag,"onCallStatus callback undefined");
            } 
        });

        this.audioSession.on('error', (callId, errorInfo) => {
 
            if (self.props.onError !== undefined ) {
                var json = { "callId": callId, "errorInfo": errorInfo}; 
                self.props.onError(json);
            }else{
                logger.Info(Tag,"error callback undefined");
            }        
        });
    }

    //Invoked to set values for an outgoing call before starting session
    startCall = (dialedNumber) =>{
        this.setState({
            onCreate: true,
            targetNum: dialedNumber
        });
    }

    rejectCall = (notificationPayload) =>{
        this.audioSession = new RtcSession();
        this.audioSession.reject(notificationPayload)
    }

    //Invoked to mute an audio call
    muteCall = (mute) => {
        if(this.audioSession != null){
            this.audioSession.audioMuteToggle();
        }
    }

    //Invoked to hold an audio call
    holdCall = (hold) => {
        if(this.audioSession != null){
            if(hold)
                this.audioSession.pstnHold();
            else
            this.audioSession.pstnUnHold();
        }
    }

    //Executed on ending an active call
    endSession = () =>{      
        this.setState({
            mode: 'Outgoing',
            onCreate: false,
            targetNum: null,
            notificationPayload: {}
        });
        
        if(this.audioSession != null){
            this.audioSession.closeSession();
            this.audioSession = null;
        }
    }
    
    //Function to return the notification payload for an outgoing audio call
    getNotificationPayload = () =>{

        let data =  [{'cname': this.state.sourceNum} , {'cid': this.state.sourceNum} , {'tar': this.state.targetNum}];

        let notificationpayload =  [{'type': 'pstn'} , {'topic': 'federation/pstn'}];

        let userdata =  [{'data': data} , {'notification': notificationpayload}];

        let jsondata = JSON.stringify(userdata);

        return jsondata;
    }

    onNotification = (incomingPayload) => {
        logger.Info(Tag, "on Notification");

        let userData = JSON.parse(incomingPayload.user_data);

        Alert.alert(
            'Call from '+userData.data.cname,
            userData.data.cid,
            [
                {
                    text: 'Ignore',
                    onPress: () => logger.Info('Dialer', 'Call Ignored'),
                },
                {
                    text: 'Reject',
                    onPress: () => this.rejectCall(incomingPayload),
                    style: 'cancel',
                },
                {
                    text: 'Accept',
                    onPress: () => {
                        this.setState({
                            mode: 'Incoming',
                            targetNum: userData.data.cid,
                            notificationPayload: incomingPayload,
                        });
                    },
                },
            ],
            {cancelable:false}
        );
    }

    //Session callbacks for create and join session
    onSessionCallback = (json) =>{       
        
        if (this.props.onCallStatus !== undefined ) {
            this.props.onCallStatus(json);
        }else {
            logger.Info(Tag,"onCallStatus callback undefined");
        }      

        if(json.event == "onSessionEnded"){           
            this.setState({
                mode: 'Outgoing',
                onCreate: false,
                targetNum: null,
                notificationPayload: {}
            });

            if(this.audioSession != null)               
                this.audioSession = null;
            
        }           
    }
}
