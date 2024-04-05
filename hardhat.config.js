require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia-example";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "p4tk3y";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "c01n";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "3th4p1k3y";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // solidity: "0.8.24",
    solidity: {
        compilers: [{ version: "0.8.24" }],
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 5,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            blockConfirmations: 5,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // i.e., accounts[0] will be account named deployer, in default network (hardhat here)
            // 11155111: 1, // sepolia (chainId 11155111) will have deployer at position 1
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY, // comment for no api call
        // L1: "polygon", // Default: ethereum
    },
};
