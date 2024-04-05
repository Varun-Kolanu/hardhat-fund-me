const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // hre: hardhat
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // nmedaccounts defined in config
    const { chainId } = network.config;

    // For localhost deployments, we shall use mocks

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [networkConfig[chainId].ethUsdPriceFeedAddress], // constructor args
        log: true,
    });
};
