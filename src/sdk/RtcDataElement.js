

    
export default class RtcDataElement {
    
    roomId = null;
    traceId = null;
    userData = null;
    callType = null;
    fromRId = null;
    targetRId = null;
    roomToken = null;
    rootNodeId = null;
    childNodeId = null;
    rtcServerUrl = null;
    roomTokenExpiryTime = null;
    eventType = null;
    static wsHostUrl = null;

     constructor(responseData){
        this.rootNodeId = responseData.root_node_id;
        this.childNodeId = responseData.child_node_id;
        this.roomId = responseData.eventdata.room_id; 
        this.traceId = responseData.eventdata.trace_id;
        this.roomToken = responseData.eventdata.room_token;
        this.rtcServerUrl = responseData.eventdata.rtc_server;
        this.targetRId = responseData.eventdata.to_routing_id;
        this.fromRId = responseData.eventdata.from_routing_id;
        this.roomTokenExpiryTime = responseData.eventdata.room_token_expiry_time;
       
     }

    //JID value
    /*static setJId(jId) {
        this.jId = jId;
    }

    static getJId() {
        return this.jId;
    }*/

    //Incoming or Outgoing
    setCallType(type) {
        this.callType = type;
    }

    getCallType() {
        return this.callType;
    }

    //Room id
     setRoomId(mRoomId) {
        this.roomId = mRoomId;
    }
    
     getRoomId() {
        return this.roomId;
    }

    //Trace id
     setTraceId(traceId) {
        this.traceId = traceId;
    }
    
     getTraceId() {
        return this.traceId;
    }
    
    //Host server details
    static setHostUrl(hostUrl) {
        wsHostUrl = hostUrl;
    }

    static getHostUrl() {
        return wsHostUrl;
    }

    //User data
     setUserData(userdata) {
        this.userData = userdata;
    }

     getUserdata() {
        return this.userData;
    }

    //Event type
    setEventType(eventType) {
         this.eventType = eventType;
    }

     getEventType() {
        return this.eventType;
    }

    //Target routing id
     setTargetRId(targetRId) {
        this.targetRId = targetRId;
    }

     getTargetRId() {
        return this.targetRId;
    }

    //Room token 
     setRoomToken(roomToken) {
        this.roomToken = roomToken;
    }

     getRoomToken() {
        return this.roomToken;
    }

    //RTC server details
     setRtcServerUrl(rtcServerUrl) {
        this.rtcServerUrl = rtcServerUrl;
    }

     getRtcServerUrl() {
        return this.rtcServerUrl;
    }

    //Room token expiry
     setRoomTokenExpiryTime(roomTokenExpiryTime) {
         this.roomTokenExpiryTime = roomTokenExpiryTime;
    }

     getRoomTokenExpiryTime() {
        return this.roomTokenExpiryTime;
    }

    getFromRId(){
        if(this.fromRId != null)
            return this.fromRId
    }

    toRoutingid(){
        var fromRoutingid = this.fromRId.split("@");     
        let data = window.Strophe.xmlElement("data",[
            ["xmlns","urn:xmpp:comcast:info"],
            ["event",this.getEventType()],
            ["traceid",this.getTraceId()],
            ["roomtoken",this.getRoomToken()],
            ["rootnodeid",this.rootNodeId],
            ["childnodeid",this.childNodeId],
            ["roomtokenexpirytime",this.getRoomTokenExpiryTime()],
            ["host", wsHostUrl],
            ["toroutingid", this.targetRId],
            ["appdomain", fromRoutingid[1]]]);
    
        return data
    }    

    toXML(){
        let data = window.Strophe.xmlElement("data",[
            ["xmlns","urn:xmpp:comcast:info"],
            ["event",this.getEventType()],
            ["traceid",this.getTraceId()],
            ["roomtoken",this.getRoomToken()],
            ["rootnodeid",this.rootNodeId],
            ["childnodeid",this.childNodeId],
            ["roomtokenexpirytime",this.getRoomTokenExpiryTime()],
            ["host", wsHostUrl],
            ["userdata", this.getUserdata()]]);
    
        return data
    }

    //Return event data for sending stats
    eventData(){
        let data = {
            "roomId": this.roomId,
            "routingId": this.fromRId,
            "traceid": this.traceId,
            "callType": "videobridge",
            "sessionType": this.eventType,
        };
        return data;
    }

    getStreamInfo(){
        let data = {
            roomId : this.roomId,
            callType : this.eventType,
            routingId : this.fromRId,
            XMPPServer : wsHostUrl,
            callDirection : this.callType
        }
        return data;
    }

}
