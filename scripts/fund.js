const { ethers, deployments } = require("hardhat");

async function main() {
    const signer = (await ethers.getSigners())[0];
    const fundMeDeployment = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(
        fundMeDeployment.abi,
        fundMeDeployment.address,
        signer,
    );
    const sendValue = ethers.parseEther("0.04");
    const txResponse = await fundMe.fund({ value: sendValue });
    await txResponse.wait(1);
    console.log("Funded...");
}

main()
    .then((_) => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
