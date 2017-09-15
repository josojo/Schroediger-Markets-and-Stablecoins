const EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
const RealityToken = artifacts.require("./RealityToken.sol");
const OracleRequests = artifacts.require("./OracleRequests.sol");
const OracleWhiteListVoting = artifacts.require("./OracleWhiteListVoting.sol");
const utils = require("./utils/utils.js");


contract('Contract Escalation', function(accounts) {
	var prefix="State All Working: ";
/*
	it(prefix + "report issue", function() {
	var VeriethContract,EscalationContract, stage, id, var1,var2,var3;
	deployer(accounts).then(function(Contracts){
		EscalationContract=Contracts.EscalationContract;
		VeriethContract=Contracts.VeriethContract;
					 stage=1;
            return goToStage(stage, accounts,EscalationContract, VeriethContract);
          });
	});

	it(prefix + "report issue with insufficent funds", function() {
	var VeriethContract,EscalationContract, stage, id, var1,var2,var3;
		deployer(accounts).then(function(Contracts){
		EscalationContract=Contracts.EscalationContract;
		VeriethContract=Contracts.VeriethContract;
					 stage=1;
            return utils.assertThrows(EscalationContract.reportIssue(0, VeriethContract.address,"111111111111111111111111111111111111",{from: 			accounts[7], value:1*ether/10000}), 'cannot create issue with insufficent funds');
    		});
	});
	 prefix="State Voting: ";

      it(prefix + "testing vote additions in voting time", function() {
	var VeriethContract,EscalationContract, stage, issueId, var1,var2,var3;
        deployer(accounts).then(function(Contracts2){
		EscalationContract=Contracts2.EscalationContract;
		VeriethContract=Contracts2.VeriethContract;
        	stage=1;
  		return goToStage(stage, accounts,EscalationContract, VeriethContract);
          }).then(function(result){
            issueId=result.positionOfIssue;
            return VeriethContract.balanceOf(accounts[2]);
          }).then(function(tx){
              var1=tx;
           return EscalationContract.vote(true, issueId,{from: accounts[2]});
	}).then(function(tx){
                return EscalationContract.issueInfoVotedFor.call(issueId-1)
          }).then(function(tx){
            assert.equal(var1.s,tx.s);
            return VeriethContract.balanceOf(accounts[3]);
          }).then(function(tx){
              var2=tx;
           return EscalationContract.vote(true, issueId,{from: accounts[3]});
	}).then(function(tx){
                return EscalationContract.issueInfoVotedFor.call(issueId)
          }).then(function(tx){
            assert.equal(Number(var1.c)+Number(var2.c),Number(tx.c));
            return VeriethContract.balanceOf(accounts[1]);
            }).then(function(tx){
              var3=tx;
            return EscalationContract.vote(false, issueId,{from: accounts[1]});
            }).then(function(tx){
                return EscalationContract.issueInfoVotedFor.call(issueId)
            }).then(function(tx){
            assert.equal(Number(var1.c)+Number(var2.c),Number(tx.c));
            //return EscalationContract.issueInfoVotedNotFor.call(issueId)
        //	}).then(function(tx){
          //assert.equal(Number(var3.c),Number(tx.c));
                    });
	});

	it(prefix + "testing double vote  in voting time", function() {
	var VeriethContract,EscalationContract, stage, issueId, var1,var2,var3;
			  deployer(accounts).then(function(Contracts){
		EscalationContract=Contracts.EscalationContract;
		VeriethContract=Contracts.VeriethContract;
					 stage=1;
            return goToStage(stage, accounts,EscalationContract, VeriethContract);
         }).then(function(result){
            issueId=result.positionOfIssue;
            return VeriethContract.balanceOf(accounts[2]);
          }).then(function(tx){
              var1=tx;
           return EscalationContract.vote(true, issueId,{from: accounts[2]});
	}).then(function(tx){
                return EscalationContract.issueInfoVotedFor.call(issueId)
          }).then(function(tx){
            assert.equal(var1.s,tx.s);
            return VeriethContract.balanceOf(accounts[3]);
          }).then(function(tx){
              var2=tx;
           return  utils.assertThrows(EscalationContract.vote(true, issueId,{from: accounts[2]}), "double vote was possible");
	});
});
	it(prefix + "testing startSellingOfSplitTokens within time", function() {
		var VeriethContract,EscalationContract, stage, issueId, var1,var2,var3;
    	deployer(accounts).then(function(Contracts){
				EscalationContract=Contracts.EscalationContract;
				VeriethContract=Contracts.VeriethContract;
					 stage=1;
            return goToStage(stage, accounts,EscalationContract, VeriethContract);
          }).then(function(result){
            issueId=result.positionOfIssue;


        return VeriethContract.balanceOf(accounts[4]);
				}).then(function(tx){
						var1=tx;
	console.log(var1);
       return EscalationContract.vote(true, issueId,{from: accounts[4]});
		 }).then(function(tx){

            return EscalationContract.issueInfoVotedFor.call(issueId)
      }).then(function(tx){

        assert.equal(var1.s,tx.s,"right before time sift");

        return VeriethContract.stageNr.call();
      }).then(function(stageAns){
				console.log(stageAns+"right before shift");

        return shiftTimePromisified(60*60*24*2+600)}).then(function(){
	console.log("looking good");
        stage=2;
        return EscalationContract.startSellingOfSplitTokens(issueId,{from: accounts[9]});
      }).then(function(tx){

        return VeriethContract.stageNr.call();
      }).then(function(stageAns){
				console.log(stageAns);
        assert.equal(stageAns.c, stage);
                });
});
*/
prefix="SellingSplitToken"
it(prefix + "testing case priceForVoteIsIssue<initialVeriethPrice25per && priceForVoteIsNoIssue>initialVeriethPrice25per", function() {
		var VeriethContract,EscalationContract,OracleRequestsContract, stage, issueId, var1,var2,var3,OracleAddress,currentPrice=1000;
		var balance3,amountSharesVoteIsIssue=5000000,amountSharesVoteIsNoIssue=10000000,amountWeiSentIsIssue=50000000000,amountWeiSentIsNoIssue=1000000000000,currentPrice=100000;
		return getbalance(accounts[3]).then(function(balance){
			console.log(balance.c[1]);
			balance3=balance.c[1];
		return prepareEscalationWith(accounts,amountSharesVoteIsIssue,amountSharesVoteIsNoIssue,amountWeiSentIsIssue,amountWeiSentIsNoIssue,currentPrice)
	}).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethContract=Contracts.VeriethContract;
			OracleRequestsContract=Contracts.OracleRequestsContract;
			OracleAddress=Contracts.OracleAddress;
			issueId=Contracts.IssueId;
			return VeriethContract.stageNr.call();
			}).then(function(result){
				console.log(result);
				assert.equal(result.c, utils.EscalationStates.EmergencySettlementsAllowance,"stage not right");
				return VeriethContract.totalBalance.call();
				}).then(function(result){
					console.log("total verieth balance"+result);
		return EscalationContract.withdrawTokenFromVoting(issueId,{from:accounts[3]})
		}).then(function(result){
			return VeriethContract.balanceOf(accounts[3])
		}).then(function(result){
			assert.equal(result.c,amountSharesVoteIsIssue, "error for votingTokenresultion" );
			return EscalationContract.withdrawTokenFromInvesting(issueId,{from:accounts[3]})
			}).then(function(result){
				return VeriethContract.balanceOf(accounts[3])
			}).then(function(result){
				assert.equal(result.c,amountSharesVoteIsIssue+amountSharesVoteIsNoIssue, "error for votingTokenresultion" );
			return EscalationContract.withdrawTokenFromVoting(issueId,{from:accounts[4]})
		}).then(function(result){
			return VeriethContract.balanceOf(accounts[4])
		}).then(function(result){
			assert.equal(result.c,0, "error for votingTokenresolution" );
			return getbalance(accounts[3])}).then(function(balance){
				console.log(balance.c[1]);
				assert(balance3>balance.c[1], "accounts do not fit after escalation");
		}).then(function(result){
			return shiftTimePromisified(60*60*24*14);
		}).then(function (){
			return EscalationContract.clearEsclation(issueId)
			}).then(function (){
					return VeriethContract.totalDividends.call()
				}).then(function(result){
					console.log("totalDividends"+result);
					assert.equal(result,0,"total dividends is not right");
			return VeriethContract.paymentOfOracle()
		}).then(function(result){
			return VeriethContract.totalDividends.call()
		}).then(function(result){
				console.log(result);
			assert.equal(result.c[0],amountWeiSentIsNoIssue,"total dividends is not right");
			return  getbalance(accounts[3])
		}).then(function(balance){
				balance3=balance.c[1];
			return VeriethContract.paydividends({from: accounts[3]})
		}).then(function(result){
			return  getbalance(accounts[3])
		}).then(function(balance){
				balance4=balance.c[1];
				console.log(balance4+" changed from"+balance3);
				assert(balance4>balance3,'error with withdraw');
			})
});

/*
prefix="SellingSplitToken"
it(prefix + "testing case priceForVoteIsIssue>=initialVeriethPrice25per && priceForVoteIsNoIssue<=initialVeriethPrice25per", function() {
		var VeriethContract,EscalationContract,OracleRequestsContract, stage, issueId, var1,var2,var3,OracleAddress,currentPrice=1000;
		var balance3,amountSharesVoteIsIssue=10000000,amountSharesVoteIsNoIssue=5000000,amountWeiSentIsIssue=1000000000000,amountWeiSentIsNoIssue=50000000000,currentPrice=100000;
		return getbalance(accounts[3]).then(function(balance){
			console.log(balance.c[1]);
			balance3=balance.c[1];
		return prepareEscalationWith(accounts,amountSharesVoteIsIssue,amountSharesVoteIsNoIssue,amountWeiSentIsIssue,amountWeiSentIsNoIssue,currentPrice)
	}).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethContract=Contracts.VeriethContract;
			OracleRequestsContract=Contracts.OracleRequestsContract;
			OracleAddress=Contracts.OracleAddress;
			issueId=Contracts.IssueId;
			return VeriethContract.stageNr.call();
			}).then(function(result){
				console.log(result);
				assert.equal(result.c, utils.EscalationStates.EmergencySettlementsAllowance,"stage not right");
				return VeriethContract.totalBalance.call();
				}).then(function(result){
					console.log("total verieth balance"+result);
		return EscalationContract.withdrawTokenFromVoting(issueId,{from:accounts[3]})
		}).then(function(result){
			return VeriethContract.balanceOf(accounts[3])
		}).then(function(result){
			assert.equal(result.c,amountSharesVoteIsIssue, "error for votingTokenresultion" );
			return EscalationContract.withdrawTokenFromInvesting(issueId,{from:accounts[3]})
			}).then(function(result){
				return VeriethContract.balanceOf(accounts[3])
			}).then(function(result){
				assert.equal(result.c,amountSharesVoteIsIssue+amountSharesVoteIsNoIssue, "error for votingTokenresultion" );
			return EscalationContract.withdrawTokenFromVoting(issueId,{from:accounts[4]})
		}).then(function(result){
			return VeriethContract.balanceOf(accounts[4])
		}).then(function(result){
			assert.equal(result.c,0, "error for votingTokenresolution" );
			return getbalance(accounts[3])}).then(function(balance){
				console.log(balance.c[1]);
				assert(balance3>balance.c[1], "accounts do not fit after escalation");
		}).then(function(result){
			return shiftTimePromisified(60*60*24*14);
		}).then(function (){
			return EscalationContract.clearEsclation(issueId)
			}).then(function (){
					return VeriethContract.totalDividends.call()
				}).then(function(result){
					console.log("totalDividends"+result);
					assert.equal(result,0,"total dividends is not right");
			return VeriethContract.paymentOfOracle()
		}).then(function(result){
			return VeriethContract.totalDividends.call()
		}).then(function(result){
				console.log(result);
			assert.equal(result.c[0],amountWeiSentIsNoIssue,"total dividends is not right");
			return  getbalance(accounts[3])
		}).then(function(balance){
				balance3=balance.c[1];
			return VeriethContract.paydividends({from: accounts[3]})
		}).then(function(result){
			return  getbalance(accounts[3])
		}).then(function(balance){
				balance4=balance.c[1];
				console.log(balance4+" changed from"+balance3);
				assert(balance4>balance3,'error with withdraw');
			})
});*/
/*
prefix="SellingSplitToken"
it(prefix + "testing case priceForVoteIsIssue<=initialVeriethPrice25per && priceForVoteIsNoIssue>=initialVeriethPrice25per", function() {
		var VeriethContract,EscalationContract,OracleRequestsContract, stage, issueId, var1,var2,var3,OracleAddress,currentPrice=1000;
		deployer(accounts).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethContract=Contracts.VeriethContract;
			OracleRequestsContract=Contracts.OracleRequestsContract;
			OracleAddress=Contracts.OracleAddress;
					return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address);
				}).then(function(result){
					id=Number(result.receipt.logs[0].data.substring(2, 66));
					return oracleAnswering(id, 0,currentPrice, OracleAddress,OracleRequestsContract)}).then(function(){
					return VeriethContract.veriethTokenPrice();}).then(function(result){
					assert.equal(result,currentPrice,"test for price update failed");
				}).then(function(){
					 stage=1;
            return goToStage(stage, accounts,EscalationContract, VeriethContract);
        }).then(function(result){
            issueId=result.positionOfIssue;
        		return VeriethContract.balanceOf(accounts[4]);
				}).then(function(tx){
						var1=tx;
						console.log(var1);
       			return EscalationContract.vote(true, issueId,{from: accounts[4]});
		 		}).then(function(tx){
					return VeriethContract.balanceOf(accounts[3]);
			}).then(function(tx){
					var1=tx;
					console.log(var1);
					return EscalationContract.vote(false, issueId,{from: accounts[3]});
			}).then(function(tx){
            return EscalationContract.issueInfoVotedFor.call(issueId)
      	}).then(function(tx){
        	assert.equal(var1.s,tx.s,"right before time sift");
        	return VeriethContract.stageNr.call();
      	}).then(function(stageAns){
        	return shiftTimePromisified(60*60*24*2+600)}).then(function(){
        	stage=2;
        	return EscalationContract.startSellingOfSplitTokens(issueId,{from: accounts[9]});
	      }).then(function(tx){
        	return VeriethContract.stageNr.call();
      	}).then(function(stageAns){
        	assert.equal(stageAns.c, stage);
				}).then(function(){
					return EscalationContract.SellingOfSplitTokens(true,issueId,{from:accounts[4],value:100000000})
				}).then(function(result){
					console.log(result);
					return EscalationContract.SellingOfSplitTokens(false,issueId,{from:accounts[4],value:650000000})
				}).then(function(result){
					return shiftTimePromisified(60*60*24*2+600)}).then(function(){
					return EscalationContract.evaluate(issueId)
				}).then(function(result){
					return VeriethContract.stageNr.call()
				}).then(function(result){
			assert.equal(result.c,utils.EscalationStates.AllWorking);
				});
});*/
/*
prefix="SellingSplitToken"
it(prefix + "testing case priceForVoteIsIssue<=initialVeriethPrice25per && priceForVoteIsNoIssue<=initialVeriethPrice25per", function() {
		var VeriethContract,EscalationContract,OracleRequestsContract, stage, issueId, var1,var2,var3,OracleAddress,currentPrice=1000;
		deployer(accounts).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethContract=Contracts.VeriethContract;
			OracleRequestsContract=Contracts.OracleRequestsContract;
			OracleAddress=Contracts.OracleAddress;
					return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address);
				}).then(function(result){
					id=Number(result.receipt.logs[0].data.substring(2, 66));
					return oracleAnswering(id, 0,currentPrice, OracleAddress,OracleRequestsContract)}).then(function(){
					return VeriethContract.veriethTokenPrice();}).then(function(result){
					assert.equal(result,currentPrice,"test for price update failed");
				}).then(function(){
					 stage=1;
            return goToStage(stage, accounts,EscalationContract, VeriethContract);
        }).then(function(result){
            issueId=result.positionOfIssue;
        		return VeriethContract.balanceOf(accounts[4]);
				}).then(function(tx){
						var1=tx;
						console.log(var1);
       			return EscalationContract.vote(true, issueId,{from: accounts[4]});
		 		}).then(function(tx){
					return VeriethContract.balanceOf(accounts[3]);
			}).then(function(tx){
					var1=tx;
					console.log(var1);
					return EscalationContract.vote(false, issueId,{from: accounts[3]});
			}).then(function(tx){
            return EscalationContract.issueInfoVotedFor.call(issueId)
      	}).then(function(tx){
        	assert.equal(var1.s,tx.s,"right before time sift");
        	return VeriethContract.stageNr.call();
      	}).then(function(stageAns){
        	return shiftTimePromisified(60*60*24*2+600)}).then(function(){
        	stage=2;
        	return EscalationContract.startSellingOfSplitTokens(issueId,{from: accounts[9]});
	      }).then(function(tx){
        	return VeriethContract.stageNr.call();
      	}).then(function(stageAns){
        	assert.equal(stageAns.c, stage);
				}).then(function(){
					return EscalationContract.SellingOfSplitTokens(true,issueId,{from:accounts[4],value:100000000})
				}).then(function(result){
					console.log(result);
					return EscalationContract.SellingOfSplitTokens(false,issueId,{from:accounts[4],value:500000})
				}).then(function(result){
					return shiftTimePromisified(60*60*24*2+600)}).then(function(){
					return EscalationContract.evaluate(issueId)
				}).then(function(result){
					return VeriethContract.stageNr.call()
				}).then(function(result){
			assert.equal(result.c,utils.EscalationStates.EmergencySettlementsAllowance);
				});
});
*/
/*
prefix="testing Oracle"
it(prefix + "oracleAnswer testing", function() {
		var VeriethContract,EscalationContract, stage, issueId, var1,var2,var3,OracleAddress,currentPrice=525;
    	deployer(accounts).then(function(Contracts){
				EscalationContract=Contracts.EscalationContract;
				VeriethContract=Contracts.VeriethContract;
				OracleRequestsContract=Contracts.OracleRequestsContract;
				OracleAddress=Contracts.OracleAddress;
					  return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address);
          }).then(function(result){
            console.log(Number(result.receipt.logs[0].data.substring(2, 66)));
						id=Number(result.receipt.logs[0].data.substring(2, 66));
						return oracleAnswering(id, 0,currentPrice, OracleAddress)}).then(function(){

									return VeriethContract.veriethTokenPrice();}).then(function(result){
											console.log(result);
												assert.equal(result,currentPrice,"test for price update failed");
					});


});*/
/*
it(prefix + "testing startSellingOfSplitTokens before End time", function() {
	var VeriethContract,EscalationContract, stage,  issueId, var1,var2,var3;
		deployer(accounts).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethContract=Contracts.VeriethContract;
				 stage=1;
					return goToStage(stage, accounts,EscalationContract, VeriethContract);
				 }).then(function(result){
            issueId=result.positionOfIssue;

			return VeriethContract.balanceOf(accounts[4]);
			}).then(function(tx){
					var1=tx;
		 return EscalationContract.vote(true,  issueId,{from: accounts[4]});
	 }).then(function(tx){

					return EscalationContract.issueInfoVotedFor.call( issueId)
		}).then(function(tx){
			return EscalationContract.startSellingOfSplitTokens( issueId,{from: accounts[9]})
			}).then(function(tx){
			return VeriethContract.stageNr.call();
		}).then(function(tx){
			assert.equal(tx,1,"time constraint not take");

			});
});
*/
});
function deployer(accounts){
	var EscalationContract, VeriethContract,OracleRequestsContract,VotingAboutOracleContract ;
	return Escalation.deployed(
				).then(function(Escalation1) {
				EscalationContract=Escalation1;
				return OracleRequests.deployed(
				)}).then(function(OracleRequests1) {
					OracleRequestsContract=OracleRequests1;
				return VotingAboutOracle.deployed(
				)}).then(function(VotingAboutOracle1) {
					VotingAboutOracleContract=VotingAboutOracle1;
				return Verieth.new( VotingAboutOracleContract.address,EscalationContract.address, 100000000,  		   OracleRequestsContract.address,{from: accounts[2]})
				}).then(function(Verieth1){
          				VeriethContract=Verieth1;
					 return distributeFunds(VeriethContract,accounts);
				}).then(function(tx){
					return VotingAboutOracleContract.proposeNewOracle(VeriethContract.address,accounts[7],accounts[7],10,10,{from:accounts[6],value: 1*ether+10});
				 }).then(function(balance) {
		 //console.log(balance.receipt.logs);
		// console.log("voting done");
		 return VotingAboutOracleContract.vote(0,true,{from:accounts[2]});
	 	}).then(function(balance) {
			return shiftTimePromisified(60*60*24*4);
				 }).then(function(){
		 return VotingAboutOracleContract.proposalslength.call();
	 }).then(function(id){
			 console.log("oracleprosied with id "+id);
	 return VotingAboutOracleContract.evaluate(id-1);
			 }).then(function(balance) {
				 	console.log("evelauation done");
								return VeriethContract.oracle.call();
			 }).then(function(balance) {
								 assert.equal(balance.valueOf(), accounts[7], "oracle installed");
								 console.log("oracle installed");
					return new Promise(function(accept,reject){
										web3.eth.getBlock('latest', function(err, block){
										      if(err) return reject(err)
										      timestampBeforeJump = block.timestamp
										      accept({
									        				EscalationContract: EscalationContract,
									        				VeriethContract: VeriethContract,
																	OracleRequestsContract:OracleRequestsContract,
																	OracleAddress:accounts[7]
									    					});
										 });});
/*
					              			})
				return {
        				EscalationContract: EscalationContract,
        				VeriethContract: VeriethContract
    					};*/
				});
}


function goToStage( stage,accounts, EscalationContract, VeriethContract){
var positionOfIssue;
				return EscalationContract.reportIssue(0, VeriethContract.address,"111111111111111111111111111111111111",{from: accounts[8], value:1*ether/1000})

					.then(function(id){
						positionOfIssue=Number(id.receipt.logs[0].data);
						return VeriethContract.stageNr.call();
					}).then(function(stageAns){
						assert.equal((stageAns), stage);
						if(stage=1) return {positionOfIssue:positionOfIssue};
						else {
							return {positionOfIssue:positionOfIssue};
						}
					});

}


function prepareEscalationWith(accounts,amountSharesVoteIsIssue,amountSharesVoteIsNoIssue,amountWeiSentIsIssue,amountWeiSentIsNoIssue,currentPrice){
	var VeriethContract,EscalationContract,OracleRequestsContract, stage, issueId, var1,var2,var3,OracleAddress,VotingAboutOracleContract ;

	return Escalation.deployed(
				).then(function(Escalation1) {
				EscalationContract=Escalation1;
				return OracleRequests.deployed(
				)}).then(function(OracleRequests1) {
					OracleRequestsContract=OracleRequests1;
				return VotingAboutOracle.deployed(
				)}).then(function(VotingAboutOracle1) {
					VotingAboutOracleContract=VotingAboutOracle1;
				return Verieth.new( VotingAboutOracleContract.address,EscalationContract.address, 100000000,OracleRequestsContract.address,{from: accounts[2]})
				}).then(function(Verieth1){
          				VeriethContract=Verieth1;
										return VeriethContract.transfer(accounts[3],amountSharesVoteIsIssue,{from: accounts[2]});
								}).then(function(tx){
									return VeriethContract.balanceOf(accounts[3])
									}).then(function(tx){
										assert.equal(tx.c,amountSharesVoteIsIssue,"transfer of share not working");
										return VeriethContract.transfer(accounts[4],amountSharesVoteIsNoIssue,{from: accounts[2]});
									}).then(function(tx){
										return VotingAboutOracleContract.proposeNewOracle(VeriethContract.address,accounts[7],accounts[7],10,10,{from:accounts[6],value: 1*ether+10});
									 }).then(function(balance) {
									//console.log(balance.receipt.logs);
									// console.log("voting done");
									return VotingAboutOracleContract.vote(0,true,{from:accounts[2]});
									}).then(function(balance) {
									return shiftTimePromisified(60*60*24*4);
									 }).then(function(){


									return VotingAboutOracleContract.proposalslength.call();
									}).then(function(id){
									console.log("oracleprosied with id "+id);
									return VotingAboutOracleContract.evaluate(id-1);
									}).then(function(balance) {
										console.log("evelauation done");
													return VeriethContract.oracle.call();
									}).then(function(balance) {
													 assert.equal(balance.valueOf(), accounts[7], "oracle installed");
													 console.log("oracle installed");
										return new Promise(function(accept,reject){
															web3.eth.getBlock('latest', function(err, block){
																		if(err) return reject(err)
																		timestampBeforeJump = block.timestamp
																		accept({
																						EscalationContract: EscalationContract,
																						VeriethContract: VeriethContract,
																						OracleRequestsContract:OracleRequestsContract,
																						OracleAddress:accounts[7]
																					});
															 });})})
		.then(function(Contracts){
		EscalationContract=Contracts.EscalationContract;
		VeriethContract=Contracts.VeriethContract;
		OracleRequestsContract=Contracts.OracleRequestsContract;
		OracleAddress=Contracts.OracleAddress;
				return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethContract.address);
			}).then(function(result){
				id=Number(result.receipt.logs[0].data.substring(2, 66));
				return oracleAnswering(id, 0,currentPrice, OracleAddress,OracleRequestsContract)}).then(function(){
				return VeriethContract.veriethTokenPrice();}).then(function(result){
				assert.equal(result,currentPrice,"test for price update failed");
				 stage=1;
					return goToStage(stage, accounts,EscalationContract, VeriethContract);
			}).then(function(result){
					issueId=result.positionOfIssue;
					return VeriethContract.balanceOf(accounts[3]);
			}).then(function(tx){
					var1=tx;
					console.log(tx.s);
						console.log("voting for split with "+amountSharesVoteIsIssue+"tokens");
					return EscalationContract.vote(true, issueId,{from: accounts[3]});
			}).then(function(tx){
				return VeriethContract.balanceOf(accounts[3]);
		}).then(function(tx){
				var2=tx;
				console.log(var1);
				return EscalationContract.vote(false, issueId,{from: accounts[4]});
		}).then(function(tx){
					return EscalationContract.issueInfoVotedFor.call(issueId)
			}).then(function(tx){
				assert.equal(var1.c[0],tx.c[0],"right before time shift");
				return VeriethContract.stageNr.call();
			}).then(function(stageAns){
				return shiftTimePromisified(60*60*24*2+600)}).then(function(){
				stage=2;
				return EscalationContract.startSellingOfSplitTokens(issueId,{from: accounts[9]});
			}).then(function(tx){
				return VeriethContract.stageNr.call();
			}).then(function(stageAns){
				assert.equal(stageAns.c,utils.EscalationStates.SellingOfSplittedTokens,"not in right state");
				return EscalationContract.SellingOfSplitTokens(true,issueId,{from:accounts[3],value:amountWeiSentIsIssue})
			}).then(function(result){
				console.log("selling of all split tokens with vote false"+amountWeiSentIsNoIssue);
				return EscalationContract.SellingOfSplitTokens(false,issueId,{from:accounts[4],value:amountWeiSentIsNoIssue})
			}).then(function(result){
				return shiftTimePromisified(60*60*24*2+600)}).then(function(){

					return VeriethContract.stageNr.call()
				}).then(function(result){
					console.log(result);
					assert.equal(result.c,utils.EscalationStates.SellingOfSplittedTokens,'state not set correctly in verieth contract');

						return VeriethContract.totalBalance.call();
						}).then(function(result){
							console.log("total verieth balance"+result);
				return EscalationContract.evaluate(issueId)
			}).then(function(result){
				return VeriethContract.stageNr.call()
			}).then(function(result){
				console.log(result);
				assert.equal(result.c,utils.EscalationStates.EmergencySettlementsAllowance,'state not set correctly in verieth contract');

		return new Promise(function(accept,reject){
							web3.eth.getBlock('latest', function(err, block){
										if(err) return reject(err)
										timestampBeforeJump = block.timestamp
										accept({
														EscalationContract: EscalationContract,
														VeriethContract: VeriethContract,
														OracleRequestsContract:OracleRequestsContract,
														OracleAddress:accounts[7],
														IssueId:issueId
													});
							 });})
			});

}
