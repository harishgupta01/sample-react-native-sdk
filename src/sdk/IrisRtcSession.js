import React, { Component } from 'react';
import {encode as utf8Encode} from "utf8";
import sdkStats from './RtcSdkStats';
import ParticipantInfo from './RtcParticipantInfo.js';
import PhoneUtils from'./utils/PhoneUtils';
import DataElement from './RtcDataElement';
import RtcConnection from './IrisRtcConnection';
import InCallManager from 'react-native-incall-manager';
import RtcLogEvents from './RtcLogEvents';
const uuidv4 = require('uuid/v4');
const timer = require('react-native-timer');
var RestRtcRestHelper = require('./networking/RtcRestHelper.js');
var rtcConfig = require('./RtcConfig.js');
var IrisRtcStream = require('./IrisRtcStream.js');
import logger from './RtcLogger.js';
 
import RtcManager from './RtcManager';
import RtcSignaling from './RtcSignaling';

import Events from "./RtcEvents";
import {RtcRoomSession} from "./RtcRoomSession";
import { ErrorCodes } from './networking/ErrorCodes';

var connectionEmitter;
const Tag = "IrisRtcSession";

//require('./modules/strophejs-plugin-muc/lib/strophe.muc');

// IrisRtcSession.js : Javascript code for managing calls/sessions for audio, video and PSTN
export default  class IrisRtcSession extends RtcRoomSession{
 
    constructor(){
        super();
        this._sessionInitiateSdp = null;
        this._peerconnection = null;
        this.candidates = [];
        this.config.notificationdata = {};       
        this.localSdp = null;
        this.focusJid = null;
        this.localStream = null;
        this.participants = {};
        this.pstnTargetJid = null;
        this.participantRoutingid = null;
        this.isParticipantJoined = false;
        this.isPSTNOnHold = false;
        this.isRemotePSTNOnHold = false;
        this.isAudioMuted = false;
        this.isVideoMuted = false;
        connectionEmitter = RtcConnection.getConnectionEmitter();
    }

    //Public api's
    dial(sourceTN, targetTN, notificationData,config){
          
        var self = this;       
        this.config.sessionType = "pstncall";
        this.config.callType = "outgoing";
        this.config.Sourcenum = sourceTN ;
        this.config.Targetnum = targetTN;
        this.config.notifydata = notificationData;
        this.config.userData = config;
        self._traceId = uuidv4();

        return new Promise((success,failure) =>{
            self._validateConfigInputParam().then(response => {               
                 self._checkSocketConnection().then(response =>{
                     self._createStreamandMuc().then(response =>{
                        return success(self._traceId)
                     })
                     .catch(error => {
                        logger.Info(Tag, error);
                        var error = {"code": error.code,"reason":error.reason}; 
                        return failure(error)
                     });
                 }) .catch(error => {
                    logger.Info(Tag, error);
                    var error = {"code": error.code,"reason":error.reason};
                    return failure(error)
                 });                         
            }).catch(error => {
                logger.Info(Tag, error);
                var error = {"code": ErrorCodes.ERR_INCORRECT_PARAMS,"reason":error};               
                return failure(error)
            });    

       });      
       
    }

    accept(notificationData,config){                
        var self = this;  
        this.config.sessionType = notificationData.sessionType;
        this.config.callType = "incoming";
        this.config.notificationdata = notificationData;
        this.config.userData = config;
        this._traceId = notificationData.trace_id;

        return new Promise((success,failure) =>{
             if(self.config.notificationdata != null){
                 self._checkSocketConnection().then(response =>{
                    self._joinMuc().then(response =>{
                        return success(self._traceId);
                    }) .catch(error => {
                        logger.Info(Tag, error);      
                        return failure(error)
                    });  
                }) .catch(error => {
                    logger.Info(Tag, error);           
                    var error = {"code": ErrorCodes.ERR_INCORRECT_PARAMS,"reason":error};               
                    return failure(error)
                });
             }else{
                var error = {"code": ErrorCodes.ERR_INCORRECT_PARAMS,"reason":"notificationData is null"};
                return failure(error);
             }
       
        })

        //this.onSessionCallback = onSession.bind(this);
        // this.registerConnectionEvents();       
        // if(ParticipantInfo.sharedInstance.getRtcConnectionState() !=  ParticipantInfo.state.CONNECTED){          
        //     self._createSocketConnection();           
        // }else{           
        //     self._joinMuc();
        // } 
    }

    call(targetEmailId, notificationData, config){
        var self = this;       
        this.config.sessionType = "videocall";
        this.config.callType = "outgoing";
        this.config.targetEmailId = targetEmailId;      
        this.config.notifydata = notificationData;
        this.config.userData = config;
        
        self._traceId = uuidv4();
        return new Promise((success,failure) =>{
            self._validateConfigInputParam().then(response => {       
                 self._checkSocketConnection().then(response =>{
                     self._createStreamandMuc().then(response =>{   
                        return success(self._traceId)
                     })
                     .catch(error => {
                        logger.Info(Tag, error);
                        var error = {"code": error.code,"reason":error.reason}; 
                        return failure(error)
                     });
                 }) .catch(error => {
                    logger.Info(Tag, error);
                    var error = {"code": error.code,"reason":error.reason};
                    return failure(error)
                 });                         
            }).catch(error => {
                logger.Info(Tag, error);
                var error = {"code": ErrorCodes.ERR_INCORRECT_PARAMS,"reason":error};               
                return failure(error)
            });    
       }); 

    }


    createSession(configData,onSession){
        var self = this;
        this.config = configData;
    //    this.onSessionCallback = onSession.bind(this);

        this._traceId = uuidv4(); 
        this._logEvent = new RtcLogEvents(this._traceId, configData); 

        this.registerConnectionEvents();
       
        if(ParticipantInfo.sharedInstance.getRtcConnectionState() !=  ParticipantInfo.state.CONNECTED){          
            self._createSocketConnection();           
        }else{
            self._createStreamandMuc();
        }            
    }

    joinSession(configData, onSession){

        var self = this;
        this.config = configData;
    //    this.onSessionCallback = onSession.bind(this);
        this._logEvent = new RtcLogEvents(configData.notificationdata.trace_id, configData);
        this._roomId = configData.notificationdata.room_id;

        this.registerConnectionEvents();
       
        if(ParticipantInfo.sharedInstance.getRtcConnectionState() !=  ParticipantInfo.state.CONNECTED){          
            self._createSocketConnection();           
        }else{
           
            self._joinMuc();
        }   

    }

    registerConnectionEvents(){

        return new Promise((success,failure) =>{
            connectionEmitter.on('connectionChange', function (data) {
          
                if(ParticipantInfo.sharedInstance.getRtcConnectionState() ==  ParticipantInfo.state.CONNECTED){                                
                     return success();             
                }else if(ParticipantInfo.sharedInstance.getRtcConnectionState() ==  ParticipantInfo.state.CONNFAIL){
                     return failure();
                }               
            });
        })
          
    }

    _checkSocketConnection(){
        var self = this; 
        return new Promise((success,failure) =>{
            if(ParticipantInfo.sharedInstance.getRtcConnectionState() !=  ParticipantInfo.state.CONNECTED){
                if(ParticipantInfo.sharedInstance.getRtcConnectionState() !==  ParticipantInfo.state.CONNECTING){
                    if(this.config.userData.irisToken != null && this.config.userData.routingId != null){
                        RtcConnection.connect(this.config.userData.irisToken,this.config.userData.routingId);
                    } else{
                        var error = {"code": ErrorCodes.ERR_INCORRECT_PARAMS,"reason":"Invalid parameters for RTC Connection"}; 
                        return failure(error)
                    }          
                }          
                
                self.registerConnectionEvents().then(response => {
                    if(timer != null){               
                        timer.clearInterval(this,"socketConnectionTimer");               
                    }
                    return success();
                  }).catch(error => {
                      logger.Info(Tag, "Socket not connected");
                      if(timer != null){               
                        timer.clearInterval(this,"socketConnectionTimer");               
                      }
                      var error = {"code": ErrorCodes.ERR_WEBSOCKET_DISCONNECT,"reason":"Socket not connected"};
                      return failure(error)
                  });

                
                timer.setInterval(this,"socketConnectionTimer",() => {
                        this._checkConnectionState().then(response => {
                          return success();
                        }).catch(error => {
                            logger.Info(Tag, "Socket not connected");
                            var error = {"code": error.code,"reason":error.reason};
                            return failure(error);
                          });
                }, 10000);
            }else{
                return success();
            }            
        }) 
    }

    _checkConnectionState(){   
       
        return new Promise((success,failure) =>{
            if(ParticipantInfo.sharedInstance.getRtcConnectionState() !=  ParticipantInfo.state.CONNECTED){            
                if(timer != null){               
                    timer.clearInterval(this,"socketConnectionTimer");               
                } 
                logger.Info(Tag, "Socket not connected");
                RtcConnection.disconnect();
                var error = {"code": ErrorCodes.ERR_WEBSOCKET_DISCONNECT,"reason":" Socket not connected"};
                return failure(error);
            }else{
                return success();
            }
        })

        
    }

    _createStreamandMuc(){
        //rtcManagerInstance.setConfig(this.config,this._logEvent);       
        var self = this;
        this._logEvent = new RtcLogEvents(this._traceId, this.config);
        RtcManager.getInstance().setConfig(this.config,this._logEvent);

        return new Promise((success,failure) =>{
            this._createStream().then(function () { 
                
                // if(self.config.sessionType == "videocall"){
                //     var json = { "callId": self._traceId, "stream":self.localStream }
                //     self.emit('localStream',json);    
                //  }         
                self.create().then(function () {
                   self._logEvent.startEventBufferTimer();
                    RtcConnection.addPresenceHandler();
                    RtcConnection.addChatMessageHandler();
                    self._logEvent.onSdkEvent(Events.CREATE_SESSION);
                    return success();
                }).catch(error => {
                    console.log(error);
                    return failure(error)
                 });                
            }).catch(error => {
                console.log(error);
                return failure(error)
            });
        })    
        /*//setup peerConnection
        rtcManagerInstance.setUpPeerConnection(this._roomId);
        self._peerconnection = rtcManagerInstance.getPeerConnection(this._roomId);*/

         //validate input config parameters
       //  this._validateConfigInputParam();

        //create local stream
        
    }

    _joinMuc(){
        var self = this;
        this._logEvent = new RtcLogEvents(this.config.notificationdata.trace_id, this.config);
        this._roomId = this.config.notificationdata.room_id;
        RtcManager.getInstance().setConfig(this.config,this._logEvent);
        if(self.config.sessionType == "videocall")
            self.emit('status',this._traceId,"initiating");
        return new Promise((success,failure) =>{ 
            var irisStream = new IrisRtcStream();
            var streamConfig = {
                 streamType : this.config.sessionType,
                 streamConfig:  this.config.streamConfig
            }

           super.join();           
           //self.createPeerconnection();
           RtcManager.getInstance().setUpPeerConnection(this._roomId);
           self._peerconnection = RtcManager.getInstance().getPeerConnection(this._roomId);

           irisStream.createStream(streamConfig).then(function(stream) {
               self.localStream = stream;
               self._createConference();
               if(self._peerconnection){
                   self._peerconnection.addStream(stream);
               }
               if(self.config.sessionType == "videocall"){               
                 //  var json = { "callId": self.config.notificationdata.trace_id, "stream":stream }
                   self.emit('localStream',self.config.notificationdata.trace_id,stream);            
               }
               return success();
            }).catch(error => {
                console.log(error);
                var errorInfo = {};
                errorInfo.code = ErrorCodes.ERR_STREAM;
                errorInfo.reason = "Stream create error";
                return failure(errorInfo)
            });
        })       
    }

    //Close the active session
    closeSession = () =>{
        logger.Info(Tag, "Close session");
        InCallManager.setSpeakerphoneOn(false);
       // var json = { "callId": this._traceId, "status": "onSessionEnded"}
        this.emit('status',this._traceId,"onSessionEnded");
       // this.emit('status',json);
       // this.onSessionCallback(json);
        this._logEvent.onSdkEvent(Events.SESSION_END)
        if(this._dataElement != null)
            RtcSignaling.getInstance().sendHangupIQ(this.pstnTargetJid,this._dataElement);
        RtcManager.getInstance().disposePeerConnection(this._roomId);
        RtcSignaling.getInstance().removeEventListner(this._roomId,this._roomEventListner);
        if(this._dataElement != null)
            RtcManager.getInstance().leaveRoom(this._roomId,this._dataElement);
        RtcSignaling.getInstance().stopPeriodicAlivePresence();
        this._sdkStats.stopStatsMonitoring();

        timer.clearInterval(this,"presenceMonitorTimer");
        timer.clearInterval(this,"socketConnectionTimer");
        //RtcConnection.removePresenceHandler();
    }

    flipCamera = () =>{
        this.localStream.getVideoTracks().forEach((track) => {
            track._switchCamera();
        })
    }

    reject = (notificationpayload) => {
        let type = JSON.parse(notificationpayload.user_data).notification.type;

        this._dataElement = new DataElement({eventdata : notificationpayload});
        this._dataElement.setEventType(type+"call")

        //this._rtcXMPP = new RtcXMPP(this._dataElement);
        RtcSignaling.getInstance().sendRejectIQ(this._dataElement)

        //this._rtcXMPP = null;
        this._dataElement = null;
    }

    audioMuteToggle(){

        var self = this;
        if (self.localStream && self.localStream.getAudioTracks().length >= 1 && self.localStream.getAudioTracks()[0]) {
            this.isAudioMuted = this.localStream.getAudioTracks()[0].enabled;
            logger.Info(Tag, "AudioMuteToggle :: Audio Mute : " + this.isAudioMuted);

            this.config.audiomuted = this.isAudioMuted.toString();

            this.config.videomuted = this.isVideoMuted.toString();

            if (this.isAudioMuted) {
                this.localStream.getAudioTracks()[0].enabled = false;
            } else {
                this.localStream.getAudioTracks()[0].enabled = true;
            }

            // if (this._rtcXMPP) {
            RtcSignaling.getInstance().stopPeriodicAlivePresence();
            RtcSignaling.getInstance().sendAudioMute(this.config,this._roomId,this._dataElement);
            RtcSignaling.getInstance().sendPeriodicAlivePresence(this._dataElement);
            /*} else {
                console.log("IrisRtcSession :: audioMuteToggle: Check if session is created");
            }*/

        } else {
            logger.Debug(Tag, "AudioMuteToggle: No audio to mute");
        }
    }

    videoMuteToggle(){

        var self = this;
        if (self.localStream && self.localStream.getVideoTracks().length >= 1 && self.localStream.getVideoTracks()[0]) {
            this.isVideoMuted = this.localStream.getVideoTracks()[0].enabled;
            logger.Info(Tag, "VideoMuteToggle :: Video Mute : " + this.isVideoMuted);

            this.config.audiomuted = this.isAudioMuted.toString();

            this.config.videomuted = this.isVideoMuted.toString();

            if (this.isVideoMuted) {
                this.localStream.getVideoTracks()[0].enabled = false;
            } else {
                this.localStream.getVideoTracks()[0].enabled = true;
            }

            //if (this._rtcXMPP) {
            RtcSignaling.getInstance().stopPeriodicAlivePresence();
            RtcSignaling.getInstance().sendAudioMute(this.config,this._roomId,this._dataElement);
            RtcSignaling.getInstance().sendPeriodicAlivePresence(this._dataElement);
            /*} else {
                console.log("IrisRtcSession :: audioMuteToggle: Check if session is created");
            }*/

        } else {
            logger.Debug(Tag,"AudioMuteToggle: No video to mute");
        }
    }

    pstnHold(){

        var participantJid = "";

        this.isPSTNOnHold = true;

        if (this._isSDKToSDKPSTN()) {

            // Send a private iq to mute other participant
            // Remove stream from current session

            this._holdCall();

            Object.keys(this.participants).forEach(function(jid) {

                if (!jid.includes('inbound') && !jid.includes('outbound'))
                    participantJid = jid;

            });

            RtcSignaling.getInstance().sendMessageHold(this.config, participantJid, true,this._roomId,this._dataElement);


        } else {
            RtcSignaling.getInstance().sendHold(this.config, this.remoteParticipant,this._roomId, this._dataElement);
        }

    }

    pstnUnHold(){

        var participantJid = "";

        this.isPSTNOnHold = false;

        if (this._isSDKToSDKPSTN()) {

            // Send a private iq to unmute other participant
            // Add stream from current session
            if(!this.isRemotePSTNOnHold) {
                this._unHoldCall();
            }

            Object.keys(this.participants).forEach(function(jid) {

                if (!jid.includes('inbound') && !jid.includes('outbound'))
                    participantJid = jid;

            });

            RtcSignaling.getInstance().sendMessageHold(this.config, participantJid, false,this._roomId,this._dataElement);

        } else {
            RtcSignaling.getInstance().sendUnHold(this.config,this.remoteParticipant, this._roomId,this._dataElement);
        }


    }


    // Private api's

    _createStream(){

        var self = this;

        return new Promise((success,failure) =>{
            var irisStream = new IrisRtcStream();

            var streamConfig = {
                streamType : self.config.sessionType,
                streamConfig:  self.config.streamConfig               
            };

            irisStream.createStream(streamConfig).then(function(stream) {
                self.localStream = stream;
                if(self.config.sessionType == "videocall"){
                  // var json = { "callId": self._traceId, "stream":stream }
                   self.emit('localStream',self._traceId,stream);    
                }
                return success();
            }).catch(error => {
                var errorInfo = {};
                errorInfo.code = ErrorCodes.ERR_STREAM;
                errorInfo.reason = "Stream create error";
                return failure(errorInfo);
            });
        });
    }

    _validateConfigInputParam(){

        return new Promise((success,failure) =>{

            if(this.config.sessionType == "pstncall"){
                if(this.config.Targetnum == null){
                    logger.Error(Tag, "Target num is empty");
                    var errormsg = "Target num is empty";
                    return failure(errormsg);
                }else if(this.config.Sourcenum == null){
                    logger.Error(Tag, "source num is empty");
                    var errormsg = "Source num is empty";
                    return failure(errormsg);
                }                
               
                var regex = /^-?\d+\.?\d*$/;
   
                if(regex.test(this.config.Targetnum) && regex.test(this.config.Sourcenum)){
                    logger.Error(Tag, "Invalid parameters");                    
                    var errormsg = "Invalid parameters";
                    return failure(errormsg);
                }else{
                    try {
                        this.config.Targetnum = PhoneUtils.getMUCRequestNumber(this.config.Targetnum);
                    } catch (err) {
                        logger.Error(Tag, "Invalid target num");
                        var errormsg = "Invalid target num";
                        return failure(errormsg);                       
                    }
   
                    ParticipantInfo.getSharedInstance().setTargetNumber(this.config.Targetnum)
                    ParticipantInfo.getSharedInstance().setSourceNumber(this.config.Sourcenum)
                    return success();
                }
             }else{
                 if(this.config.targetEmailId == null){
                    logger.Error(Tag, "target mail id  is empty");
                    var errormsg = "target mail id  is empty";
                    return failure(errormsg);
                 }else{
                    return success();
                 }
             }
            
            })       
     }

    _onRemoteHoldStatus(hold){
        var self = this;

        if(hold) {
            self._holdCall();
            self.isRemotePSTNOnHold = true;
            this._logEvent.onSdkEvent(Events.SIP_HOLD);
        }
        else {
            self.isRemotePSTNOnHold = false;
            if(!self.isPSTNOnHold) {
                self._unHoldCall();
            }
        }
    }

    _holdCall(){
        var self = this;
        if (self.localStream){
            self._peerconnection.removeStream(self.localStream);
        }

    }

    _unHoldCall(){
        var self = this;
        if (self.localStream){
            self._peerconnection.addStream(self.localStream);
        }

    }

    _isSDKToSDKPSTN(){

        if (this.config.sessionType == "pstncall") {

            var checkParticipant = "";

            Object.keys(this.participants).forEach(function(jid) {

                if (jid.includes('inbound') || jid.includes('outbound')) {
                    checkParticipant = true;
                }

            });

            if (checkParticipant && Object.keys(this.participants).length > 2) {
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }
    }

}
