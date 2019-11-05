import ParticipantInfo from "./RtcParticipantInfo";
import RtcConnection from "./IrisRtcConnection";
import RtcDataElement from "./RtcDataElement";
import logger from "./RtcLogger";
import SDP from "./utils/SDP";
const timer = require('react-native-timer');

const Tag = "RtcSignaling";

export default class RtcSignaling{
    static rtcSignalingInstance = null;

    constructor(){
        this.index = 1;
        return this;
    }

    static getInstance(){
        if(!RtcSignaling.rtcSignalingInstance)
            RtcSignaling.rtcSignalingInstance = new RtcSignaling();

        return RtcSignaling.rtcSignalingInstance;
    }

    addEventListner(roomId, eventListner){
        RtcConnection.addEventHandler(roomId,eventListner);
    }

    removeEventListner(roomId, eventListner){
        if(roomId != null)
            RtcConnection.removeEventHandler(roomId,eventListner);
    }

    allocateConferenceFocus(dataElement){
        let rtcServer = dataElement.getRtcServerUrl();
        let targetId = rtcServer.replace('xmpp','focus');
        let roomId = dataElement.getRoomId();

        var iq = $iq({to: targetId, type: 'set'})
            .c('conference', {
                xmlns: 'http://jitsi.org/protocol/focus',
                room: roomId + '@' + rtcServer.replace('xmpp', 'conference')})
            .c('property',{
                name: 'bridge', value: 'jitsi-videobridge.' + rtcServer}).up()
            .c('property',{
                name: 'call_control', value: rtcServer.replace('xmpp','call_control')}).up()
            .c('property',{
                name: 'channelLastN', value: '-1'}).up()
            .c('property',{
                name: 'adaptiveLastN', value: 'false'}).up()
            .c('property',{
                name: 'adaptiveSimulcast', value: 'false'}).up()
            .c('property',{
                name: 'openSctp', value: 'true'}).up()
            .c('property',{
                name: 'simulcastMode', value: 'rewriting'}).up().up();

        //Adding data Element
        iq.cnode(dataElement.toXML());

        this.sendIQ(iq);
    }

    sendDialIq(dataElement){
        var rayo = $iq(
            {type: 'set',to:dataElement.getRoomId() + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'conference') + '/' + 'xrtc_sp00f_f0cus'
            })
            .c('dial', {
                xmlns: 'urn:xmpp:rayo:1',
                to: ParticipantInfo.getSharedInstance().getTargetNumber(),
                from: ParticipantInfo.getSharedInstance().getSourceNumber()})
            .c('header', {
                name: 'JvbRoomName',
                value: dataElement.getRoomId() + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'conference')
            }).up().up();

        rayo.cnode(dataElement.toRoutingid());
        this.sendIQ(rayo);
    }

    sendRejectIQ(dataElement){
        let toId = dataElement.getRoomId() +'@'+ dataElement.getRtcServerUrl() + '/' + dataElement.getTargetRId();

        let iq = $iq({type: 'set', to: toId})
            .c('query', {xmlns: 'jabber:iq:private',strict: 'false'}).up()
            .c('data', {
                xmlns: 'urn:xmpp:comcast:info',
                traceid: dataElement.getTraceId(),
                event: dataElement.getEventType(),
                action: 'reject',
                rtcserver: dataElement.getRtcServerUrl(),
                to: toId,
                roomid: dataElement.getRoomId(),
            })
        this.sendIQ(iq);
    }


    sendQueryIQ(dataElement, eventData) {
        var statsIq = $iq({type: 'set'})
                    .c('query', {xmlns: 'jabber:iq:private',strict: 'false'}).up()
                    .c('data', {
                        xmlns: 'urn:xmpp:comcast:info', 
                        traceid: dataElement.getTraceId(), 
                        event: 'callstats', 
                        action: 'log', 
                        roomid: dataElement.getRoomId(),
                        stats: JSON.stringify(eventData)})
    
        this.sendIQ(statsIq);
    }

    sendAudioMute(config,roomId,dataElement){
        var pres = $pres({
            to: roomId + '@' + config.notificationdata.rtc_server.replace('xmpp', 'conference') + '/' +
                RtcConnection.getConnectionObject().jid
        })
            .c('x', { 'xmlns': 'http://jabber.org/protocol/muc' }).up()
            .c('c', { 'xmlns': 'http://jabber.org/protocol/caps', 'hash': 'sha-1', 'node': 'http://jitsi.org/jitsimeet', 'ver': 'cvjWXufsg4xT62Ec2mlATkFZ9lk=' }).up();

        // pres = pres.c('devices')
        // pres.c('audio').t('true');
        // pres.c('video').t('true');
        // pres = pres.up();

        if (typeof config.audiomuted !== 'undefined') {
            pres.c('audiomuted').t(config.audiomuted).up();
        }

        if (typeof config.videomuted !== 'undefined') {
            pres.c('videomuted').t(config.videomuted).up();
        }
        if (config.name) {
            pres.c('nick').t(config.name);
        }

        pres.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': dataElement.getTraceId(),
            'childnodeid': config.notificationdata.childNodeId,
            'rootnodeid': config.notificationdata.rootNodeId,
            'event': config.type,
            'host': RtcDataElement.getHostUrl(),
            'roomtoken': config.notificationdata.room_token,
            'roomtokenexpirytime': config.notificationdata.room_token_expiry_time
        }).up();

        this.sendPresence(pres);
    }

    sendMessageHold(config, participantJid, hold , roomId, dataElement){
        logger.Info(Tag, "sendMessageHold ");

        this.index++;

        var roomJid = roomId + '@' + config.notificationdata.rtc_server.replace('xmpp', 'conference');

        var holdIQ = $msg( {
            id: 'pstnHold',
            from: RtcConnection.getConnectionObject().jid,
            to: roomJid+"/"+participantJid,
            type: 'chat',
        })
            .c('body').t(hold ? "hold" : "unhold").up();

        holdIQ = holdIQ.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': dataElement.getTraceId(),
            'host': RtcDataElement.getHostUrl(),
            'roomid': roomId
        }).up();

        // send the hold/unhold private message
        RtcConnection.getConnectionObject().send(holdIQ.tree());
    }

    sendHold(config,to,roomId,dataElement){
        logger.Info(Tag, "sendHold");

        if(to.split("/").length > 2)
            to = to.split('/').splice(1,2).join("/")
        else
            to = to.split("/").join("/");

        var roomJid = roomId + '@' + config.notificationdata.rtc_server.replace('xmpp', 'callcontrol');

        var messageId = this.index.toString() + ':sendIQ';

        // Join the room by sending the presence
        var hold = $iq({ to: roomJid+"/"+to, from: RtcConnection.getConnectionObject().jid, "type": "set", "id": messageId })
            .c('hold', { 'xmlns': 'urn:xmpp:rayo:1' }).up();

        hold = hold.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': dataElement.getTraceId(),
            'host': RtcDataElement.getHostUrl()
        }).up();

        this.index++;
        // send the rayo command
        this.sendIQ(hold);
    }

    sendUnHold(config,to,roomId,dataElement){
        logger.Info(Tag, "sendUnHold");

        if(to.split("/").length > 2)
            to = to.split('/').splice(1,2).join("/")
        else
            to = to.split("/").join("/");

        var roomJid = roomId + '@' + config.notificationdata.rtc_server.replace('xmpp', 'callcontrol');
        var messageId = this.index.toString() + ':sendIQ';

        // Join the room by sending the presence
        var unhold = $iq({ to: roomJid+"/"+to, from: RtcConnection.getConnectionObject().jid, "type": "set", "id": messageId })
            .c('unhold', { 'xmlns': 'urn:xmpp:rayo:1' }).up();

        unhold = unhold.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': dataElement.getTraceId(),
            'host': RtcDataElement.getHostUrl()
        }).up();

        this.index++;
        // send the rayo command
        this.sendIQ(unhold);
    }

    joinRoom(roomId,dataElement){
        var pres = $pres({
            to: roomId + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'conference') + '/' + RtcConnection.getConnectionObject().jid
        })
            .c('x', {
                xmlns: 'http://jabber.org/protocol/muc' }).up()
            .c('c', {
                xmlns: 'http://jabber.org/protocol/caps',
                hash: 'sha-1',
                node: 'http://www.igniterealtime.org/projects/smack',
                ver: '2G9Iv8XqFv8zCi6AruSSyULJIA4=' }).up()

        pres.cnode(dataElement.toXML())

        logger.Info(Tag, "joinRoom " + pres.tree().toString())
        this.sendPresence(pres)
    }

    //Send unavailable presence
    leaveRoom(roomId,dataElement){
        var pres = $pres({
            to: roomId + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'conference') + '/' + RtcConnection.getConnectionObject().jid,
            type : "unavailable"
        });

        pres.cnode(dataElement.toXML());

        this.sendPresence(pres);
    }

    //Send Periodic presence
    sendPeriodicAlivePresence(dataElement){
        logger.Info("RtcXmpp", "sendPresenceAlive : roomId: " + dataElement.getRoomId() + " eventType : " + dataElement.getEventType());

        var pres = $pres({
            to: dataElement.getRoomId() + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'conference') + '/' + RtcConnection.getConnectionObject().jid,
            id: 'c2p1'
        }).c('x', {
            xmlns: 'http://jabber.org/protocol/muc' }).up();

        pres.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': dataElement.getTraceId(),
            'event': dataElement.getEventType(),
            'host':  RtcDataElement.getHostUrl(),
            'type': 'periodic'
        }).up();

        // Start a timer to send periodic presence at interval
        timer.setInterval(this,"periodicPresenceTimer",() => {
            this.sendPresence(pres);
        }, 10000);
    }

    //Stop sending periodic presence
    stopPeriodicAlivePresence(){
        logger.Info("RtcXmpp", "stopPeriodicAlivePresence");
        timer.clearInterval(this,"periodicPresenceTimer");
    }

    sendPresence(stanza){
        RtcConnection.getConnectionObject().sendPresence(stanza,()=>{logger.Info(Tag, 'Presence send success')},()=>{logger.Info(Tag, 'Presence send error callback')},5000);
    }

    sendIQ(stanza){
        RtcConnection.getConnectionObject().sendIQ(stanza,()=>{logger.Info(Tag, 'stanza send success')},()=>{logger.Info(Tag, 'stanza send error callback')},5000);
    }

    // Method to send Hangup command
    sendHangupIQ(remoteParticipant,dataElement){
        logger.Verbose("RtcXmpp"," sendHangup");

        var roomJid = null;
        if(remoteParticipant != null)
            roomJid = dataElement.getRoomId() + '@' + dataElement.getRtcServerUrl().replace('xmpp', 'callcontrol') + "/" + remoteParticipant;

        var hangup = $iq({ to: roomJid,
            'type': 'set',
        })
            .c('hangup', {
                'xmlns': 'urn:xmpp:rayo:1' }).up()
            .c('data', {
                'xmlns': "urn:xmpp:comcast:info",
                'traceid': dataElement.getTraceId(),
                'host': RtcDataElement.getHostUrl()}).up();

        // send the rayo command
        this.sendIQ(hangup);
    }

    sendSessionAccept(data) {
        logger.Info(Tag, "sendSessionAccept, to " + data.to);

        var messageId = this.index.toString() + ':sendIQ';

        var accept = $iq({to: data.to, type: 'set', "id": messageId})
            .c('jingle', {
                'xmlns': 'urn:xmpp:jingle:1',
                action: 'session-accept',
                initiator: data.to,
                responder: data.from,
                sid: data.sid
            });

        // Create a variable for SDP
        var localSDP = new SDP(data.sdp);

        this.index++;

        // get the xmpp element
        accept = localSDP.toJingle(accept, 'responder');

        accept.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': data.traceId,
            'host': RtcDataElement.getHostUrl()
        }).up();

        // Send the session-accept
        this.sendIQ(accept.tree(), messageId, data.roomId);
    }

    sendTransportInfo(data) {
        logger.Verbose(Tag, " sendTransportInfo, to " + data.to);

        var messageId = this.index.toString() + ':sendIQ';

        var transportinfo = $iq( { to: data.to, type: 'set', "id": messageId })
            .c('jingle', {
                'xmlns': 'urn:xmpp:jingle:1',
                action: 'transport-info',
                initiator: data.to,
                sid: this.sid
            });

        this.index++;

        var localSDP = new SDP(data.sdp);

        // Create the transport element
        for (var mid = 0; mid < localSDP.media.length; mid++) {
            var cands = data.candidates.filter(function(el) { return el.sdpMLineIndex == mid; });
            var mline = SDPUtil.parse_mline(localSDP.media[mid].split('\r\n')[0]);
            if (cands.length > 0) {
                var ice = SDPUtil.iceparams(localSDP.media[mid], localSDP.session);
                ice.xmlns = 'urn:xmpp:jingle:transports:ice-udp:1';
                transportinfo = transportinfo.c('content', {
                    "creator": data.type,
                    "name": (cands[0].sdpMid ? cands[0].sdpMid : mline.media)
                }).c('transport', ice);
                for (var i = 0; i < cands.length; i++) {
                    transportinfo.c('candidate', SDPUtil.candidateToJingle(cands[i].candidate));
                }
                // add fingerprint
                var fingerprint_line = SDPUtil.find_line(localSDP.media[mid], 'a=fingerprint:', localSDP.session);
                if (fingerprint_line) {
                    var tmp = SDPUtil.parse_fingerprint(fingerprint_line);
                    tmp.required = true;
                    transportinfo = transportinfo.c(
                        'fingerprint', { xmlns: 'urn:xmpp:jingle:apps:dtls:0' })
                        .t(tmp.fingerprint);
                    delete tmp.fingerprint;

                    // Traverse through the variable tmp
                    /*for (var key in tmp) {
                        transportinfo.attr(key, tmp[key]);
                    }*/
                    transportinfo = transportinfo.up();

                }
                transportinfo = transportinfo.up(); // transport
                transportinfo = transportinfo.up(); // content
            }
        }
        transportinfo = transportinfo.up(); // jingle
        transportinfo = transportinfo.c('data', {
            'xmlns': "urn:xmpp:comcast:info",
            'traceid': data.traceId,
            'host': this.server
        }).up();


        // Send the session-initiate
        this.sendIQ(transportinfo.tree(), messageId, data.roomId);
    }
}
