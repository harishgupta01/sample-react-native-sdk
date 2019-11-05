import { StyleSheet} from 'react-native';


export default function InCallViewStyle(){
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#303030',
        },

        textColumn: {
            alignItems:'center',
            justifyContent:'center',
            marginBottom: 50,
            marginTop: 50
        },
    
        buttonContainer: {
            flex:1,
            marginBottom: '5%',
            justifyContent: 'flex-end',
        },

        endButton: {
            justifyContent:'space-around',
            flexDirection: "row",
            marginTop: 50,
            
        },

        buttonRow: {
            justifyContent:'space-around',
            flexDirection: "row",
            marginTop: 20,
            marginRight:5,
            marginLeft:5,
        },

        name: {
            color: "#FFFFFF",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 35,
        },

        status: {
            textAlign: "center",
            color: "#333",
            marginTop: 10,
        }
    });
}