import RtcCore from "./RtcCore";
import RtcSignaling from "./RtcSignaling";
import {RtcRoomInfo} from "./RtcRoomInfo";

export default class RtcManager{

    static rtcManagerInstance = null;

    constructor(){
      /*  if(! RtcManager.rtcManagerInstance){
            this.rtcCoreMap = new Map();
            this.rtcRoomMap = new Map();
            this._logEvent = null;
            this._config = "config";
            RtcManager.rtcManagerInstance = this;
        }

        return RtcManager.rtcManagerInstance;*/

        this.rtcCoreMap = new Map();
        this.rtcRoomMap = new Map();
        this._logEvent = null;
        this._config = null;

        return this;

    }

    static getInstance(){
        if(!RtcManager.rtcManagerInstance)
            RtcManager.rtcManagerInstance = new RtcManager();

        return RtcManager.rtcManagerInstance;

    }



    // RtcCore managing apis
    setConfig(config,logEvent){
        this._config = config;
        this._logEvent = logEvent;
    }

    setUpPeerConnection(roomId){

        var rtcCoreInstance;

        if((roomId != null )&& (!this.rtcCoreMap.has(roomId))){
            rtcCoreInstance = new RtcCore(this._config,this._logEvent);
            this.rtcCoreMap.set(roomId, rtcCoreInstance)
        }
        else if((roomId != null) && (this.rtcCoreMap.has(roomId))){
            rtcCoreInstance = this.rtcCoreMap.get(roomId)
        }

        rtcCoreInstance.createPeerconnection();


    }

    disposePeerConnection(roomId){
        var rtcCoreInstance;
        if(roomId != null && (this.rtcCoreMap.has(roomId)))
        {
            rtcCoreInstance = this.rtcCoreMap.get(roomId);
            rtcCoreInstance.closePeerconnection();

        }
    }

    getPeerConnection(roomId){
        if(roomId != null && this.rtcCoreMap.has(roomId)){
            return this.rtcCoreMap.get(roomId).getPeerconnection();
        }
    }

    getRtcCore(roomId){
        if(roomId != null && this.rtcCoreMap.has(roomId)){
            return this.rtcCoreMap.get(roomId);
        }
    }


    // Room managing apis

    initRoom(session,roomId,event,rtcServer,traceId){
        if(this.rtcRoomMap.has(roomId))
            return;
        else {
            var rtcRoomInfo = new  RtcRoomInfo();
            this.rtcRoomMap.set(roomId, rtcRoomInfo);
            rtcRoomInfo.setEvent(event);
            rtcRoomInfo.setTraceId(traceId);
            rtcRoomInfo.setRtcServer(rtcServer);
        }

    }

    joinRoom(roomId,dataElement){
        /*if(this.rtcRoomMap.has(roomId))
            return;
        else*/
        RtcSignaling.getInstance().joinRoom(roomId,dataElement);
    }

    leaveRoom(roomId,dataElement){

        if(!this.rtcRoomMap.has(roomId))
            return;
        else
            RtcSignaling.getInstance().leaveRoom(roomId,dataElement);
    }

    registerRtcCoreEventListener(roomId,eventListener){
        var rtcCoreInstance;
        if((roomId != null) && (this.rtcCoreMap.has(roomId))){
            rtcCoreInstance = this.rtcCoreMap.get(roomId);
        }
        rtcCoreInstance.addRtcCoreEventListener(eventListener);
    }

}


/*const rtcManagerInstance = new RtcManager();
Object.freeze(rtcManagerInstance);

export default rtcManagerInstance;*/
