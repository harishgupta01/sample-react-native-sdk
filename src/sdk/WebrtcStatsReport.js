
export default class WebRTCStatReport {

    turnServerIP = "";
    isTurnIPAvailable = false;
    ssrcValues = ['googFrameRateReceived', 'googFrameRateSent', 'audioOutputLevel', 'audioInputLevel'];

    constructor(){
        this.streamStatsGroup = [];
    }


    getTxAudioStat = (pairs) => {
        let obj = {};
        obj.id = "txAudio";

        for(value of pairs){
            let type = Object.keys(value);

            switch(type[0]){
                case "googCodecName":
                    obj.googCodecName = value[type[0]];
                    break;

                case "audioInputLevel":
                    obj.audioInputLevel = parseInt(value[type[0]]);
                    break;

                case "bytesSent":
                    obj.bytesSent= parseInt(value[type[0]]);
                    break;

                case "packetsLost":
                    packetLossForReceived = parseInt(value[type[0]]);
                    if(packetLossForReceived < 0)
                        packetLossForReceived = 0;
                    obj.packetsLost = packetLossForReceived;
                    break;

                case "packetsSent":
                    obj.packetsSent = parseInt(value[type[0]]);
                    break;

                case "googEchoCancellationQualityMin":
                    obj.googEchoCancellationQualityMin = parseInt(value[type[0]]);
                    break;

                case "googEchoCancellationEchoDelayMedian":
                    obj.googEchoCancellationEchoDelayMedian = parseInt(value[type[0]]);
                    break;

                case "googEchoCancellationEchoDelayStdDev":
                    obj.googEchoCancellationEchoDelayStdDev = parseInt(value[type[0]]);
                    break;

                case "googEchoCancellationReturnLoss":
                    obj.googEchoCancellationReturnLoss = parseInt(value[type[0]]);
                    break;

                case "googEchoCancellationReturnLossEnhancement":
                    obj.googEchoCancellationReturnLossEnhancement = parseInt(value[type[0]]);
                    break;

                case "googJitterReceived":
                    obj.googJitterReceived = parseInt(value[type[0]]);
                    break;
                case "googRtt":
                    obj.googRtt = parseInt(value[type[0]]);
                    break;
            }
        }
        return obj;
    }


    getTxVideoStat = (pairs) => {
        let obj = {};
        obj.id = "txVideo";

        for(value of pairs){
            let type = Object.keys(value);

            switch(type[0]){
                case "googCodecName":
                    obj.googCodecName = value[type[0]];
                    break;
                    
                case "googEncodeUsagePercent":
                    obj.googEncodeUsagePercent = parseInt(value[type[0]]);
                    break;

                case "bytesSent":
                    obj.bytesSent= parseInt(value[type[0]]);
                    break;

                case "packetsLost":
                    packetLossForReceived = parseInt(value[type[0]]);
                    if(packetLossForReceived < 0)
                        packetLossForReceived = 0;
                    obj.packetsLost = packetLossForReceived;
                    break;

                case "packetsSent":
                    obj.packetsSent = parseInt(value[type[0]]);
                    break;

                case "googFrameHeightSent":
                    obj.googFrameHeightSent = parseInt(value[type[0]]);
                    break;

                case "googFrameRateSent":
                    obj.googFrameRateSent = parseInt(value[type[0]]);
                    break;

                case "googFrameWidthSent":
                    obj.googFrameWidthSent = parseInt(value[type[0]]);
                    break;

                case "googAdaptationChanges":
                    obj.googAdaptationChanges = parseInt(value[type[0]]);
                    break;

                case "googAvgEncodeMs":
                    obj.googAvgEncodeMs = parseInt(value[type[0]]);
                    break;

                case "googFirsReceived":
                    obj.googFirsReceived = parseInt(value[type[0]]);
                    break;

                case "googFrameHeightInput":
                    obj.googFrameHeightInput = parseInt(value[type[0]]);
                    break;

                case "googFrameRateInput":
                    obj.googFrameRateInput = parseInt(value[type[0]]);
                    break;

                case "googFrameWidthInput":
                    obj.googFrameWidthInput = parseInt(value[type[0]]);
                    break;
                case "googNacksReceived":
                    obj.googNacksReceived = parseInt(value[type[0]]);
                    break;

                case "googPlisReceived":
                    obj.googPlisReceived = parseInt(value[type[0]]);
                    break;

                case "googRtt":
                    rtt = parseInt(value[type[0]]);
                    if(rtt < 0)
                        rtt=0;
                    obj.googRtt = rtt;
                break;
            }
        }
        return obj;
    }

    getRxAudioStat = (pairs) => {
        let obj = {};
        obj.id = "rxAudio";

        for(value of pairs){
            let type = Object.keys(value)
            
            switch(type[0]){
                case "googCodecName":
                    obj.googCodecName = value[type[0]];
                    break;
                    
                case "audioOutputLevel":
                    obj.audioOutputLevel = parseInt(value[type[0]]);
                    break;

                case "bytesReceived":
                    obj.bytesReceived= parseInt(value[type[0]]);
                    break;

                case "packetsLost":
                    obj.packetsLost = parseInt(value[type[0]]);
                    break;

                case "packetsReceived":
                    obj.packetsReceived = parseInt(value[type[0]]);
                    break;

                case "googCaptureStartNtpTimeMs":
                    obj.googCaptureStartNtpTimeMs = Number(value[type[0]]);
                    break;

                case "googCurrentDelayMs":    
                    obj.googCurrentDelayMs = parseInt(value[type[0]]);
                    break;

                case "googDecodingCNG":
                    obj.googDecodingCNG = parseInt(value[type[0]]);
                    break;

                case "googDecodingCTN":
                    obj.googDecodingCTN = parseInt(value[type[0]]);
                    break;

                case "googDecodingCTSG":
                    obj.googDecodingCTSG = parseInt(value[type[0]]);
                    break;

                case "googDecodingNormal":
                    obj.googDecodingNormal = parseInt(value[type[0]]);
                    break;

                case "googDecodingPLC":
                    obj.googDecodingPLC = parseInt(value[type[0]]);
                    break;

                case "googDecodingPLCCNG":
                    obj.googDecodingPLCCNG = parseInt(value[type[0]]);
                    break;

                case "googExpandRate":
                    obj.googExpandRate = parseFloat(value[type[0]]);
                    break;

                case "googJitterBufferMs":
                    obj.googJitterBufferMs = Number(value[type[0]]);
                    break;

                case "googJitterReceived":
                    obj.googJitterReceived = parseInt(value[type[0]]);
                    break;

                case "googPreferredJitterBufferMs":
                    obj.googPreferredJitterBufferMs = parseInt(value[type[0]]);
                    break;
            }
        }
        return obj;
    }

    getRxVideoStat = (pairs) =>{
        let obj = {};
        obj.id = "rxVideo";

        for(value of pairs){
            let type = Object.keys(value);
            
            switch(type[0]){
                case "googCodecName":
                    obj.googCodecName = value[type[0]];
                    break;
                    
                case "googCurrentDelayMs":
                    obj.googCurrentDelayMs = parseInt(value[type[0]]);
                    break;

                case "bytesReceived":
                    obj.bytesReceived= parseInt(value[type[0]]);
                    break;

                case "packetsLost":
                    obj.packetsLost = parseInt(value[type[0]]);
                    break;

                case "packetsReceived":
                    obj.packetsReceived = parseInt(value[type[0]]);
                    break;

                case "googFrameHeightReceived":
                    obj.googFrameHeightReceived = parseInt(value[type[0]]);
                    break;

                case "googFrameRateReceived":
                    obj.googFrameRateReceived = parseInt(value[type[0]]);
                    break;

                case "googFrameWidthReceived":
                    obj.googFrameWidthReceived = parseInt(value[type[0]]);
                    break;

                case "CaptureStartNtpTimeMs":
                    obj.CaptureStartNtpTimeMs = parseInt(value[type[0]]);
                    break;

                case "googDecodeMs":
                    obj.googDecodeMs = parseInt(value[type[0]]);
                    break;

                case "googFirsSent":
                    obj.googFirsSent = parseInt(value[type[0]]);
                    break;

                case "googFrameRateDecoded":
                    obj.googFrameRateDecoded = parseInt(value[type[0]]);
                    break;

                case "googFrameRateOutput":
                    obj.googFrameRateOutput = parseInt(value[type[0]]);
                    break;

                case "googJitterBufferMs":
                    obj.googJitterBufferMs = parseInt(value[type[0]]);
                    break;

                case "googMaxDecodeMs":
                    obj.googMaxDecodeMs = parseInt(value[type[0]]);
                    break;

                case "googMinPlayoutDelayMs":
                    obj.googMinPlayoutDelayMs = parseInt(value[type[0]]);
                    break;

                case "googNacksSent":
                    obj.googNacksSent = parseInt(value[type[0]]);
                    break;

                case "googPlisSent":
                    obj.googPlisSent = parseInt(value[type[0]]);
                    break;

                case "googRenderDelayMs":
                    obj.googRenderDelayMs = parseInt(value[type[0]]);
                    break;

                case "googTargetDelayMs":
                    obj.googTargetDelayMs = parseInt(value[type[0]]);
                    break;
            }
        }
        return obj;
    }


    getGeneralStat = (pairs) => {

        let obj = {};
        obj.id = "General";
        
        for(value of pairs){
            let type = Object.keys(value);
            
            switch(type[0]){
                case "googAvailableReceiveBandwidth":
                    obj.googAvailableReceiveBandwidth = parseInt(value[type[0]]);
                    break;
                    
                case "googAvailableSendBandwidth":
                    obj.googAvailableSendBandwidth = parseInt(value[type[0]]);
                    break;

                case "googTransmitBitrate":
                    obj.googTransmitBitrate = parseInt(value[type[0]]);
                    break;

                case "packetsLost":
                    obj.packetsLost = parseInt(value[type[0]]);
                    break;

                case "googTargetEncBitrateCorrected":
                    obj.googTargetEncBitrateCorrected = parseInt(value[type[0]]);
                    break;

                case "googRetransmitBitrate":
                    obj.googTargetEncBitrateCorrected = parseInt(value[type[0]]);
                    break;

                case "googActualEncBitrate":
                    obj.googActualEncBitrate = parseInt(value[type[0]]);
                    break;
            }
        }
        return obj; 
    }


    parseSSRC = (values) => {
        for(value of values){
            let name = Object.keys(value)
            if(this.ssrcValues.indexOf(name[0]) != -1)
                return name;
        }        
    }

    parseReport = (reports) =>{

        let obj = null;
        for (report of reports) {

            let type = report.type;
                
            switch (type) {
                case 'ssrc': 
                    let key = this.parseSSRC(report.values);

                    if (key == 'googFrameRateReceived') {
                        obj = this.getRxVideoStat(report.values);

                    } else if (key == 'googFrameRateSent') {
                        obj = this.getTxVideoStat(report.values);

                    } else if (key == 'audioOutputLevel') {
                        obj = this.getRxAudioStat(report.values);

                    } else if (key == 'audioInputLevel') {
                        obj = this.getTxAudioStat(report.values);
                    } 
                    break;

                case 'VideoBwe':
                    obj = this.getGeneralStat(report.values);
                    break;
                
                case 'googCandidatePair': 
                    if (!this.isTurnIPAvailable) {
                        this.setTurnServerIP(report.values);
                    }
                    break;    
            }
            if (obj != null) {
                this.streamStatsGroup.push(obj);
                obj = null;
            }
        }
    }

    getAllStats = () =>{
        let data = {};
        for(value of this.streamStatsGroup){
            data[value.id] = value;
        }
        this.streamStatsGroup = [];
        return data;
    }


    getTurnServerIP = () => { 
        return this.turnServerIP;
    }

    setTurnServerIP = (pairs) => {
        let  serverIP = null;
        let isActive = false;
        let isRelay = false;

        for(value of pairs){
            let type = Object.keys(value);
            
            switch(type[0]){
                case "googActiveConnection":
                    if (value[type[0]] == 'true')
                        isActive =  true;

                case "googRemoteCandidateType":
                    if(value[type[0]] == 'relay') 
                        isRelay = true;

                case "googRemoteAddress":
                    serverIP = value[type[0]];
            }
        }
        if(isActive && isRelay)
        {
            isTurnIPAvailable = true;
            this.turnServerIP = serverIP;
        }
    }

    isTurnIPAvailable = () => {
        if(isTurnIPAvailable)
            return "true";
        else
            return "false";
    }
}
