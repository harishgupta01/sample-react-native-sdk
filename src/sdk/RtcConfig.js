// Copyright 2018 Comcast Cable Communications Management, LLC

// RtcConfig.js : Javascript code for storing config

/**
 * User Config for Connection
 * @namespace
 */
var RtcConfig = module.exports;

// Config json
RtcConfig.json = {
    urls: {
        /*PROD URLs*/
        /*appServer: '',
        authManager: '',
        idManager: '',
        eventManager: '',
        notificationManager: '',*/

        /*Stats Server*/
        // UEStatsServer: '',
    },
    pingInterval: 3000,
    pingCounter: 3,
    pingPongInterval: 3000,
    presInterval: 10000,
    presMonitorInterval: 10000,
    reconnectInterval: 10000,
    statsInterval: 10000,
    useAnonymousLogin: false,
    useBridge: true, // for p2p flow set this flag to false
    logLevel: 4, // 0: NO_LOG, 1: Error, 2: Warning, 3: Info, 4: Verbose 
    channelLastN: "-1",
    sdkVersion: '0.0.4',
    packagename: "com.comcast.irisrefclient",
}

/**
 * API to update the standard config for Connection
 * @param {json} userConfig                             - (MANDATORY) A JSON object with all the mandatory and optional parameters
 * @param {json} userConfig.urls                        - (MANDATORY) A JSON with object with the urls
 * @param {string}  userConfig.urls.eventManager        - (MANDATORY) Event Manager FQDN
 * @param {string}  userConfig.urls.UEStatsServer       - (OPTIONAL) Stats Server FQDN
 * @param {boolean}  userConfig.useAnonymousLogin       - (MANDATORY) `true` anonymous calls and `false` for non-anonymous calls
 * @param {integer} userConfig.logLevel                 - (MANDATORY) Integer value for setting log level. `0: Error, 1: Warning, 2: Info, 3: Verbose`
 * @param {integer} userConfig.reconnectInterval        - (OPTIONAL) Time interval in milliseconds for retrying failed connection
 * @public
 */
RtcConfig.updateConfig = function updateConfig(userConfig) {

    // Go through hashmap
    for (key in userConfig) {
        RtcConfig.json[key] = userConfig[key];
    }
}
