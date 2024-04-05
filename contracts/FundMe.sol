// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PriceConverter.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error NotOwner();

contract FundMe {

    using PriceConverter for uint256;
    // It means, the functions in PriceConverter which has params of uint256, can be used directly on uint256 variables as methods
    // Like, msg.value.getConvertedPrice(): msg.value will be considered the first param in function

    // uint256 public MINIMUM_USD = 50 * 1e18; // Let's use constant keyword since MINIMUM_USD doesn't change after (this reduces the transaction gas)
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    // address public owner; // owner is getting changed only once after this line. So let's mark it immutable
    address public immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    constructor(AggregatorV3Interface priceFeedAddress) { // called right after deployment
        i_owner = msg.sender; // the one who deployed
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // constant and immutable stores in byte code of contract rather than in storage

    // A contract can hold funds similar to our wallet

    // msg.value is a global variable to access the value sent to contract (in wei)
        // 1 ETH = 10 ^ 18 wei
        
        // Blockchains can't know external world like is it sunny, what's the price of usd, random data etc as blockchains are deterministic. So oracle networks are used     
        // Blockchains are deterministic because if say you use random() or call any api, the value will become different in different nodes and hence consensus can't be reached: Oracle problem
        // Blockchain oracles: Any device that interacts with off chain world and provide external data or computation to smart contracts
        // Use price feeds in chainlink to get the real time price converter
        // Use chainlink vrf for random number generator
        // Chainlink keepers for event triggers
        // Chainlink Connect to any API

    address[] public funders;
    mapping(address => uint256) public addressToAmountSent;

    function addressExists(address _checkAddress) public view returns (bool) {
        for (uint256 i = 0; i < funders.length; i++) {
            if (funders[i] == _checkAddress) {
                return true; // Address found in the array
            }
        }
        return false; // Address not found in the array
    }

    function fund() public payable {
        // require(msg.value >= 1e18, "Didn't send enough!"); // i.e., atleast 1 ETH is required to be sent to the contract. Otherwise, it gets reverted back
        
        // require(msg.value >= MINIMUM_USD, "Didn't send enough!");
        // msg.value has 18 decimal places since it is in wei (1e-18 ETH)
        // To compare it with MINIMUM_USD, we need to convert it into USD and with 18 decimals (for consistency) since many functions assume that token are 18 decimaled

        uint256 convertedPrice = msg.value.getConvertedPrice(s_priceFeed);
        require(convertedPrice >= MINIMUM_USD, "Didn't send enough!");
        if (!addressExists(msg.sender)) {
            funders.push(msg.sender); // msg.sender: address of sender
        }
        addressToAmountSent[msg.sender] += convertedPrice / 1e18 ; // In USD
    }

    function withdraw() public onlyOwner { // onlyOwner is the function decoration
        // reset the map
        for (uint256 i=0; i < funders.length; i++) {
            address funderAddress = funders[i];
            addressToAmountSent[funderAddress] = 0;
        }

        // reset the funders array
        funders = new address[](0); // 0 objects in the array

        // actually withdraw the funds
        // 3 Methods:
        
        // 1. transfer
        // payable(msg.sender).transfer(address(this).balance); 
        // msg.sender: who wishes to withdraw funds
        // this: The current contract
        // address(this): gets the address or contract
        // msg.sender: address type, payable(msg.sender): payable address type
        // transfer returns error and reverts transaction if gas is more than the limit

        // 2. send
        // bool success = payable(msg.sender).send(address(this).balance); 
        // require(success, "Send Failed");
        // transfer returns bool: false if gas is more than the limit

        // 3. call (Best method)
        // This can be used to call any function with passing params
        (bool callSuccess, ) =  payable(msg.sender).call{value: address(this).balance}(""); 
        // callSuccess: whether called successfully
        // dataReturned: the data returned from the call
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Sender is not owner");
        if (msg.sender != i_owner) { revert NotOwner(); }
        // You can use revert() to revert a transaction
        _; // underscore: doing the rest of the function
    }

    // What happens if a user sends ETH without using fund function?

    // We can use receive() and fallback() functions which act as triggers
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}

// We can use libraries: library are similar to contracts which can't have state variables and can't send ether
// Error Handling:

// 1. Tinker yourself and solve the error
// 2. Google the exact error
// 3. Ask a question on Stack exchange ETH or Stackoverflow