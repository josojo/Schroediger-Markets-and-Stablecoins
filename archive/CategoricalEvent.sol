pragma solidity ^0.4.15;
import "./Event.sol";


/// @title Categorical event contract - Categorical events resolve to an outcome from a set of outcomes
/// @author Stefan George - <stefan@gnosis.pm>
contract CategoricalEvent is Event {

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _realityToken Tokens used as collateral in exchange for outcome tokens
    /// @param _requestContract Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
    function CategoricalEvent(
        address _realityToken,
        address _requestContract,
        uint8 outcomeCount
    )
    public
    {
      // Validate input
      require(address(_realityToken) != 0 && address(_requestContract) != 0 && outcomeCount >= 2);

      initialRealityToken=_realityToken;
      // Store Input
      oracleRequestContract=_requestContract;
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
        //outcomeTokens[uint(outcome)].revoke(msg.sender, winnings);
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
