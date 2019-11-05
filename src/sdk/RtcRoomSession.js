import DataElement from "./RtcDataElement";
import RtcManager from "./RtcManager";
import RtcSignaling from "./RtcSignaling";
import Events from "./RtcEvents";
import EventConfig from "./networking/EnvConfig";
import ParticipantInfo from "./RtcParticipantInfo";
import logger from "./RtcLogger";
import RtcConnection from "./IrisRtcConnection";
import sdkStats from "./RtcSdkStats";
import {encode as utf8Encode} from "utf8";
const timer = require('react-native-timer');
import InCallManager from 'react-native-incall-manager';
import {
    RTCSessionDescription
    } from 'react-native-webrtc';
import { EventEmitter } from "events";
import { ErrorCodes } from "./networking/ErrorCodes";
import { HttpStatus } from "./networking/HttpStatus";
const Tag = "RtcRoomSession";

export class RtcRoomSession extends EventEmitter{
    constructor(){
        super();
        this.config = {};
        this._dataElement = null;
        this.onSessionCallback = null;
        this._logEvent = null;
        this.remoteParticipant = null;
        this._traceId = null;
        this._roomId = null;
        this.localStream = null;
        this._sdkStats = new sdkStats();
    }

    create(){
        var self = this;
        return new Promise((success,failure) =>{
            self._createroomandmuc()
              .then(response => {
                if(self.config.sessionType == "videocall")
                  self.emit('status',self._traceId,"initiating");

                self._dataElement = new DataElement(response);
                self._roomId = self._dataElement.getRoomId();
                self._dataElement.setTraceId(this._traceId);
                self._dataElement.setEventType(self.config.sessionType);
                self._dataElement.setUserData(self.config.notifydata);
                self._dataElement.setCallType(self.config.callType);
                self._logEvent.setDataElement(this._dataElement);
                //rtcSignalingInstance.allocateConferenceFocus(this._dataElement);
                self.config.notificationdata.rtc_server = response.eventdata.rtc_server;
                self.config.notificationdata.childNodeId = response.child_node_id;
                self.config.notificationdata.rootNodeId = response.root_node_id;
                self.config.notificationdata.room_token = response.eventdata.room_token;
                self.config.notificationdata.room_token_expiry_time = response.eventdata.room_token_expiry_time;

                RtcManager.getInstance().initRoom(this,self._roomId,self.config.sessionType,self.config.notificationdata.rtc_server,self._traceId);
                //setup peerConnection
                RtcManager.getInstance().setUpPeerConnection(self._roomId);
                self._peerconnection = RtcManager.getInstance().getPeerConnection(self._roomId);

                if(self._peerconnection){
                    self._peerconnection.addStream(self.localStream);
                }

                this._registerEventListner();
                this._logEvent.onSdkEvent(Events.START_MUC_RESPONSE);
                this._sdkStats.startStatsMonitoring(this._dataElement, null);

                RtcSignaling.getInstance().allocateConferenceFocus(self._dataElement);
                return success();
            }).catch(error => {
                logger.Error(Tag,"Error while creating room", error);
                var errorInfo = {};

                if(error.status == HttpStatus.UNAUTHORIZED){
                    errorInfo.code = ErrorCodes.ERR_JWT_EXPIRE;
                    errorInfo.reason = error.message;
                }
                else{
                    errorInfo.code = error.status;
                    errorInfo.reason = error.message;
                }
                return failure(error);
               
        });
        })    
        
    }

    join(){
        RtcManager.getInstance().initRoom(this,this._roomId,this.config.sessionType,this.config.notificationdata.rtcServer,this.config.notificationdata.trace_id);
    }

    _registerEventListner(){
        logger.Info(Tag, "_registerEventListner:_roomId = "+this._roomId);
        RtcSignaling.getInstance().addEventListner(this._roomId,this._roomEventListner);
        RtcManager.getInstance().registerRtcCoreEventListener(this._roomId,this._sessionEventListener.bind(this))
        this._sdkStats.on(this._roomId,this._roomEventListner);
    }

    _roomEventListner = (event,response) => {
        logger.Info(Tag, "event = "+event)

        var self = this;
        var fromjid = null;

        if(event === Events.OFFER_RECEIVED){
            self._logEvent.onSdkEvent(Events.OFFER_RECEIVED);
            self._sessionInitiateSdp = response.remoteSDP;

            if (self._peerconnection != null) {
                // Check the current state of peerconnection: TBD
                logger.Info(Tag,
                    " onSessionInitiate :: Calling setRemoteDescription with  " + response.sdp +
                    " peerconnection " + self._peerconnection.signalingState);
                var desc = new RTCSessionDescription({ "sdp": response.sdp, "type": "offer" });

                self.to = response.from;

                RtcManager.getInstance().getRtcCore(this._roomId)._setOffer(desc, response,self.to);
                //self.readSsrcs(response);
            }

        }else if(event === Events.SOURCE_ADD_RECEIVED){
            self._logEvent.onSdkEvent(Events.SOURCE_ADD_RECEIVED);
            self._sessionInitiateSdp = response.remoteSDP;

            if (self._peerconnection != null) {
                // Check the current state of peerconnection: TBD
                logger.Info(Tag,
                    " onSourceadd  :: Calling setRemoteDescription with  " + response.sdp +
                    " peerconnection " + self._peerconnection.signalingState);
                var desc = new RTCSessionDescription({ "sdp": response.sdp, "type": "offer" });

                self.to = response.from;

                RtcManager.getInstance().getRtcCore(this._roomId)._setOffer(desc, response,self.to);
                //self.readSsrcs(response);
            }

        }

        else if(event == Events.ALLOCATE_CONFERENCE_SUCCESS){
            this._onRoomInitDone(response);

        }else if(event == Events.PRESENCE_ERROR){
            this._logEvent.onSdkEvent(Events.PRESENCE_ERROR)
        }else if (event == Events.FOCUS_JOINED){
            this._logEvent.onSdkEvent(Events.FOCUS_JOINED);
        }else if (event == Events.XMPP_JOINED){
            this._logEvent.onSdkEvent(Events.XMPP_JOINED);
            var json = { "callId": this._traceId, "event": "onSessionJoined"}
           // this.onSessionCallback(json)
          // self.emit('status',json);

        }else if (event == Events.OCCUPANT_JOINED){
            self = this;
            var isNewParticipant = true;


            fromjid = response.from;
            var participantJid = null;
            let s = fromjid.split("/");
            if (! s.length < 2){
                s.splice(0, 1);
                participantJid = s.join('/');
            }

            Object.keys(self.participants).forEach(function(jid) {
                if (jid == participantJid) {
                    isNewParticipant = false;
                }
            });

            if(isNewParticipant){
                this._logEvent.onSdkEvent(Events.OCCUPANT_JOINED);
                var pariticipantInfo = { "id": fromjid};
               // this.onSessionCallback(json)

               if(self.config.sessionType == "videocall")
                self.emit('participant',this._traceId,pariticipantInfo);
                
                self.participants[participantJid] = { "jid": fromjid };
                if(!self.isParticipantJoined){
                    self.isParticipantJoined =  true;
                    this._startPresenceTimer();
                }
            }

            if (Object.keys(self.participants).length > 0) {
                if (self.participants[participantJid] != null) {
                    self.participants[participantJid].lastPresenceReceived = Date.now();
                }
            }

            if(participantJid.indexOf('outbound') >0 || participantJid.indexOf('inbound') >0){
                self.pstnTargetJid = participantJid;
            }

            this.remoteParticipant = response.from;
        }
        else if (event == Events.OCCUPANT_LEFT){
            this._logEvent.onSdkEvent(Events.OCCUPANT_LEFT);

            fromjid = response.from;
            var participantJid = null;
            let s = fromjid.split("/");
            if (! s.length < 2){
                s.splice(0, 1);
                participantJid = s.join('/');
            }

            Object.keys(self.participants).forEach(function(jid) {
                if (jid == participantJid) {
                    delete self.participants[jid];
                }
            });

            if((this._hasInboundOutboundParitcipants() && this._isRemoteSDKParticipant(participantJid)) || (self.participants && Object.keys(self.participants).length == 0)){

                RtcConnection.removePresenceHandler();
                InCallManager.setSpeakerphoneOn(false);

                var json = { "callId": this._traceId, "event": "onSessionParticipantLeft"}
               // this.onSessionCallback(json)
                self.closeSession();
            }


            // let param = {}
            // param.traceId = this._traceId;
            // param.event = "onSessionParticipantLeft";
            // self.onSessionCallback(param);

        }else if (event == Events.XMPP_LEFT){
            this._logEvent.onSdkEvent(Events.XMPP_LEFT);
        }
        else if (event === "onAudioMute") {
            logger.Info(Tag, "onAudioMute " + " mute " + response.mute);
            /*if (self.localStream) {
                if ((response && !self.isAudioMuted) || (!response.mute && self.isAudioMuted)) {
                   // self.audioMuteToggle(self.config.roomId);
                }
            }*/

        }
        else if (event === "onPSTNHold") {

            logger.Info(Tag, "onPSTNHold " + " from : " + response.from + " PSTN Hold : " + response.hold);
            self._logEvent.onSdkEvent(Events.SIP_HOLD);
            self._onRemoteHoldStatus(response.hold);
            /*if (self.localStream) {
                if (response.hold) {
                    self.isPSTNOnHold = true;
                    self._peerconnection.removeStream(self.localStream);
                } else {
                    self.isPSTNOnHold = false;
                    self._peerconnection.addStream(self.localStream);
                }
            }*/

        }
        else if(event === Events.SIP_INITIALIZING){
           // var json = { "callId": this._traceId, "status": "initiating"}                
           // self.emit('status',json);
            self.emit('status',this._traceId,"initiating");
            this._logEvent.onSdkEvent(Events.SIP_INITIALIZING);
        }
        else if(event === Events.SIP_CONNECTING){
            //var json = { "callId": this._traceId, "status": "ringing"}                
           // self.emit('status',json);
            self.emit('status',this._traceId,"ringing");
            this._logEvent.onSdkEvent(Events.SIP_CONNECTING);
        }
        else if(event === Events.SIP_CONNECTED){
          //  var json = { "callId": this._traceId, "status": "connected"}                
          //  self.emit('status',json);
            self.emit('status',this._traceId,"connected");
            this._logEvent.onSdkEvent(Events.SIP_CONNECTED);
        }
        else if(event === Events.SIP_DISCONNECTED){
           // var json = { "callId": this._traceId, "status": "disconnected"}                
           // self.emit('status',json);
            self.emit('status',this._traceId,"disconnected");
            this._logEvent.onSdkEvent(Events.SIP_DISCONNECTED);
        }
        else if(event === Events.TIMESERIES){
            this._logEvent.onSdkEvent(Events.TIMESERIES, response);
        }
    }

    _createroomandmuc(){
        var self = this;
        return new Promise((success,failure) =>{
            if(self.config.sessionType == "videocall"){
                
                self._getTargetRoutingid(self.config.targetEmailId).then(response => {
                              
                        self._getRoomId(response.routing_id) .then(response => {
                            
                            self._roomId = response.room_id; 
                            self._createRoom().then(response =>{
                                    return success(response)
                                }).catch(error => {
                                 return failure(error)
                                });
                              //  this.setState({roomId:response.room_id})                    
                              //  this.startSession();                        
                            }).catch(error => {
                                logger.Error(Tag, " Got error", error);
                            });
                    
                    }).catch(error => {
                        logger.Error(Tag,"Got error", error);
                    });

            }else{
               self._createRoom().then(response =>{
                   return success(response)
               }).catch(error => {
                return failure(error)
               });
            }
        })
        
    }

    _createRoom(){

        var self = this;
        this._logEvent.onSdkEvent(Events.START_MUC_REQUEST);
        
            // var JwtToken = 'Bearer '+ await AsyncStorage.getItem('irisToken');
            // var routing_id = await AsyncStorage.getItem('routingId');          
        var JwtToken = 'Bearer '+ self.config.userData.irisToken;
        var routing_id = self.config.userData.routingId;

        return new Promise((success,failure) =>{
            var url = null;
            var responseStatus = {status: 'Failure'}
            if(self.config.sessionType == "pstncall"){
                url = EventConfig.EVENT_MANAGER_URL+'/v1.1/pstn/startmuc/federation/pstn';
            }else{
                url = EventConfig.EVENT_MANAGER_URL+'/v1/xmpp/startmuc/room/'+self._roomId;
            }
            
            var requestpayload = {};

            var timestamp = Math.floor(Date.now() / 1000);

            requestpayload["time_posted"] = timestamp;
            requestpayload["event_type"] = self.config.sessionType;
            requestpayload["userdata"] = self.config.notifydata ;


            if(self.config.sessionType == "pstncall"){
                requestpayload["from"] = ParticipantInfo.getSharedInstance().getSourceNumber();
                requestpayload["to"] = ParticipantInfo.getSharedInstance().getTargetNumber();
                requestpayload["inbound"] = false ;
            }else{
                requestpayload["from"] = routing_id;
            }


            let requestdata = JSON.stringify(requestpayload);

            logger.Info(Tag, "Create room request----",url,requestdata);

            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': JwtToken,
                    'Trace-Id': self.config._traceId,
                },
                body: utf8Encode(requestdata),

            }).then(response => {

                logger.Info(Tag, "Status code : "+ response.status)
                responseStatus.status = response.status;

                if(response.headers.get("Content-Type") == 'application/json'){
                    logger.Info(Tag, "Event manager response : Status code ::"+ response.status);
                    return response.json();
                }else{
                    logger.Info(Tag, "Event Manager : Failed to obtain muc response : ");
                    responseStatus.message = "Event Manager : Failed to obtain muc response due to http error code "+responseStatus.status;
                    responseStatus.status = ErrorCodes.ERR_EVENT_MANAGER;
                    //   ntmResponse('Failure');
                    return failure(responseStatus)
                }
            }).then(responseJson => {

                logger.Info(Tag, "got response ",responseJson);
                if(responseJson.error){
                    logger.Info(Tag, "Failed to obtain mucid : " + responseJson.error.code + " message : " + responseJson.error.message);
                    responseStatus.message = "Failed to obtain mucid :"+responseJson.error.message;
                    return failure(responseStatus);
                }else{
                    return success(responseJson)
                }
            }).catch((error) => {
                logger.Info(Tag, 'Got Error '+ error);
                return failure(ErrorCodes.ERR_EVENT_MANAGER,error)
            });

        });
    }

    _getTargetRoutingid(targetMailId){ 
        var self = this;             
        return new Promise((success,failure) =>{       
            var url = EventConfig.IDENTITY_MANAGER_URL+'v1/routingid/appdomain/iristest.comcast.com/publicid/'+targetMailId;  
            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + self.config.userData.irisToken,                        
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
                logger.Error(Tag, ' Got Error '+ error);
                return failure(error)
            });
        });
    }

    _getRoomId(targetRoutingid){            
        var self = this;
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
            userrequestpayload["routing_id"] = self.config.userData.routingId;

            let requestdata = {'participants': [requestpayload,userrequestpayload]};
            let requestdata1 = JSON.stringify(requestdata);

        // logger.Info(Tag, "Get Targt routing id  ",url,JwtToken,requestdata1);

            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' +self.config.userData.irisToken,                        
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

    _createConference = () =>{
        RtcConnection.addPresenceHandler();
        RtcConnection.addChatMessageHandler();
        this._dataElement = new DataElement({eventdata : this.config.notificationdata});
        this._dataElement.setTraceId(this.config.notificationdata.trace_id);
        this._dataElement.setCallType(this.config.callType);
        this._roomId = this._dataElement.getRoomId();
        this._traceId = this.config.notificationdata.trace_id;
        this._logEvent.setDataElement(this._dataElement);
        //this._rtcXMPP = new RtcXMPP(this._dataElement);
        this._logEvent.startEventBufferTimer();
        this._registerEventListner();
        this._logEvent.onSdkEvent(Events.JOIN_SESSION);
        RtcSignaling.getInstance().allocateConferenceFocus(this._dataElement);
        this._sdkStats.startStatsMonitoring(this._dataElement, null);
    }

    _onRoomInitDone = (response) => {
        this.focusJid = response.focusJid;
        //Join Room
        RtcManager.getInstance().joinRoom(this._roomId,this._dataElement);
        RtcSignaling.getInstance().sendPeriodicAlivePresence(this._dataElement);

        if(this.config.sessionType == 'pstncall' && this.config.callType == 'outgoing'){
            RtcSignaling.getInstance().sendDialIq(this._dataElement);
        }
    }

    _hasInboundOutboundParitcipants(){

        var hasInboundParticipant = false;
        var hasOutboundParticipant = false;

        Object.keys(this.participants).forEach(function(jid) {
            if(jid.indexOf('outbound') >0){
                hasOutboundParticipant = true;;
            }else if(jid.indexOf('inbound') >0){
                hasInboundParticipant = true;
            }
        });


        if(hasInboundParticipant && hasOutboundParticipant)
            return true;

        return false;
    }

    _isRemoteSDKParticipant(participantJid){
        if(participantJid.indexOf('outbound') >0 || participantJid.indexOf('inbound') >0){
            return false;
        }
        return true;
    }

    _startPresenceTimer(){
        // Start a timer to send periodic presence at interval
        timer.setInterval(this,"presenceMonitorTimer",() => {
            this._presenceMonitor();
        }, 10000);
    }

    _presenceMonitor(){
        var self = this;
        var currTime = Date.now();

        Object.keys(self.participants).forEach(function(jid) {
            if (!jid.includes('inbound') && !jid.includes('outbound')){

                var presenceReceivedTimeDiff = (currTime - self.participants[jid].lastPresenceReceived) / 1000;
                if (presenceReceivedTimeDiff > 30) {
                    logger.Info(Tag, " pariticipant not responding ");
                }
            }
        });
    }

    _sessionEventListener(json){

        if(json.event == "onSessionConnected" && this.config.sessionType == "videocall"){
            this.emit('status',this._traceId,"connected");
        }else if(json.event == "onSessionRemoteStream"){
            this.emit('remoteStream',this._traceId,json.stream);
           // this.emit('remoteStream',json);
        }
        
       // this.onSessionCallback(json);        
    }

}
