pragma solidity ^0.4.15;
import "./RealityToken.sol";
contract EscalationRealitySplit{
//Different esclation stages//
//event Voted(bool vote);
event NewIssue(address realityToken, bytes txhash, uint position);
event Bonded(address realityToken, uint amount,address sender );
event Voted(address realaityToken,uint amount, bool isIssue, address sender);
event IssueEvaluation(uint position, bool accepted);
event Childscreated(address realityChild1,address   realityChild2);
event RewardRequest(uint a);

enum Stages {
        Working,
        Reported,
        BondCollection,
        Voting,
        IssueDeclined,
        IssueAccepted
    }

 //Issues subject to Escalation
struct Issue{
  address reporter;
  uint reportedtime;
  uint totalBonds;
	uint votedForIsIssue;
	uint votedForIsNoIssue;
  address realityToken;
	Stages stage;
	uint endOfVoting;
  bool allowanceWithdrawForBonders;
  bytes reportTransactionInfo;
  address missBehavingOracle;
  mapping (address=>uint) bonder;
  mapping (address=> mapping(bool=>uint)) voter;
}
//Todo: tranform issues to mapping
Issue[] issues;

 uint64 public constant reportIssueDeposit=100;
 uint64 public constant reportIssueReward=200;
 uint64 public constant bondingPeriod=2 hours;
 uint64 public constant votingPeriod=2 days;

function getStage(uint position) returns(uint){
  return uint(issues[position].stage);
}
//Todo:
function reportIssue( address realityToken_,bytes reportTransactionInfo_, address missBehavingOracle_){
  require(RealityToken(realityToken_).transferFrom(msg.sender, this, reportIssueDeposit));
  require(!RealityToken(realityToken_).realityIsSplit());
  require(!RealityToken(realityToken_).realityIsUnderInvestigation());
  issues.push(Issue({
    reporter:msg.sender,
    reportedtime:now,
    totalBonds:0,
  	votedForIsIssue:0,
  	votedForIsNoIssue:0,
    realityToken:realityToken_,
  	stage:Stages.Reported,
  	endOfVoting:10000000,
    missBehavingOracle:missBehavingOracle_,
    allowanceWithdrawForBonders:false,
    reportTransactionInfo:reportTransactionInfo_
  }));
	NewIssue(realityToken_,reportTransactionInfo_,issues.length-1);
  RealityToken(realityToken_).warnRealityIsUnderInvestigation(true);
  // this will allow the Issure reporter to withdraw his coins plus a winning
  issues[issues.length-1].bonder[msg.sender]=reportIssueDeposit+reportIssueReward;
}
function bondForIssue(uint amount,uint position){
  require(issues[position].stage==Stages.Reported);
  require(issues[position].reportedtime+bondingPeriod>now);
  require(RealityToken(issues[position].realityToken).transferFrom(msg.sender, this,amount));
  issues[position].bonder[msg.sender]+=amount;
  issues[position].totalBonds+=amount;
  Bonded(issues[position].realityToken, amount,msg.sender);
}
function vote(uint amount,uint position, bool isIssueVote){
  require(issues[position].reportedtime+votingPeriod >now);
  if(issues[position].stage==Stages.Reported)if(issues[position].totalBonds>100000){issues[position].stage=Stages.Voting;}
  require(issues[position].stage==Stages.Voting);
  require(RealityToken(issues[position].realityToken).transferFrom(msg.sender, this,amount));
  issues[position].voter[msg.sender][isIssueVote]+=amount;
  if(isIssueVote)issues[position].votedForIsIssue+=amount;
  else issues[position].votedForIsNoIssue+=amount;

  Voted(issues[position].realityToken , amount, isIssueVote,msg.sender);
}
function evaluateSplit(uint position){
  require(issues[position].reportedtime+votingPeriod<now);
  if(issues[position].votedForIsIssue*20>RealityToken(issues[position].realityToken).totalSupply()){

    RealityToken(issues[position].realityToken).isSplitted();
    issues[position].allowanceWithdrawForBonders=true;
    issues[position].stage=Stages.IssueAccepted;
    IssueEvaluation(position,true);
  }
  else{
    issues[position].stage=Stages.IssueDeclined;
    RealityToken(issues[position].realityToken).warnRealityIsUnderInvestigation(false);
    IssueEvaluation(position,false);
  }
}
function createChildContracts(uint position) returns(bool){
  require(issues[position].stage==Stages.IssueAccepted);
  address realityChild1=new RealityToken( this, RealityToken(issues[position].realityToken).OracleWhiteListVoting(),issues[position].realityToken,0);
  address realityChild2=new RealityToken( this, RealityToken(issues[position].realityToken).OracleWhiteListVoting(),issues[position].realityToken,0);
  Childscreated(realityChild1,realityChild2);
  require(RealityToken(issues[position].realityToken).receiveChildContracts(realityChild1,realityChild2));
  return true;
}
uint amount;
function rewardBonders(uint position){
  require(issues[position].allowanceWithdrawForBonders);
  amount=issues[position].bonder[msg.sender];
  issues[position].bonder[msg.sender]=0;
  RewardRequest(amount);
  if(!(RealityToken(RealityToken(issues[position].realityToken).realityChild1()).fundEscalationReward(msg.sender,2*amount))){
    issues[position].bonder[msg.sender]=amount;
  }
}
function rewardVoterIsNoIssue(uint position) returns (bool){
  require(issues[position].voter[msg.sender][false]>0);
  if(issues[position].stage==Stages.IssueAccepted){
    amount=issues[position].voter[msg.sender][false];
    issues[position].voter[msg.sender][false]=0;
    if(!(RealityToken(RealityToken(issues[position].realityToken).realityChild2()).fundEscalationReward(msg.sender,2*amount))){
      issues[position].voter[msg.sender][false]=amount;
      return false;
    }
  }
  if(issues[position].stage==Stages.IssueDeclined){
    amount=issues[position].voter[msg.sender][false];
    issues[position].voter[msg.sender][false]=0;
    if(!RealityToken(issues[position].realityToken).transfer(msg.sender,amount)){
      issues[position].voter[msg.sender][false]=amount;
      return false;
      }
  }
  return true;
}

function rewardVoterIsIssue(uint position){
  require(issues[position].stage==Stages.IssueAccepted);
  amount=issues[position].voter[msg.sender][true];
  issues[position].voter[msg.sender][true]=0;
  if(!(RealityToken(RealityToken(issues[position].realityToken).realityChild1()).fundEscalationReward(msg.sender,2*amount))){
    issues[position].voter[msg.sender][true]=amount;
  }
}
function max(uint a,uint b) returns(uint){
  if(a>b)return a;
  else return b;
}
}
