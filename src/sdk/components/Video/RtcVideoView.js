import React from 'react';
import { Platform, StyleSheet, Text, View, TouchableHighlight, StatusBar, Dimensions, Image, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import defaultStyle from '../../Styles/VideoViewStyle';
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
import RtcRenderer from "./RtcRenderer";
const deviceWidth = Dimensions.get('window').width;

export default class RtcVideoView extends React.Component {
    constructor(Props) {
        super(Props)
        this.state = {
          callViewStyle: defaultStyle(),          
          remoteVideoURL: null, 
          inRoom : '',          
          faceCamera: false,
          speakerStatus: false,
          muteStatus: false,
          videoStatus: false,
          holdStatus : false
        }
      }

    static propTypes = {
        videoViewTheme: ViewPropTypes.style,
        onEndPressed: PropTypes.func.isRequired,      
        onMute : PropTypes.func.isRequired,              
        localVideo: PropTypes.object,
        remoteVideo: PropTypes.object,
        onFlip : PropTypes.func.isRequired,
        onShutter : PropTypes.func.isRequired,
        onLocalStream : PropTypes.bool,
        onRemoteStream : PropTypes.bool     
    }
    static navigationOptions = {
        headerTitle: 'Video Only Stream',
        headerTitleStyle: { color: 'white' },
        headerStyle: { backgroundColor: 'black' },
        headerTintColor: 'white'
    }

    static getDerivedStateFromProps(nextProps, prevState){
      if(nextProps.videoViewTheme != undefined){
          return {  callViewStyle: nextProps.videoViewTheme};
     }
     return null;
    }

    componentDidMount() {        
       
    }     
    endSession = () => {      
        this.props.onEnd();
    }  

    _cameraFlip() {
       this.props.onFlip();      
    }
    
    _muteVideo() { 
        if(this.state.videoStatus){
          this.setState({videoStatus:false});
        }else{
          this.setState({videoStatus:true});
        }
          this.props.onShutter();     
    }
    
    _muteAudio() { 

        if(this.state.muteStatus){
          this.setState({muteStatus:false});
        }else{
          this.setState({muteStatus:true});
        }
        
        this.props.onMute();       
    }
    
    _hold() {        
    }
    
    _endCall= ()=>{  
        this.props.onEndPressed();   
    }

    renderlocalStream() {        
         if(this.props.onLocalStream){ 
           if(this.props.localVideo != null){
            return(
              <View style={this.state.callViewStyle.localStreamContainer}>
                <RtcRenderer stream = {this.props.localVideo} rendererConfig = {this.state.callViewStyle.localVideoContainer}></RtcRenderer>
              </View>
            )
           }      
          
         }
       }

    renderRemoteStream() {
        if(this.props.onRemoteStream){ 
          return(
              <RtcRenderer stream = {this.props.remoteVideo} rendererConfig = {this.state.callViewStyle.remoteVideoContainer}></RtcRenderer>
          )
        }
    }

    render() {
        return (
          <View style={this.state.callViewStyle.container}>
            <StatusBar style={[this.state.callViewStyle.statusbarstyle]} />
            <View style={[this.state.callViewStyle.mainContainer]}>
              <View style={[this.state.callViewStyle.streamContainer]}>
                    {this.renderRemoteStream()}           
                    {this.renderlocalStream()}                  
              </View>
    
              <View style={[this.state.callViewStyle.callFeaturesContainer]}>
                <View style={[this.state.callViewStyle.callOptionViewContainer]}>    
                  <View style={[this.state.callViewStyle.callOptionView]}>
                    <View style={this.state.callViewStyle.buttonContainer}>
                      <View style={this.state.callViewStyle.imageContainer}>
                        <TouchableHighlight onPress={this._cameraFlip.bind(this)} underlayColor='transparent' >
                          <Image
                            style={this.state.callViewStyle.imageStyles}
                            source={this.state.faceCamera === false ?
                              require('./../../Assets/camera_rotate_inactive.png') :
                              require('./../../Assets/camera_rotate_active.png')}
                          />
                        </TouchableHighlight>
                        <Text style={this.state.callViewStyle.texStyle}>{this.state.faceCamera === true ? 'Front' : 'Back'}</Text>
                      </View>
                    </View>
                    <View style={this.state.callViewStyle.buttonContainer}>
                      <View style={this.state.callViewStyle.imageContainer}>
                        <TouchableHighlight onPress={this._muteAudio.bind(this)} underlayColor='transparent' >
                          <Image
                            style={[this.state.callViewStyle.imageStyles]}
                            source={this.state.muteStatus === false ?
                              require('./../../Assets/mute_inactive.png') :
                              require('./../../Assets/mute_active.png')}
                          />
                        </TouchableHighlight>
                        <Text style={this.state.callViewStyle.texStyle}>{this.state.muteStatus === true ? 'unmute' : 'mute'}</Text>
                      </View>
                    </View>
                    <View style={this.state.callViewStyle.buttonContainer}>
                      <View style={this.state.callViewStyle.imageContainer}>
                        <TouchableHighlight onPress={this._muteVideo.bind(this)} underlayColor='transparent' >
                          <Image
                            style={this.state.callViewStyle.imageStyles}
                            source={this.state.videoStatus === false ?
                              require('./../../Assets/video_off_inactive.png') :
                              require('./../../Assets/video_off_active.png')} />
                        </TouchableHighlight>
                        <Text style={this.state.callViewStyle.texStyle}>{this.state.videoStatus === true ? 'videoOn' : 'videoOff'}</Text>
                      </View>
                    </View>                 
                  </View>
                </View>
              </View>
            </View>
    
            <View style={this.state.callViewStyle.endcallbuttonContainer}>
              <View style={this.state.callViewStyle.endCallcontainer}>
                <View style={this.state.callViewStyle.endCall}>
                  <Text onPress={this._endCall} style={this.state.callViewStyle.endCallbuttonText}>End Call</Text>
                </View>
              </View>
            </View>
          </View >
        );
    }
}

