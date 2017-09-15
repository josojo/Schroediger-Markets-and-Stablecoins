pragma solidity ^0.4.15;
import "./StandardToken.sol";



contract RealityToken is StandardToken{


  // This contract is describing the underlying logic of the RealityToken.
  // It implements: - ERC20 token standard
  //                - New reality Tokens representing a reality split via child contracts
  //		    - Crediting tokens to new reality forks
  //                -
  string public name = 'RealityToken';
  string public symbol = 'RTO';
  uint public decimals = 0;
  uint public INITIAL_SUPPLY ;
  modifier onlyBy(address _account)
     {
         require(msg.sender == _account);
         _;
     }
	address public parentRealityToken;
	address public realityChild1;
	address public realityChild2;
	address public EscalationRealitySplit;
	address public OracleWhiteListVoting;
  bool public realityIsUnderInvestigation;
	bool public realityIsSplit;

  function RealityToken(address EscalationRealitySplit_, address OracleWhiteListVoting_,address parentToken,uint amount){
     parentRealityToken=parentToken;
     OracleWhiteListVoting=OracleWhiteListVoting_;
     EscalationRealitySplit=EscalationRealitySplit_;
     balances[msg.sender]=amount;
     totalSupply=amount;
     INITIAL_SUPPLY =amount;

  }

  mapping(address => bool) creditedToChild1;
  mapping(address => bool) creditedToChild2;

  /****************ERC20 token standard****************/

  function transfer(address _to, uint256 _value) returns (bool) {
          // Abort if coin are locked
    require(!creditedToChild1[msg.sender]);
	  require(!creditedToChild2[msg.sender]);
  	return super.transfer(_to,_value);
  }

  function transferFrom(address _from, address _to, uint256 _value) returns (bool success){
        // Abort if coin are locked
    require(!creditedToChild1[msg.sender]);
    require(!creditedToChild2[msg.sender]);
    return super.transferFrom(_from,_to,_value);
  }


  /*****************************Contract interfaces*************************/


  //Interface for Child Contracts

  function receiveChildContracts(address child1,address child2) external returns(bool){
    require(realityIsSplit);
    require(realityChild1==0x0);
    require(realityChild2==0x0);
    realityChild1=child1;
  	realityChild2=child2;
    return true;
  }

  function creditToChilds(){
	   require(realityIsSplit);
		if(!creditedToChild1[msg.sender]){
      creditedToChild1[msg.sender]=true;
		    if(!(RealityToken(realityChild1).fundFromParentContract(balances[msg.sender],msg.sender)))
        creditedToChild1[msg.sender]=false;
		 }

		if(!creditedToChild2[msg.sender]){
      creditedToChild2[msg.sender]=true;
		    if(!(RealityToken(realityChild2).fundFromParentContract(balances[msg.sender],msg.sender)))
        creditedToChild2[msg.sender]=false;
		}
	}

 function fundFromParentContract(uint amount,address holder) onlyBy(parentRealityToken)returns(bool){
  	require(msg.sender==parentRealityToken);
  	totalSupply+=amount;
  	balances[holder]+=amount;
    return true;
 }

  //Interface for EscalationContract
  function warnRealityIsUnderInvestigation(bool isActive) onlyBy(EscalationRealitySplit){
    realityIsUnderInvestigation=isActive;
  }
  function isSplitted() onlyBy(EscalationRealitySplit){
    realityIsSplit=true;
  }
  function fundEscalationReward(address owner, uint amount) onlyBy(EscalationRealitySplit) returns(bool){
    balances[owner]+=amount;
    return true;
  }
}
