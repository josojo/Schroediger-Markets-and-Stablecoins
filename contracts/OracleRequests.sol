pragma solidity ^0.4.15;
import "./RealityToken.sol";
import "./OracleWhiteListVoting.sol";
contract OracleRequests{
  event TakeRequests(uint requestNr, address  sender,uint feedRequestId, uint timeBlock, uint aDelay);
  event AnswerReceived(address sender, uint data);
    struct OracleRequest{
        address from;
        //function(bytes) external callback;
        function(uint256, uint256, address) external callback;
        uint feedRequestId;
        bytes32 oracleRequestDescription;
        uint timeBlockRequest;
        uint timeBlockAnswer;
        uint feedInvestigationPeriod;
        bool finished;
        uint oracleAnswer;
        address realityToken;
    }
  //ToDo: convert array to mapping
   OracleRequest[] public oracleRequests;
   mapping(address => mapping(address =>uint))FeesCollected;
   address OracleWhiteListVotingContract;
   function OracleRequests(address oracleWhiteListVoting_){
     OracleWhiteListVotingContract=oracleWhiteListVoting_;
   }

      /*  @dev sendInput is the function called by oracle server to send their Input
        @param: callback_ is the name of the function, to which the oracle should return its input
        @param: arbitrator_ is the address of the arbitrator, from whom an answer is requested
        @param: feedRequestId_ if an contract has several request, they can hand out different feedRequestIds to know which answer belongs to which request
        */
        //Todo save oracleRequests in a mapping from a hash to the request, then we can delete done
    function pushRequest( function(uint256, uint256, address) external callback_, bytes32 oracleRequestDescription_, uint feedRequestId_,uint feedInvestigationPeriod_, address realityToken_)  returns (uint){
        require(RealityToken(realityToken_).transferFrom(msg.sender,this,1));
        oracleRequests.push(OracleRequest({
            from: msg.sender,
            callback: callback_,
            oracleRequestDescription: oracleRequestDescription_,
            feedRequestId: feedRequestId_,
            timeBlockRequest: now,
            timeBlockAnswer:now+10000,// will be reset later
            feedInvestigationPeriod: feedInvestigationPeriod_, //negative delay can be allowed... check that.
            finished: false,
            oracleAnswer:0,
            realityToken:realityToken_
        }));
        TakeRequests(oracleRequests.length-1,msg.sender,feedRequestId_,block.number,feedInvestigationPeriod_);

        return oracleRequests.length-1;
    }
    // the oracle will call this function to publiciate his answer
    function receiveAnswer(uint id, uint data){
      //  require((OracleWhiteListVoting(OracleWhiteListVotingContract)).oracleIsWhiteListed(oracleRequests[id].realityToken,msg.sender));
        require(!RealityToken(oracleRequests[id].realityToken).realityIsSplit());
        require(!RealityToken(oracleRequests[id].realityToken).realityIsUnderInvestigation());
        require(!oracleRequests[id].finished);
        oracleRequests[id].timeBlockAnswer=now;
        oracleRequests[id].oracleAnswer=data;
        FeesCollected[msg.sender][oracleRequests[id].realityToken]++;
        AnswerReceived(msg.sender,data);
    }
  // the oracle is requested to call this function to send out his answer to the rerquestor after an investgation period
    function sendAnswer( uint id) returns (bool){
        require(!oracleRequests[id].finished);
        require(oracleRequests[id].timeBlockAnswer+oracleRequests[id].feedInvestigationPeriod<=now);
        require(!RealityToken(oracleRequests[id].realityToken).realityIsSplit());
        require(!RealityToken(oracleRequests[id].realityToken).realityIsUnderInvestigation());
        oracleRequests[id].callback(oracleRequests[id].feedRequestId,oracleRequests[id].oracleAnswer, oracleRequests[id].realityToken);
        oracleRequests[id].finished=true;
    }
    // if an fork has appeared, oracle requests can be pushed down to the child reality tokens
    function pushRequestToChildRealityTokens(uint id){
      require(!oracleRequests[id].finished);
      require(!RealityToken(oracleRequests[id].realityToken).realityIsSplit());
      oracleRequests.push(OracleRequest({
          from: oracleRequests[id].from,
          callback: oracleRequests[id].callback,
          oracleRequestDescription: oracleRequests[id].oracleRequestDescription,
          feedRequestId: oracleRequests[id].feedRequestId,
          timeBlockRequest: now,
          timeBlockAnswer:now+10000,// will be reset later
          feedInvestigationPeriod: oracleRequests[id].feedInvestigationPeriod, //negative delay can be allowed... check that.
          finished: false,
          oracleAnswer:0,
          realityToken:RealityToken(oracleRequests[id].realityToken).realityChild1()
      }));
      TakeRequests(oracleRequests.length-1,oracleRequests[id].from,oracleRequests[id].feedRequestId,block.number,oracleRequests[id].feedInvestigationPeriod);
      oracleRequests.push(OracleRequest({
          from: oracleRequests[id].from,
          callback: oracleRequests[id].callback,
          oracleRequestDescription: oracleRequests[id].oracleRequestDescription,
          feedRequestId: oracleRequests[id].feedRequestId,
          timeBlockRequest: now,
          timeBlockAnswer:now+10000,// will be reset later
          feedInvestigationPeriod: oracleRequests[id].feedInvestigationPeriod, //negative delay can be allowed... check that.
          finished: false,
          oracleAnswer:0,
          realityToken:RealityToken(oracleRequests[id].realityToken).realityChild2()
      }));
      TakeRequests(oracleRequests.length-1,oracleRequests[id].from,oracleRequests[id].feedRequestId,block.number,oracleRequests[id].feedInvestigationPeriod);
    }
    function claimFee( address realityToken_) returns(bool){
      uint toBePaid=FeesCollected[msg.sender][realityToken_];
      FeesCollected[msg.sender][realityToken_]=0;
      if(!RealityToken(realityToken_).transfer(msg.sender,toBePaid/2)){
        FeesCollected[msg.sender][realityToken_]=toBePaid;
        return false;
      }
      return true;
    }
}
