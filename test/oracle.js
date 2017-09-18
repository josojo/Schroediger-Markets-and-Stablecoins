const EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
const RealityToken = artifacts.require("./RealityToken.sol");
const OracleRequests = artifacts.require("./OracleRequests.sol");
const OracleWhiteListVoting = artifacts.require("./OracleWhiteListVoting.sol");
const Event = artifacts.require("./PredictionMarket/Event.sol");
const utils = require("./utils/utils.js");

const contracts = [EscalationRealitySplit, RealityToken, OracleRequests, OracleWhiteListVoting]
const crowdfundcontract = 0;
const oracle = 1;
const customer1=2;
const customer2=3;
const attacker1=4;
const attacker2=5;


contract('Contract Initialisastion', function(accounts) {
    let escalationRealitySplit
    let realityToken
    let oracleRequests
    let oracleWhiteListVoting
    let oracle_id
    let eventContract
    /*
    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    */
    beforeEach(async () => {
        escalationRealitySplit = await EscalationRealitySplit.deployed();
        oracleWhiteListVoting = await OracleWhiteListVoting.deployed();
        oracleRequests = await OracleRequests.deployed(oracleWhiteListVoting.address);
        realityToken = await RealityToken.deployed(EscalationRealitySplit.address,OracleWhiteListVoting.address,0x0,1000000000,{from: accounts[crowdfundcontract]});

        // distributeFunds

        console.log(accounts[crowdfundcontract  ]);
        await realityToken.transfer(accounts[customer1],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[customer2],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[attacker1],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[attacker2],1000000,{from: accounts[crowdfundcontract]});


        //Add an oracle to the whitelist by voting
        oracle_id
        await realityToken.approve(oracleWhiteListVoting.address,1000)
        oracle_id = getParamFromTxEvent(
                      await oracleWhiteListVoting.proposeNewOracle(realityToken.address, accounts[oracle], 1,{from: accounts[crowdfundcontract]}),
                      'id', null, 'ProposeNewOracleEvent'
                    )
        console.log("For Reality:"+realityToken.address+" Oracle proposed with id:"+ oracle_id);

        var coins=1000;
        await realityToken.approve(oracleWhiteListVoting.address,coins,{from: accounts[customer1]})
        await oracleWhiteListVoting.vote(oracle_id,true,coins,{from: accounts[customer1]});
        console.log("Voted for oracle: with "+coins +"coins");


        coins=200000000;
              //reset approval
        await realityToken.approve(oracleWhiteListVoting.address,0,{from: accounts[crowdfundcontract]});
        await realityToken.approve(oracleWhiteListVoting.address,coins,{from: accounts[crowdfundcontract]});
        await oracleWhiteListVoting.vote(oracle_id,true,coins ,{from: accounts[crowdfundcontract]} );
        console.log("Voted for oracle: with "+coins +"coins");

        timeTravel(86400 * 4) //4 days later
        await mineBlock()
        console.log("4 days later");
        await oracleWhiteListVoting.evaluate(oracle_id,{from: accounts[crowdfundcontract]} );




    })

    it("Create Event, which is asking for an Answer; Sending answer from oracle", async () => {

            // Create Oracle Request
              eventContract = await Event.deployed(realityToken.address, oracleRequests.address,2);
              console.log(realityToken.address);
              await realityToken.approve(eventContract.address,1,{from: accounts[crowdfundcontract]});
              await eventContract.createOracleRequest("Will BTC>ETH on 01.01.2017 00:00");
              await oracleRequests.receiveAnswer(0,0,{from: accounts[oracle]});
              timeTravel(86400 * 4) //4 days later
              await oracleRequests.sendAnswer(0,{from: accounts[oracle]});

    });

	});


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
  const mineBlock = function () {
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
