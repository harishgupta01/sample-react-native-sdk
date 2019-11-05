import { StyleSheet, Dimensions} from 'react-native';

var width = Dimensions.get('window').width;

export default function DialerStyle(){
    return StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            flexWrap: "wrap", 
            backgroundColor: '#303030',
            justifyContent: 'flex-end',
        },

        keyContainer: {
            flex: 5, 
            flexWrap: 'wrap',
            flexDirection:'row', 
            alignContent: 'center'
        },

        keyContent:{
            flex:1,
            flexDirection: 'column',
            justifyContent: 'center',
        },

        key: {
            opacity: 0.7,
            width: width/5,
            height: width/5,
            marginVertical: 7,
            borderRadius: width/10,
            borderWidth: 1,
            marginHorizontal: width/15,
            borderColor: '#0277BD',
            backgroundColor: '#484848',
        },

        number: {
            fontSize: 24,
            color: '#FFFFFF',
            textAlign: 'center',
            justifyContent: 'center'
        },

        alphabets: {
            fontSize: 12,
            paddingTop: 5,
            color: '#FFFFFF',
            textAlign: 'center',
        },

        numberDisplay:{
            flex:1,
            width: width,
            paddingTop: 15,
            paddingBottom: 15,
            borderBottomWidth: 1,
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "center",
        },

        enteredNumber:{
            fontSize: 40,
            width: width-50,
            color: '#FFFFFF',
            textAlign: 'right',
            alignSelf: 'flex-end'
        },
        clearNumber:{
            padding: '3%',
            paddingRight: '5%',
            paddingBottom: '4%',
            textAlign: "right",
            color: '#FFFFFF',
            justifyContent: "flex-end",
        },

        callButtonContainer: {
            flex: 1,
            height: 80,
            width: width,
            paddingBottom: "2%",
            textAlign: "center",
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "center",
        },

        callButton: {
            height: width/5,
            width: width/5,
            borderRadius: width/10,
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: "#01579B",
        },
        
        inputIcon: {
            color: '#FFFFFF',
            textAlign: 'center',
            justifyContent: "center",
        }
    });

}
