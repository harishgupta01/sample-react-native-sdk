# 555 RTC React Native SDK

## Overview

555 RTC React Native SDK provides an inbuilt component for PSTN or video call feature leveraging the 555 platform. Component's UI theme is configurable by providing the custom style props. It also provide JS-based APIs (in case you need to create your component) for PSTN/video call feature.

## Feature list
### Current

1) SDK provides component and API for PSTN call
2) Provided adavance features like mute/unmute, hold/unhold.
3) SDK analytics and stats support
4) Way to enable/disable SDK logs

### Pending
1) Updaing SDK APIs(if needed) as per this document)
1) Call reconnect feature in case of network failure
2) Handling all predefined error codes
3) Way to dump logs into a file for debugging purposes
4) Advance call features like merge/swap/add call.
5) Video call testing and adding custom renderer.


## Installation


```javascript
npm install rtc-react-native-sdk
```

#### iOS

1. In XCode, in the project navigator, right-click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `rtc-react-native-SDK` and add `RNRtcReactNativeSdk.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRtcReactNativeSdk.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Add SDK dependent frameworks - WebRTC
5. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
- Add `import com.reactlibrary.RNRtcReactNativeSdkPackage;` to the imports at the top of the file
- Add `new RNRtcReactNativeSdkPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
```javascript
include ':rtc-react-native-sdk'
project(':rtc-react-native-sdk').projectDir = new File(rootProject.projectDir, '../node_modules/rtc-react-native-sdk/android')
```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
```javascript
implementation project(':rtc-react-native-sdk')
```

## Usage
 
 The client can make use of either component or JS APIs to implement video and PSTN calls in their application.
 Before invoking PSTN/Video call API, RTC connection should be connected. Though, SDK API/component will take care of the connection if it is not there. But it is advisable to have RTC connection connected beforehand to minimize call connect time. 

### RTC Connection
---
###### API

Use connect API to establish RTC connection.

```javascript
import {RtcConnection} from 'rtc-react-native-sdk';
RtcConnection.connect(evmURL, irisToken, routingId);
````
#### Parameters

| Property    | Type   | Values                        |
|-------------|--------|-------------------------------|
| evmURL      | string | Server URL for event manager  |
| irisToken   | string | JWT token                     |
| routingId   | string | Unique Id for the User        |

#### Calllbacks 
**state** callback gives call RTC connection state(connecting/connected/disconnected)
```javascript
    RtcConnection.on("state", (state) => {
        console.log("connection status is",state)
    }
 ````

**notification** callback gives incoming notification data if client has subscribed for XMPP notification.
```javascript
    RtcConnection.on("notification", (notificationData) => {
        console.log("notification",JSON.stringify(notificationData))
    }
   ````
**error** callback consists of error code and reason for error during connection.
 ```javascript
    RtcConnection.on("error", (errorInfo) => {
        console.log("Call status is",errorInfo.code)
        console.log("Call status is",errorInfo.reason)
    }
   ```` 
### RTC Stream
---

###### API

Use create API to create local stream.

```javascript
import {RtcStream} from 'rtc-react-native-sdk';
RtcStream.create(callType);
````
#### Parameters

| Property    | Type   | Values                        |
|-------------|--------|-------------------------------|
| callType    | string | PSTN/Video                    |

create API also takes an optional parameters which wil be used to set camera type if calltype is video

```javascript
import {RtcStream} from 'rtc-react-native-sdk';
RtcStream.create(callType,{
    camera : 'BACK/FRONT'})
````

create API returns a promise. Response will have stream if stream is successful created otherwise error JSON with code and reason for error.

```javascript
RtcStream.create(callType)
    .then(function (stream) {
    // stream created    
  })
  .catch(function (error) {
    // handle error
    console.log(error.code);
    console.log(error.reason);
  })
 ```

## PSTN Call

### Using JS APIs
--- 
#### 1) Outgoing Call

###### API

To make outgoing calls, pass source phone number, destination phone number, and notification data.

```javascript
   RtcSdk.dial(sourceTN, targetTN, notificationData)
   ````
Dial API also takes an optional parameters which allows user to config different options. Also make sure to pass evmURL,irisToken,routingId as optional parameter if RTC connection need to be taken care by dial API

```javascript
   RtcSdk.dial(sourceTN, targetTN, notificationData,{
    statsCollectorInterval : '10',
    toDomain : '<DOMAIN NAME>'
   
   })
   ````

###### Handling Response

Dial API returns a promise. Response will have callId if call is successful otherwise error JSON with code and reason for error.

```javascript
RtcSdk.dial(sourceTN, targetTN, notificationData)
    .then(function (response) {
    // handle success
    console.log(response.callId);
  })
  .catch(function (error) {
    // handle error
    console.log(error.code);
    console.log(error.reason);
  })
 ```
#### 2) Incoming Call

To accept incoming call, pass the notification payload got in notification.

###### API
```javascript
   RtcSdk.accept(notificationData)
   ````
Optional configuration parameters can be passed as mentioned in dial API.

Below is the Notification payload need to be populated from incoming notification:


| Property          | Type   | Description           |
|-------------------|--------|-----------------------|
| callType         | string | pstn/video|
| roomId         | string | Unique room id|
| roomToken             | string | Room token             |
| roomTokenExpiryTime          | string | Expiry time of room token     |
| rtcServer          | string | RTC server    |
| remoteTN          | string | Caller TN     |
| traceId              | string | trace Id    |

###### Handling Response

```javascript
RtcSdk.accept(notificationData)
    .then(function (response) {
    // handle success
    console.log(response.callId);
  })
  .catch(function (error) {
    // handle error
    console.log(error.code);
    console.log(error.reason);
  })
   ````
#### 3) Callbacks

Status callback gives call status(initiating/ringing/connected/disconnected)
```javascript
RtcSdk.on("status", (callId, status) => {
  console.log("Call status is",status)
}
```
Error callback consists of error code and reason for any error occur during a call.

```javascript
RtcSdk.on("error", (callId, errorInfo) => {
  console.log("Call status is",errorInfo.code)
  console.log("Call status is",errorInfo.reason)
}
```

#### 4) Terminating Call

```javascript
RtcSdk.hangup(callId) 
```

#### 5) Call Features

```javascript
 RtcSdk.merge(callId,callIdtobeMerged)  
   ````

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId is unique id for this call which was returned from dial/accept API                      |
| callIdtobeMerged | string | callIdtobeMerged is unique id for call to be merged with                      |

```javascript
 RtcSdk.hold(callId)  
   ````
| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId is unique id for this call which was returned from dial/accept API                      |
```javascript
 RtcSdk.unhold(callId)  
   ````

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId is unique id for this call which was returned from dial/accept API                      |

```javascript
 RtcSdk.mute(callId)  
   ````


| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId is unique id for this call which was returned from dial/accept API                      |

```javascript
RtcSdk.unmute(callId) 
```

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId is unique id for this call which was returned from dial/accept API                      |

```javascript
RtcSdk.sendDTMF(callId,number) 
```

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId  is unique id for this call which was returned from dial/accept API


### Using Component
---

This component will consist of a keypad dialer and Incall UI screens. All UI button and views will be configurable i.e. you can set your custom styles. This component will be responsible for creating RTC connection (if not there already) and creating a media connection for the voice call when set with required props.


```javascript
   import {RTCDialer} from 'rtc-react-native-sdk';
   ````
#### Props 

###### Parameters

| Name                  | Type                                          | Description  |
| ----------------------|:----------------------------------------------|----------------------------------------------------------------------------------------------|
| config                | Json                                          |  <ul> <li>irisToken</li><li>routingId</li><li>evmUrl</li><ul> |
| mode                  | <ul> <li>outgoing</li><li>incoming</li></ul>  |  To decide if outgoing or incoming call                                                      |
| notificationPayload   | Json                                          |  Notification payload for incoming call                                                      |
| dialerTheme           | Json                                          |  Custom style for dial pad screen buttons                                                    |
| inCallViewTheme       | Json                                          |  Custom style for Incall screen buttons                                                      |

###### Notification payload :

| Property              | Type   | Description              |
|-----------------------|--------|--------------------------|
| roomId                | string | Unique room id           |
| roomToken             | string | Room token               |
| roomTokenExpiryTime   | string | Expiry time of room token|
| rtcServer             | string | RTC server               |
| remoteTN              | string | Caller TN                |
| traceId               | string | trace Id                 |

#### Callbacks

| Name                              | Parameter                                                                                                     | Description                                                                    |
| ----------------------------------|:--------------------------------------------------------------------------------------------------------------| :------------------------------------------------------------------------------|
| onCallStatus(json{callId,status}) | status contains call status :  <ul><li>initiating</li><li>ringing</li><li>connected</li><li>disconnected</li></ul>  |  Status of session during call                                                 |
| onError(json{callId,errorInfo})   | errorInfo contains following info :  <ul><li>code</li><li>reason</li><li>additionInfo</li></ul>               |  Error callback invoked if any error during RTC connection or creating session |

#### sample code to integrate Dialer component

```javascript
   componentWillMount() { 
    this.setState({
        mode: 'outgoing',
        dialerConfig: 
        {            
            "routingId": this.state.routingId,
            "irisToken": this.state.token,
            "evmUrl": this.state.config.evmServer          
        }
    });
  }

render() {
    return (      
        <Dialer
            config={this.state.dialerConfig}
            mode={this.state.mode}
            notificationPayload={this.state.notificationPayload}  
            onCallStatus={this.onCallStatus.bind(this)}
            onError={this.onDialerError.bind(this)}
        >
        </Dialer>      
      );
 }
   ````

## Video Call

### Using JS APIs
--- 

In order to make outgoing video call, pass targetEmailId and notification data.

###### API

```javascript
RtcSdk.call(targetEmailId,notificationData) 
```

Call API also takes an optional parameter which allows user to config different options. Pass parameters(evmURL,irisToken,routingId) in optional parameters if RTC connection also needs to be taken care along with making outgoing call. Also you can configure which camera to use while in call.

```javascript
   RtcSdk.call(targetEmailId, notificationData,{
    evmURL : 'eventManagerURL',
    irisToken : 'JWTToken',
    routingId : 'Unique user id'   
    statsCollectorInterval : '10',
    toDomain : '<DOMAIN NAME>',
    camera: 'FRONT/BACK'
   
   })
   ````
###### Handling Response
This API return a promise. Response will have callId if call is successful otherwise error json with code and reson for error.
```javascript
RtcSdk.call(targetEmailId, notificationData)
    .then(function (response) {
    // handle success
    console.log(response.callId);
  })
  .catch(function (error) {
    // handle error
    console.log(error.code);
    console.log(error.reason);
  })
   ````

#### 2) Incoming Call

To accept incoming call, pass the notification payload got in notification

###### API
 
 ```javascript
   RtcSdk.accept(notificationPayload)
   ````
Below is the Notification payload need to be populated from incoming notification:


| Property          | Type   | Description           |
|-------------------|--------|-----------------------|
| callType         | string | pstn/video|
| roomId         | string | Unique room id|
| roomToken             | string | Room token             |
| roomTokenExpiryTime          | string | Expiry time of room token     |
| rtcServer          | string | RTC server    |
| traceId          | string | trace id     |

Optional configuration parameters can be passed as mentioned in dial API.

###### Handling Response

Accept API return a promise. Response will have callId if call is successful otherwise error JSON with code and reason for error.
```javascript
RtcSdk.accept(notificationData)
    .then(function (response) {
    // handle success
    console.log(response.callId);
  })
  .catch(function (error) {
    // handle error
    console.log(error.code);
    console.log(error.reason);
  })
   ````

#### 3) SDK callback events

**status** callback gives call status(initiating/connected/disconnected)

```javascript
RtcSdk.on("status", (callId, status) => {
  console.log("Call status is",status)
}
   ````
###### Parameters

| Property | Type   | Values                                                         |
|----------|--------|---------------------------------------------------------------------|
| callId   | string | Unique Id for the call                                              |
| status   | string | initiating,connected,disconnected |

**participant** callback gives participant information when any remote participant join.

```javascript
RtcSdk.on("participant", (callId, participantInfo) => {
  console.log("participantInfo Id",participantInfo.id)
  console.log("participantInfo name",participantInfo.name)
}
   ````
###### Parameters

| Property | Type   | Values                                                         |
|----------|--------|---------------------------------------------------------------------|
| callId   | string | Unique Id for the call                                              |
| participantInfo   | JSON | Consist all information about the remote participant  |

**error** callback consists of error code and reason for any error occur during a call.

```javascript
RtcSdk.on("error", (callId, errorInfo) => {
  console.log("Call status is",errorInfo.code)
  console.log("Call status is",errorInfo.reason)
}
   ````

###### Parameters

| Property | Type   | Values                                                         |
|----------|--------|---------------------------------------------------------------------|
| callId   | string | Unique Id for the call                                              |
| errorInfo   | json | code, reason, additionalInfo  |


**localStream** callback will be called when local stream is created 
```javascript
RtcSdk.on("localStream", (callId,stream) => {
  
}
```

###### Parameters

| Property | Type   | Values                                                         |
|----------|--------|---------------------------------------------------------------------|
| stream   | string | local stream                                              |
| streamId   | string | unique id for stream |

**remoteStream** callback will be called when remote participant is joined and got remote stream
```javascript
RtcSdk.on("remoteStream", (callId,stream) => {
  
}

```

###### Parameters

| Property | Type   | Values                                                         |
|----------|--------|---------------------------------------------------------------------|
| stream   | string | remote participant stream                                              |
| streamId   | string | unique id for stream |

#### 4) Ending Call

```javascript
RtcSdk.end(callId) 
```

###### Parameters

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId which is returned from call/accept api                      |


#### 5) Rendering Video

RtcrRenderer component will be used to render local and remote streams. 

 #### Props 

###### Parameters

| Name        | Type           | Description  |
| ------------- |:-------------| -----|
| stream     | object |  local stream and remote stream which we got from localStream and remoteStream callbacks of RTCSession  |
| viewConfig |  <ul> <li>width</li><li>height</li></ul>    |     configurations of view which renders the stream |


##### Sample code  to integrate RtcRenderer component
```javascript
import {RtcRenderer} from 'rtc-react-native-sdk'; 

render(){
    <RtcRenderer stream={stream} rendererConfig={rendererConfig}/>
}
```

#### 6) Call Features

```javascript
RtcSession.mute(callId) 
```

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId which is returned from call/accept API                   |

```javascript
RtcSession.unmute(callId) 
```

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId which is returned from call/accept API                     |

```javascript
RtcSession.flip(callId) 
```

| Property      | Type   | Description                                        |
|---------------|--------|----------------------------------------------------|
| callId | string | callId which is returned from call/accept API 

### Using Component
--- 

This component will consist of video call view screen. All UI button and views will be configurable i.e. you can set your custom styles. This component will be responsible for creating RTC connection (if not there already) and creating a media connection for the voice call when set with required props.

```javascript
   import {RtcVideoCall} from 'rtc-react-native-sdk';
   ````

#### Props 

###### Parameters

| Name                | Type                                                               | Description  |
| --------------------|:------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------|
| config              | Json                                                               |  <ul> <li>irisToken</li><li>routingId</li><li>targetParticipantEmailId</li><li>evmUrl</li></ul> |
| mode                | <ul> <li>outgoing</li><li>incoming</li></ul>                       |  To decide if outgoing or incoming call                                                                                        |
| notificationPayload | Json                                                               |  Notification payload for incoming call                                                                                        |
| videocallViewTheme  | Json                                                               |  Custom style for videocall view screen                                                        |




###### Notification payload :

| Property          | Type   | Description           |
|-------------------|--------|-----------------------|
| roomId         | string | Unique room id|
| roomToken             | string | Room token             |
| roomTokenExpiryTime          | string | Expiry time of room token     |
| rtcServer          | string | RTC server    |
| traceId          | string | trace id     |

#### Callbacks

| Name        | Parameter           | Description  |
| ------------- |:-------------| :-----|
| onCallStatus(json{callId,status})      | status contains call status :  <ul><li>initiating</li><li>connected</li><li>disconnected </li></ul>    |   Status of session during call|
| onParticipantJoined(json{callId,participantInfo})      | participantInfo contains participant information :  <ul><li>id</li><li>name</li></ul>    |   remote paritcipant information|
| onLocalStream(json{callId,stream})      | contains callId and stream  |   local stream|
| onRemoteStream(json{callId,stream})      | contains callId and stream    |   remote stream|
| onError(json{callId,errorInfo}) | errorInfo contains following info :  <ul><li>code</li><li>reason</li><li>additionInfo</li></ul>     |    Error callback invoked if any error during 

##### sample code to integrate RTCVideoCall component

```javascript
   componentWillMount() { 
    this.setState({
        mode: 'outgoing',
        Config: 
        {            
            "routingId": this.state.routingId,
            "irisToken": this.state.token,
            "targetParticipantEmailId":this.state.emailId,
            "evmUrl": this.state.config.evmServer          
        }       
    });
  }

render() {
    return (      
        <RtcVideoCall
            config={this.state.Config}           
            mode={this.state.mode}
            notificationPayload={this.state.notificationPayload}  
            onCallStatus={this.onCallStatus.bind(this)}
            onLocalStream={this.onLocalStream.bind(this)}
            onRemoteStream={this.onRemoteStream.bind(this)}     
            onError={this.onSessionError.bind(this)}
        >
        </RtcVideoCall>      
      );
 }
   ````
