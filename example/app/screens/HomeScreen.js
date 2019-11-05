import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {IrisLogin} from "rtc-react-native-sdk";
import UserInfo from './login/UserInfo';
import * as EventConfig from "../services/EnvConfig"
import {refreshCimaToken} from "../services/TokenManagerService";



export default class Home extends Component {

    static navigationOptions = {
        header: null
    };

    constructor(props){
        super(props);
        this.state = {
            accessToken : "",
            isRetry : false,
            isUserSignedIn : false
        }
       console.log ("Is User Signedin = "+this.isUserSignedIn());
    }

    componentWillMount(){
    }

    componentDidMount(){
        console.log("did mount")
    }

    async isUserSignedIn(){
        try{
            const userToken =  await AsyncStorage.getItem('Username');
            const refreshToken = await AsyncStorage.getItem('Refreshtoken');
            const accessToken =  await AsyncStorage.getItem('Accesstoken');
           
            (userToken && refreshToken && accessToken) ? 
                              this.setState({accessToken : accessToken,isUserSignedIn : true}) 
                            : this.props.navigation.navigate('CimaLogin');
        }catch(error){
            console.log("Got Error")
            console.log(error);
        }
                
    }

    onSuccessResponse(response){        
        UserInfo.getSharedInstance().setIrisToken(response.irisToken);
        UserInfo.getSharedInstance().setIrisTokenAge(response.irisTokenAge);
        UserInfo.getSharedInstance().setIrisRefreshToken(response.irisRefreshToken);
        UserInfo.getSharedInstance().setRoutingId(response.routingId);
        UserInfo.getSharedInstance().setSourceTN(response.sourceTN);

        this.props.navigation.navigate('DashBoard');
    }

    onErrorResponse(errCode){
        if(!this.state.isRetry && errCode === 'AUTH_0005'){
            refreshCimaToken(() => {
                this.setState({isRetry: true})
            });
        }
        else
            this.props.navigation.navigate('DashBoard',{status: "Failure"});
    }

    getCimaToken(){
         return this.state.accessToken;
    }


    render() {

        if(!this.state.isUserSignedIn)
            return null;

        else
            return (


            <KeyboardAvoidingView style={styles.wrapper}>

                <StatusBar backgroundColor='black' barStyle='light-content' />
                <View style={styles.scrollViewWrapper}>
                    <ScrollView>
                        <Image
                            source={require('../asset/logo.png')}
                            style={styles.logo} />
                        <Text style={styles.logoText}> 555 Test </Text>

                        <IrisLogin loginType="cima" token={this.getCimaToken()} appKey = {EventConfig.APP_KEY} appSecret={EventConfig.APP_SECRET} onSuccess={this.onSuccessResponse} onFailure = {this.onErrorResponse} context={this}  />

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        display: 'flex',
        backgroundColor: 'black',

    },
    scrollViewWrapper: {
        marginTop: '5%',
        flex: 1,
    },
    logo: {
        width: 100,
        height: 100,
        marginTop: '10%',
        alignSelf: 'center',
    },
    logoText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white',
        alignSelf: 'center',
        marginBottom: 20,
    },
    text: {
        fontSize: 15,
        textAlign: 'center',
        margin: 5,
        color: 'white'
    }
});
