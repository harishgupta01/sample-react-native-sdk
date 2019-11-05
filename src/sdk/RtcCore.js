import ParticipantInfo from "./RtcParticipantInfo";
import Events from "./RtcEvents";
import RtcSignaling from "./RtcSignaling";
import InCallManager from 'react-native-incall-manager';
import {RTCPeerConnection,
    } from 'react-native-webrtc';

import logger from './RtcLogger.js';

const Tag = "RtcCore";

export default  class RtcCore {

    constructor(config,logEvent) {
        this.config = config;
        this._peerconnection = null;
        this._logEvent = logEvent;
        this.localSdp = null;
        this.candidates = [];
        this._sessionEventListener = null;
        this.to = null;
    }

    //Public api's

    createPeerconnection(stream){

        const configuration = {"iceServers": this._getICEServers() };

        var constraints;

        constraints = {
            "optional": [
                { "DtlsSrtpKeyAgreement": true }
            ]
        };

        // configuration.sdpSemantics = "plan-b";


        this._peerconnection = new RTCPeerConnection(configuration,constraints);
        this._peerconnection.onicecandidate = this._onIceCandidate.bind(this);
        this._peerconnection.oniceconnectionstatechange = this._onIceConnectionStateChange.bind(this);
        this._peerconnection.onaddstream = this._onAddStream.bind(this);

        return this._peerconnection;

    }

    closePeerconnection(){
        this._peerconnection.close();
    }

    getPeerconnection(){
        return this._peerconnection;
    }

    addRtcCoreEventListener(sessionEventListener){
        this._sessionEventListener = sessionEventListener;
    }

     //Private api's

    _setOffer(desc, response,to) {

        // Assign self
        let self = this;
        // Set constraints
        //var constraints = {};

        self.to = to;

        var sid = response.jingle.getAttribute('sid');
        var from = response.to;


        if (self.config.type == "video" || self.config.type == "audio") {
            var modSDP = desc.sdp;

            desc.sdp = modSDP;

            logger.Info(Tag, "Modified Offer \n" + desc.sdp);
        }

        if ((self.config.type == "video" || self.config.type == "audio") && self.config.useBridge == true) {
            // Remove codecs not supported
            if (self.config.videoCodec && self.config.videoCodec.toLowerCase() == "h264") {
                //desc.sdp = removeCodec(desc.sdp, "VP8");
                //desc.sdp = removeCodec(desc.sdp, "VP9");
                desc.sdp = self._preferH264(desc.sdp);
            }

            // Preferring audio codecs
            if (self.config.audioCodec && self.config.audioCodec.toLowerCase() == "isac") {
                desc.sdp = self._preferISAC(desc.sdp);
            }
            //opus/48000/2
            if (self.config.audioCodec && self.config.audioCodec.toLowerCase() == "opus") {
                desc.sdp = self._preferOpus(desc.sdp);
            }

            logger.Info(Tag, "Modified offer \n" + desc.sdp);
        }

        // Call the peerconnection setRemoteDescription

        this._peerconnection.setRemoteDescription(desc)
            .then(function (res) {
                logger.Info(Tag, "setRemoteDescription Success ");
                self._peerconnection.createAnswer().then(function (answerDesc) {
                    logger.Info(Tag, "Answer created " + answerDesc.sdp);
                    var answer = answerDesc;
                    //If it is p2p call send candidates after offer is set
                    //and answer is sent

                    self._peerconnection.setLocalDescription(answer)
                        .then(function () {
                            logger.Info(Tag, "setLocalDescription Success :: sdp " + self._peerconnection.localDescription.sdp);
                            var localsdp_new = "";
                            localsdp_new = self._peerconnection.localDescription;
                            // Send the answer
                            var data = {
                                "sdp": localsdp_new.sdp,
                                "to": self.to,
                                "traceId": self.config.traceId,
                                "roomId": self.config.roomId,
                                "sid" : sid,
                                "from" : from
                            };

                            self.localSdp = localsdp_new.sdp;

                            // Send session-accept
                            RtcSignaling.getInstance().sendSessionAccept(data);

                        })
                });
            })
            .catch(function (err) {
                logger.Error(Tag, "setRemoteDescription err " + err.toString());
            });
    }

    _sendCandidates() {
        logger.Info(Tag, "sendCandidates");
        var self = this;
        // Check the current state whether the remote participant has joined the room
        // if ((Object.keys(this.participants).length != 0) && (!self.config.useBridge || this.localSdp || this.localAnswer)) {

        this.candidates.forEach(function(candidate) {
            var type;
            if (self.focusJid) {
                type = "responder";
            } else {
                type = "initiator";
            }
            var singleCandidateArray = [];
            singleCandidateArray.push(candidate);

            // Send the transport-info now;
            var data = {
                "candidates": singleCandidateArray,
                "type": type,
                "to": self.to,
                "sdp": self.localSdp,
                "traceId": self.config.traceId,
                "roomId": self.config.roomId
            };

            // Send the transport-info
            RtcSignaling.getInstance().sendTransportInfo(data);

        });
        // self.sendEvent("SDK_XMPPJingleTransportInfoSent", candidate);

        // Clear the candidates
        this.candidates = [];

    };

    //Peerconnection callbacks
    _getICEServers(){
        logger.Info(Tag, "Turn severs ",ParticipantInfo.getSharedInstance().getTurnServers());
        var iceServers = [];
        var turnServers = ParticipantInfo.getSharedInstance().getTurnServers();
        var json = JSON.parse(turnServers);


        if (json && json.ice_servers) {
            var urlArray = json.ice_servers;

            for (var i = 0; i < urlArray.length; i++) {

                // Check if the element itself is an array or not
                if (urlArray[i].urls instanceof Array) {

                    for (var j = 0; j < urlArray[i].urls.length; j++) {

                        if (urlArray[i].username && urlArray[i].credential) {

                            iceServers.push({
                                'urls': [urlArray[i].urls[j]],
                                'username': urlArray[i].username,
                                'credential': urlArray[i].credential
                            });
                        } else {
                            iceServers.push({
                                'urls': [urlArray[i].urls[j]],
                            });
                        }
                    }
                }
                // Add element to the array
                else {

                    if (urlArray[i].urls.username && urlArray[i].urls.credential) {

                        iceServers.push({
                            'urls': [urlArray[i].urls],
                            'username': urlArray[i].urls.username,
                            'credential': urlArray[i].urls.credential
                        });
                    } else {

                        iceServers.push({
                            'urls': [urlArray[i].urls],
                        });
                    }
                }
            }
        }

        iceServers.push({ urls: ["stun:stun.l.google.com:19302"] });
        return iceServers;
    }

    _onAddStream(event){
        logger.Info(Tag," onAddstream "+ event.stream.id);

        if(event.stream.id != "mixedmslabel"){

            InCallManager.setSpeakerphoneOn(true);
            logger.Info(Tag," stream id -- "+ event.stream.id);

            var json = { "callId": this._traceId, "stream":event.stream , "event": "onSessionRemoteStream"}
            this._sessionEventListener(json);
        }
    }

    _onIceCandidate(event) {
        logger.Info(Tag," onIceCandidate ", event.candidate);

        var self = this;
        // Check if the event is nil
        if (event && event.candidate) {
            logger.Info(Tag, "Candidate : " , event.candidate.candidate);
            if (self.config.useRelay && event.candidate.candidate.indexOf('relay') == -1) {
                logger.Info(Tag, "Ignoring Non-relay candidates");
                return;
            }
            // Buffer the candidates first
            this.candidates.push(event.candidate);

            // send the candidates
            this._sendCandidates();
        }
    };


    /**
     * _onIceConnectionStateChange callback from peerconnection
     * @param {object} event
     * @private
     */
    _onIceConnectionStateChange(event) {
            var iceState = event.target.iceConnectionState;
            /*if (this.peerconnection.iceConnectionState) {
                logger.log(logger.level.INFO, Tag,
                    " onIceConnectionStateChange " + this.peerconnection.iceConnectionState);

                iceState = this.peerconnection.iceConnectionState ? this.peerconnection.iceConnectionState.toString() : "NA";

                if (this.peerconnection.iceConnectionState.toString() == "connected") {

                    this.state = RtcCore.CONNECTED;

                    this.callSummary.callStatus = "Success";
                    this.callStartTime = new Date();

                    if (this.config.type == "pstn")
                        this.pstnState = RtcCore.CONNECTED;

                    this._onSessionConnected(this.config.roomId);
                }
            } else if (this.peerconnection.iceState) {
                logger.log(logger.level.INFO, Tag,
                    " onIceConnectionStateChange " + this.peerconnection.iceState);

                iceState = this.peerconnection.iceState ? this.peerconnection.iceState.toString() : "NA";

                if (this.peerconnection.iceState.toString() == "connected") {
                    this.state = RtcCore.CONNECTED;
                    this._onSessionConnected(this.config.roomId);
                }
            } else {
                logger.log(logger.level.ERROR, Tag,
                    " onIceConnectionStateChange :: Error in finding iceConnectionState");
                this.onError(this.config.roomId, RtcErrors.ERR_INCORRECT_PARAMETERS,
                    "onIceConnectionStateChange :: Error in finding iceConnectionState");
            }*/

            switch (iceState) {
                case "new":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_NEW);
                    break;
                case "checking":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_CHECKING);
                    break;
                case "connected":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_CONNECTED);
                    var json = { "callId": ""/*this._traceId*/, "event": "onSessionConnected"}
                    this._sessionEventListener(json)
                    break;
                case "completed":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_COMPLETED);
                    break;
                case "failed":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_FAILED);
                    break;
                case "disconnected":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_DISCONNECTED);
                    break;
                case "closed":
                    this._logEvent.onSdkEvent(Events.ICE_CONNECTION_CLOSED);
                    break;
            }
    }



    // Private methods

    /**
     * Function to prefer codec from sdp
     * @param sdp - original sdp
     * @returns modified sdp with preferred codec
     * @private
     */
    _preferH264(sdp) {
        logger.Info(Tag, "preferH264");

        var sdpLines = sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=video') !== -1) {
                var mLineIndex = i;
                break;
            }
        }

        if (mLineIndex === null) return sdp;

        for (i = 0; i < sdpLines.length; i++) {
            if ((sdpLines[i].search('H264/90000') !== -1) || (sdpLines[i].search('h264/90000') !== -1)) {
                var opusPayload = this._extractSdp(sdpLines[i], /:(\d+) H264\/90000/i);
                if (opusPayload)
                    sdpLines[mLineIndex] = this._setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                break;
            }
        }

        sdpLines = this._removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');

        return sdp;
    }


    /**
     * Prefer ISAC audio codec
     * @private
     */
    _preferISAC(sdp) {
        logger.Info(Tag, "preferISAC");

        var sdpLines = sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }

        if (mLineIndex === null) return sdp;

        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('ISAC/16000') !== -1) {
                var isacPayload = this._extractSdp(sdpLines[i], /:(\d+) ISAC\/16000/i);
                if (isacPayload)
                    sdpLines[mLineIndex] = this._setDefaultCodec(sdpLines[mLineIndex], isacPayload);
                break;
            }
        }
        sdpLines = this._removeCN(sdpLines, mLineIndex);

        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('ISAC/32000') !== -1) {
                var isacPayload = this._extractSdp(sdpLines[i], /:(\d+) ISAC\/32000/i);
                if (isacPayload)
                    sdpLines[mLineIndex] = this._setISAC3200Codec(sdpLines[mLineIndex], isacPayload);
                break;
            }
        }
        sdpLines = this._removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');

        return sdp;
    }


    /**
     *
     * @param {object} sdp
     * @private
     */
    _preferOpus(sdp) {
        logger.Info(Tag, "preferISAC");

        var sdpLines = sdp.split('\r\n');

        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }

        if (mLineIndex === null) return sdp;

        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000/2') !== -1) {
                var isacPayload = this._extractSdp(sdpLines[i], /:(\d+) opus\/48000\/2/i);
                if (isacPayload)
                    sdpLines[mLineIndex] = this._setDefaultCodec(sdpLines[mLineIndex], isacPayload);
                break;
            }
        }
        sdpLines = this._removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');

        return sdp;
    }


    /**
     * @private
     */
    _extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return (result && result.length == 2) ? result[1] : null;
    }


    /**
     * @private
     */
    _removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = this._extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) mLineElements.splice(cnPos, 1);
                sdpLines.splice(i, 1);
            }
        }
        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }

    /**
     * @private
     */
    _setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) newLine[index++] = payload;
            if (elements[i] !== payload) newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }


    /**
     * @private
     */
    _setISAC3200Codec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 4) newLine[index++] = payload;
            if (elements[i] !== payload) newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

}