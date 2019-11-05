import * as IdentityManager from './IdentityManager';
import * as TokenManager from './TokenManagerService';
import {ErrorCodes} from './ErrorCodes';
import AsyncStorage from '@react-native-community/async-storage';
import * as EventConfig from "./EnvConfig";
import AuthCredentials from "./AuthCredentials";
import {getUserAgent} from './Auth';





export function irisTokenRequest(type, cimaToken, key, secret,successResponse,faliureResponse){
    if(cimaToken == null || cimaToken.trim() == ""){
        //console.log("Failed to create Login request:: check parameters");
    }else{
        try{
            AsyncStorage.setItem('loginType',type);
            AsyncStorage.setItem('appKey',key);
            AsyncStorage.setItem('appSecret',secret);
            AsyncStorage.setItem('accessToken',cimaToken);
        }
        catch(error){
            //console.log("Got Error");
            //console.log(error);
        }


        getIrisToken(false,type,cimaToken,key, secret,(response) =>{
           // console.log(response)
            if(response.status == 'Failure'){
                //console.log("Failed to create Login request:: check parameters ");
                switch(response.responseData.error.code) {
                    case ErrorCodes.INVALID_PAYLOAD:
                        //console.log("API execution failed with error: "+response.responseData.error.message)
                        faliureResponse(ErrorCodes.INVALID_PAYLOAD)
                        break;
                    default:
                        //console.log("API execution failed with error: "+ response.responseData.error.message);
                        faliureResponse(null);
                }
            }else{
                var irisToken = response.responseData.token;
                //console.log("Iris token>>>>>>>"+irisToken);
                try{
                    // AsyncStorage.setItem('irisRefreshToken',response.responseData.refresh_token)
                    // AsyncStorage.setItem('irisTokenAge',Date.now().toString())
                    // AsyncStorage.setItem('irisToken',response.responseData.token)
                    IdentityManager.getAllIdentities(irisToken,(IdentityResponse)=>{                       
                        AsyncStorage.setItem("routingId",IdentityResponse.routing_id);
                        var json = { "sourceTN":IdentityResponse.public_ids[1],"routingId": IdentityResponse.routing_id, "irisToken":irisToken, "irisTokenAge":Date.now().toString(),"irisRefreshToken": response.responseData.refresh_token}
                        successResponse(json)
                    });
                }
                catch(error){
                    //console.log("Got Error")
                    //console.log(error);
                }
            }
        });
    }
}



//Request iris token
export function getIrisToken(isRefreshneeded,type,token,key,secret,responseStatus){
    //console.log("----- Request for Iris token ----- ");
    let body,method;
    if(isRefreshneeded){
         body = {'refresh_token':token}
         method = 'v1.1/token'
    }
    else{
         body = {
            'type': type,
            'media_token': token,
            'access_type': 'offline',
        }
         method = 'v1.1/login'
    }
    fetch(EventConfig.AUTH_MANAGER_URL + method, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + AuthCredentials.Base64(key,secret),
            'User-Agent' : getUserAgent(),
        },
        body: JSON.stringify(body),

    }).then(response => {
        //console.log("Status code : "+ response.status)
        return(response.json());
    }).then(responseJson => {
        var response = {status : 'Success'}
        if(responseJson.error){
            response.status = 'Failure';
        }else{
            response.status = 'Success';
        }
        response.responseData = responseJson;
        responseStatus(response);
    }).catch((error) => {
        //console.log('Got Error');
        //console.log(error);
    });
}



