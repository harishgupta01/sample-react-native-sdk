// Copyright 2018 Comcast Cable Communications Management, LLC

// RtcLogger.js : Javascript code for storing the logs

export default class RtcLogger {
    // Logger levels 
    static level = {
        NO_LOG:  0,
        ERROR:   1,
        WARNING: 2,
        INFO:    3,
        DEBUG:   4,
        VERBOSE: 5
    };

    static currentLevel = RtcLogger.level.VERBOSE;

    // Set logger level
    static setLogLevel(logLevel){
        RtcLogger.currentLevel = logLevel;
    }

    static Error(tag, msg, obj) {
        if(RtcLogger.currentLevel >= 1 && RtcLogger.currentLevel != 0)
            console.error(tag + " :: " + msg + " ", obj ? JSON.stringify(obj) : "");
    }
    static Warning(tag, msg, obj)  {
        if(RtcLogger.currentLevel >= 2 && RtcLogger.currentLevel != 0)
            console.warn(tag + " :: " + msg + " ", obj ? JSON.stringify(obj) : "");
    } 
    
    static Info(tag, msg, obj) {
        if(RtcLogger.currentLevel >= 3 && RtcLogger.currentLevel != 0)
            console.info(tag + " :: " + msg + " ", obj ? JSON.stringify(obj) : "");
    }
    
    static Debug(tag, msg, obj)  {
        if(RtcLogger.currentLevel >=4 && RtcLogger.currentLevel != 0)
            console.debug(tag + " :: " + msg + " ", obj ? JSON.stringify(obj) : "");  
    }

    static Verbose(tag, msg, obj)  {
        if(RtcLogger.currentLevel >= 5 && RtcLogger.currentLevel != 0)
            console.log(tag + " :: " + msg + " ", obj ? JSON.stringify(obj) : "");
    }
    
}
