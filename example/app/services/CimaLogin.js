import * as CimaLoginRequest from './CimaLoginRequest';
import {ErrorCodes} from './ErrorCodes';

export function getCimaToken(authCode,onSuccessHandler) {

    let cimaToken = null;

    if (authCode == null || authCode.trim() == "") {
        console.log("Auth code cannot be empty, check parameter");
        onError('INVALID_PARAMETER', 'Failed to obtain CIMA token')
    } else {
        CimaLoginRequest.getCimaToken(false, authCode, (response) => {
            console.log(response)
            if (response.status == 'Failure');

            else {
                cimaToken = response.access_token;
                console.log("Cima token>>>>>>>" + cimaToken);
                onSuccessHandler();
                // this.irisTokenRequest(false,cimaToken,onSuccessHandler);
            }

            return cimaToken;
        });
    }
}

function onError(code, message){
   // onErrorHandler(message)
}



