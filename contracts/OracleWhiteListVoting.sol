pragma solidity ^0.4.15;
import "./RealityToken.sol";
contract OracleWhiteListVoting {

  // This contract manages whitelisted oralces, which are allowed to send information into the Reality Token system.
  //    Reality Token holders can vote for new Oracles or against existing oracles.
  mapping(address => mapping(address=>bool)) oracleWhiteList;
  mapping(address => mapping(address=>bool)) oracleDepositAvailable;

  uint constant oracleSecurityDeposit=100;

  struct Proposal{
    address realityToken;
    address oracle;
    address proposer;
    uint votedFor;
    uint votedAgainst;
    uint endOfVoteTime;
    bool evaluated;
    uint minFeeInWei;
    mapping(address=> uint) voted;
  }

  Proposal[] proposals;

  event ProposeNewOracleEvent(address realityToken, address oracle_, uint id);
  event NewWhiteListedOracle(address realityToken,address oracle);
  function oracleIsWhiteListed(address realityToken_,address oracle_) public returns(bool){
    return oracleWhiteList[realityToken_][oracle_];
  }

  function proposeNewOracle(address realityToken_, address oracle_,uint minFeeInWei_) returns(uint id){
    require(RealityToken(realityToken_).transferFrom(msg.sender,address(this),oracleSecurityDeposit));
    proposals.push(Proposal({
      realityToken:realityToken_,
     oracle:oracle_,
     proposer:msg.sender,
     votedFor:0,
     votedAgainst:0,
     endOfVoteTime:now+3 days,
     evaluated:false,
     minFeeInWei:minFeeInWei_
    }));
    ProposeNewOracleEvent(realityToken_,oracle_,proposals.length-1);
    return proposals.length-1;
  }


  function proposalslength()returns (uint id){
    return proposals.length;
  }

  function vote(uint id, bool voteFor, uint amount){
    require(RealityToken(proposals[id].realityToken).transferFrom(msg.sender,this,amount));
    proposals[id].voted[msg.sender]+=amount;
    if(voteFor) proposals[id].votedFor+=amount;
    else proposals[id].votedAgainst+=amount;
  }

  function evaluate(uint id){
    require(proposals[id].endOfVoteTime<now);
    require(!proposals[id].evaluated);
    proposals[id].evaluated=true;
    if(proposals[id].votedFor>proposals[id].votedAgainst && proposals[id].votedFor*20>RealityToken(proposals[id].realityToken).totalSupply()){
      oracleWhiteList[proposals[id].realityToken][proposals[id].oracle]=true;
      oracleDepositAvailable[proposals[id].realityToken][proposals[id].oracle]=true;
      NewWhiteListedOracle(proposals[id].realityToken,proposals[id].oracle);
    }
    else{
      oracleWhiteList[proposals[id].realityToken][proposals[id].oracle]=false;
      oracleDepositAvailable[proposals[id].realityToken][proposals[id].oracle]=true;
    }
  }
  // After the offical voting time, people can withdraw their RealityTokens, which they used for voting.
  function withdrawVotingDeposit(uint id){
      require(proposals[id].evaluated);
    uint amount=proposals[id].voted[msg.sender];
    proposals[id].voted[msg.sender]=0;
    if(!RealityToken(proposals[id].realityToken).transfer(msg.sender, amount)){proposals[id].voted[msg.sender]=amount;}
  }

  // In case, oracle do no longer want to be whiteListed, they can unsubscribe
  function unsubscribeWhiteList(address realityToken){
     require(oracleWhiteList[realityToken][msg.sender]);
     require(!RealityToken(realityToken).realityIsSplit());
     require(!RealityToken(realityToken).realityIsUnderInvestigation());
     if(RealityToken(realityToken).transfer(msg.sender,oracleSecurityDeposit)){
       oracleWhiteList[realityToken][msg.sender]=false;
     }
  }
  // In case of an escalation, the SecurityDeposit of the oracle sending the information, which cause the split, will loose its security Deposit on the chain, which evaluated that the information was not correct
  function unsubscribedByEscalation(address realityToken,address oracle){
    require(msg.sender==RealityToken(realityToken).EscalationRealitySplit());
     require(oracleDepositAvailable[realityToken][oracle]);
     oracleDepositAvailable[realityToken][msg.sender]=false;
  }
}
