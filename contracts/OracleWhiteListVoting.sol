pragma solidity ^0.4.15;
import "./RealityToken.sol";
contract OracleWhiteListVoting {

  // This contract manages whitelisted oralces, which are allowed to send information into the Reality Token system.
  //    Reality Token holders can vote for new Oracles or against existing oracles.
  mapping(address => mapping(address=>bool)) oracleWhiteList;

  struct Proposal{
    address realityToken;
    address oracle;
    address proposer;
    uint valuesend;
    uint votedFor;
    uint votedAgainst;
    uint endOfVoteTime;
    bool evaluated;
    address oracleBillAddress;
    uint oracleRequestCost;
    uint oraclePaymentPerMonth;

    mapping(address=> uint) voted;
  }

  Proposal[] proposals;

  event ProposeNewOracleEvent(address oracle_, address oracleBillAddress_, uint oracleRequestCost_, uint oraclePaymentPerMonth_, uint id);

  function oracleIsWhiteListed(address realityToken_,address oracle_) returns(bool){
    return oracleWhiteList[realityToken_][oracle_];
  }

  function proposeNewOracle(address realityToken_, address oracle_, address oracleBillAddress_, uint oracleRequestCost_, uint oraclePaymentPerMonth_) payable returns(uint id){
    require(RealityToken(realityToken_).transferFrom(msg.sender,this,100));
    proposals.push(Proposal({
      realityToken:realityToken_,
     oracle:oracle_,
     proposer:msg.sender,
     valuesend:msg.value,
     votedFor:0,
     votedAgainst:0,
     endOfVoteTime:now+3 days,
     evaluated:false,
     oracleBillAddress:oracleBillAddress_,
     oracleRequestCost:oracleRequestCost_,
     oraclePaymentPerMonth:oraclePaymentPerMonth_
    }));
    ProposeNewOracleEvent(oracle_,oracleBillAddress_,  oracleRequestCost_, oraclePaymentPerMonth_,proposals.length);
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
    require(proposals[id].endOfVoteTime>now);
    require(!proposals[id].evaluated);
    proposals[id].evaluated=true;
    if(proposals[id].votedFor>proposals[id].votedAgainst && proposals[id].votedFor*20>RealityToken(proposals[id].realityToken).totalSupply()){
      oracleWhiteList[proposals[id].realityToken][proposals[id].oracle]=true;
    }
    else{
      oracleWhiteList[proposals[id].realityToken][proposals[id].oracle]=false;
    }

  }

  function getVotingDepositBack(uint id){
    require(proposals[id].evaluated);
    uint amount=proposals[id].voted[msg.sender];
    proposals[id].voted[msg.sender]=0;
    if(!RealityToken(proposals[id].realityToken).transfer(msg.sender, amount)){proposals[id].voted[msg.sender]=amount;}
  }
}
