const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const { chainId } = network.config;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const mockAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = mockAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress;
    }

    const args = [ethUsdPriceFeedAddress];
    console.log(`Args: ${args}`);
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
    log(`Deployed to ${network.name}`);
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
