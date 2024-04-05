// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
// This gets the ABI/ Interface from the github via npm package @chainlink/contracts
// See this github repo: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol

library PriceConverter {

    function getConversionRatio(AggregatorV3Interface priceFeed) internal view returns(uint256){
        // ABI is needed: This is the interface (showing all the functions) of the smart contract
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // answer: ETH in USD

        uint8 tokenDecimals = priceFeed.decimals();
        uint8 weiDecimals = 18;
        int256 decimalConvertedPrice = answer * int256(10 ** (weiDecimals - tokenDecimals)); // To convert to 1e18 decimals

        return uint256(decimalConvertedPrice);
    }

    function getConvertedPrice(uint256 priceInWei, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        // Always multiply before dividing
        return (priceInWei * getConversionRatio(priceFeed)) / 1e18; // Since, priceInWei should be conveted to ETH first, divided by 1e18
    }
}