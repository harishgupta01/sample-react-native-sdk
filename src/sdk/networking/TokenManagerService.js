import * as IrisLoginRequest from './IrisLoginRequest';
import AsyncStorage from '@react-native-community/async-storage';
import logger from '../RtcLogger';

// Maximum age of Iris token in seconds
const IRIS_TOKEN_MAX_AGE = 3599.0 * 3;
const Tag = "TokenManagerService";

async function refreshIrisToken(success){
    try{
        var irisToken = await AsyncStorage.getItem('irisToken')
        var irisTokenAge = await AsyncStorage.getItem('irisTokenAge')
        var irisRefreshToken = await AsyncStorage.getItem('irisRefreshToken')
        var loginType = await AsyncStorage.getItem('loginType')
        var appKey = await AsyncStorage.getItem('appKey')
        var appSecret = await AsyncStorage.getItem('appSecret')
    }
    catch(error){
        logger.Error(Tag, "Got error while retriving values from async storage", error);
    }

    if(hasValidIrisToken(irisToken,irisTokenAge)){
        logger.Info(Tag, "Session has valid Iris token");
        return
    }
    else if(irisRefreshToken == null){
        logger.Debug(Tag, "Does not have a valid refresh token")
        try{
            var cimaToken = await AsyncStorage.getItem('accessToken')
        }
        catch(error){
            logger.Error(Tag, "Got error while retriving cima token from async storage", error);
        }

        IrisLoginRequest.getIrisToken(false,loginType,cimaToken,appKey,appSecret,(response)=>{
            if(response.status == 'Failure'){
                logger.Error(Tag, 'unable to retrive Iris Token')
                return
            }
            let irisToken = response.responseData.token;
                logger.Info(Tag, "Iris token>>>>>>>"+irisToken);
                try{
                    AsyncStorage.setItem('irisRefreshToken',response.responseData.refresh_token)
                    AsyncStorage.setItem('irisTokenAge',Date.now().toString())
                    AsyncStorage.setItem('irisToken',response.responseData.token);
                }
                catch(error){
                    logger.Info(Tag, "Got error while retriving values from async storage", error);
                }
                success()
        })
    }
    else{
        logger.Info(Tag, "Refreshing Iris token");
        IrisLoginRequest.getIrisToken(true,loginType,irisRefreshToken,appKey,appSecret,(response)=>{
            logger.Info(Tag, 'Token response ',response.responseData.token);
            try{
                AsyncStorage.setItem('irisToken',response.responseData.token)
                AsyncStorage.setItem('irisTokenAge',Date.now().toString())
                AsyncStorage.removeItem('irisRefreshToken');
            }
            catch(error){
                logger.Info(Tag, "Got error while setting values in async storage", error);
            }
            success()
        })
    }   
}

//Function to refresh CIMA token and irisToken if they got expired
export async function refreshTokensIfNeeded(){
    try{
        var irisToken = await AsyncStorage.getItem('irisToken')
        var irisTokenAge = await AsyncStorage.getItem('irisTokenAge')
    }
    catch(error){
        logger.Info(Tag, "Got error while retriving token from async storage", error);
    }
    return new Promise((resolve,reject)=>{


    if(!hasValidIrisToken(irisToken,irisTokenAge)){
        refreshIrisToken(()=>{
            resolve()
        })
    }
    else{
        logger.Info(Tag, 'Session has valid Iris Token');
        resolve()
    }
    })
}

function hasIrisToken(irisToken){
    return (irisToken != null ?true :false);
}

function isIrisTokenValid(irisTokenAge){
    var tokenAge = Date.now().toString() - irisTokenAge;
    return (tokenAge < IRIS_TOKEN_MAX_AGE*1000)
}

function hasValidIrisToken(irisToken,irisTokenAge){
    if(hasIrisToken(irisToken) && isIrisTokenValid(irisTokenAge)){
        return true;
    }
    else{
        return false;
    }
}
