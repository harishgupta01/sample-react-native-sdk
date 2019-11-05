export class RtcRoomInfo{
    constructor(){
        this.targetJid = null;
        this.jingleSid = null;
        this.participantTarjetJid = null;
        this.traceId = null;
        this.rtcServer = null;
        this.participantMap = new Map();
        this.toRoutingId = null;
        this.activeSessions = [];
        this.event = null;
    }

    setTargetJid(targetJid){
        this.targetJid = targetJid;
    }

    getTargetJid(){
        return this.targetJid;
    }

    setJingleSid(jingleSid){
        this.jingleSid = jingleSid;
    }

    getJingleSid(){
        return this.jingleSid;
    }

    setTraceId(traceId){
        this.traceId = traceId;
    }

    getTraceId(traceId){
        return this.traceId;
    }

    setParticipantTargetJid(participantTarjetJid){
        this.participantTarjetJid = participantTarjetJid;
    }

    getparticipantTarjetJid(){
        return this.participantTarjetJid;
    }

    getAllParticipants(){
        return this.participantMap;
    }

    addSession(roomSession){
        this.activeSessions.push(roomSession);
    }

    setEvent(event){
        this.event = event;
    }

    getEvent(){
        return this.event;
    }

    setRtcServer(rtcServer){
        this.rtcServer = rtcServer;
    }

    getRtcServer(){
        return this.rtcServer;
    }

}