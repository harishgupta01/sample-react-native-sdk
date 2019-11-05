import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info';

import RtcConfig from './RtcConfig';
import WebrtcStatsReport from './WebrtcStatsReport';
import RtcManager from "./RtcManager";
import ParticipantInfo from "./RtcParticipantInfo";

const EventEmitter = require('events');
const timer = require('react-native-timer');

export default class RtcSdkStats extends EventEmitter {

    static STATS_COLLECTOR_INTERVAL = 10 *1000;
    static STARTING_STATS_COLLECTOR_INTERVAL = 1 *1000;
    static metaData = null;
    static networkType = ParticipantInfo.getSharedInstance().getNetworkType();

    constructor(){
        super();
        this.roomId = null;
        this.loopCounter = 0;
        this.isStarted = false;
        this.statsMonitoringInterval = null;
        this.webrtcStats = new WebrtcStatsReport();
    }

    static getMetaData = () => {

        if(RtcSdkStats.metaData === null){
            RtcSdkStats.metaData = {
                packageName : RtcConfig.json.packagename,
                model : DeviceInfo.getModel(),
                manufacturer : DeviceInfo.getManufacturer(),
                hardware : DeviceInfo.getDeviceId(),
                sdkVersion : RtcConfig.json.sdkVersion,
                OSVersion : DeviceInfo.getSystemVersion(),
                networkType : RtcSdkStats.networkType,
                alias : "",
                sdkType : Platform.OS,
            };
        }
        else {
            let currentNetworkType = ParticipantInfo.getSharedInstance().getNetworkType()
            if(RtcSdkStats.networkType != currentNetworkType){
                RtcSdkStats.networkType = currentNetworkType;
                RtcSdkStats.metaData.networkType = RtcSdkStats.networkType;
            }
        }
        return RtcSdkStats.metaData;
    }

    startStatsMonitoring = (dataElement, statsInterval) => {
        if(this.isStarted)
            return;

        this.isStarted = true;
        this.roomId = dataElement.getRoomId();

        if(statsInterval){
            this.statsMonitoringInterval = statsInterval;
        }
        else{
            this.statsMonitoringInterval = RtcSdkStats.STATS_COLLECTOR_INTERVAL;
        }

        timer.setInterval(this,"repeatedStatsLogger",() => {
            this.webrtcEventStats(RtcManager.getInstance().getPeerConnection(this.roomId), dataElement);
        }, RtcSdkStats.STARTING_STATS_COLLECTOR_INTERVAL);
    }

    webrtcEventStats = (peerConnection, dataElement) =>{
        var self = this;
        peerConnection.getStats().then(res => {
            self.webrtcStats.parseReport(res);
            self.onWebrtcStats(dataElement);
            self.loopCounter++;
        });

        if(this.loopCounter == 10){
            timer.clearInterval(this, "repeatedStatsLogger");

            timer.setInterval(this, "repeatedStatsLogger",() => { 
                this.webrtcEventStats(peerConnection, dataElement);
            }, this.statsMonitoringInterval);
        }
    }

    onWebrtcStats = (dataElement) => {
        let data = {
            timeseries : this.webrtcStats.getAllStats(),
            streaminfo : this.createStreamInfo(dataElement)
        }
        this.emit(this.roomId, "SDK_Timeseries", data);
    }

    createStreamInfo = (dataElement) =>{
        let streamInfo = dataElement.getStreamInfo();

        if(this.webrtcStats != null)
            streamInfo.turnIP = this.webrtcStats.getTurnServerIP();
        else
            streamInfo.turnIP = "";
        
        return streamInfo;
    }

    stopStatsMonitoring = () => {
        timer.clearInterval(this, "repeatedStatsLogger");
        
        this.metaData = {};
        this.loopCounter = 0;
        this.networkType = '';
        this.statsMonitoringInterval = null;

    }
}