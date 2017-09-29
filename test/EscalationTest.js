
const expectThrow  =require( './utils/expectThrow.js');
const EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
const RealityToken = artifacts.require("./RealityToken.sol");
const OracleRequests = artifacts.require("./OracleRequests.sol");
const OracleWhiteListVoting = artifacts.require("./OracleWhiteListVoting.sol");
const Event = artifacts.require("./PredictionMarket/Event.sol");
const utils = require("./utils/utils.js");

const contracts = [EscalationRealitySplit, RealityToken, OracleRequests, OracleWhiteListVoting]
// accounts
const crowdfundcontract = 0;
const oracle = 1;
const customer1=2;
const customer2=3;
const attacker1=4;
const attacker2=5;
const customer3=6;
const customer4=7;
// Stages

const WORKING=0;
const REPORTED=1;
const BONDCOLLECTION=2;
const VOTING=3;
const ISSUEDECLINED=4;
const ISSUEACCEPTED=5;
let escalationRealitySplit
let realityToken
let oracleRequests
let oracleWhiteListVoting
let oracle_id
let escalationId;
let eventContract
let corruptAnswerSending;

//Actors definition


contract('EscalationContract Testing:', function(accounts) {
      /*
    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    */
    let IssueReporter={address: accounts[customer1],coinsToBeVoted:1000}
    let Bonders=[{address: accounts[customer2],coinsToBeVoted:1000},{address: accounts[customer3],coinsToBeVoted:100000000}]
    let Voters=[{address: accounts[customer2],coinsToBeVoted:90000000,vote:true},{address: accounts[customer4],coinsToBeVoted:9000000,vote:true},{address: accounts[attacker1],coinsToBeVoted:100000000,vote:false},]

    before(async () => {
            escalationRealitySplit = await EscalationRealitySplit.deployed();
            oracleWhiteListVoting = await OracleWhiteListVoting.deployed();
            oracleRequests = await OracleRequests.deployed(oracleWhiteListVoting.address);
            realityToken = await RealityToken.deployed(EscalationRealitySplit.address,OracleWhiteListVoting.address,0x0,1000000000,{from: accounts[crowdfundcontract]});
            await installOracleAndRequestFeed(realityToken,escalationRealitySplit,oracleRequests,oracleWhiteListVoting,accounts);
            corruptAnswerSending=await oracleRequests.receiveAnswer(0,0,{from: accounts[oracle]});
          })
    beforeEach(async () => {
    })


        it("Creation of Child contracts", async () => {

          escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);

          isRealitySplit=await realityToken.realityIsSplit();

          assert.equal(isRealitySplit,true);
          await escalationRealitySplit.createChildContracts(escalationId);

          realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
          realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());

          assert.notEqual(realityTokenChild2,0x0);
          assert.notEqual(realityTokenChild1,0x0);
        });
        it("Testing Reward of Reporter in case of truthful reporting", async () => {
          await escalationRealitySplit.rewardBonders(escalationId,{from:IssueReporter.address});
          assert.equal((await realityTokenChild1.balanceOf.call(IssueReporter.address)),600);
        });
        it("Testing Reward to Bonders", async () => {
          bonderlength=Bonders.length;
          for(var b=0;b<bonderlength;b++){
          await escalationRealitySplit.rewardBonders(escalationId,{from:Bonders[b].address});
          assert.equal((await realityTokenChild1.balanceOf(Bonders[b].address)),Bonders[b].coinsToBeVoted*2);
          }

        });

        it("Testing Reward to voters", async () => {
              voterlength=Voters.length;
              for(var b=0;b<voterlength;b++){

                  balanceAtChild1=(await realityTokenChild1.balanceOf(Voters[b].address));
                  balanceAtChild2=(await realityTokenChild2.balanceOf(Voters[b].address));
              if(Voters[b].vote){
                await escalationRealitySplit.rewardVoterIsIssue(escalationId,{from:Voters[b].address});
                assert.equal((await realityTokenChild1.balanceOf(Voters[b].address)),parseInt(balanceAtChild1)+parseInt(Voters[b].coinsToBeVoted*2));
                assert.equal(parseInt(await realityTokenChild2.balanceOf(Voters[b].address)),parseInt(balanceAtChild2));

                }
                else{
                  await escalationRealitySplit.rewardVoterIsNoIssue(escalationId,{from:Voters[b].address});
                assert.equal((await realityTokenChild2.balanceOf(Voters[b].address)),parseInt(balanceAtChild2)+parseInt(Voters[b].coinsToBeVoted*2));
                assert.equal(parseInt(await realityTokenChild1.balanceOf(Voters[b].address)),parseInt(balanceAtChild1));
                }
              }

        });

        it("Crediting process to child Contracts", async () => {
                              voterslenght=Voters.length;
                              for(var u=0;u<voterslenght;u++){
                                console.log(u);
                                balanceAtChild1=parseInt(await realityTokenChild1.balanceOf(Voters[u].address));
                                balanceAtChild2=parseInt(await realityTokenChild2.balanceOf(Voters[u].address));
                                console.log("Child1 "+balanceAtChild1);
                                console.log("Child2 "+balanceAtChild2);

                                tempbalance=parseInt(await realityToken.balanceOf(accounts[u]));
                                console.log(tempbalance);
                                await realityToken.creditToChilds({from: accounts[u]});
                                assert.equal(parseInt(await realityTokenChild1.balanceOf(accounts[u])),(tempbalance)+balanceAtChild1);
                                assert.equal(parseInt(await realityTokenChild2.balanceOf(accounts[u])),tempbalance+balanceAtChild2);
                            }  //Test for more accounts;
      });


	});
/*
contract('EscalationContract Testing:', function(accounts) {
      let IssueReporter={address: accounts[customer1],coinsToBeVoted:1000}
      let Bonders=[{address: accounts[customer2],coinsToBeVoted:1000},{address: accounts[customer3],coinsToBeVoted:100000000}]
      let Voters=[{address: accounts[customer2],coinsToBeVoted:90000000,vote:true},{address: accounts[customer4],coinsToBeVoted:9000000,vote:true},{address: accounts[attacker1],coinsToBeVoted:100000000,vote:false},]

      before(async () => {
              escalationRealitySplit = await EscalationRealitySplit.deployed();
              oracleWhiteListVoting = await OracleWhiteListVoting.deployed();
              oracleRequests = await OracleRequests.deployed(oracleWhiteListVoting.address);
              realityToken = await RealityToken.deployed(EscalationRealitySplit.address,OracleWhiteListVoting.address,0x0,1000000000,{from: accounts[crowdfundcontract]});
              await installOracleAndRequestFeed(realityToken,escalationRealitySplit,oracleRequests,oracleWhiteListVoting,accounts);
                 corruptAnswerSending=await oracleRequests.receiveAnswer(0,0,{from: accounts[oracle]});
            });

      it("Testing Reward of Reporter in case of non-truthful reporting", async () => {
        Voters=[{address: accounts[customer2],coinsToBeVoted:90000000,vote:false},{address: accounts[attacker1],coinsToBeVoted:100000000,vote:false},]

        escalationId=await getToEscalationState(ISSUEDECLINED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);

        await expectThrow.expectThrow(escalationRealitySplit.rewardBonders(escalationId,{from:IssueReporter.address}));
        });
});*/
  const timeTravel = function (time) {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time], // 86400 is num seconds in day
        id: new Date().getTime()
      }, (err, result) => {
        if(err){ return reject(err) }
        return resolve(result)
      });
    })
  }
  const mineBlock = async function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
  }
  function getParamFromTxEvent(transaction, paramName, contractFactory, eventName) {
    assert.isObject(transaction)
    let logs = transaction.logs
    if(eventName != null) {
        logs = logs.filter((l) => l.event === eventName)
    }
    assert.equal(logs.length, 1, 'too many logs found!')
    let param = logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
  }
const installOracleAndRequestFeed = async function(realityToken,escalationRealitySplit,oracleRequests,oracleWhiteListVoting,accounts){

              // distributeFunds
              await realityToken.transfer(accounts[customer1],100000000,{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer2],100000000,{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer3],100000000,{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer4],100000000,{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[attacker1],100000000,{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[attacker2],100000000,{from: accounts[crowdfundcontract]});


              //Add an oracle to the whitelist by voting

              oracle_id
              await realityToken.approve(oracleWhiteListVoting.address,1000)
              oracle_id = getParamFromTxEvent(
                            await oracleWhiteListVoting.proposeNewOracle(realityToken.address, accounts[oracle], 1,{from: accounts[crowdfundcontract]}),
                            'id', null, 'ProposeNewOracleEvent'
                          )
              var coins=1000;
              await realityToken.approve(oracleWhiteListVoting.address,coins,{from: accounts[customer1]})
              await oracleWhiteListVoting.vote(oracle_id,true,coins,{from: accounts[customer1]});
              coins=200000000;
              //reset approval
              await realityToken.approve(oracleWhiteListVoting.address,0,{from: accounts[crowdfundcontract]});
              await realityToken.approve(oracleWhiteListVoting.address,coins,{from: accounts[crowdfundcontract]});
              await oracleWhiteListVoting.vote(oracle_id,true,coins ,{from: accounts[crowdfundcontract]} );
              timeTravel(86400 * 4) //4 days later
              await mineBlock()
              await oracleWhiteListVoting.evaluate(oracle_id,{from: accounts[crowdfundcontract]} );
      				//Push oracle answer
      				eventContract = await Event.deployed(realityToken.address, oracleRequests.address,2);
      				await realityToken.approve(eventContract.address,1,{from: accounts[crowdfundcontract]});
      				await eventContract.createOracleRequest("Will BTC>ETH on 01.01.2017 00:00");

}
  const getToEscalationState= async function (final_stage,Reporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,oracleAddress){

                // Create Oracle Request
                await realityToken.approve(escalationRealitySplit.address,Reporter.coinsToBeVoted,{from: Reporter.address});
                escalationId=getParamFromTxEvent(
                await escalationRealitySplit.reportIssue(realityToken.address,corruptAnswerSending.tx,oracleAddress,{from:Reporter.address}),
                              'position', null, 'NewIssue'
                            )

                isUnderInvestigation=await realityToken.realityIsUnderInvestigation.call()
                assert.equal(isUnderInvestigation,true);


                stage=await escalationRealitySplit.getStage.call(escalationId);
                if(stage==final_stage) return escalationId;

                bonderlength=Bonders.length;
                for(var b =0;b<bonderlength;b++){
                await realityToken.approve(escalationRealitySplit.address,Bonders[b].coinsToBeVoted,{from: Bonders[b].address});
                await escalationRealitySplit.bondForIssue(Bonders[b].coinsToBeVoted,escalationId,{from: Bonders[b].address})
                }

                stage=await escalationRealitySplit.getStage.call(escalationId);
                if(stage==final_stage) return escalationId;

                voterlength=Voters.length;
                for(var v=0;v<voterlength;v++){
                await realityToken.approve(escalationRealitySplit.address,Voters[v].coinsToBeVoted,{from: Voters[v].address});
                await escalationRealitySplit.vote(Voters[v].coinsToBeVoted,escalationId,Voters[v].vote,{from: Voters[v].address})
               }

                timeTravel(86400 * 3) //3 days later
                await mineBlock();

                await escalationRealitySplit.evaluateSplit(escalationId,{from: Voters[0].address})

                stage=await escalationRealitySplit.getStage.call(escalationId);
                  if(stage==final_stage) return escalationId;
                console.log("intended escalation stage not reached");

                return escalationId;
  }
