import {StyleSheet, Text, TextInput, Button, Keyboard, View, ViewPropTypes} from 'react-native';
import RtcSession from '../../IrisRtcSession';
import EventConfig from "../../networking/EnvConfig";
import {encode as utf8Encode} from "utf8";
import logger from  '../../RtcLogger';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RtcVideoView from "./RtcVideoView"
import AsyncStorage from '@react-native-community/async-storage';

const Tag = "RtcVideoCall";

export default class RtcVideoCall extends Component {

    constructor(props) {
        super(props);
        videoSession = null;
        this.state = {           
            mode: 'Outgoing',
            gotLocalStream:false,
            gotRemoteStream:false,
            onCreate: false,
            irisToken: null,
            routingID: null,          
            localTrack: null,
            remoteTrack: null,
            localVideo: null,
            remoteVideo: null,
            notificationPayload: {},
            targetemailId: '',
            userName : '',
            roomId: '',
        }
    }

    static propTypes = {
        mode: PropTypes.oneOf(['Outgoing', 'Incoming']),
        notificationPayload: PropTypes.object,
        config: PropTypes.object,
        onEnd: PropTypes.func.isRequired,
        videocallViewTheme: ViewPropTypes.style,
        onParticipantJoined:PropTypes.func,
        onLocalStream:PropTypes.func,
        onRemoteStream:PropTypes.func,
        onCallStatus: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired       
    }

    //Executed before render
    componentWillMount(){
        this.setState({
            mode: this.props.mode,
            notificationPayload: this.props.notificationPayload,
            targetemailId: this.props.config.targetEmailId,
            userName: this.props.config.userName,
            irisToken:this.props.config.irisToken,
            routingID:this.props.config.routingId           
        });
    }

    componentDidMount(){      
            this.startSession();
    }

    render() {                         
            return (
                <RtcVideoView 
                    localVideo = {this.state.localTrack}
                    remoteVideo = {this.state.remoteTrack} 
                    onEndPressed = {this.endSession} 
                    onMute={this.muteCall} 
                    onFlip={this.flipCamera}
                    onShutter={this.shutCamera}
                    onLocalStream = {this.state.gotLocalStream}
                    onRemoteStream = {this.state.gotRemoteStream}
                    videoViewTheme = {this.props.videocallViewTheme}/>
            );            
      }

    //Invoked to set values for an outgoing call before starting session
     startCall = (roomId) =>{       
        this.setState({
            roomId: roomId,
            onCreate:true            
        });
     }

    muteCall = (mute) => {
        if(this.videoSession != null){
            this.videoSession.audioMuteToggle();
        }
    }

    flipCamera = () => {        
        this.videoSession.flipCamera();
    }

    shutCamera = () =>{
        if(this.videoSession != null){
            this.videoSession.videoMuteToggle();
        }
    }

    //Invoked to hold an audio call
    holdCall = (hold) => {
        // if(this.audioSession != null){
        //     if(hold)
        //         this.audioSession.pstnHold();
        //     else
        //     this.audioSession.pstnUnHold();
        // }
    }

    //Executed on ending an active call
    endSession = () =>{      
        this.setState({
            mode: 'Outgoing',
            onCreate: false,           
            notificationPayload: {}
        });
        
        if(this.videoSession != null){
            this.videoSession.closeSession();
            this.videoSession = null;
        }
    
        this.props.onEnd();
    }
 
    createRoom = () =>{
        var self = this;
        let targetid = this.state.targetemailId;      
        this.getTargetRoutingid(targetid)
             .then(response => {                
                 this.getRoomId(response.routing_id)
                     .then(response => { 
                         this.setState({roomId:response.room_id})                    
                         this.startSession();                        
                     }).catch(error => {
                         logger.Error(Tag, "Got error", error);
                     });
            
             }).catch(error => {
                 logger.Error(Tag,"Got error", error);
             });  
    }  
 
     async getTargetRoutingid(targetId){      
 
        
             return new Promise((success,failure) =>{
     
                 var url = EventConfig.IDENTITY_MANAGER_URL+'v1/routingid/appdomain/iristest.comcast.com/publicid/'+targetId;  
  
                 fetch(url, {
                     method: 'GET',
                     headers: {
                         'Content-Type': 'application/json',
                         'Authorization': 'Bearer ' +this.state.irisToken,                        
                     },                   
     
                 }).then(response => { 
     
                     if(response.headers.get("Content-Type") == 'application/json'){
                         logger.Info(Tag, "Identity manager response : Status code ::"+ response.status);
                         return response.json();
                     }else{
                         logger.Error(Tag, "Identity Manager : Failed to obtain target routing id  : ");
                         //   ntmResponse('Failure');
                         return failure("Identity Manager : Failed to obtain target routing id : ")
                     }
                 }).then(responseJson => {
     
                     logger.Info(Tag, "got response ",responseJson);
                     if(responseJson.error){
                         logger.Error(Tag, "Failed to obtain target routing id : " + responseJson.error.code + " message : " + responseJson.error.message);
                         return failure("Failed to obtain target routing id : " + responseJson.error.code + " message : " + responseJson.error.message)
                     }else{
                         logger.Info(Tag, "got response");
                         return success(responseJson)
                     }
                 }).catch((error) => {
                     logger.Error(Tag, 'Got Error '+ error);
                     return failure(error)
                 });
     
             });
         
     }
 
     async getRoomId(targetRoutingid){            
 
      
         return new Promise((success,failure) =>{
 
             var url = EventConfig.EVENT_MANAGER_URL+'/v1/createroom/participants';    
         
 
             var requestpayload = {};           
 
             requestpayload["history"] = true;
             requestpayload["owner"] = true;
             requestpayload["room_identifier"] = true;
             requestpayload["routing_id"] = targetRoutingid;
 
             var userrequestpayload = {};
             userrequestpayload["history"] = true;
             userrequestpayload["owner"] = true;
             userrequestpayload["room_identifier"] = true;
             userrequestpayload["routing_id"] = this.state.routingID;
 
             let requestdata = {'participants': [requestpayload,userrequestpayload]};
             let requestdata1 = JSON.stringify(requestdata);
 
            // logger.Info(Tag, "Get Targt routing id  ",url,JwtToken,requestdata1);
 
             fetch(url, {
                 method: 'PUT',
                 headers: {
                     'Content-Type': 'application/json',
                     'Authorization': 'Bearer ' +this.state.irisToken,                        
                 }, 
                 body: utf8Encode(requestdata1),                  
 
             }).then(response => {
 
                 logger.Info(Tag, "Status code : "+ response.status)
 
                 if(response.headers.get("Content-Type") == 'application/json'){
                     logger.Info(Tag, "Event manager response : Status code ::"+ response.status);
                     return response.json();
                 }else{
                     logger.Error(Tag, "Event Manager : Failed to obtain muc response : ");
                     //   ntmResponse('Failure');
                     return failure("Event Manager : Failed to obtain muc response : ")
                 }
             }).then(responseJson => {
 
                 logger.Info(Tag, "Got response ",responseJson);
                 if(responseJson.error){
                     logger.Debug(Tag, "Failed to obtain mucid : " + responseJson.error.code + " message : " + responseJson.error.message);
                     return failure("Failed to obtain mucid : " + responseJson.error.code + " message : " + responseJson.error.message)
                 }else{
                     logger.Info(Tag, "Got response");
                     return success(responseJson)
                 }
             }).catch((error) => {
                 logger.Error(Tag, 'Got Error '+ error);
                 return failure(error)
             });
 
         });    
     }

    startSession = () =>{
        var self = this;
        if(this.videoSession == null){
            this.videoSession = new RtcSession();
            if(this.props.mode == "Incoming"){               
                // let config =  {'sessionType':'videocall', 'callType':'incoming', 'notificationdata':this.props.notificationPayload,'useBridge':true,streamConfig:this.props.streamConfig};
                // this.videoSession.joinSession(config, this.onSessionCallback)

                this.videoSession.accept(this.state.notificationPayload,this.props.config).then(response => {
                    console.log("Call id ", response)
                }).catch(error => {                
                    if (self.props.onError !== undefined ) {
                        self.props.onError(error);
                    }else {
                        logger.Info(Tag,"onError callback undefined");
                    }                    
                });

            }else{                             
                let config =  {'sessionType':'videocall',  'notifydata': this.getNotificationPayload()
                                  , 'callType':'outgoing', 'roomID' : this.state.roomId,'notificationdata':{},'useBridge':true, 'userData':this.props.config, streamConfig:this.props.streamConfig};
               // this.videoSession.createSession(config,this.onSessionCallback)
                this.videoSession.call( this.state.targetemailId , this.getNotificationPayload(), this.props.config).then(response => {
                    console.log("Call id ", response)
                }).catch(error => {                   
                    if (self.props.onError !== undefined ) {
                        self.props.onError(error);
                    }else {
                        logger.Info(Tag,"onError callback undefined");
                    }                    
                });
              }


             this.videoSession.on('status', (callId, status) => {
               
                if (self.props.onCallStatus !== undefined ) {

                    var json = { "callId": callId, "status": status}; 
                    self.props.onCallStatus(json);
                    if(status == "onSessionEnded"){

                        self.setState({
                            mode: 'Outgoing',
                            onCreate: false,           
                            notificationPayload: {}
                        });            
                        if(self.videoSession != null)                
                            self.videoSession = null;                
                        
                        if (self.props.onEnd !== undefined ) {
                            self.props.onEnd();
                        }else{
                            logger.Info(Tag,"onEnd callback undefined");
                        }            
                    }
                }else {
                    logger.Info(Tag,"onCallStatus callback undefined");
                } 
            });

            this.videoSession.on("participant", (callId, participantInfo) => {
                if (self.props.onParticipantJoined !== undefined ) {
                    var json = { "callId": callId, "participantInfo": participantInfo}; 
                    self.props.onParticipantJoined(json);
                }else{
                    logger.Info(Tag,"onParticipantJoined callback undefined");
                } 
                
              }
            );

            this.videoSession.on('localStream', (callId, stream) => {
               
                self.setState({
                    localTrack : stream,
                    gotLocalStream : true                                 
                })  
                
                if (self.props.onLocalStream !== undefined ) {
                    var json = { "callId": callId, "stream": stream}; 
                    self.props.onLocalStream(json);
                }else{
                    logger.Info(Tag,"onLocalStream callback undefined");
                }
            });

            this.videoSession.on('remoteStream', (callId, stream) => {
               
                self.setState({
                    gotRemoteStream:true,              
                    remoteTrack: stream
                }) 
                
                if (self.props.onRemoteStream !== undefined ) {
                    var json = { "callId": callId, "stream": stream}; 
                    self.props.onRemoteStream(json);
                }else{
                    logger.Info(Tag,"onRemoteStream callback undefined");
                }
            });

            this.videoSession.on('error', (callId, errorInfo) => {
 
                if (self.props.onError !== undefined ) {
                    var json = { "callId": callId, "errorInfo": errorInfo}; 
                    self.props.onError(json);
                }else{
                    logger.Info(Tag,"error callback undefined");
                }        
            });

            
        }      
    }

    getNotificationPayload(){          
         
        // let data =  [{'cname': this.state.userName} , {'cid': this.state.userName} , {'isVideoOnly': true}];      
        // let notificationpayload =  [{'type': 'video'} , {'topic': 'iristest.comcast.com/video'}];      
        // let userdata =  [{'data': data} , {'notification': notificationpayload}];      
        // let jsondata = JSON.stringify(userdata);      
        // return jsondata;


        let jsondata = JSON.stringify({
            "data": {
                "cid": this.state.userName,
                "cname": this.state.userName,
                "isVideoOnly": true
            },
            "notification": {
                "topic": "iristest.comcast.com/video",                
                "type": "video"
            }
        });

        return jsondata;
    }

    //Session callbacks for create and join session
    onSessionCallback = (json) =>{ 
        
        if (this.props.onSdkEvents !== undefined ) {
            this.props.onSdkEvents(json);
        }else {
            logger.log(Tag,"onSdkEvents callback undefined")
        } 

        if(json.event == "onSessionLocalStream"){  
                   
            this.setState({
                localTrack : json.stream,
                gotLocalStream : true,               
                localVideoURL : json.stream.toURL()
            })
        }     
        else if (json.event == "onSessionRemoteStream"){                 
             this.setState({
                gotRemoteStream:true,              
                remoteVideoURL: json.stream.toURL()
          }) 
        }
        else  if(json.event == "onSessionEnded"){            
            this.setState({
                mode: 'Outgoing',
                onCreate: false,           
                notificationPayload: {}
            });            
            if(this.videoSession != null)                
                this.videoSession = null;                
                this.props.onEnd();            
        }           
    }

    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,        
        justifyContent: 'center',
        backgroundColor: '#303030',
    },   
    textinput: {
        fontSize: 16,
        marginTop: 30,
        marginBottom: 10,
        marginLeft:40,    
        marginRight:40, 
        color: '#b2b2b2',
        alignItems: 'center'             
    },
    targetid_style:{
        height: 40, 
        borderColor: 'gray',
        backgroundColor: 'white',
        borderWidth: 1,
        marginBottom: 10,
        marginLeft:40,    
        marginRight:40,       
    },    
    button: {
        height: 50,
        width: 300,
        alignItems: 'center',        
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#319ed9',
        backgroundColor: '#319ed9',
        fontWeight: 'bold',
        fontSize: 15,
        color: '#ffffff',
        marginLeft:40,
        textAlign: 'center',
    }
});

