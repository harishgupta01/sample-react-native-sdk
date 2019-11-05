import React, {Component} from 'react';
import {StyleSheet, Text, View, StatusBar, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import FlashMessage from 'react-native-flash-message';
import {IrisRtcConnection} from 'rtc-react-native-sdk';
import RectangularButton from "../common/RectangularButton";
import PropTypes from 'prop-types';
import UserInfo from '../screens/login/UserInfo';

const RCTNetworking = require('RCTNetworking');

export default class DashboardScreen extends Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.state = {
            userId: null,
        }
    }

    static propTypes = {
        status: PropTypes.string
    };

    connectionStateCallback = (connectionState) => {
        console.log("Connection callback = "+connectionState);
        if(connectionState === 'DISCONNECTED'){
            this.signOut();
        }
    }

    componentWillMount() {
        if(this.props.status === 'Failure')
            this.signOut();
    }

    componentDidMount() {
        //UserInfo.getSharedInstance().setRtcConnectionState(UserInfo.state.DISCONNECTED)
        
        AsyncStorage.getItem('Username').then((value) => {
            this.setState({userId: value})
        })
        .catch(error => {
            console.log(error);
        })
       this.connectToServer();

        IrisRtcConnection.onNotification = this.onNotification.bind(this);
        var connectionEmitter = IrisRtcConnection.getConnectionEmitter();
        
        connectionEmitter.on('connectionChange', function (data) {
           
        });
     
    }
    
    async connectToServer(){ 
        try{
            var token = UserInfo.getSharedInstance().getIrisToken();
        }
        catch(error){
            console.log("Got error");
            console.log(error);
        }
        if(token.trim() == "" || token == 'null'){ 
            console.log("Invalid token for connection");
            return;
        }

        let routingId = UserInfo.getSharedInstance().getRoutingId();
        if(routingId.trim() == "" || routingId == 'null'){
            console.log("Invalid routing id");
            return;
        }
    
        IrisRtcConnection.connect(token, routingId);        
    }

    onNotification(incomingPayload){
      
        
        let userData = JSON.parse(incomingPayload.user_data)
        Alert.alert(
            'Call from '+userData.data.cname,
            userData.data.cid,
            [
                {
                    text: 'Ignore',
                    onPress: () => console.log('Call Ignored'),
                },
                {
                    text: 'Reject',
                    onPress: () => console.log('Reject call'),
                    style: 'cancel',
                },
                {
                    text: 'Accept',
                    onPress: () => {
                        if(userData.notification.type == "video"){
                            this.props.navigation.navigate('Video',{mode: 'Incoming', notificationPayload: incomingPayload});
                        }           
                        
                    },
                },
            ],
            {cancelable:false}
        );
    }
    onclick(){

    }

    onSuccessResponse(res) {       
        this.props.navigation.navigate('Home');
    }

    onErrorResponse(err) {
        console.log(err);
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='#303030' barStyle='light-content'/>

                <Text style={styles.headingStyle}>555 Test</Text>
                <Text style={styles.subheadingStyle}>Choose from one of the options below.</Text>

                <RectangularButton style={styles.button} handleOnPress={()=>this.props.navigation.navigate('Audio')}
                                   text="PSTN CALL"
                />
                <RectangularButton style={styles.button} handleOnPress={()=>this.props.navigation.navigate('Video')}
                                   text="VIDEO CALL"
                />
                <RectangularButton style={styles.button} handleOnPress={this.onclick}
                                   text="JOIN ROOM"
                />
                <RectangularButton style={styles.button} handleOnPress={this.onclick}
                                   text="CAMERA CALL"
                />
                <RectangularButton style={styles.button} handleOnPress={this.onclick}
                                   text="SETTINGS"
                />

                <Text onPress={()=>this.signOut()} style = {styles.signOutText}>
                    Sign Out: {this.state.userId}
                </Text>
                <Text style={styles.copyrighttext_style}> Copyright(c) 2018 Comcast. All rights reserved. </Text>
                <FlashMessage position="top"/>
            </View>
        );
    }

    signOut= ()=>{
       IrisRtcConnection.disconnect();
       
        //Clear cookies and async storage
        RCTNetworking.clearCookies(() => {
            AsyncStorage.clear().then(()=>{
                console.log('Signing Out....');
                this.props.navigation.navigate('Home');
            })
            .catch((error)=>{
                console.error(error);
            })
        })
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#303030',
    },
    headingStyle: {
        fontSize: 34,
        marginTop: '25%',
        color: '#217DAF',
        justifyContent: 'center',
    },
    subheadingStyle: {
        fontSize: 16,
        marginTop: 30,
        marginBottom: 10,
        color: '#b2b2b2',
        justifyContent: 'center',
    },
    copyrighttext_style: {
        bottom: 0,
        fontSize: 12,
        marginBottom: 20,
        color: '#DAA520',
        position: 'absolute',
    },

    button: {
        height: 50,
        width: 250,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#319ed9',
        backgroundColor: '#319ed9',
        fontWeight: 'bold',
        fontSize: 15,
        color: '#ffffff',
        textAlign: 'center',
    },

    signOutText:{
        marginTop: '5%',
        color: '#1565c0',
        textAlign: 'center',
    }
    
});
