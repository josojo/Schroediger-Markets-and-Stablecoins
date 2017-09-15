var EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
var RealityToken = artifacts.require("./RealityToken.sol");
var OracleWhiteListVoting= artifacts.require("./OracleWhiteListVoting.sol");
var OracleRequests = artifacts.require("./OracleRequests.sol");
var SafeMathLib = artifacts.require("./SafeMath.sol");
var BasicToken = artifacts.require("./BasicToken.sol");


//accounts[0] is only for deploying
//accounts[1] is main share holder
//account[2] is for oracle
//accounts[3..8] other shareholder

module.exports = function(deployer, accounts) {
 var EscalationRealitySplitContract,RealityTokenContract,OracleWhiteListVotingContract,OracleRequestsContract;
 deployer.deploy(EscalationRealitySplit).then(function() {
	   return deployer.deploy(OracleRequests);
	}).then(function() {
	 return deployer.deploy(OracleWhiteListVoting,OracleRequests.address);
	}).then(function() {
	  return deployer.deploy(RealityToken,EscalationRealitySplit.address,OracleWhiteListVoting.address,0x0,1000000000);
	}).then(function() {
	});

};
//	console.log("all good until option");
// return deployer.deploy(OptionPut,10000,20,20,OracleRequests.address, Verieth.address,web3.eth.accounts[2],web3.eth.accounts[3], 25,20, 22,100000,{from: web3.eth.accounts[2],value:1000+20*22+ether/1000});
