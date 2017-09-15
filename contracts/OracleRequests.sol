pragma solidity ^0.4.15;
import "./RealityToken.sol";
import "./OracleWhiteListVoting.sol";
contract OracleRequests{
  event TakeRequests(uint requestNr, address  sender,uint feedRequestId, uint timeBlock,address oraclePlatform, uint aDelay);

    struct OracleRequest{
        address from;
        //function(bytes) external callback;
        function(uint256, uint256) external callback;
        uint feedRequestId;
        address oracle;
        uint timeBlockRequest;
        uint timeBlockAnswer;
        uint feedInvestigationPeriod;
        bool finished;
        uint oracleAnswer;
        address realityToken;
    }
  //ToDo: convert array to mapping
   OracleRequest[] public oracleRequests;
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
    function pushRequest( function(uint256, uint256) external callback_, address oracle_, uint feedRequestId_,uint feedInvestigationPeriod_, address realityToken_) payable returns (uint){
        require(RealityToken(realityToken_).transferFrom(msg.sender,this,1));
        require((OracleWhiteListVoting(OracleWhiteListVotingContract)).oracleIsWhiteListed(realityToken_,oracle_));
        oracleRequests.push(OracleRequest({
            from: msg.sender,
            callback: callback_,
            oracle: oracle_,
            feedRequestId: feedRequestId_,
            timeBlockRequest: now,
            timeBlockAnswer:now+10000,// will be reset later
            feedInvestigationPeriod: feedInvestigationPeriod_, //negative delay can be allowed... check that.
            finished: false,
            oracleAnswer:0,
            realityToken:realityToken_
        }));
        TakeRequests(oracleRequests.length-1,msg.sender,feedRequestId_,block.number,oracle_,feedInvestigationPeriod_);
        return oracleRequests.length-1;
    }
    // the oracle will call this function to publiciate his answer
    function receiveAnswer(uint id, uint data){
        require(oracleRequests[id].oracle==msg.sender);
        require(!oracleRequests[id].finished);
        oracleRequests[id].timeBlockAnswer=now;
        oracleRequests[id].oracleAnswer=data;
    }
  // the oracle is requested to call this function to send out his answer to the rerquestor after an investgation period
    function sendAnswer( uint id) returns (bool){
        require(!oracleRequests[id].finished);
        require(oracleRequests[id].timeBlockAnswer+oracleRequests[id].feedInvestigationPeriod>=now);
        require(!RealityToken(oracleRequests[id].realityToken).realityIsSplit());
        require(!RealityToken(oracleRequests[id].realityToken).realityIsUnderInvestigation());
        oracleRequests[id].callback(oracleRequests[id].feedRequestId,oracleRequests[id].oracleAnswer);
        oracleRequests[id].finished=true;
    }
    // if an fork has appeared, oracle requests can be pushed down to the child reality tokens
    function pushRequestToChildRealityTokens(uint id){
      require(!oracleRequests[id].finished);
      require(!RealityToken(oracleRequests[id].realityToken).realityIsSplit());
      oracleRequests.push(OracleRequest({
          from: oracleRequests[id].from,
          callback: oracleRequests[id].callback,
          oracle: oracleRequests[id].oracle,
          feedRequestId: oracleRequests[id].feedRequestId,
          timeBlockRequest: now,
          timeBlockAnswer:now+10000,// will be reset later
          feedInvestigationPeriod: oracleRequests[id].feedInvestigationPeriod, //negative delay can be allowed... check that.
          finished: false,
          oracleAnswer:0,
          realityToken:RealityToken(oracleRequests[id].realityToken).realityChild1()
      }));
      TakeRequests(oracleRequests.length-1,oracleRequests[id].from,oracleRequests[id].feedRequestId,block.number,oracleRequests[id].oracle,oracleRequests[id].feedInvestigationPeriod);
      oracleRequests.push(OracleRequest({
          from: oracleRequests[id].from,
          callback: oracleRequests[id].callback,
          oracle: oracleRequests[id].oracle,
          feedRequestId: oracleRequests[id].feedRequestId,
          timeBlockRequest: now,
          timeBlockAnswer:now+10000,// will be reset later
          feedInvestigationPeriod: oracleRequests[id].feedInvestigationPeriod, //negative delay can be allowed... check that.
          finished: false,
          oracleAnswer:0,
          realityToken:RealityToken(oracleRequests[id].realityToken).realityChild2()
      }));
      TakeRequests(oracleRequests.length-1,oracleRequests[id].from,oracleRequests[id].feedRequestId,block.number,oracleRequests[id].oracle,oracleRequests[id].feedInvestigationPeriod);
    }
}
