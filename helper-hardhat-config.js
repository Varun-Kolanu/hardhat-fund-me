const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
};

const developmentChains = ["hardhat", "localhost"];

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000; // The initial TOKEN/USD rate

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
