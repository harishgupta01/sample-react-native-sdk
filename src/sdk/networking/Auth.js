import EnvConfig from './EnvConfig';
import AuthCredentials from './AuthCredentials';
import DeviceInfo from 'react-native-device-info';

export function emailLogin(emailId, password,response) {

  fetch(EnvConfig.AUTH_MANAGER_URL+'v1.1/login', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + AuthCredentials.Base64(), 
      'Content-Type': 'application/json',
      'Accept': 'application/json',  
    },
    body: JSON.stringify({
      'type': 'Email',
      'email': emailId,
      'password': password,
    }),
  }).then(response => {
    if(!response.ok){
      throw Error(response.status)
    }
    return response.json()})
    .then((responseJson) => {
          response(responseJson);
      })
      .catch((error) => {
      });
  }
  
  export function anonymousLogin(userId,response){
    fetch(EnvConfig.AUTH_MANAGER_URL+'v1.1/login/anonymous', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + AuthCredentials.Base64(), 
      'Content-Type': 'application/json',
      'Accept': 'application/json',  
    },
    body: JSON.stringify({
      'user_id': userId,
    }),
  }).then(response => {
    if(!response.ok){
      throw Error(response.status)
    }
    return response.json()})
    .then((responseJson) => {
          response(responseJson);
      })
      .catch((error) => {
      });
  
  }

  export function getUserAgent(){
    let systemName = DeviceInfo.getSystemName();
    let deviceName = DeviceInfo.getManufacturer();
    let OSVersion = DeviceInfo.getSystemVersion();
    let appName = DeviceInfo.getApplicationName();
    let appVersion = DeviceInfo.getVersion();
    let userAgent = systemName +"/"+ deviceName +"/"+ OSVersion +"/"+ appName +"/"+ appVersion;
    return userAgent;
}