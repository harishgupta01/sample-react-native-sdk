import {encode as utf8Encode} from 'utf8';
import EventConfig from './EnvConfig';
import {getUserAgent} from './Auth';
import logger from '../RtcLogger';
import AsyncStorage from '@react-native-community/async-storage';

var topics = ['video', 'pstn', 'chat'];
const Tag = "NotificationManager";

//Register a subscriber for notification service
export function registerSubscriber(irisToken, token, protocal, ntmResponse){
    logger.Info(Tag,"Register subscriber for notification service")
    var postBody = "proto="+ protocal +"&token="+ token +"&app_domain="+ EventConfig.APP_DOMAIN +"&lang=en&badge=0";
        
    fetch(EventConfig.NOTIFICATION_MANAGER_URL + 'v1/subscriber', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + irisToken,
            'User-Agent' : getUserAgent(),
        },
        body: utf8Encode(postBody),

    }).then(response => {
        if(response.headers.get("Content-Type") == 'application/json'){
            logger.Info(Tag,"Response : Status code ::"+ response.status);
            return response.json();
        }else{
            logger.Info(Tag,"Failed to obtain registration ID, code : "+ response.status);
            ntmResponse('Failure');
            throw Error(response.status);
        }
    }).then(responseJson => {
        logger.Info(Tag,responseJson);
        if(responseJson.error){
            logger.Info(Tag,"Failed to obtain registration ID, code : " + responseJson.error.code + " message : " + responseJson.error.message);
        }else{
            var responseData = JSON.parse(responseJson);
            logger.Info(Tag,"Sunscriber Id : " + responseData.id);
            try{
                AsyncStorage.setItem('subscriberId',responseData.id);
            }
            catch(error){
                logger.Info(Tag,"Error in setting value to async storage",error);
            }
            for (topic of topics) 
                subscribeTopics(topic);
        }
    }).catch((error) => {
            logger.Info(Tag,'Error in request to notification manager'+ error);
    });
}

//Subscribe notification service for topics: pstn, video, chat 
export async function subscribeTopics(topic){
    try{
        var irisToken = await AsyncStorage.getItem('irisToken');
        var subscriberId = await AsyncStorage.getItem('subscriberId');
        var routingId = await AsyncStorage.getItem('routingId');
    }
    catch(error){
        logger.Info(Tag,"Got error in retriving values from async storage",error);
    }
    
    var topicUri = getUri(routingId, topic);
    var url = EventConfig.NOTIFICATION_MANAGER_URL+ 'v1/subscription/subscriber/' +subscriberId+ '/topic/' + escape(topicUri);
        
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + irisToken,
            'User-Agent' : getUserAgent(),
        },
    }).then(response => {
        if(!response.ok)
            logger.Info(Tag,"Failed to create subscription for "+ topic +", code : "+ response.status);
        else{
            logger.Info(Tag,"Subscription request response for " + topic + " : Status code ::"+ response.status);
        }
        
    }).catch((error) => {
        logger.Info(Tag,'Got Error in subscription for topics', error );
    }); 
}

//Deregister subscriber from notification service
export async function deregisterSubscriber(){
    logger.Info(Tag,"Deregister subscriber from notification service");
    try{
        var irisToken = await AsyncStorage.getItem('irisToken');
        var subscriberId = await AsyncStorage.getItem('subscriberId');
    }
    catch(error){
        logger.Info(Tag,"Got error while retreving values from async storage",error);
    }
    var url = EventConfig.NOTIFICATION_MANAGER_URL + 'v1/subscriber/' + subscriberId;

    return new Promise((resolve) => {
        if(subscriberId == null){
            logger.Info(Tag,"Subscriber ID not found, early exit")
            resolve();
            return;
        }
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + irisToken,
                'User-Agent' : getUserAgent(),
            },
            
        }).then(response => {
            if(!response.ok)
                logger.Info(Tag,"Failed to delete registration, code : " + response.status);
            resolve();
        }).catch((error) => {
            logger.Info(Tag,'Got Error during deregister from subscription',error);
        });
    });
}


//Mute notifications
export async function muteNotification(topic){
    logger.Info(Tag,"Mute "+ topic +" notification");
    try{
        var irisToken = await AsyncStorage.getItem('irisToken');
        var subscriberId = await AsyncStorage.getItem('subscriberId');
        var routingId = await AsyncStorage.getItem('routingId');
    }
    catch(error){
        logger.Info(Tag,"Got error while retreving values from async storage",error);
    }

    var topicUri = getUri(routingId, topic);
    var url = EventConfig.NOTIFICATION_MANAGER_URL+ 'v1/subscription/subscriber/' +subscriberId+ '/topic/' + escape(topicUri);

    if(subscriberId == null){
        logger.Info(Tag,"Subscriber ID not found, early exit");
        return;
    }
        
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + irisToken,
            'User-Agent' : getUserAgent(),
        },
            
    }).then(response => {
        if(!response.ok)
            logger.Info(Tag,"Failed to mute notificaion, code : " + response.status);
    }).catch((error) => {
        logger.Info(Tag,'Got Error while trying to mute notification',error);
    });
}


 //Construct uri for topic subscription
function getUri(routingId, topic){
        
    if(topic === 'pstn')
        var uri = 'federation/'+ topic + '/'+ routingId;
    else
        var uri = EventConfig.APP_DOMAIN+ '/' +topic+ '/'+ routingId;
            
    return encodeURIComponent(uri);
}
