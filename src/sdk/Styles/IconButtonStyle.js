
import { StyleSheet, Dimensions } from 'react-native';

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height; //full height

export default function IconButtonStyle(){
    return StyleSheet.create({

        container:{
            flex: 1, 
            overflow: 'hidden'
            
        },

        icon: {
            fontSize: 30,
            textAlign: 'center',
            alignSelf: 'stretch',
            justifyContent: 'center',
        },

        iconBttn: { 
            fontSize: 30,
            borderWidth: 1,
            width: width/5,
            height: width/5,
            borderRadius: width/10,
            overflow: 'hidden',     
            alignSelf: 'center',
            textAlign: 'center',
            borderColor: '#FFFFFF',
            justifyContent: 'center',
            backgroundColor: '#484848', 
        },

        iconBttnPressed: { 
            fontSize: 30,
            borderWidth: 1,    
            width: width/5,
            height: width/5,
            borderRadius: width/10,
            overflow: 'hidden',
            textAlign: 'center',
            alignSelf: 'center',
            borderColor: '#0277BD',
            justifyContent: 'center',
            backgroundColor: '#484848',
        },

        iconLabel: {
            fontSize: 16,
            color: '#999',
            textAlign: 'center',
        }
    });
}
