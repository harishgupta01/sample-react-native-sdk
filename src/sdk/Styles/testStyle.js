import { StyleSheet, Dimensions, StatusBar, Platform} from 'react-native';

var width = Dimensions.get('window').width;

export default function testStyle(){
    return StyleSheet.create({
        container: {
            width: '100%',
            flexWrap: "wrap",
            flexDirection: "row", 
            justifyContent: 'flex-end',
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
            marginHorizontal: width/15,
            borderColor: '#eee',
            backgroundColor: '#ddd',
        },

        number: {
            fontSize: 24,
            color: '#000000',
            textAlign: 'center',
            justifyContent: 'center'
        },

        alphabets: {
            fontSize: 12,
            paddingTop: 5,
            color: '#1F618D',
            textAlign: 'center',
        },

        numberDisplay:{
            width: width,
            paddingTop: 15,
            paddingBottom: 15,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#ddd",
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "center",
        },

        enteredNumber:{
            fontSize: 40,
            width: width-50,
            color: "#333",
            textAlign: 'right',
        },
        clearNumber:{
            marginHorizontal: 20,
            textAlign: "right",
            justifyContent: "flex-end",
        },

        callButtonContainer: {
            height: 80,
            width: width,
            textAlign: "center",
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "center",
        },

        callButton: {
            height: 50,
            width: '75%',
            borderRadius: 40,
            alignSelf: "center",
            justifyContent: "center",
            backgroundColor: "#c62828",
        },
        
        inputIcon: {
            textAlign: 'center',
            justifyContent: "center",
        }
    });

}
