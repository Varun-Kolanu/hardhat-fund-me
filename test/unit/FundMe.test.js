const { assert } = require("chai");
const { deployments, ethers } = require("hardhat");

describe("FundMe", async function () {
    let fundMe, signer, mockV3Aggregator;
    beforeEach(async function () {
        // deploy our fundMe contract using hardhat
        const accounts = await ethers.getSigners();
        signer = accounts[0];
        await deployments.fixture(["all"]);

        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt(
            fundMeDeployment.abi,
            fundMeDeployment.address,
            signer,
        );

        const MockV3AggregatorDeployment =
            await deployments.get("MockV3Aggregator");
        mockV3Aggregator = await ethers.getContractAt(
            MockV3AggregatorDeployment.abi,
            MockV3AggregatorDeployment.address,
            signer,
        );
    });

    describe("Constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed(); // returns the priceFeed
            const mockAggregatorAddress = mockV3Aggregator.target;
            assert.equal(response, mockAggregatorAddress);
        });
    });
});
