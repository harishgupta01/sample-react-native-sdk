import React from 'react';
import { createAppContainer,createSwitchNavigator } from 'react-navigation';

import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from "../screens/DashboardScreen";
import LoginPage from "../screens/login/LoginPage";
import AudioCall from "../screens/AudioCall"
import VideoCall from "../screens/VideoCall"

const AppStack = createSwitchNavigator({
        Home: HomeScreen,
        DashBoard: DashboardScreen,
        CimaLogin : LoginPage,
        Audio : AudioCall,
        Video : VideoCall
    },
    {
        initialRouteName: "Home"
    });

export default createAppContainer(AppStack);




