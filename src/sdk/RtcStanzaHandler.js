
import RtcConnection from './IrisRtcConnection';
import SDP from './utils/SDP';
import Events from './RtcEvents.js';
const EventEmitter = require('events');
import logger from './RtcLogger.js';

const Tag = "RtcStanzaHandler";

export default class StanzaHandler extends EventEmitter{

    constructor(){
        super();
        this.onFocusJoined = false;
        this.onXmppJoined = false;
        this.onRemoteParticipant = false;
        this.participantsList = {};
        this.remoteSDP = null;
    }
    
    addListener(roomId, eventListner){
        this.on(roomId,eventListner);
    }

     onIq(msg) {
        // logger.Info(Tag, "got iq message ---",msg);

        if (msg.getElementsByTagName("conference").length > 0) {
            this._onConference(msg);
        }

         if(msg.getElementsByTagName("jingle").length > 0){
             this.onJingle(msg);
         }
         else if(msg.getElementsByTagNameNS("jabber:iq:private","query")){
             this.onPrivateIQ(msg);
         }

        return true;
    }

     onPresence(stanza){
        var myJid = RtcConnection.getConnectionObject().jid;
        var fromJid = stanza.getAttribute('from');
        var roomId = stanza.getAttribute('from').split('@')[0];      

         // Check if there is an error in the presence
        var type = stanza.getAttribute('type');  
        let status = stanza.getElementsByTagName('status');
        if (type == "error") {          
           
            logger.Error(Tag, " Received presence error");
            
            var error = stanza.getElementsByTagName('error');
            if(error){
                var errormessage = error[0].getAttribute('type');
            }
            // Create the presence config
            var presenceConfig = {               
                "roomId": roomId,
                "type": "error",
                "error": errormessage              
            };

            this.emit(roomId, Events.PRESENCE_ERROR, presenceConfig);           
        }  
        else if (type == "unavailable") {                        
            // Create the presence config
            var presenceConfig = {                        
               "roomId": roomId,              
               "from": fromJid                  
            };
            if(fromJid.indexOf(myJid) > 0){
                this.emit(roomId, Events.XMPP_LEFT, presenceConfig);
            }else{
                this.emit(roomId, Events.OCCUPANT_LEFT, presenceConfig);
            }    
            
            this.onXmppJoined = false;
            this.onFocusJoined = false;
            this.onRemoteParticipant = false;

           // RtcConnection.removePresenceHandler();

        }else if(fromJid.indexOf('f0cus') > 0) {           
            var dataElement = stanza.getElementsByTagName('data');          
            // Create the presence config
             var presenceConfig = {
                "jid": fromJid,                         
                "roomId": roomId,                                       
                "dataElement": dataElement
            };           
           
            // send the presence message
            if(!this.onFocusJoined)
            this.emit(roomId, Events.FOCUS_JOINED, presenceConfig);

            this.onFocusJoined = true;
        }else if(fromJid.indexOf(myJid) > 0 ) {           
           
            var dataElement = stanza.getElementsByTagName('data');              
      
            // Create the presence config
             var presenceConfig = {
                "jid": fromJid,                          
                "roomId": roomId,                                      
                "dataElement": dataElement
            };
           
            // send the presence message
            if(!this.onXmppJoined){
                this.emit(roomId, Events.XMPP_JOINED, presenceConfig);   
                this.onXmppJoined = true; 
            }             
                              
        } else{    
           var presenceConfig = {                        
                "roomId": roomId,
                "from": fromJid,                 
           };  
           
           if(status.length > 0){  
            this.onSipStatus(roomId,status.toString());
           }

           this.emit(roomId, Events.OCCUPANT_JOINED, presenceConfig);                 
        } 
               
      return true;
    }

     onMessage(stanza){
        logger.Info(Tag, "onMessage = ", stanza.toString());
        this._onChatMessage(stanza)
        return true;
     }


    _onChatMessage(stanza){
        logger.Info(Tag, "RtcXmpp ::_onChatMessage");
        if (stanza.getAttribute('type')) {
            if (stanza.getAttribute('type') == "chat") {
                this._onChat(stanza);
            }
        }
    }


    _onChat(stanza) {

        logger.Info(Tag, "RtcXmpp :: _onChat");

        var self = this;
        var from = "";
        var roomId = "";
        if (stanza.getAttribute('from').includes('conference')) {
            from = stanza.getAttribute('from').substring(stanza.getAttribute('from').indexOf('/') + 1);
            roomId = stanza.getAttribute('from').split('@')[0];
        } else {
            from = stanza.getAttribute('from');
        }
        // var to = stanza.attrs.to.split('/')[0];
        var to = stanza.getAttribute('to');
        var id = stanza.getAttribute('id');
        var data = stanza.getElementsByTagName('data')[0];
        roomId = data.getAttribute('roomid');
        var body = stanza.getElementsByTagName('body')[0];
        if (body) {
            var message = body.firstChild.data;
            logger.Info(Tag, "RtcXmpp :: _onChat : message: " + message);
            if (message) {
                //Handle mute/unmute of the particpant
                if (id && id == "mute") {
                   if (message == 'audioMute') {
                        self.emit(roomId, 'onAudioMute', { "mute": true, "roomId": roomId });
                    } else if (message == 'audioUnmute') {
                        self.emit(roomId, 'onAudioMute', { "mute": false, "roomId": roomId });
                    }
                } else if (id && id == "pstnHold") {

                    if (message == "hold")
                        self.emit(roomId, 'onPSTNHold', { 'hold': true, from: from, roomId: roomId });
                    else if (message == "unhold")
                        self.emit(roomId, 'onPSTNHold', { 'hold': false, from: from, roomId: roomId });


                } else {
                    // For handling chat messages
                }
            }
        }
    }

    _onConference(stanza){       
      
         var conferenceIq = stanza.getElementsByTagName('conference');       
        var focusJid = conferenceIq[0].getAttribute('focusjid');

        logger.Info(Tag, "focus jid ",focusJid);

        // Get focus jid
         if (focusJid) {
            var roomId = conferenceIq[0].getAttribute('room').split('@')[0];
            logger.Info(Tag, "room id "+roomId);
            var data = { "focusJid": focusJid, "roomId": roomId };           
            this.emit(roomId, Events.ALLOCATE_CONFERENCE_SUCCESS, data);
        }
    }

    onJingle(stanza){

        var from = stanza.getAttribute('from');
        var to = stanza.getAttribute('to');
        var roomId = stanza.getAttribute('from').split('@')[0];
        logger.Info(Tag, "Received offer roomId= " + roomId);
        // this.emit(roomId,Events.OFFER_RECEIVED,'harish');


        var jingle = stanza.getElementsByTagName("jingle")[0];
        if (jingle.getAttribute("action") === "session-initiate") {
            logger.Info(Tag, "offer recieved");
            this.remoteSDP = new SDP('');

            // Convert to SDP
            this.remoteSDP.fromJingle(stanza);

            logger.Info(Tag, "remote sdp = ", this.remoteSDP);

            // Create the json for session
            var data = {
                "remoteSDP": this.remoteSDP,
                "jingle": jingle,
                "sdp": this.remoteSDP.raw,
                "roomId": roomId,
                "from": from,
                "to" : to
            };

            this.emit(roomId, Events.OFFER_RECEIVED, data);
        }else if (jingle.getAttribute("action") === "source-add"){
            logger.Info(Tag, "source add  recieved --- ");
            var newsddp = new SDP(this.remoteSDP.raw);

            // Convert to SDP
            newsddp.addSources(jingle);

            logger.Info(Tag, "remote sdp = ", newsddp);

            // Create the json for session
            var data = {
                "remoteSDP": newsddp,
                "jingle": jingle,
                "sdp": newsddp.raw,
                "roomId": roomId,
                "from": from,
                "to" : to
            };

            this.emit(roomId, Events.SOURCE_ADD_RECEIVED, data);
        }
    }


    onPrivateIQ(msg){

        // Get the query node
        var privateiq = msg.getElementsByTagName('query');
        if (privateiq.length <=0) { return; }


        var data = msg.getElementsByTagName('data');

        if(data.length>0){
            var type = data[0].getAttribute('type');
            
            // Check if the data is avaialable with required config
            if(type){
                logger.Info(Tag, "type :"+type)
                if(type === 'disconnect'){
    
                }else if(type === 'leave room'){
    
                }else if(type == 'notify') {
    
                    logger.Info(Tag, "Received notification");

                    var notificationPayload = {
                        type: type,
                        room_id: data[0].getAttribute('roomid'),
                        trace_id: data[0].getAttribute('traceid'),
                        user_data: data[0].getAttribute('userdata'),
                        to_routing_id: data[0].getAttribute('routingid'),
                        rtc_server: data[0].getAttribute('rtcserver'),
                        room_token: data[0].getAttribute('roomtoken'),
                        room_token_expiry_time: data[0].getAttribute('roomtokenexpirytime'),
                    };
                    RtcConnection.onNotification(notificationPayload);
                }
            }
        }
    }

    onSipStatus(roomId, status){
        if(status.indexOf('Initializing') > 0 ) { 
            this.emit(roomId, Events.SIP_INITIALIZING);
        }
        else if(status.indexOf('Connecting') > 0 ) { 
            this.emit(roomId, Events.SIP_CONNECTING);
        }
        else if(status.indexOf('Connected') > 0 ) { 
            this.emit(roomId, Events.SIP_CONNECTED);
        }
        else if(status.indexOf('Disconnected') > 0 ) { 
            this.emit(roomId, Events.SIP_DISCONNECTED);
        }
    }
}
