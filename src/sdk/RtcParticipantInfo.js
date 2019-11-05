class RtcParticipantInfo{
    static sharedInstance = null
    userId = null;
    irisToken = null;
    routingId = null;
    jid = null;
    sourceNumber = null;
    targetNumber = null;
    websocketServer = null;
    turnServers = null;
    networkType = 'none'

    static state = {
        CONNECTING: "CONNECTING",
        CONNECTED: "CONNECTED",
        CONNFAIL:"CONNFAIL",
        DISCONNECTING:"DISCONNECTING",
        DISCONNECTED: "DISCONNECTED",
        LOGOUT:"LOGOUT",
    };

    static rtcConnectionState = RtcParticipantInfo.state.DISCONNECTED;

    static getSharedInstance(){
        if(RtcParticipantInfo.sharedInstance == null){
            RtcParticipantInfo.sharedInstance = new RtcParticipantInfo();
            RtcParticipantInfo.sharedInstance.rtcConnectionState = RtcParticipantInfo.state.DISCONNECTED
        }
        return RtcParticipantInfo.sharedInstance 
    }
    getRtcConnectionState(){
        return this.rtcConnectionState
    }
    setRtcConnectionState(state){
        this.rtcConnectionState = state
    }
    getNetworkType(){
        return this.networkType;
    }
    setNetworkType(type){
        this.networkType = type;
    }
    getUserId(){
        return this.userId
    }
    setUserId(id){
        this.userId = id
    }
    getIrisToken(){
        return this.irisToken
    }
    setIrisToken(token){
        this.irisToken = token
    }
    getRoutingId(){
        return this.routingId;
    }
    setRoutingId(id){
        this.routingId = id;
    }
    getJid(){
        return this.jid
    }
    setJid(jid){
        this.jid = jid
    }
    getUserNumber(){
        return this.userNumber
    }
    setUserNumebr(number){
        this.userNumber = number
    }
    getWebsocketServer(){
        return this.websocketServer;
    }
    setWebsocketServer(server){
        this.websocketServer = server;
    }
    getTurnServers(){
         return this.turnServers;
    }
    setTurnServers(turnServer){
         this.turnServers = turnServer;
    }
    setSourceNumber(num){
        this.sourceNumber = num;
    }
    getSourceNumber(){
        return this.sourceNumber;
    }
    setTargetNumber(num){
        this.targetNumber = num;
    }
    getTargetNumber(){
        return this.targetNumber;
    }
}

export default RtcParticipantInfo
