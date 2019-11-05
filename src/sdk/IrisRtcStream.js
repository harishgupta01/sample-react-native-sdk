// Copyright 2018 Comcast Cable Communications Management, LLC

// IrisRtcStream.js : Javascript code for creating audio and video streams

// Import the modules
var rtcConfig = require('./RtcConfig.js');
import {mediaDevices} from 'react-native-webrtc';
import logger from './RtcLogger'

const Tag = "IrisRtcStream";
const MIN_WIDTH = 500;
const MIN_HEIGHT = 300;
const MIN_FRAMERATE = 30;
/**
 * Constructor for IrisRtcStream<br/>
 * This class maintains Iris APIs used to create local video and audio tracks. When new IrisRtcSession is created
 * Iris streams are associated with the session.
 * @constructor
 */
function IrisRtcStream() {
    this.localStream = null;

}

/**
 * This API is called to create local streams based on the streamConfig set by the user <code>streamConfig</code> is a json object.
 * Client can either set the Media Constraints with <code>streamConfig.constraints</code> or just 
 * set the type of the strem he wants <code>streamConfig.streamType</code> as "audio" or "video".<br/>
 * Client can also set few other parameters if streamType is used like resloution, bandwidth and fps.
 * @param {json} streamConfig  - Stream config json example as mentioned
 * @param {string} streamConfig.streamType - Type of stream audio or video
 * @param {string} streamConfig.resolution - Resolution for the video
 * @param {string} streamConfig.fps - Frames per second
 * @param {json} streamConfig.constraints - Media constraints for audio and video
 * @param {string} streamConfig.constraints.audio - Media constraints for audio
 * @param {string} streamConfig.constraints.video - Media constraints for video
 * @param {string} streamConfig.screenShare - True if it is a screen share call
 * @public
 */
IrisRtcStream.prototype.createStream = function(streamConfig) {

    // assign self
    var self = this;

    if (!streamConfig || (!streamConfig.streamType && !streamConfig.constraints) ||
        (!streamConfig.constraints && (streamConfig.streamType != "videocall" && streamConfig.streamType != "pstncall")) ||
        (!streamConfig.streamType && (streamConfig.constraints && !streamConfig.constraints.video && !streamConfig.constraints.audio))) {
        logger.Error(Tag, "Inavlid parameters");
        this.onStreamError(RtcErrors.ERR_INCORRECT_PARAMETERS, "Invalid parameters");
        return;
    }

    logger.Info(Tag, "CreateStream with streamConfig ", streamConfig);

    self.streamConfig = streamConfig;
    try {
        // Save the stream config in rtcConfig
        rtcConfig.streamConfig = streamConfig;

        // Get media constraints required to getUserMedia 
        var constraints = getMediaConstraints(streamConfig);
        if (!constraints) {
            logger.Error(Tag, "Inavlid parameters");
            this.onStreamError(RtcErrors.ERR_INCORRECT_PARAMETERS, "Invalid parameters");
            return;
        }

        logger.Info(Tag, "getUserMedia with constraints ", constraints);

        // Call getusermedia
        return getUserMedia(streamConfig).then(function(stream) {
            logger.Info(Tag, "getUserMedia Success with constraints " , constraints);

            if (stream) {
                // Mute the stream before it is being sent to client
                if (streamConfig.startMutedStream) {

                    logger.Info(Tag, "Stream is started with mute enabled ");

                    if (stream.getVideoTracks() && stream.getVideoTracks().length >= 1)
                        stream.getVideoTracks()[0].enabled = false;
                    if (stream.getAudioTracks() && stream.getAudioTracks().length >= 1)
                        stream.getAudioTracks()[0].enabled = false;
                }

                self.localStream = stream;

                // Callback for local stream created
                self.onLocalStream(stream);
                self.onStreamEndedListener(stream);
                return stream;
            }
        }).catch(function(error) {
            logger.Error(Tag, "getUserMedia :: Error :: ", error);
            self.onStreamError(RtcErrors.ERR_CREATE_STREAM_FAILED,
                "Failed to create stream");
        });
    } catch (error) {
        logger.Error(Tag, "Failed to create a local stream ", error);
        self.onStreamError(RtcErrors.ERR_CREATE_STREAM_FAILED,
            "Failed to create stream");
    }
};

/**
 * Get the media constraints
 * @private
 */
function getMediaConstraints(streamConfig) {
    var constraints = { audio: false, video: false };

    //Check for streamConfig availability
    if (!streamConfig) {
        logger.Error(Tag, "StreamConfig is required to create rtc stream");
        return;
    }

    if (streamConfig.constraints) {
        if (streamConfig.constraints.video || streamConfig.constraints.audio) {
            constraints = streamConfig.constraints;

            if (streamConfig.constraints.video) {
                setParamsToConstraints(streamConfig, constraints);
            }

            return constraints;
        } else {
            logger.Error(Tag, "Invalid constraints in streamConfig " , streamConfig);
        }
    } else if (streamConfig.streamType) {
        if (streamConfig.streamType == "video") {
            constraints.video = { mandatory: {}, optional: [] };
            constraints.audio = { mandatory: {}, optional: [] };

            if (constraints.video) {
                setParamsToConstraints(streamConfig, constraints);
            }

        } else if (streamConfig.streamType == "audio") {
            constraints.video = false;
            constraints.audio = true;
        }
        return constraints;
    } else {
        logger.Error(Tag, "Invalid streamConfig received " , streamConfig);
        return;
    }
}

/**
 * 
 * @param {json} streamConfig 
 * @param {json} constraints 
 * @private
 */
function setParamsToConstraints(streamConfig, constraints) {

    //Set the required resolution
    if (streamConfig.resolution) {
        _setResolution(constraints, streamConfig.resolution);
    }

    // Set required bandwidth
    if (streamConfig.bandwidth) {
        _setBandwidth(constraints, streamConfig.bandwidth);
    }

    // Set required frames per second
    if (streamConfig.fps) {
        _setFPS(constraints, streamConfig.fps);
    }
}

/**
 * Gets local media stream 
 * @param {json} constraints - get user media constraints for 
 * @private
 */
function getUserMedia(constraints) {
    try {
        logger.Verbose(Tag, "getUserMedia");           

        if(constraints.streamType == "videocall"){
           
            return new Promise(function(resolve, reject) {                
                let isFront = true;
                mediaDevices.enumerateDevices().then(sourceInfos => {
                    logger.Info(Tag, 'Source Info', sourceInfos);
                    let videoSourceId;
                    for (let i = 0; i < sourceInfos.length; i++) {
                      const sourceInfo = sourceInfos[i];
                      if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                        videoSourceId = sourceInfo.id;
                      }
                    }
                    
                    if(constraints.streamConfig == null){
                        constraints.streamConfig = {};
                        constraints.streamConfig.minWidth = MIN_WIDTH; 
                        constraints.streamConfig.minHeight = MIN_HEIGHT;
                        constraints.streamConfig.minFrameRate = MIN_FRAMERATE;
                    }
                    mediaDevices.getUserMedia({
                      audio: true,
                      video: {
                        mandatory: {
                          minWidth: constraints.streamConfig.minWidth, // Provide your own width, height and frame rate here
                          minHeight: constraints.streamConfig.minHeight,
                          minFrameRate: constraints.streamConfig.minFrameRate
                        },
                        facingMode: (isFront ? "user" : "environment"),
                        optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
                      }
                    })
                      .then(stream => {
                     //   logger.Info(Tag, 'got Stream', stream)
                       // track = new MediaStreamTrack(stream['_tracks'][1])
                        logger.Info(Tag, 'Track ' , stream.getAudioTracks())
                        resolve(stream); 
                      })
                      .catch(error => {
                        reject("Failed to get media streams ", error);
                      });
                  });
            });
        }else{
            return new Promise(function(resolve, reject) {
                mediaDevices.getUserMedia({
                    audio: true
                }).then(stream => {
                        logger.Info(Tag, 'Audio track' , stream.getAudioTracks());   
                        resolve(stream);    
                   })
                   .catch(error => {    
                         reject("Failed to get media streams ", error);   
                    });
    
                // WebRTC.getUserMedia(constraints, function(stream) {
                //     if (stream) {
                //         resolve(stream);
                //     }
                // }, function(err) {
                //     reject("Failed to get media streams ", err);
                // });
            });
        }
       
    } catch (error) {
        logger.Error(Tag, "Failed to getUserMedia ", error);
        self.onStreamError(RtcErrors.ERR_CREATE_STREAM_FAILED,
            "Failed to create stream");

    }
};

/**
 * Called when a local stream is created.
 * @param {object} stream - local stream 
 * @public
 */
IrisRtcStream.prototype.onLocalStream = function(stream) {
  
};

/**
 * This callback is called if stream creation is failed
 * @public
 */
IrisRtcStream.prototype.onStreamError = function(errorCode, errorMessage) {

}

/**
 * @private
 */
IrisRtcStream.prototype.onStreamEndedListener = function(stream) {
    var self = this;
    try {
        if (stream.getVideoTracks() && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].onended = function() {
                console.info("Video Stream is stopped");
                self.irisVideoStreamStopped();
            };
        }
        if (stream.getAudioTracks() && stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].onended = function() {
                console.info("Audio Stream is stopped");
                self.irisAudioStreamStopped();
            };
        }
    } catch (error) {
        logger.Error(Tag, " onStreamEndedListener ", error);
    }
};

/**
 * Callback when iris video stream is stopped
 * @private
 */
IrisRtcStream.prototype.irisVideoStreamStopped = function() {
    logger.Info(Tag, "Stream is stopped");
};

/**
 * Callback when iris audio stream is stopped
 * @private
 */
IrisRtcStream.prototype.irisAudioStreamStopped = function() {
    logger.Info(Tag, "Stream is stopped");
};

/**
 * This API stops the given media stream
 * @param {object} mediaStream - Stream to be stopped
 * @public
 */
IrisRtcStream.prototype.stopMediaStream = function(mediaStream) {
    try {
        if (!mediaStream) {
            logger.Error(Tag,"MediaStream is null");
            this.onStreamError(RtcErrors.ERR_API_PARAMETERS, "Media stream is null");
            return;
        }

        logger.Info(Tag, "stopMediaStream");

        mediaStream.getTracks().forEach(function(track) {
            track.stop();
        });
    } catch (error) {
        logger.Info(Tag, "stopMediaStream", error);
        if (mediaStream.stop) {
            mediaStream.stop();
        }
    }

    if (mediaStream.stop) {
        mediaStream.stop();
    }
};

/** 
 *  Mute or Unmute the local video
 * @private
 */
IrisRtcStream.prototype.videoMuteToggle = function() {
    try {
        var self = this;

        if (self.localStream && self.localStream.getVideoTracks() && self.localStream.getVideoTracks().length > 0) {
            this.isVideoMuted = this.localStream.getVideoTracks()[0].enabled;
            logger.Info(Tag, "isVideoMuted : " + this.isVideoMuted);
            if (this.isVideoMuted) {
                this.localStream.getVideoTracks()[0].enabled = false;
            } else {
                this.localStream.getVideoTracks()[0].enabled = true;
            }
        }
    } catch (error) {
        logger.Error(Tag, "videoMuteToggle failed : ", error);
    }
};

/**
 * Mute or Unmute the local audio
 * @private
 */
IrisRtcStream.prototype.audioMuteToggle = function() {
    try {
        var self = this;

        if (self.localStream && self.localStream.getAudioTracks() && self.localStream.getAudioTracks().length > 0) {
            this.isAudioMuted = this.localStream.getAudioTracks()[0].enabled;
            logger.Info(Tag, "isAudioMuted : " + this.isAudioMuted);
            if (this.isAudioMuted) {
                this.localStream.getAudioTracks()[0].enabled = false;
            } else {
                this.localStream.getAudioTracks()[0].enabled = true;
            }
        }
    } catch (error) {
        logger.Error(Tag, "audioMuteToggle failed : ", error);
    }
};


/**
 * Set the required resolution before calling getUserMedia
 * @private
 */
function _setResolution(constraints, resolution) {

    if (Resolutions[resolution]) {
        constraints.video.mandatory.minWidth = Resolutions[resolution].width;
        constraints.video.mandatory.minHeight = Resolutions[resolution].height;
    }

    if (constraints.video.mandatory.minWidth) {
        constraints.video.mandatory.maxWidth = constraints.video.mandatory.minWidth;
    }

    if (constraints.video.mandatory.minHeight) {
        constraints.video.mandatory.maxHeight = constraints.video.mandatory.minHeight;
    }

}


/**
 * Set the bandwidth
 * @private 
 */
function _setBandwidth(constraints, bandwidth) {
    if (bandwidth) {
        if (!constraints.video) {
            constraints.video = { mandatory: {}, optional: [] };
        }
        constraints.video.optional.push({ bandwidth: bandwidth });
    }
}

/**
 * Set the frames per second(FPS)
 * @private
 */
function _setFPS(constraints, fps) {
    if (fps) {
        if (!constraints.video) {
            // same behaviour as true;
            constraints.video = { mandatory: {}, optional: [] };
        }
        constraints.video.mandatory.minFrameRate = fps;
    }
}

/**
 * Get the media devices
 * @public
 */
IrisRtcStream.getMediaDevices = function() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        logger.Error(Tag, " getMediaDevices :: enumerateDevices not supported", error);

        return;
    }
    return new Promise(function(resolve, reject) {
        navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                resolve(devices);
            })
    })

};

IrisRtcStream.prototype.getMediaDevices = IrisRtcStream.getMediaDevices;

// Defining the API module

module.exports = IrisRtcStream;
