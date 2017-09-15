var EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
var RealityToken = artifacts.require("./RealityToken.sol");
var OracleRequests = artifacts.require("./OracleRequests.sol");
var OracleWhiteListVoting = artifacts.require("./OracleWhiteListVoting.sol");
contract('Contract Initialisastion', function(accounts) {

      it("oracle selecting", function() {
        var VeriethContract,VotingAboutOracleContract,oralceRequestContract,cnt=0;
      return VotingAboutOracle.deployed().then(function(VotingAboutOracle1) {
				VotingAboutOracleContract=VotingAboutOracle1;
				return Verieth.deployed()
				}).then(function(Verieth1){
          				VeriethContract=Verieth1;
					console.log("Verieth in place");
            console.log(Verieth1.address);
              console.log(web3.eth.getBalance(web3.eth.accounts[7]));
         			 return VotingAboutOracleContract.proposeNewOracle(VeriethContract.address,accounts[7],accounts[7],10,10,{from:accounts[6],value: 1*ether+10});
        			}).then(function(balance) {
					console.log(balance.receipt.logs);
					console.log("voting done");
					return VotingAboutOracleContract.vote(0,true,{from:accounts[0]});
				}).then(function(balance) {
					 shiftTimePromisified(60*60*24*4);
				      }).then(function(){
			    return VotingAboutOracleContract.proposalslength.call();
			  }).then(function(id){
			      console.log(id);
				return VotingAboutOracleContract.evaluate(id-1);
				    }).then(function(balance) {
              				return VeriethContract.oracle.call();
				    }).then(function(balance) {
              				assert.equal(balance.valueOf(), accounts[7], "oracle installed");
                        shiftTimePromisified(60*60*24);
            }).then(function(balance) {
                        return OracleRequests.deployed()
            }).then(function(instance) {
                          OracleRequestsContract=instance;
                          console.log(instance.address);
                          return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address)
					}).then(function(balance) {
            console.log(balance.receipt.logs);
        }).then(function(){

          console.log("listing is being started");
            console.log( OracleRequestsContract.address);
            var requests=OracleRequestsContract.TakeRequests({fromBlock: "latest"});
            // var requests= OracleRequestsContract.TakeRequests();

             requests.watch(function(error, result) {
                       if (error == null||error !=null) {
                      console.log(result.args);
                      cnt++;
                    }
                });
        }).then(function(){
          shiftTimePromisified(60*60*24*5);
        }).then(function(balance) {
          return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address,{from: accounts[3]})

        }).then(function(balance){

            console.log(balance.receipt.logs);
            console.log( OracleRequestsContract.address);
            console.log(cnt);
          //var requests=OracleRequestsContract.TakeRequests({fromBlock: "latest"});
          var requests= OracleRequestsContract.TakeRequests({fromBlock: 0, toBlock:155});

           requests.watch(function(error, result) {
           if (error == null||error !=null) {
          console.log(result);
        }});

        }).then(function(){ return new Promise(function(accept, reject) {
       web3.currentProvider.sendAsync({
         jsonrpc: "2.0",
         method: "evm_mine",
         //params: [10],
         id: new Date().getTime()
       }, function(err) {
         if (err) return reject(err);
         accept();
       }) });
         //return web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine",id: new Date().getTime()})
       });
	});

});

function shiftTimePromisified(seconds){
return new Promise(function(accept,reject){
					web3.eth.getBlock('latest', function(err, block){
					      if(err) return reject(err)
					      timestampBeforeJump = block.timestamp
					      accept();
					 });

              			}).then(function(){
					return new Promise(function(accept, reject) {
					    web3.currentProvider.sendAsync({jsonrpc: "2.0",method: "evm_increaseTime",params: [seconds], id: 						new Date().getTime()}, function(err) {
					      if (err) return reject(err);
					      accept();
					    }) });
                //return web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine",id: new Date().getTime()})
              			}).then(function(){
				      return new Promise(function(accept, reject) {
					  web3.currentProvider.sendAsync({
					    jsonrpc: "2.0",
					    method: "evm_mine",
					    //params: [10],
					    id: new Date().getTime()
					  }, function(err) {
					    if (err) return reject(err);
					    accept();
					  }) });
              //return web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine",id: new Date().getTime()})
					    })
					    .then(function() {
					      web3.eth.getBlock('latest', function(err, block){
				  if(err) return done(err)
				  var secondsJumped = block.timestamp - timestampBeforeJump

				  // Somehow it jumps an extra 18 seconds, ish, when run inside the whole
				  // test suite. It might have something to do with when the before block
				  // runs and when the test runs. Likely the last block didn't occur for
				  // awhile.
				  assert(secondsJumped >=seconds);

        			});})
}

	//});
//    });
//  });
/*
it("balance checking", function() {
  return Escalation.deployed().then(function(EscalationContract1) {
//return OracleRequests.deployed().then(function(OracleRequests1) {
//	return VotingAboutOracle.deployed().then(function(VotingAboutOracle1) {
  //          return VotingAboutOracle.deployed().then(function(VotingAboutOracle1) {
          return EscalationContract1.reportIssueDeposit();
          }).then(function(balance) {
            assert.equal(balance.valueOf(), 250000000000000000000, "250000000000000000000 wasn't in the first account");
              return Verieth.deployed();})
        .then(function(Verieth1){

        return Verieth1.balanceOf(accounts[0]);})
        .then(function(balance) {
          console.log(balance);
         assert.equal(balance.valueOf(), 100000000, "100000000 wasn't in the first account");
        });
});*/
