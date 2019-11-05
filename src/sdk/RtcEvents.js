export default{

    INIT:'SDK_Init',
    JOIN_SESSION: 'SDK_JoinSession',
    CREATE_SESSION: 'SDK_CreateSession',
    UPGRADE_TO_VIDEO: 'SDK_UpgradeToVideo',
    DOWNGRADE_TO_CHAT: 'SDK_DowngradeToChat',
    SESSION_RECONNECT: 'SDK_SessionReconnect',
    SESSION_ERROR: 'SDK_SessionError',
    SESSION_END: 'SDK_SessionEnded',

    START_MUC_REQUEST: 'SDK_StartMucRequest',
    START_MUC_RESPONSE: 'SDK_StartMucResponse',

    CREATE_ROOT_EVENT: 'SDK_RootEventRequest',
    CREATE_ROOT_EVENT_RESPONSE: 'SDK_RootEventResponse',


    OFFER_SENT: 'SDK_XMPPJingleSessionInitiateSent', 
    ANSWER_SENT:'SDK_XMPPJingleSessionAcceptSent',
    OFFER_RECEIVED:'SDK_XMPPJingleSessionInitiateReceived',
    ANSWER_RECEIVED: 'SDK_XMPPJingleSessionAcceptReceived',
    SOURCE_ADD_RECEIVED:'SDK_XMPPJingleSourceAddReceived',
    SOURCE_REMOVE_RECEIVED: 'SDK_XMPPJingleSourceRemoveReceived',
    TRANSPORT_INFO_SENT: 'SDK_XMPPJingleTransportInfoSent',
    TRANSPORT_INFO_RECEIVED: 'SDK_XMPPTransportInfoReceived',

    ICE_GATHERING: 'SDK_ICEGathering',
    ICE_GATHERING_NEW: 'SDK_ICEGatheringNew',
    ICE_CONNECTION_NEW: 'SDK_ICEConnectionNew',
    ICE_GATHERING_COMPLETED: 'SDK_ICEGatheringCompleted',
    ICE_CONNECTION_CHECKING: 'SDK_ICEConnectionChecking',
    ICE_CONNECTION_CONNECTED: 'SDK_ICEConnectionConnected',
    ICE_CONNECTION_COMPLETED: 'SDK_ICEConnectionCompleted',
    ICE_CONNECTION_DISCONNECTED: 'SDK_ICEConnectionDisconnected',
    ICE_CONNECTION_FAILED: 'SDK_ICEConnectionFailed',
    ICE_CONNECTION_CLOSED: 'SDK_ICEConnectionClosed',


    SIGNALING_STATE: 'SDK_SignalingState',
    SIGNALING_STATE_STABLE: 'SDK_SignalingStateStable',
    SIGNALING_STATE_CLOSED: 'SDK_SignalingStateClosed',
    SIGNALING_STATE_LOCAL_OFFER: 'SDK_SignalingStateHaveLocalOffer',
    SIGNALING_STATE_REMOTE_OFFER: 'SDK_SignalingStateHaveRemoteOffer',
    SIGNALING_STATE_LOCAL_ANSWER: 'SDK_SignalingStateHaveLocalPranswer',
    SIGNALING_STATE_REMOTE_ANSWER: 'SDK_SignalingStateHaveRemotePranswer',


    SIP_INITIALIZING: 'SDK_SIPInitializing',
    SIP_CONNECTING: 'SDK_SIPConnecting',
    SIP_CONNECTED: 'SDK_SIPConnected',
    SIP_DISCONNECTED: 'SDK_SIPDisConnected',
    SIP_HOLD: 'SDK_SIPHold',


    RENEW_TOKEN_REQUEST: 'SDK_RenewTokenRequest',
    RENEW_TOKEN_RESPONSE: 'SDK_RenewTokenResponse',

    NO_ACK: 'SDK_XMPPNOACK',
    TIMESERIES: 'SDK_Timeseries',
    INVALIDATE_STATE: 'SDK_InvalidState',
    DATA_CHANNEL_OPENED: 'SDK_DataChannelOpened',
    ALLOCATE_CONFERENCE_SUCCESS:'SDK_AllocateConferenceSuccess',
    PRESENCE_ERROR:'SDK_PresenceError',
    FOCUS_JOINED:'SDK_FocusJoined', 
    XMPP_JOINED: 'SDK_XMPPJoined',
    XMPP_LEFT: 'SDK_XMPPLeft',
    OCCUPANT_JOINED: 'SDK_PaticipantJoined', 
    OCCUPANT_LEFT: 'SDK_ParticipantLeft',   
    REMOTE_STREAM: 'SDK_RemoteStreamAdded',
    LOCAL_STREAM: 'SDK_LocalStreamAdded' 
};
