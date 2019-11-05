
import {encode as btoa} from 'base-64';

export default class AuthCredentials{

    static Base64(key,secret) {
        return btoa(key + ":" + secret);
    }       
}