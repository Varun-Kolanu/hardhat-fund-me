// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    function getConversionRatio(AggregatorV3Interface priceFeed) internal view returns(uint256){
        
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        

        uint8 tokenDecimals = priceFeed.decimals();
        uint8 weiDecimals = 18;
        int256 decimalConvertedPrice = answer * int256(10 ** (weiDecimals - tokenDecimals)); 

        return uint256(decimalConvertedPrice);
    }

    function getConvertedPrice(uint256 priceInWei, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        
        return (priceInWei * getConversionRatio(priceFeed)) / 1e18; 
    }
}