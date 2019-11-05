import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, ActivityIndicator, Text, TouchableHighlight} from 'react-native';
import {WebView} from 'react-native-webview';
import EnvConfig from '../../services/EnvConfig';
import * as CimaLogin from '../../services/CimaLogin';
import NetInfo from '@react-native-community/netinfo';

import {Modal} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
const scheme = EnvConfig.CIMA_REDIRECT_URL;
var isTextShown = true

export default class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            logingUrl: EnvConfig.CIMA_LOGIN_URL,
            connection_Status: '',
            no_internet_msg: 'You do not seems to be connected to internet. Please check connection and tap here to retry',
            isLoginDone: false,
            spinner: false

        }
    }

    static navigationOptions = {
        header: null,
    }

    _onReloadWebview() {
        this.webview && this.webview.reload();
    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener(
            'connectionChange', this._handleConnectivityChange
        );
        NetInfo.isConnected.fetch().done((isConnected) => {
            if (isConnected == false) {
                this.setState({connection_Status: this.state.no_internet_msg})
            }
        });
    }

    componentWillUnmount() {
        this.setState({});
        NetInfo.isConnected.removeEventListener(
            'connectionChange',
            this._handleConnectivityChange
        );
    }

    _handleConnectivityChange = (isConnected) => {
        if (isConnected == false) {
            this.setState({connection_Status: this.state.no_internet_msg})
        }
    };

    _updateUrlTextView = (url) => {
        this.setState({logingUrl: url})
    }
    webview = null;

    ActivityIndicatorLoadingView() {
        return (
                <View style={styles.container}>
                    <StatusBar backgroundColor='#303030' barStyle='light-content'/>

                    <Text style={styles.textStyle}> 555 Test</Text>

                    <Text style={styles.loadingUrlStyle}> {this.state.logingUrl} </Text>

                    <ActivityIndicator
                        color='#daa520'
                        size='small'
                        style={styles.ActivityIndicatorStyle}
                    />
                </View>
        );
    }

    ErrorView() {
        return (

            <View style={styles.container}>
                <StatusBar backgroundColor='#303030' barStyle='light-content'/>

                <TouchableHighlight onPress={this._onReloadWebview.bind(this)}>
                    <Text style={styles.loadingUrlStyle}> {this.state.connection_Status} </Text>
                </TouchableHighlight>

            </View>
        );
    }

    render() {
        console.log(this.state.isLoginDone)
        /*if(this.state.isLoginDone == true){
            return (

                <View style={styles.container}>
                    <StatusBar backgroundColor='#303030' barStyle='light-content' />

                    <Text style={styles.textStyle}> Iris Test</Text>

                    <ActivityIndicator
                        color='#daa520'
                        size='large'
                        style={styles.ActivityIndicatorStyle}
                    />
                </View>

            );
        }*/
        return (
            <Modal style={styles.modalContainer}>

                <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                />

                <WebView
                    useWebKit={true}
                    cacheEnabled={false}
                    sharedCookiesEnabled={true}
                    ref={ref => (this.webview = ref)}
                    source={{uri: EnvConfig.CIMA_LOGIN_URL}}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    renderLoading={this.ActivityIndicatorLoadingView.bind(this)}
                    renderError={this.ErrorView.bind(this)}
                    startInLoadingState
                    onShouldStartLoadWithRequest={this.shouldStartLoadWithRequest}
                />
            </Modal>
        );
    }

    shouldStartLoadWithRequest = request => {
        console.log(request)

        var url = request.url.split("?");
        this._updateUrlTextView(url)
        if (url.indexOf(scheme) === -1) {
            return true;
        } else {
            this.webview.stopLoading();
            // this.setState({isLoginDone:true})

            this.setState({
                spinner: !this.state.spinner
            });

            var authCode = request.url.slice(request.url.indexOf('=') + 1);

            CimaLogin.getCimaToken(authCode, () => {
                //this.props.successCb("login success");
                this.setState({
                    spinner: !this.state.spinner
                });
                this.props.navigation.navigate('Home')
            }, (err) => {
               // this.props.failureCb("login failure = " + err);
                this.setState({
                    spinner: !this.state.spinner
                });
                //this.props.navigation.navigate('DashBoardNavigator')
            });

            return false;
        }
    }
}

const styles = StyleSheet.create(
    {
        ActivityIndicatorStyle: {
            position: 'relative',
            marginTop: 10,
        },

        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'grey',
        },
        container: {
            backgroundColor: '#303030',
            flex: 1,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center'
        },

        textStyle: {
            color: '#319ed9',
            fontSize: 30,
            textAlign: 'center',
            position: 'relative',
        },

        loadingUrlStyle: {
            paddingLeft: 10,
            paddingRight: 10,
            color: '#FF4753',
            fontSize: 11,
            textAlign: 'center',
            position: 'relative',
        }

    });
