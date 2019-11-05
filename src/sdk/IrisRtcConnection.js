
import EnvConfig from './networking/EnvConfig';
import ParticipantInfo from './RtcParticipantInfo';
import StanzaHandler from './RtcStanzaHandler';
import DataElement from './RtcDataElement';
import logger from './RtcLogger';

/* Do not remove this unused import */
import Strophe from './modules/strophe.js/src/strophe';

import {ErrorCodes} from './networking/ErrorCodes';
import {showMessage, hideMessage} from "react-native-flash-message";
import {refreshTokensIfNeeded} from "./networking/TokenManagerService";
import { HttpStatus } from './networking/HttpStatus';
import NetworkManager from './networking/NetworkManager';


require('./modules/strophejs-plugin-ping/strophe.ping');
const timer = require('react-native-timer');
window.Strophe.log = (level, msg) => {
    logger.Info("Strophe log", msg);
}

var emitter = require('events').EventEmitter;
var connectionEventEmitter = new emitter(); 
var hostUrl,connection,routingId,stanzaHandler;

var connectionState = ParticipantInfo.getSharedInstance().getRtcConnectionState();
var presence_handler,chat_message_handler,iq_handler;
const Tag = "RtcConnection";

// local methods
function _createSocketConnection(xmppInfo) {
    hostUrl = xmppInfo.websocket_server;
    DataElement.setHostUrl(hostUrl);
    var timestamp = xmppInfo.websocket_server_token_expiry_time;
    var websocketToken = xmppInfo.websocket_server_token;
    var username = ParticipantInfo.getSharedInstance().getUserId();

    var ws_url = "wss://" + hostUrl + "/xmpp-websocket/routingid/" + routingId + "/timestamp/" + timestamp + "/token/" + websocketToken;

    // Xmpp.connect(ws_url);

    // socket connection
    if (ParticipantInfo.getSharedInstance().getRtcConnectionState() != ParticipantInfo.state.LOGOUT) {
        connection = new window.Strophe.Connection(ws_url);
        connection.rawOutput = rawOutput;
        connection.rawInput = rawInput;
        connection.connect(routingId, null, onConnect);
    }

}

async function _closeSocketConnection() {
    try{
        if (connection != null) {
            connection.disconnect()
            connection = null
        }
    }
    catch(error){
        logger.Error(Tag, 'Got Error', error);
    }
}

async function _fetchWsTurnServer(token, routing_Id, evmResponse) {
    var responseStatus = {status: 'Failure'}
    var JwtToken = 'Bearer ' + token;
    routingId = routing_Id;
    var url = EnvConfig.EVENT_MANAGER_URL+'/v1/wsturnserverinfo/routingid/'+routingId;

    fetch(url, {
        method: 'GET',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': JwtToken
        }
    }).then(response => {
        logger.Info(Tag, "Status code : " + response.status);
        responseStatus.statusCode = response.status;
        if (response.headers.get("Content-Type") == 'application/json') {
            return response.json();
        } else {
            responseStatus.errorMessage = "HTTP Connection failed with error code :: " + response.status;
            evmResponse(responseStatus);
            throw Error(response.status);
        }
    }).then((responseJson) => {
        if (responseJson.error) {
            responseStatus.errorMessage = responseJson.error.message;
            evmResponse(responseStatus);
        } else {
            responseStatus.status = 'Success';
            responseStatus.data = responseJson;
            evmResponse(responseStatus);
        }
    }).catch((error) => {
        logger.Error(Tag, 'Got error ', error)
    })
}

function _getXmppRegisterInfo(token, routing_Id) {

    _fetchWsTurnServer(token, routing_Id, response => {
        logger.Info(Tag, "Received socket response: ", response);
        if (response.status == 'Failure') {
            logger.Error(Tag, "Received error code from HTTP server :: " + response.statusCode);
            var errorInfo = {};
            var code, reason;
            if (response.statusCode == HttpStatus.UNAUTHORIZED) {
                errorInfo.code = ErrorCodes.ERR_JWT_EXPIRE;
                (response.errorMessage) ? errorInfo.reason = response.errorMessage : errorInfo.reason = "Invalid token for http connection";  
            } 
            else {
                errorInfo.code = ErrorCodes.ERR_EVENT_MANAGER;
                errorInfo.reason = response.errorMessage;
            }
            logger.Info(Tag, "Connection failure : Error code = " + errorCode + " message = " + errorMessage);
            connectionEventEmitter.emit("error",errorInfo);
        } else {
            if (ParticipantInfo.getSharedInstance().getRtcConnectionState() != ParticipantInfo.state.LOGOUT) {
                ParticipantInfo.getSharedInstance().setTurnServers(response.data.turn_credentials);
                ParticipantInfo.getSharedInstance().setWebsocketServer(response.data.websocket_server);
                
                _createSocketConnection(response.data);
            }
        }
    });
}

// strophe callbacks
function rawInput(msg) {
    logger.Info(Tag, 'RECV = ' + msg);
}

function rawOutput(msg) {
    logger.Info(Tag, 'SENT = ' + msg);
}

function onConnect(status,condition) {
    if (status == window.Strophe.Status.CONNECTING) {
        logger.Info(Tag, 'Socket is  connecting.');
        connectionState = ParticipantInfo.state.CONNECTING
        connectionEventEmitter.emit('state',connectionState);
    } else if (status == window.Strophe.Status.CONNECTED) {
        logger.Info(Tag, 'Socket is  connected.');
        showMessage({
            message: "Connected to rtc server",
            type: "success",
            hideStatusBar: true,
        });
        connectionState = ParticipantInfo.state.CONNECTED
        connectionEventEmitter.emit('state',connectionState);
        stanzaHandler = new StanzaHandler();
        iq_handler = connection.addHandler(stanzaHandler.onIq.bind(stanzaHandler),null,'iq');
        timer.setInterval("pingTimer", _startPing, 3000);
    } else if (status == window.Strophe.Status.CONNFAIL) {
        logger.Info(Tag, 'Socket failed to connect.');
        connectionState = ParticipantInfo.state.CONNFAIL
        var errorInfo ={};
        errorInfo.code = ErrorCodes.ERR_SESSION_MANAGER;
        errorInfo.reason = condition;
        connectionEventEmitter.emit('error',errorInfo);
    } else if (status == window.Strophe.Status.DISCONNECTING) {
        logger.Info(Tag, 'Socket is disconnecting.');
        connectionState = ParticipantInfo.state.DISCONNECTING
    } else if (status == window.Strophe.Status.DISCONNECTED) {
        logger.Info(Tag, 'Socket is disconnected.');
        connectionState = ParticipantInfo.state.DISCONNECTED
        connectionEventEmitter.emit('state',connectionState);
    }

    ParticipantInfo.getSharedInstance().setRtcConnectionState(connectionState)
    logger.Info(Tag, "---new connection state :: "+ ParticipantInfo.sharedInstance.getRtcConnectionState());

  //  onConnectionStateChange(connectionState);
    //connectionStateCallback ? connectionStateCallback(connectionState) : null;
}


function _startPing() {
    connection.ping.ping(hostUrl, function (iq) {
    }, function () {
        logger.Debug(Tag, 'ping Failed!');
    }, 3000);
}

function _stopPing() {
    timer.clearInterval("pingTimer");
}


// public members
function connect(token, routingId) {
    
    if(connectionState === ParticipantInfo.state.CONNECTED){
        return;
    }  

    NetworkManager.getInstance().init();
    
   // connectionStateCallback = callback;
    _stopPing();
    refreshTokensIfNeeded().then(() => {
        if(ParticipantInfo.getSharedInstance().getRtcConnectionState() != ParticipantInfo.state.LOGOUT){
            showMessage({
                message: "Connecting....",
                type: "info",
                hideStatusBar: true,
            });

        }
        _getXmppRegisterInfo(token, routingId);
    });
}

function disconnect() {
    //Remove all handlers
    _stopPing();
    
    if(connectionState === ParticipantInfo.state.CONNECTED){
        removeIqHandler();
        removePresenceHandler();
        removeChatMessageHandler();
        _closeSocketConnection();
    }       

    NetworkManager.getInstance().dispose();
}

function getConnectionEmitter(){
     return connectionEventEmitter;
}

function getConnectionState() {
    return !connectionState?ParticipantInfo.getSharedInstance().getRtcConnectionState():connectionState;
}

//User overrideable function that receives incoming call notification
function onNotification(notificationPayload){
    
}
function getConnectionObject(){
    return connection
}

function addEventHandler(roomId, eventListner){
    stanzaHandler.on(roomId,eventListner);
}

function removeEventHandler(roomId,eventListner){
    stanzaHandler.removeListener(roomId,eventListner);
}

function addPresenceHandler(){
    presence_handler = connection.addHandler(stanzaHandler.onPresence.bind(stanzaHandler),null,'presence');
}

function removePresenceHandler(){
    logger.Info(Tag, "Remove presence listener");
    connection.deleteHandler(presence_handler);
}

function addChatMessageHandler(){
    chat_message_handler = connection.addHandler(stanzaHandler.onMessage.bind(stanzaHandler),null,'message');
}

function removeChatMessageHandler() {
    connection.deleteHandler(chat_message_handler);
}

function removeIqHandler() {
    connection.deleteHandler(iq_handler);
}

export default {
    getConnectionObject,
    getConnectionState,
    getConnectionEmitter,
    onNotification,
    connect,
    disconnect,
    addEventHandler,
    removeEventHandler,
    addPresenceHandler,
    removePresenceHandler,
    addChatMessageHandler,
    removeChatMessageHandler
};





