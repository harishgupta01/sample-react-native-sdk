export const ErrorCodes = {
    'USER_NOT_FOUND'            : 'AUTH_0002',
    'USER_ALREADY_REGISTERED'   : 'AUTH_0003',
    'INCORRECT_CREDENTIALS'     : 'AUTH_0004',
    'INVALID_PAYLOAD'           : 'AUTH_0005',
    'IDM_INVALID_DATA_RECEIVED' : 'AUTH_0006',
    'COULD_NOT_AUTHORIZE'       : 'AUTH_0007',
    'USER_CREATE_FAILED'        : 'AUTH_0009',
    'INVALID_ACCESS_TOKEN'      : 'AUTH_0010',
    'INVALID_PARAMETER'         : 'AUTH_0011',
    'INVALID_REFRESH_TOKEN'     : 'AUTH_0012',
    
    //General
    'OK_NO_ERROR' : '0',
    'ERR_INVALID_CREDENTIALS' : '-101',
    'ERR_ENDPOINT_URL' : '-102',
    'ERR_INCORRECT_PARAMS' : '-103',
    'ERR_INCORRECT_STATE' : '-104',
    'ERR_JWT_EXPIRE' : '-105',


    //socket IO error
    'ERR_WEBSOCKET_DISCONNECT' : '-201',

    // STREAM ERRORS
    'ERR_STREAM' : '-301',
    
    // Session manager error
    'ERR_SESSION_MANAGER' : '-901',
    'ERR_EVENT_MANAGER' : '-902',
}