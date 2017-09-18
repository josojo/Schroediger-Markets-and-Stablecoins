pragma solidity ^0.4.15;


/// @title OracleRequestInterface contract - Functions to be implemented by token contracts
contract OracleRequestInterface {

    /*
     *  Events
     */
     event TakeRequests(uint requestNr, address  sender,uint feedRequestId, uint timeBlock, uint aDelay);

    /*
     *  Public functions
     */
       function pushRequest( function(uint256, uint256, address) external callback_, bytes32 oracleRequestDescription_, uint feedRequestId_,uint feedInvestigationPeriod_, address realityToken_)  returns (uint);

}
