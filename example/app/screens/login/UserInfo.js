class UserInfo{
    static sharedInstance = null
    irisToken = null;
    irisTokenAge = null;
    irisRefreshToken = null;
    routingId = null;
    sourceTN = null;

    static getSharedInstance(){
        if(UserInfo.sharedInstance == null){
            UserInfo.sharedInstance = new UserInfo();            
        }
        return UserInfo.sharedInstance 
    }

    getIrisToken(){
        return this.irisToken
    }
    setIrisToken(token){
        this.irisToken = token
    }
    getIrisTokenAge(){
        return this.irisTokenAge
    }
    setIrisTokenAge(tokenAge){
        this.irisTokenAge = tokenAge
    }
    getRoutingId(){
        return this.routingId;
    }
    setRoutingId(id){
        this.routingId = id;
    }
    getIrisRefreshToken(){
        return this.irisRefreshToken;
    }
    setIrisRefreshToken(token){
        this.irisRefreshToken = token;
    }
    getSourceTN(){
        return this.sourceTN;
    }
    setSourceTN(num){
        this.sourceTN = num;
    }
}
export default UserInfo
