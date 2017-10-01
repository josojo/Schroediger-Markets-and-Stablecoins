pragma solidity ^0.4.15;
import "./Token.sol";
import "./OutcomeToken.sol";
import "../OracleRequests.sol";
import "../RealityToken.sol";


/// @title Event contract - Provide basic functionality required by different event types
/// @author Stefan George - <stefan@gnosis.pm>  modified by josojo@hotmail.de
contract Event {

    /*
     *  Events
     */
    event OutcomeTokenCreation(OutcomeToken outcomeToken, uint8 index);
    event OutcomeTokenSetIssuance(address indexed buyer, uint collateralTokenCount);
    event OutcomeTokenSetRevocation(address indexed seller, uint outcomeTokenCount);
    event OutcomeAssignment(uint outcome,address realityToken);
    event WinningsRedemption(address indexed receiver, uint winnings, address realityToken);

    /*
     *  Storage
     */
     struct RealityTokenBranch{
       address realityTokenChild1;
       address realityTokenChild2;
       bool isOutcomeSet;
       uint outcome;
       bool newestBranch;
     }
     mapping(address => RealityTokenBranch) realityTokens;

   address public oracleRequestContract;
  address public initialRealityToken;
    OutcomeToken[] public outcomeTokens;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _realityToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracleRequestContract Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
   function Event(address _realityToken, address _oracleRequestContract, uint8 outcomeCount)
         public payable
    {

      // Validate input
      require(address(_realityToken) != 0 && address(_oracleRequestContract) != 0 && outcomeCount >= 2);

      initialRealityToken=_realityToken;
      // Store Input
      oracleRequestContract=_oracleRequestContract;
      realityTokens[_realityToken]=RealityTokenBranch({
        realityTokenChild1:0x0,
        realityTokenChild2:0x0,
        isOutcomeSet: false,
        outcome:0,
        newestBranch:true
        });
      /*  realityTokens[_realityToken].realityTokenChild1=0x0;
        realityTokens[_realityToken].realityTokenChild2=0x0;
        realityTokens[_realityToken].isOutcomeSet=false;
        realityTokens[_realityToken].outcome=0;
        realityTokens[_realityToken].newestBranch=true;*/
      // Create an outcome token for each outcome
      for (uint8 i = 0; i < outcomeCount; i++) {
          OutcomeToken outcomeToken = new OutcomeToken();
          outcomeTokens.push(outcomeToken);
          OutcomeTokenCreation(outcomeToken, i);
      }
    }
    function createOracleRequest(bytes32 oracleRequestDescription) public{
      // testing only
      //bytes32 oracleRequestDescription='af';
      RealityToken R=RealityToken(initialRealityToken);
      // Create OracleRquest
      require( R.transferFrom(msg.sender,this, 1));
      require( R.approve(oracleRequestContract,1));
      OracleRequests(oracleRequestContract).pushRequest(this.setOutcome, oracleRequestDescription,0,2 days,initialRealityToken);

    }
    /// @dev Buys equal number of tokens of all outcomes, exchanging collateral tokens and sets of outcome tokens 1:1
    /// @param collateralTokenCount Number of collateral tokens
    function buyAllOutcomes(uint collateralTokenCount)
        public
    {

        // Transfer collateral tokens to events contract
        require(RealityToken(realityToken).transferFrom(msg.sender, this, collateralTokenCount));
        // Issue new outcome tokens to sender
        for (uint8 i = 0; i < outcomeTokens.length; i++)
            outcomeTokens[i].issue(msg.sender, collateralTokenCount);
        OutcomeTokenSetIssuance(msg.sender, collateralTokenCount);
    }
    /// @dev Updates the RealityToken balances into 2 ChildRealityTokens balances
    function splitCollateral(address _realityToken){
        require(RealityToken(_realityToken).realityIsSplit());
        require(!realityTokens[_realityToken].isOutcomeSet);
        require(realityTokens[_realityToken].newestBranch);

        address realityTokenChild1=RealityToken(_realityToken).realityChild1();
        address realityTokenChild2=RealityToken(_realityToken).realityChild2();
        realityTokens[_realityToken].newestBranch=false;
        require(RealityToken(_realityToken).creditToChilds());
        realityTokens[_realityToken].realityTokenChild1=realityTokenChild1;
        realityTokens[_realityToken].realityTokenChild2=realityTokenChild2;
        realityTokens[realityTokenChild1]=RealityTokenBranch({
          realityTokenChild1:0x0,
          realityTokenChild2:0x0,
          isOutcomeSet: false,
          outcome:0,
          newestBranch:true
          });
          realityTokens[realityTokenChild2]=RealityTokenBranch({
            realityTokenChild1:0x0,
            realityTokenChild2:0x0,
            isOutcomeSet: false,
            outcome:0,
            newestBranch:true
            });
        //OracleRequests([_realityToken].oracleRequestContract).pushRequestToChildRealityTokens(id) needs to be called.
    }
    /// @dev Sets winning event outcome
    function setOutcome(uint outcome, uint id, address _realityToken)
        public
    {
        // Winning outcome is not set yet in event contract but in oracle contract
        require(!realityTokens[_realityToken].isOutcomeSet && msg.sender==oracleRequestContract);
        // Set winning outcome
        realityTokens[_realityToken].outcome = outcome;
        realityTokens[_realityToken].isOutcomeSet = true;
        OutcomeAssignment(outcome, _realityToken);
    }
    function getOutcome( address _realityToken)
        public returns (uint)
    {
        return realityTokens[_realityToken].outcome;

    }
    /// @dev Returns outcome count
    /// @return Outcome count
    function getOutcomeCount()
        public
        constant
        returns (uint8)
    {
        return uint8(outcomeTokens.length);
    }

    /// @dev Returns outcome tokens array
    /// @return Outcome tokens
    function getOutcomeTokens()
        public
        constant
        returns (OutcomeToken[])
    {
        return outcomeTokens;
    }

    /// @dev Returns the amount of outcome tokens held by owner
    /// @return Outcome token distribution
    function getOutcomeTokenDistribution(address owner)
        public
        constant
        returns (uint[] outcomeTokenDistribution)
    {
        outcomeTokenDistribution = new uint[](outcomeTokens.length);
        for (uint8 i = 0; i < outcomeTokenDistribution.length; i++)
            outcomeTokenDistribution[i] = outcomeTokens[i].balanceOf(owner);
    }

    mapping(address =>bool) withDrawnCollateral;
    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings(address realityToken_)
        public
        returns (uint winnings)
    {
        // Winning outcome has to be set
        require(realityTokens[realityToken_].isOutcomeSet);
        // Winnings will only redeems in the newest Brnch
        require(realityTokens[realityToken_].newestBranch);


        // Calculate winnings
        winnings = outcomeTokens[uint(realityTokens[realityToken_].outcome)].balanceOf(msg.sender);
        // Revoke tokens from winning outcome
        outcomeTokens[uint(realityTokens[realityToken_].outcome)].setWithdrawnInOneBranch(msg.sender);
        require(!withDrawnCollateral[realityToken_]);
        // Payout winnings
        require(RealityToken(realityToken_).transfer(msg.sender, winnings));
        withDrawnCollateral[realityToken_]=true;
        WinningsRedemption(msg.sender, winnings, realityToken_);
    }

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash(address realityToken_)
        public
        constant
        returns (bytes32)
    {
        return keccak256(realityToken_, outcomeTokens.length);
    }
}
