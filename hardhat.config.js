require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    namedAccounts: {
        deployer: {
            default: 0, // i.e., accounts[0] will be account named deployer, in default network (hardhat here)
            // 11155111: 1, // sepolia (chainId 11155111) will have deployer at position 1
        },
    },
};
