pragma solidity ^0.5.0;

import "./ConditionalTradeEscrow.sol";

contract TradeFinance{

    enum TradeStatus { Initialized, Approved, Active, Fulfilled, Concluded }

    struct Trade {
        bytes32 commodity;
        uint price;
        uint deliveryDate;
        bytes32 deliveryVehicle;
        bytes32 deliveryTerm;
        uint quantity;
        uint tolerance;
        bytes32 surveyCompany;
        bytes32 insuranceCertificate;
        bytes commodityInfo;
        TradeStatus status;
    }

    // struct Doc {
    //     bytes32 name;
    //     string value;
    //     bool submitted;
    // }

    address public buyer;
    address public seller;
    
    address public buyerBank;
    address payable public sellerBank;

    // Trade[] public trades;
    Trade public trade;
    bytes public description;
    ConditionalTradeEscrow public escrow;

    // Doc[] public documentChecklist;

    bool public approved;
    
    event ContractApproved(uint _timestamp);
    event ConditionFullfiled(bytes32 _message);
    event TradeConcluded(address _buyer, address _seller, address _buyerBank, address _sellerBank, uint timestamp);
    
    modifier onlyBuyer(){
        require(msg.sender == buyer, 'invalid access');
        _;
    }

    modifier onlySeller(){
        require(msg.sender == seller, 'invalid access');
        _;
    }

    modifier onlyBuyerBank(){
        require(msg.sender == buyerBank, 'invalid access');
        _;
    }
    
    modifier onlySellerBank(){
        require(msg.sender == sellerBank, 'invalid access');
        _;
    }
    
    constructor(
        address _buyer, 
        address _seller, 
        address _buyerBank, 
        address payable _sellerBank,
        bytes memory _description,
        bytes32 _commodity,
        uint _price,
        uint _deliveryDate,
        bytes32 _deliveryVehicle,
        bytes32 _deliveryTerm,
        uint _quantity,
        uint _tolerance,
        bytes32 _insuranceCertificate,
        bytes32 _surveyCompany,
        bytes memory _commodityInfo
    ) public {
        require( _buyerBank != address(0), 'invalid address');
        require( _sellerBank != address(0), 'invalid address');
        require( _buyer != address(0), 'invalid address');
        require( _seller != address(0), 'invalid address');

        buyer = _buyer;
        seller = _seller;
        buyerBank = _buyerBank;
        sellerBank = _sellerBank;

        description = _description;
        trade = Trade({
            commodity: _commodity,
            price: _price,
            deliveryDate: _deliveryDate,
            deliveryVehicle: _deliveryVehicle,
            deliveryTerm: _deliveryTerm,
            quantity: _quantity,
            tolerance: _tolerance,
            surveyCompany: _surveyCompany,
            insuranceCertificate: _insuranceCertificate,
            commodityInfo: _commodityInfo,
            status: TradeStatus.Initialized
        });

        approved = false;
        escrow = new ConditionalTradeEscrow(4);
    }

    function approveContract() public onlySeller {
        require(trade.status == TradeStatus.Initialized, "invalid status");
        approved = true;
        trade.status = TradeStatus.Approved;
        emit ContractApproved(now);
    }

    function initiateTrade() public onlyBuyerBank payable {
        require(approved == true, 'contract not approved by buyer');
        require(trade.status == TradeStatus.Approved, "Invalid status");
        require(msg.value > 10000 wei, 'insufficient deposit');
        trade.status = TradeStatus.Active;
        escrow.deposit.value(msg.value)(sellerBank);
    }

    function indicateMetCondition(bytes32 message) public onlyBuyerBank {
        require(trade.status == TradeStatus.Active, "Invalid status");
        require(escrow.getStatus(sellerBank) < 4, "conditions already fulfilled");
        if(escrow.getStatus(sellerBank) == 3){
            trade.status = TradeStatus.Fulfilled;
        }
        escrow._metConditions(sellerBank);
        emit ConditionFullfiled(message);
    }
    
    function finalSellerBankApproval() payable public onlySellerBank {
        require(trade.status == TradeStatus.Fulfilled, "Invalid status");
        escrow._finalSellerApproval();
        trade.status = TradeStatus.Concluded;
        escrow.withdraw(sellerBank);
        emit TradeConcluded(buyer, seller, buyerBank, sellerBank, now);
    }
}