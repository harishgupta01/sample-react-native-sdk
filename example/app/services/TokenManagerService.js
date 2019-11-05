import * as CimaLoginRequest from './CimaLoginRequest';
import AsyncStorage from '@react-native-community/async-storage';

// Maximum age of CIMA token in seconds
const CIMA_TOKEN_MAX_AGE = 3599.0;


//Function to request for new CIMA token
export async function refreshCimaToken(cimaResponse){
    try{
        var refreshToken = await AsyncStorage.getItem('Refreshtoken');
    }
    catch(error){
        console.log("Got error");
        console.log(error);
    }
    return new Promise((resolve,reject)=>{
        CimaLoginRequest.getCimaToken(true,refreshToken,(response) => {
            console.log(response);
            var cimaToken = null;
            if(response.status == 'Failure')
                console.log("Failed to refresh CIMA token");
            else{
                cimaToken = response.access_token;
                console.log("Cima token>>>>>>>"+cimaToken);
            }
            resolve()
            cimaResponse(cimaToken)
        });
    })
}


//Function to refresh CIMA token and irisToken if they got expired
export async function refreshTokensIfNeeded(){
    try{
        var cimaToken = await AsyncStorage.getItem('Accesstoken');
        var cimaTokenAge = await AsyncStorage.getItem('CIMATokenAge');
    }
    catch(error){
        console.log("Got error");
        console.log(error);
    }
    return new Promise((resolve,reject)=>{

    if(!hasValidCimaToken(cimaToken, cimaTokenAge)){
        console.log("Refreshing CIMA token");
        refreshCimaToken(token => {
            if(token != null)
                resolve()
        });
    }

    else{
        console.log('session has valid Cima Token')
        resolve()
    }
    })
}

function hasValidCimaToken(refreshToken, cimaTokenAge){
    if(hasCimaToken(refreshToken) && isCimaTokenValid(cimaTokenAge))
        return true;
    else
        return false;
}

function hasCimaToken(refreshToken){
    return(!(refreshToken == null || refreshToken.trim() == ""))
}

function isCimaTokenValid(cimaTokenAge){
    var tokenAge = Date.now().toString() - cimaTokenAge;
    return (tokenAge < CIMA_TOKEN_MAX_AGE*1000)
}

