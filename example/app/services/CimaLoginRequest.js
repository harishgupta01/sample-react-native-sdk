import {encode as btoa} from 'base-64';
import {decode as atob} from 'base-64';
import {encode as utf8Encode} from 'utf8';
import EventConfig from './EnvConfig';
import {getUserAgent} from './Auth';
import AsyncStorage from '@react-native-community/async-storage';

//Request Cima token
export function getCimaToken(isRefreshToken,authValue,responseStatus){
    console.log("----- Request for cima token  ----- ");
    let authError = {status : 'Failure',
                 code : 'INVALID_PARAMETER',
                 message : 'Failed to obtain CIMA token'}

    if(EventConfig.CIMA_REDIRECT_URL == null || EventConfig.CIMA_REDIRECT_URL.trim() == ""){
        console.log("Redirect URL cannot be empty, check parameter");
        responseStatus(authError)
        return;
    }
    if(EventConfig.APP_ID == null || EventConfig.APP_ID.trim() == ""){
        console.log("CIMA key cannot be empty, check parameter");
        responseStatus(authError)
        return;
    }
    if(EventConfig.APP_SECRET_CIMA == null || EventConfig.APP_SECRET_CIMA.trim() == ""){
        console.log("CIMA secret cannot be empty, check parameter");
        responseStatus(authError)
        return;
    }
    
    let authToken = utf8Encode(EventConfig.APP_ID + ':' + EventConfig.APP_SECRET_CIMA);
    
    fetch(EventConfig.CIMA_TOKEN_URL + 'token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(authToken),
            'User-Agent' : getUserAgent(),
        },
        body: utf8Encode(getpostBody(isRefreshToken,authValue)),

    }).then(response => {
        console.log("Status code : "+ response.status)
        return(response.json());
    }).then(responseJson => {
        if(responseJson.error){
            console.log(responseJson)
            authError.code = 'TRANSPORT_FAILURE',
            authError.message = 'Failed to connect to Server'
            responseStatus(authError)
        }else{
            console.log("cima response ",responseJson)
            var userid = responseJson.id_token.split(".");
            var userinfo = atob(userid[1])
            var userinfojson = JSON.parse(userinfo)
    
            console.log("userid---",userinfojson.login_id)
            console.log("refesh token----",responseJson.refresh_token)
            console.log("access token---",responseJson.access_token)       
            try{
                AsyncStorage.setItem("Username", userinfojson.login_id); 
                AsyncStorage.setItem("Refreshtoken", responseJson.refresh_token); 
                AsyncStorage.setItem("Accesstoken", responseJson.access_token); 
                AsyncStorage.setItem("CIMATokenAge", Date.now().toString());
            }
            catch(error){
                console.log('Got Error');
                console.log(error);
            }

            responseStatus(responseJson)
        }
    }).catch((error) => {
        console.log('Got Error : '+ error);
    });
}

//Post body for CIMA token request
function getpostBody(isRefreshToken,authValue){
    let postBody;
    if(isRefreshToken)
        postBody = "grant_type=refresh_token&refresh_token=" + authValue
    else
        postBody = "grant_type=authorization_code&redirect_uri=" + EventConfig.CIMA_REDIRECT_URL + "&code=" + authValue;
    return(postBody)
}
