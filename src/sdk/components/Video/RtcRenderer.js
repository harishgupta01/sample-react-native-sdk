import React from 'react';
import { Platform, StyleSheet, Text, View, TouchableHighlight, StatusBar, Dimensions, Image, ViewPropTypes } from 'react-native';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    sourceInfo,
  } from 'react-native-webrtc';
  import PropTypes from 'prop-types';
  import defaultStyle from '../../Styles/VideoViewStyle';

export default class RtcRenderer extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            callViewStyle: defaultStyle(),          
            stream: null,
            zOrderVal:0,
            viewConfig: null
        }
    }

    static propTypes = {
        stream: PropTypes.object.isRequired,
        rendererConfig : ViewPropTypes.style            
    }

    //Executed before render
    componentWillMount(){
        this.setState({
            stream: this.props.stream
                              
        });

        if(this.props.rendererConfig != null){
            this.setState({
                viewConfig : this.props.rendererConfig,
                zOrderVal: this.props.rendererConfig.zOrder
                                  
            });
          
        }else{       
            zOrderVal = 1;
            viewConfig = this.state.callViewStyle.videoContainer;
        }
    }

    render() {
    
        return(     
             <RTCView streamURL={this.state.stream.toURL()} zOrder={this.state.zOrderVal} style={this.state.viewConfig} />          
          )          
      }

}