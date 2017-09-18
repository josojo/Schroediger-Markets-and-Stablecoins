pragma solidity ^0.4.15;
import "./RealityToken.sol";
contract EscalationRealitySplit{
//Different esclation stages//
//event Voted(bool vote);
event NewIssue(uint position);
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
  bytes32 reportTransactionInfo;
  address missBehavingOracle;
  mapping (address=>uint) bonder;
  mapping (address=> mapping(bool=>uint)) voter;
}
//Todo: tranform issues to mapping
Issue[] issues;

 uint64 public constant reportIssueDeposit=100;
 uint64 public constant reportIssueReward=100;
 uint64 public constant bondingPeriod=2 hours;
 uint64 public constant votingPeriod=2 days;

//Todo:
function reportIssue( address realityToken_,bytes32 reportTransactionInfo_, address missBehavingOracle_){
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
	NewIssue(issues.length-1);
  RealityToken(realityToken_).warnRealityIsUnderInvestigation(true);

}
function bondForIssue(uint amount,uint position){
  require(issues[position].stage==Stages.Reported);
  require(issues[position].reportedtime+bondingPeriod>now);
  require(RealityToken(issues[position].realityToken).transferFrom(msg.sender, this,amount));
  issues[position].bonder[msg.sender]+=amount;
  issues[position].totalBonds+=amount;
}
function vote(uint amount,uint position, bool isIssueVote){
  require(issues[position].reportedtime+bondingPeriod<now);
  require(issues[position].reportedtime+votingPeriod >now);
  if(issues[position].stage==Stages.Reported)if(issues[position].totalBonds>100000){issues[position].stage=Stages.Voting;}
  require(issues[position].stage==Stages.Voting);
  require(RealityToken(issues[position].realityToken).transferFrom(msg.sender, this,amount));
  issues[position].voter[msg.sender][isIssueVote]+=amount;
  if(isIssueVote)issues[position].votedForIsIssue+=amount;
  else issues[position].votedForIsNoIssue+=amount;
}
function evaluateSplit(uint position){
  require(issues[position].reportedtime+votingPeriod<now);
  if(issues[position].votedForIsIssue*20>RealityToken(issues[position].realityToken).totalSupply()){
    issues[position].stage=Stages.IssueAccepted;
    RealityToken(issues[position].realityToken).isSplitted();
    issues[position].allowanceWithdrawForBonders=true;
  }
  else{
    issues[position].stage=Stages.IssueDeclined;
    RealityToken(issues[position].realityToken).warnRealityIsUnderInvestigation(false);
  }
}
function createChildContracts(uint position) returns(bool){
  require(issues[position].stage==Stages.IssueAccepted);
  address realityChild1=new RealityToken( this, RealityToken(issues[position].realityToken).OracleWhiteListVoting(),issues[position].realityToken,0);
  address realityChild2=new RealityToken( this, RealityToken(issues[position].realityToken).OracleWhiteListVoting(),issues[position].realityToken,0);
  require(RealityToken(issues[position].realityToken).receiveChildContracts(realityChild1,realityChild2));
    return true;
}
function rewardIssueReporter(){

}
function rewardVoterIsNoIssue(uint position){
  if(issues[position].stage==Stages.IssueAccepted){

  }
  if(issues[position].stage==Stages.IssueDeclined){

  }
}

function rewardVoterIsIssue(uint position){
  require(issues[position].stage==Stages.IssueAccepted);
}
function max(uint a,uint b) returns(uint){
  if(a>b)return a;
  else return b;
}
}
