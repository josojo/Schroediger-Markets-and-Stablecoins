pragma solidity 0.4.15;
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
    event OutcomeAssignment(int outcome);
    event WinningsRedemption(address indexed receiver, uint winnings, address realityToken);

    /*
     *  Storage
     */
     struct RealityToken{
       address realityTokenChild1;
       address realityTokenChild2;
       bool isOutcomeSet;
       int outcome;
       bool newestBranch;
     }
     mapping(address => RealityToken) realityTokens;

   address public oracleRequestContract;
    OutcomeToken[] public outcomeTokens;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _realityToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracleRequestContract Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    function Event(address _realityToken, address _oracleRequestContract, uint8 outcomeCount, string oracleRequestDescription)
        public
    {
        // Validate input
        require(address(_realityToken) != 0 && address(_oracleRequestContract) != 0 && outcomeCount >= 2);

        RealityToken memory R=RealityToken(_realityToken);
        // Create OracleRquest
        require( R.transferFrom(msg.sender,this, 1));
        require( R.approve(_oracleRequestContract,1));
        OracleRequests(_oracleRequestContract).pushRequest(this.setOutcome, oracleRequestDescription,0,2 days,_realityToken);

        // Store Input
        oracleRequestContract=_oracleRequestContract;
        realityTokens[_realityToken]=RealityToken({
          realityTokenChild1:0x0,
          realityTokenChild2:0x0,
          isOutcomeSet: false,
          outcome:0,
          newestBranch:true
          });

        // Create an outcome token for each outcome
        for (uint8 i = 0; i < outcomeCount; i++) {
            OutcomeToken outcomeToken = new OutcomeToken();
            outcomeTokens.push(outcomeToken);
            OutcomeTokenCreation(outcomeToken, i);
        }
    }

    /// @dev Buys equal number of tokens of all outcomes, exchanging collateral tokens and sets of outcome tokens 1:1
    /// @param collateralTokenCount Number of collateral tokens
    function buyAllOutcomes(uint collateralTokenCount, address _realityToken)
        public
    {
        //unfortunately, this is a hard requiremet, otherwise, things will get even more complicated.
        require(realityTokens[_realityToken].newestBranch);

        // Transfer collateral tokens to events contract
        require(RealityToken(_realityToken).transferFrom(msg.sender, this, collateralTokenCount));
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
        realityTokens[realityTokenChild1]=RealityToken({
          realityTokenChild1:0x0,
          realityTokenChild2:0x0,
          isOutcomeSet: false,
          outcome:0,
          newestBranch:true
          });
          realityTokens[realityTokenChild2]=RealityToken({
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
        require(!realityTokens[_realityToken].isOutcomeSet && msg.sender==realityTokens[_realityToken].oracleRequestContract);
        // Set winning outcome
        realityTokens[_realityToken].outcome = outcome;
        realityTokens[_realityToken].isOutcomeSet = true;
        OutcomeAssignment(outcome, _realityToken);
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

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash() public constant returns (bytes32);

    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings() public returns (uint);
}
