pragma solidity 0.4.15;
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
        uint8 outcomeCount,
        string oracleRequestDescription_
    )
        public
        Event(_realityToken, _requestContract, outcomeCount,oracleRequestDescription_)
    {

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
