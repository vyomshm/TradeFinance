pragma solidity ^0.5.0;

import "./payment/ConditionalEscrow.sol";

contract ConditionalTradeEscrow is ConditionalEscrow{
    uint private _nConditions;
    mapping(address => uint) private _conditions;
    bool private _sellerApproval;
    
    constructor(uint _n) public{
        require(_n >= 3, 'invalid conditions');
        _nConditions = _n;
        _sellerApproval = false;
    }

    function getStatus(address payee) public view returns(uint){
        return _conditions[payee];
    }
    
    function _metConditions(address payee) public{
        require(_conditions[payee] < _nConditions);
        _conditions[payee] += 1;
    }
    
    function _finalSellerApproval() public{
        _sellerApproval = true;
    }
    
    function withdrawalAllowed(address payee) public view returns (bool) {
        return (_conditions[payee] == _nConditions && _sellerApproval);
    }
}
