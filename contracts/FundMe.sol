// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19; // Pragma

// Imports
// import "hardhat/console.sol"; // You can use console.log(...) now
import "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// Error Codes
error FundMe__NotOwner();
error FundMe__NotEnoughSent();
error FundMe__CallFailed();

// The above saved 6.2 USD (400rs approx)

// Libraries, Interfaces, Contracts

/**
 * @title A contract for crowd funding
 * @author Varun Kolanu
 * @notice This contract is to demo a sample funding contract
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State Variables
    // Normal variables are default: storage i.e., stuck in storage permanently
    // constant and immutable variables don't get stored in storage because they are part of contract's bytes itself
    // storage takes so much memory (s_ : storage)

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;
    AggregatorV3Interface private immutable i_priceFeed;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountSent;

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // Functions Order: constructor -> receive -> fallback -> external -> public -> internal -> private -> view/pure

    constructor(AggregatorV3Interface priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     */
    function fund() public payable {
        uint256 convertedPrice = msg.value.getConvertedPrice(i_priceFeed);
        if (convertedPrice < MINIMUM_USD) {
            revert FundMe__NotEnoughSent();
        }
        if (!addressExists(msg.sender)) {
            s_funders.push(msg.sender);
        }
        s_addressToAmountSent[msg.sender] += convertedPrice / 1e18;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            // reading s_funders from storage many a times
            address funderAddress = s_funders[i]; // reading from storage
            s_addressToAmountSent[funderAddress] = 0;
        }

        s_funders = new address[](0);
        (bool callSuccess, ) = payable(i_owner).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert FundMe__CallFailed();
        }
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (uint256 i = 0; i < funders.length; i++) {
            address funderAddress = funders[i];
            s_addressToAmountSent[funderAddress] = 0;
        }

        s_funders = new address[](0);
        (bool callSuccess, ) = payable(i_owner).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert FundMe__CallFailed();
        }
    }

    // View, Pure
    /**
     * @param _checkAddress The address to be checked if it is already in funders
     */
    function addressExists(address _checkAddress) public view returns (bool) {
        for (uint256 i = 0; i < s_funders.length; i++) {
            if (s_funders[i] == _checkAddress) {
                return true;
            }
        }
        return false;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAmountSentBy(address funder) public view returns (uint256) {
        return s_addressToAmountSent[funder];
    }
}
