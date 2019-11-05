import NetInfo from '@react-native-community/netinfo';


export default class NetworkManager{
    static networkManagerInstance = null;

    static getInstance(){
        if(!NetworkManager.networkManagerInstance)
            NetworkManager.networkManagerInstance = new NetworkManager();

        return NetworkManager.networkManagerInstance;
    }

    init(){
        NetInfo.addEventListener(
            'connectionChange', this._handleConnectivityChange
        );
    }

    _handleConnectivityChange(connectionInfo){
        
        console.log(connectionInfo);
    }

    dispose(){
        NetInfo.removeEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );
    }
}