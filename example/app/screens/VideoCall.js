
import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, Button, Keyboard, View} from 'react-native';
import {RtcVideoCall} from "rtc-react-native-sdk";
import RectangularButton from "../common/RectangularButton";
import UserInfo from '../screens/login/UserInfo';

export default class VideoCall extends Component{
    
    constructor(props) {
        super(props);        
        this.state = {           
            targetemailId: '', 
            onCreate: false   
        }
    }

    componentDidMount() {
         
    }

    onEndCall() {  
        this.props.navigation.navigate('DashBoard');
    }

    onParticipantJoined(data){
        console.log("call id "+data.callId+"participant info"+data.participantInfo.id)
    }
    
    onLocalStream(data){
        
    }

    onRemoteStream(data){
        
    } 

    onSdkEvents(data){
        console.log("callid"+data.callId+"status"+data.status)        
    }

    onError(data){
        console.log("onerror "+data.code+"status"+data.reason)
    }

    render() {
        const { navigation } = this.props;       
        if(navigation.getParam('mode') == "Incoming" || this.state.onCreate == true){            
           const mode = navigation.getParam('mode', 'Outgoing');
           var Payload = navigation.getParam('notificationPayload', {}); 
           Payload.sessionType = "videocall";         
           const config = { "irisToken": UserInfo.getSharedInstance().getIrisToken(), 
                           "routingId":UserInfo.getSharedInstance().getRoutingId(),
                           targetEmailId: this.state.targetemailId}
        //   const streamconfig = {'minWidth': 500, 'minHeight': 300 , 'minFrameRate': 30};
            return(
                <RtcVideoCall config = {config} mode = {mode} notificationPayload = {Payload}  onParticipantJoined = {this.onParticipantJoined.bind(this)} onLocalStream = {this.onLocalStream.bind(this)} onRemoteStream = {this.onRemoteStream.bind(this)} onCallStatus = {this.onSdkEvents.bind(this)} onError = {this.onError.bind(this)} onEnd = {this.onEndCall.bind(this)}/>
            );
        }
        else{           
            return(          
                <View style={styles.container}>
                    <Text style={styles.textinput}>
                        Enter email ID for the contact you wish to call:{'\n'}
                    </Text>
                    <TextInput 
                        style={styles.targetid_style}                   
                        onChangeText={(text) => this.setState({targetemailId:text})}
                        value={this.state.text}
                        autoCapitalize="none"                   
                    />
                    <RectangularButton style={styles.button} handleOnPress={() => {this.setState({onCreate:true})}}
                        text="Video Call"
                    />
                </View>                
                
            );
        }        
    }    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,    
      alignItems: 'center',
      backgroundColor: '#303030',
    },   
    textinput: {
        fontSize: 16,
        marginTop: '30%',
        marginLeft: 40, 
        marginBottom: 10,          
        marginRight:40, 
        color: '#b2b2b2',
        alignItems: 'center'                  
    },
    targetid_style:{
        height: 40,
        width: 250,                 
        borderColor: 'gray',        
        backgroundColor: 'white',
        borderWidth: 1,
        marginBottom: 10,       
        justifyContent: 'center',
        alignItems:'center',
        marginLeft:10                   
    },
    button: {
        height: 50,
        alignItems: 'center',     
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#319ed9',
        backgroundColor: '#319ed9',
        fontWeight: 'bold',
        fontSize: 15,
        color: '#ffffff',        
        marginLeft: 80,
        paddingLeft: 45,
    }
});
