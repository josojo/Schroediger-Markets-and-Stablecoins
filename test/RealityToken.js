const EscalationRealitySplit = artifacts.require("./EscalationRealitySplit.sol");
const RealityToken = artifacts.require("./RealityToken.sol");
const OracleRequests = artifacts.require("./OracleRequests.sol");
const OracleWhiteListVoting = artifacts.require("./OracleWhiteListVoting.sol");
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

    /*
    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    */
    beforeEach(async () => {
        escalationRealitySplit = await EscalationRealitySplit.deployed();
        oracleWhiteListVoting = await OracleWhiteListVoting.deployed();
        oracleRequests = await OracleRequests.deployed(oracleWhiteListVoting.address);
        realityToken = await RealityToken.deployed(EscalationRealitySplit.address,OracleWhiteListVoting.address,0x0,100000000000,{from: accounts[crowdfundcontract]});

        // distributeFunds
        console.log(accounts[crowdfundcontract  ]);
        await realityToken.transfer(accounts[customer1],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[customer2],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[attacker1],1000000,{from: accounts[crowdfundcontract]});
        await realityToken.transfer(accounts[attacker2],1000000,{from: accounts[crowdfundcontract]});

    })
    it("oracle selecting", async () => {
        let ans=await realityToken.balanceOf(accounts[customer1]);
        console.log(ans);
        assert.equal((ans.c),1000000);
        await realityToken.transfer(accounts[customer2],1000000,{from: accounts[customer1]});

        assert.equal(await realityToken.balanceOf(accounts[customer1]),0);

    });

    it("oracle selecting", async () => {
            await timeTravel(86400 * 3) //3 days later
            await mineBlock()
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
