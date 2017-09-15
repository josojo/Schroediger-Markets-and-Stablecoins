
/*return Raffle;



var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var contract = require("truffle-contract");

console.log(json);
var artifactor = require("truffle-artifactor");

artifactor.save({json}, "./build/contracts/MyContract.sol.js").then(function(){
var OracleRequests =  require("./build/contracts/OracleRequests.sol.js");
 OracleRequests.setProvider(provider);

var OracleRequests =  require("./migrations/2_deploy_contracts.js");

var Os =  require("./migrations/2_deploy_contracts.js");
console.log(Os.deployer);
*//*
var Web3 = require("web3");
var json = require("./build/contracts/OracleRequests.json");
var contract = require("truffle-contract");
 OracleRequests = contract(json);
 OracleRequests.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

 OracleRequests.deployed().then(function(instance) {
    var  OR = instance;
   return  OR.takeRequests();}).then(function (watcher){
    return watcher.get()
  }).then(function(events) {
    // now we'll check that the events are correct
    console.log(events);
  });
*/
var Web3 = require("web3");
var json = require("./build/contracts/OracleRequests.json");
var contract = require("truffle-contract");
 OracleRequests = contract(json);
OracleRequests.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));

 //var OracleRequests = artifacts.require("./OracleRequests.sol");
    var  OR =OracleRequests.deployed().then(function(instance){
	console.log("listing is being started");
    console.log(instance.address);
    var requests=instance.TakeRequests({fromBlock: "latest"});
    // var requests=instance.TakeRequests();

     console.log(requests);
     requests.watch(function(error, result) {
     if (error == null) {
    console.log(result.args);
  }
        console.log("testEvent.StringEvent: error=" + error + " result.args=" + result.args);
    });});
