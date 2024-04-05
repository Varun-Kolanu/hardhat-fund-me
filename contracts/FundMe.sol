// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PriceConverter.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error NotOwner();

contract FundMe {

    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address public immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    constructor(AggregatorV3Interface priceFeedAddress) { 
        i_owner = msg.sender; 
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    address[] public funders;
    mapping(address => uint256) public addressToAmountSent;

    function addressExists(address _checkAddress) public view returns (bool) {
        for (uint256 i = 0; i < funders.length; i++) {
            if (funders[i] == _checkAddress) {
                return true; 
            }
        }
        return false; 
    }

    function fund() public payable {
        uint256 convertedPrice = msg.value.getConvertedPrice(s_priceFeed);
        require(convertedPrice >= MINIMUM_USD, "Didn't send enough!");
        if (!addressExists(msg.sender)) {
            funders.push(msg.sender); 
        }
        addressToAmountSent[msg.sender] += convertedPrice / 1e18 ; 
    }

    function withdraw() public onlyOwner { 
        for (uint256 i=0; i < funders.length; i++) {
            address funderAddress = funders[i];
            addressToAmountSent[funderAddress] = 0;
        }

        funders = new address[](0); 
        (bool callSuccess, ) =  payable(msg.sender).call{value: address(this).balance}(""); 
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner {
        if (msg.sender != i_owner) { revert NotOwner(); }
        _; 
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}