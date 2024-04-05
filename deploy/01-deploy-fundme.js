const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // hre: hardhat
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // nmedaccounts defined in config
    const { chainId } = network.config;
};
