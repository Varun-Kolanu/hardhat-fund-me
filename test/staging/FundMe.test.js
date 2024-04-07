const { assert, expect } = require("chai");
const { ethers, network, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer;
          beforeEach(async function () {
              deployer = (await ethers.getSigners())[0];
              const fundMeDeployment = await deployments.get("FundMe");
              fundMe = await ethers.getContractAt(
                  fundMeDeployment.abi,
                  fundMeDeployment.address,
                  deployer,
              );
          });

          it("allows people to fund and withdraw", async function () {
              const sendValue = ethers.parseEther("0.02");
              const fundResponse = await fundMe.fund({
                  value: sendValue,
              });
              await fundResponse.wait(1);
              const txResponse = await fundMe.cheaperWithdraw();
              await txResponse.wait(1);
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target,
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
