// Copyright 2018 Comcast Cable Communications Management, LLC

// RtcRestHelper.js : Javascript code for making rest calls to backend

var Rtcconfig = require('../../sdk/RtcConfig.js');
var logger = require('../../sdk/RtcLogger.js');
import EventConfig from "./EnvConfig";

// Defining the API module  
var RtcRestHelper = module.exports;

/**
 * @namespace
 */
RtcRestHelper.EventManager = {
   
    /**
     * Makes a call to EVM to get RTC server and roomtoken details
     * @param {json} config - Config from session
     * @param {function} successCallback - 
     * @param {function} failureCallback - 
     */
     /*sendStartMuc: function(config, successCallback, failureCallback) {
        
            const JwtToken = 'Bearer '+ await AsyncStorage.getItem('irisToken');       

            var url = EventConfig.EVENT_MANAGER_URL+'/v1.1/pstn/startmuc/federation/pstn';

            var requestpayload = {};

            var timestamp = Math.floor(Date.now() / 1000);

            requestpayload["time_posted"] = timestamp;
            if(config.type = "pstn"){
                requestpayload["event_type"] = "pstncall";
            }            
            requestpayload["from"] = config.fromTN;
            requestpayload["to"] = config.toTN;
            requestpayload["inbound"] = false ;
            requestpayload["userdata"] = config.notificationpayload ;

            let requestdata = JSON.stringify(requestpayload);

            console.log("Create room request----",url,requestdata,JwtToken,traceId);

            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': JwtToken,
                    'Trace-Id': traceId,
                },
                body: utf8Encode(requestdata),

            }).then(response => {

                console.log("Status code : "+ response.status)

                if(response.headers.get("Content-Type") == 'application/json'){
                    console.log("Event manager response : Status code ::"+ response.status);
                    return response.json();
                }else{
                    console.log("Event Manager : Failed to obtain muc response : ");
                    //   ntmResponse('Failure');
                    return failureCallback("Event Manager : Failed to obtain muc response : ")
                }
            }).then(responseJson => {

                console.log("got response ",responseJson);
                if(responseJson.error){
                    console.log("Failed to obtain mucid : " + responseJson.error.code + " message : " + responseJson.error.message);
                    return failureCallback("Failed to obtain mucid : " + responseJson.error.code + " message : " + responseJson.error.message)
                }else{
                    console.log("got response");
                    return successCallback(responseJson)
                }
            }).catch((error) => {
                console.log('Got Error '+ error);
                return failureCallback(error)
            }); 
                   
    }*/
}
