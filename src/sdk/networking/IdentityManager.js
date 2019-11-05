import logger from '../RtcLogger';
import EventConfig from './EnvConfig';
import {getUserAgent} from './Auth';
import ParticipantInfo from '../RtcParticipantInfo';
import {registerSubscriber} from './NotificationManager';
import AsyncStorage from '@react-native-community/async-storage';

const Tag = "IdentityManager";

export function getAllIdentities(irisToken,response){
    fetch(EventConfig.IDENTITY_MANAGER_URL + 'v1/allidentities', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + irisToken,
            'User-Agent' : getUserAgent(),
        },
    }).then(response => response.json())
    .then(responseJson => {
        if(responseJson.error){
            logger.Error(Tag, "Received error response : "+ responseJson.error.message);
        }else{
            logger.Info(Tag, "public ids ",responseJson.public_ids[1]);
            try{
                AsyncStorage.setItem('fromTN',responseJson.public_ids[1])
            }catch(error){
                logger.Error(Tag, "couldn't set fromTN value in async storage", error);
            }
            ParticipantInfo.getSharedInstance().setRoutingId(responseJson.routing_id);
            notificationService(irisToken, responseJson.routing_id);
            response(responseJson);
        }
    }).catch((error) => {
        logger.Error(Tag, 'Got Error', error);
    });
}

export async function getRoutingId(userId,responseStatus){
    try{
        var irisToken = await AsyncStorage.getItem('irisToken');
    }
    catch(error){
        logger.Error(Tag, "Iris token error", error);
    }
   
    fetch(EventConfig.IDENTITY_MANAGER_URL + 'v1/routingid/appdomain/' +EventConfig.APP_DOMAIN + '/publicid/' + userId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + irisToken,
            'User-Agent' : getUserAgent(),
        },
    }).then(response => {
        logger.Info(Tag,"routing id request ressponse", response);
        if(response.status != 200){
            logger.Error(Tag, "Received error response. Status code: "+ response.status);
            responseStatus({status: 'Failure'});
        }else{
            return response.json();
        }
    }).then(responseJson =>{
        logger.Info(Tag, "Routing id: ",responseJson.routing_id);
        responseStatus({status: 'Success'});   
    }).catch((error) => {
        logger.Error(Tag, 'Got Error', error);
    });
}


async function notificationService(irisToken, routingId){
    /*isDeviceRegistered = await AsyncStorage.getItem('isDeviceRegistered');

    if(isDeviceRegistered == "true"){
        deviceToken = await AsyncStorage.getItem('deviceToken');
        
        Platform.OS === 'ios' ? protocal = 'apns' : protocal = 'gcm';
        
        registerSubscriber(irisToken,deviceToken, protocal,response =>{
            logger.Info(Tag, "Subscribed for notification service");
        }); 
    }else{*/
        registerSubscriber(irisToken,routingId, 'xmpp',response =>{
            //logger.Info(Tag, "Subscribed for notification service");
        }); 
    //}
}
