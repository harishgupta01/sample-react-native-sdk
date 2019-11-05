

import logger from './RtcLogger.js';
import ParticipantInfo from './RtcParticipantInfo';
import RtcSignaling from "./RtcSignaling";
import RtcSdkStats from './RtcSdkStats.js';


const timer = require('react-native-timer');
const Tag = "RtcLogEvents";

export default class RtcLogEvents {

    constructor(traceId, config){
        this.config = config;
        this.traceId = traceId;
        this.dataElement = null;
        this.logEventsArray = [];
        this.enableEventBuffering = true;
    }

    setDataElement(dataElement){
        this.dataElement = dataElement;
    }

    logEvent = (eventLog) => {

        logger.Info(Tag, "logEvent :: state = " + eventLog.n + " for roomId = " + (this.dataElement !=null ? this.dataElement.getRoomId() : null) + " traceId = " + this.traceId);
        
        if(this.enableEventBuffering){
            this.logEventsArray.push(eventLog);
            if(eventLog.n == 'SDK_SessionEnded'){
                this.sendEventArray();
                timer.clearInterval(this, "eventBufferTimer");
            }
        }
        else {            
            RtcSignaling.getInstance().sendQueryIQ(this.dataElement, eventLog);
        }
    }

    onSdkEvent = (event, eventData) => {
        
        let data = {};
        data.n = event;
        data.timestamp = new Date().toISOString();
        
        if(this.dataElement != null){
            data.attr =  this.dataElement.eventData();
            data.meta = RtcSdkStats.getMetaData();
        }
        else{
            data.attr =  this.initialEventData();
        }

        if(eventData != undefined){
            if(eventData.streaminfo != undefined)
                data.streaminfo = eventData.streaminfo;

            if(eventData.timeseries != undefined)
                data.timeseries = eventData.timeseries;
        }
        
        this.logEvent(data);

        //return data;
    }

    initialEventData = () => {
        let data = {
            "traceId": this.traceId,
            "routingId": ParticipantInfo.getSharedInstance().getRoutingId(),
            "sessionType": this.config.sessionType,
            "callType": "videobridge"
        }
        return data;
    }

    startEventBufferTimer = () => {
        this.enableEventBuffering = true;
        timer.setTimeout(this,"eventBufferTimer",() => {            
            this.sendEventArray();
        }, 5000);
    }

    sendEventArray = () => {
        this.enableEventBuffering = false;       
        if(this.dataElement != null)
           RtcSignaling.getInstance().sendQueryIQ(this.dataElement, this.logEventsArray);
        this.logEventsArray = [];
    }
}