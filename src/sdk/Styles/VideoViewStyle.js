import { StyleSheet,Dimensions} from 'react-native';
const deviceWidth = Dimensions.get('window').width;
export default function VideoViewStyle(){
    return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#303030',
    },
    statusbarstyle: {
      backgroundColor:'#303030',           
    },
    mainContainer: {
      flex: 0.90 
    },
    streamContainer: {
      backgroundColor: '#303030', 
      flex: 1 
    },
    callFeaturesContainer: {
      position: 'absolute', 
      alignSelf: 'flex-end', 
      flexDirection: 'row', 
      width: deviceWidth, 
      left: 0, 
      bottom: 0  
    },
    bottom: {
      flex: 1,
      justifyContent: 'flex-end',
      height: 50,
      backgroundColor: 'red',
      marginBottom: 36
    },

    localVideoContainer: {
      flex: 2,
      zIndex:1,
      backgroundColor: '#303030',
      borderColor: '#000',
    },
    remoteVideoContainer: {
      flex: 2,
      zIndex:0,
      backgroundColor: '#303030',
      borderColor: '#000',
    },
    
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5,
    },
    capture: {
      position: 'absolute',
      flex: 1,
      backgroundColor: '#fff',
    },
    localStreamContainer: {
      flex: 1,
      position: 'absolute',
      height: 200,
      width: 150,
      paddingRight: 20,
      alignSelf: 'flex-end',
      bottom: 50,
      paddingBottom: 60
    },
    endcallbuttonContainer : {
      flex: 0.10 
    },    
    endCallcontainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#303030',
    },
    endCall: {
      padding: 15,
      borderRadius: 25,
      backgroundColor: 'red',
    },
    endCallbuttonText: {
      color: 'white'
    },
    callOptionViewContainer: {
      marginLeft: 5,
      marginRight: 5,
      flex: 1,
    },
    buttonContainer: {
      flex: 1
    },
    imageStyles: {
      width: 30, height: 30
    },
    callOptionView: {
      flex: 1,
      flexDirection: 'row'
    },
    texStyle: {
      color: 'white',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: 10,
      paddingLeft: 5
    },    
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
}
