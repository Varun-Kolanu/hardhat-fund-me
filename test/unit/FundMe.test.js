const { assert, expect } = require("chai");
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

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed(); // returns the priceFeed
            const mockAggregatorAddress = mockV3Aggregator.target;
            assert.equal(response, mockAggregatorAddress);
        });
    });

    describe("fund", async function () {
        it("Fails with message 'Didn't send enough!' if you don't send enough ETH", async function () {
            // Saying that it should be reverted with this message
            await expect(fundMe.fund()).to.be.revertedWith(
                "Didn't send enough!",
            );
        });

        it("updates address to amount sent mapping", async function () {
            const sendValue = ethers.parseEther("1");
            const sendValInUsd = "2000"; // The conversion rate we have defined earlier
            await fundMe.fund({ value: sendValue });
            const gotValue = await fundMe.s_addressToAmountSent(signer);
            assert.equal(gotValue.toString(), sendValInUsd.toString());
        });

        it("Adds funder to array", async function () {
            const sendValue = ethers.parseEther("1");
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.s_funders(0);
            assert.equal(funder, await signer.getAddress());
        });
    });

    describe("withdraw", async function () {
        // without optimization: Gas used: 56614

        it("withdraws ETH from a single funder", async function () {
            // Arrange
            const sendValue = ethers.parseEther("1");
            await fundMe.fund({ value: sendValue });

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const startingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Act
            const txResponse = await fundMe.withdraw();
            const txReceipt = await txResponse.wait(1);
            const txFee = txReceipt.fee;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                endingDeployerBalance.toString(),
                (
                    startingDeployerBalance +
                    startingFundMeBalance -
                    txFee
                ).toString(),
            );
        });

        it("withdraws ETH with multiple accounts", async function () {
            // Arrange
            const accounts = await ethers.getSigners();
            const sendValue = ethers.parseEther("1");
            for (let i = 0; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const startingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Act
            const txResponse = await fundMe.withdraw();
            const txReceipt = await txResponse.wait(1);
            const txFee = txReceipt.fee;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Assert
            await expect(fundMe.s_funders(0)).to.be.reverted;
            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountSent(accounts[i].address),
                    0,
                );
            }
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                endingDeployerBalance.toString(),
                (
                    startingDeployerBalance +
                    startingFundMeBalance -
                    txFee
                ).toString(),
            );
        });

        it("only owner can withdraw money", async function () {
            const attacker = (await ethers.getSigners())[1];

            const sendValue = ethers.parseEther("1");
            await fundMe.fund({ value: sendValue });

            const fundMeConnectedWithAttacker = await fundMe.connect(attacker);
            if (attacker !== signer) {
                await expect(
                    fundMeConnectedWithAttacker.withdraw(),
                ).to.be.revertedWithCustomError(
                    fundMeConnectedWithAttacker,
                    "FundMe__NotOwner",
                );
            }
        });
    });

    describe("cheaperWithdraw", async function () {
        // with optimization: Gas used: 56400
        it("withdraws ETH from a single funder", async function () {
            // Arrange
            const sendValue = ethers.parseEther("1");
            await fundMe.fund({ value: sendValue });

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const startingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Act
            const txResponse = await fundMe.cheaperWithdraw();
            const txReceipt = await txResponse.wait(1);
            const txFee = txReceipt.fee;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                endingDeployerBalance.toString(),
                (
                    startingDeployerBalance +
                    startingFundMeBalance -
                    txFee
                ).toString(),
            );
        });

        it("withdraws ETH with multiple accounts", async function () {
            // Arrange
            const accounts = await ethers.getSigners();
            const sendValue = ethers.parseEther("1");
            for (let i = 0; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const startingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Act
            const txResponse = await fundMe.cheaperWithdraw();
            const txReceipt = await txResponse.wait(1);
            const txFee = txReceipt.fee;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(signer);

            // Assert
            await expect(fundMe.s_funders(0)).to.be.reverted;
            for (let i = 0; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountSent(accounts[i].address),
                    0,
                );
            }
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                endingDeployerBalance.toString(),
                (
                    startingDeployerBalance +
                    startingFundMeBalance -
                    txFee
                ).toString(),
            );
        });

        it("only owner can withdraw money", async function () {
            const attacker = (await ethers.getSigners())[1];

            const sendValue = ethers.parseEther("1");
            await fundMe.fund({ value: sendValue });

            const fundMeConnectedWithAttacker = await fundMe.connect(attacker);
            if (attacker !== signer) {
                await expect(
                    fundMeConnectedWithAttacker.cheaperWithdraw(),
                ).to.be.revertedWithCustomError(
                    fundMeConnectedWithAttacker,
                    "FundMe__NotOwner",
                );
            }
        });
    });
});
